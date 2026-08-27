-- ═══════════════════════════════════════════════════════════════════════════
-- 0003 — Verificación de esquema
--
-- Las migraciones son archivos .sql que se pegan a mano en el SQL Editor
-- (decisión 28). Con una sola tanda no importaba; con más, nada garantizaba
-- que la base real se pareciera al repositorio: una migración sin aplicar, o
-- un cambio hecho desde el panel de Supabase, no dejaban ninguna huella.
--
-- Esta migración agrega la pieza que faltaba: una función que devuelve el
-- estado REAL del esquema, línea por línea y en orden determinista, para
-- poder compararlo contra lo que el repositorio dice que debería ser.
--
-- El procedimiento completo está en la decisión 31 y se corre con:
--
--     node scripts/verificar-esquema.mjs
--
-- Se pega en el SQL Editor de Supabase, igual que 0001 y 0002. Es idempotente.
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────────
-- verificar_esquema()
--
-- Devuelve una descripción textual y ordenada de todo lo que este proyecto
-- define en la base. Es una FOTO, no una lista de comprobaciones: no sabe qué
-- se espera encontrar, solo informa qué hay. Quien compara es el script, que
-- tiene la foto anterior versionada en supabase/esquema.txt.
--
-- Por qué así y no una lista de `assert` acá adentro: una lista de
-- comprobaciones solo encuentra lo que alguien se acordó de escribir. Una foto
-- completa encuentra también lo que nadie previó — la columna que alguien
-- agregó desde el panel, la política que quedó de una prueba, el `revoke` que
-- no se llegó a correr.
--
-- `security invoker` y `search_path` vacío, por la misma razón que
-- `marcar_actualizado_en()` en 0001: sin search_path heredado no hay forma de
-- que la función resuelva un nombre a algo que no sea lo que dice.
-- ───────────────────────────────────────────────────────────────────────────

create or replace function public.verificar_esquema()
returns table (linea text)
language sql
stable
security invoker
set search_path = ''
as $$

  -- ── Tablas y columnas ───────────────────────────────────────────────────
  select format(
           'tabla       %s.%s  %s %s %s%s',
           n.nspname, c.relname, a.attname,
           pg_catalog.format_type(a.atttypid, a.atttypmod),
           case when a.attnotnull then 'not-null' else 'nullable' end,
           coalesce(' default=' || pg_catalog.pg_get_expr(d.adbin, d.adrelid), '')
         )
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  join pg_catalog.pg_attribute a on a.attrelid = c.oid
  left join pg_catalog.pg_attrdef d on d.adrelid = c.oid and d.adnum = a.attnum
  where n.nspname = 'public' and c.relkind = 'r'
    and a.attnum > 0 and not a.attisdropped

  union all

  -- ── Restricciones: claves, unicidad, checks y el ON DELETE de cada FK ────
  select format('restriccion %s.%s  %s  %s',
                n.nspname, c.relname, con.conname,
                pg_catalog.pg_get_constraintdef(con.oid))
  from pg_catalog.pg_constraint con
  join pg_catalog.pg_class c on c.oid = con.conrelid
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'

  union all

  -- ── Índices ─────────────────────────────────────────────────────────────
  --
  -- Con la definición completa, que es donde se ve el `where es_portada` del
  -- índice parcial de portada. Un índice único que perdiera esa cláusula
  -- seguiría llamándose igual y haría otra cosa.
  select format('indice      %s.%s  %s', schemaname, tablename, indexdef)
  from pg_catalog.pg_indexes
  where schemaname = 'public'

  union all

  -- ── Disparadores ────────────────────────────────────────────────────────
  select format('disparador  %s.%s  %s  %s',
                n.nspname, c.relname, t.tgname,
                pg_catalog.pg_get_triggerdef(t.oid))
  from pg_catalog.pg_trigger t
  join pg_catalog.pg_class c on c.oid = t.tgrelid
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and not t.tgisinternal

  union all

  -- ── RLS activado, tabla por tabla ───────────────────────────────────────
  --
  -- Una tabla de `public` sin RLS queda expuesta a través de la API automática
  -- de Supabase. Es lo primero que hay que mirar si esta foto cambia.
  select format('rls         %s.%s  %s',
                n.nspname, c.relname,
                case when c.relrowsecurity then 'activado' else 'DESACTIVADO' end)
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r'

  union all

  -- ── Políticas, con su condición entera ──────────────────────────────────
  select format('politica    %s.%s  %s  cmd=%s  roles=%s  using=%s  check=%s',
                n.nspname, c.relname, p.polname,
                p.polcmd,
                coalesce((
                  select string_agg(r.rolname, ',' order by r.rolname)
                  from pg_catalog.pg_roles r where r.oid = any (p.polroles)
                ), 'public'),
                coalesce(pg_catalog.pg_get_expr(p.polqual, p.polrelid), '-'),
                coalesce(pg_catalog.pg_get_expr(p.polwithcheck, p.polrelid), '-'))
  from pg_catalog.pg_policy p
  join pg_catalog.pg_class c on c.oid = p.polrelid
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'

  union all

  -- ── Permisos de tabla para anon y authenticated ─────────────────────────
  --
  -- La segunda capa de docs/seguridad.md: el `revoke` de insert/update/delete.
  -- Sin políticas RLS ya alcanzaría, pero el revoke sigue rechazando la
  -- escritura aunque alguien agregue una política permisiva por error. Que
  -- aparezca acá un INSERT para `anon` es un incidente, no un detalle.
  --
  -- Se lee de `pg_class.relacl` y no de `information_schema.role_table_grants`.
  -- La vista del information_schema **solo muestra permisos de roles de los
  -- que el usuario que consulta es miembro**, así que se comería justo los de
  -- `anon` — que son los que hay que auditar— y devolvería una lista vacía,
  -- que se lee como «no hay permisos de más» cuando en realidad es «no miré».
  select format('permiso     %s.%s  %s  %s',
                n.nspname, c.relname,
                case when a.grantee = 0 then 'PUBLIC' else r.rolname end,
                a.privilege_type)
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  cross join lateral pg_catalog.aclexplode(c.relacl) a
  left join pg_catalog.pg_roles r on r.oid = a.grantee
  where n.nspname = 'public' and c.relkind = 'r'
    and (a.grantee = 0 or r.rolname in ('anon', 'authenticated'))

  union all

  -- ── Permisos de ejecución de las funciones de public ────────────────────
  --
  -- Ojo con el caso de `proacl` nulo: en Postgres una función recién creada
  -- **la puede ejecutar todo el mundo**. Nulo no significa «sin permisos»,
  -- significa «los de fábrica», y los de fábrica incluyen a PUBLIC. Por eso
  -- se informa distinto en vez de mostrar una lista vacía.
  select format('ejecucion   %s(%s)  %s',
                p.proname,
                pg_catalog.pg_get_function_identity_arguments(p.oid),
                case
                  when p.proacl is null
                    then 'DE FÁBRICA — PUBLIC puede ejecutarla'
                  else coalesce((
                    select string_agg(
                             case when a.grantee = 0 then 'PUBLIC' else r.rolname end,
                             ',' order by 1)
                    from pg_catalog.aclexplode(p.proacl) a
                    left join pg_catalog.pg_roles r on r.oid = a.grantee
                    where a.privilege_type = 'EXECUTE'
                      and (a.grantee = 0 or r.rolname in ('anon', 'authenticated', 'service_role'))
                  ), 'nadie de anon/authenticated/service_role/PUBLIC')
                end)
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'

  union all

  -- ── El bucket ───────────────────────────────────────────────────────────
  --
  -- `public` acá es del bucket, no del esquema: si alguna vez sale `true`,
  -- cualquiera con la URL descarga la foto de la casa de un cliente.
  select format('bucket      %s  publico=%s  tope=%s  tipos=%s',
                b.id, b.public,
                coalesce(b.file_size_limit::text, '-'),
                coalesce(array_to_string(b.allowed_mime_types, ','), '-'))
  from storage.buckets b

  union all

  -- ── Políticas de storage.objects ────────────────────────────────────────
  --
  -- Tiene que estar VACÍO. Sin ninguna política, ni anon ni authenticated
  -- pueden listar, leer, subir ni borrar. Todo pasa por el servidor con
  -- service_role — docs/seguridad.md.
  select format('storage     %s  cmd=%s  roles=%s', p.polname, p.polcmd,
                coalesce((
                  select string_agg(r.rolname, ',' order by r.rolname)
                  from pg_catalog.pg_roles r where r.oid = any (p.polroles)
                ), 'public'))
  from pg_catalog.pg_policy p
  join pg_catalog.pg_class c on c.oid = p.polrelid
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'storage' and c.relname = 'objects'

  order by 1
$$;

comment on function public.verificar_esquema() is
  'Foto ordenada del esquema real. Se compara contra supabase/esquema.txt con scripts/verificar-esquema.mjs — decisión 31.';


-- Solo `service_role`. Nadie más tiene por qué poder leer la forma de la base
-- a través de la API automática, y `anon`/`authenticated` reciben permiso de
-- ejecución por defecto en Supabase, así que hay que sacarlo explícitamente.
revoke execute on function public.verificar_esquema() from public;
revoke execute on function public.verificar_esquema() from anon, authenticated;
grant  execute on function public.verificar_esquema() to service_role;
