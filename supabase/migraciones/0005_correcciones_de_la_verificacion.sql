-- ═══════════════════════════════════════════════════════════════════════════
-- 0005 — Dos cosas que encontró la verificación de esquema
--
-- Las dos aparecieron **la primera vez que se corrió `npm run esquema`**, que
-- es exactamente para lo que se escribió (decisión 31). Ninguna es grave;
-- ninguna se habría encontrado leyendo las migraciones.
--
-- Se pega en el SQL Editor de Supabase. Es idempotente.
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────────
-- 1. `marcar_actualizado_en()` la podía ejecutar cualquiera
--
-- La foto del esquema lo mostró así:
--
--     ejecucion   marcar_actualizado_en()  authenticated,anon,service_role,PUBLIC
--
-- No es un descuido de la migración 0001: **es el valor de fábrica de
-- Postgres.** Una función recién creada la puede ejecutar `PUBLIC` salvo que
-- se diga lo contrario, y Supabase expone las funciones de `public` por su API
-- automática. La 0001 revocó los permisos de escritura de las tablas y no se
-- acordó de las funciones, que es un tipo de objeto distinto.
--
-- **El riesgo concreto es nulo** y conviene decirlo con precisión en vez de
-- exagerarlo: es una función de disparador, así que sin el contexto de un
-- `UPDATE` no hace nada —falla con «trigger functions can only be called as
-- triggers»— y no lee ni escribe nada por su cuenta.
--
-- Se revoca igual, por dos razones que sí valen: deja el principio
-- «`anon` no ejecuta nada de lo nuestro» sin excepciones que haya que
-- recordar, y evita que la próxima vez que se lea la foto haya una línea rara
-- que uno decida ignorar. Un inventario con una excepción tolerada deja de
-- servir como inventario.
--
-- Revocarle `execute` a un disparador no lo rompe: Postgres comprueba ese
-- permiso al CREAR el disparador, no cada vez que se dispara.
-- ───────────────────────────────────────────────────────────────────────────

revoke execute on function public.marcar_actualizado_en() from public;
revoke execute on function public.marcar_actualizado_en() from anon, authenticated;


-- ───────────────────────────────────────────────────────────────────────────
-- 2. La foto del esquema salía partida en varias líneas
--
-- `pg_get_expr()` devuelve las condiciones de las políticas formateadas en
-- varias líneas, así:
--
--     politica  public.producto_imagenes  …  using=(EXISTS ( SELECT 1
--        FROM public.productos p
--       WHERE ((p.id = producto_imagenes.producto_id) AND p.activo)))
--
-- El script compara **línea contra línea**, así que un hecho partido en tres
-- se lee como tres hechos sueltos. La consecuencia práctica: cambiar una
-- política mostraría seis líneas de diferencia entre agregadas y quitadas, con
-- fragmentos de SQL sin contexto, y ordenadas alfabéticamente por «FROM» y
-- «WHERE» en medio de las tablas. Justo la clase de ruido que hace que un
-- diff deje de leerse.
--
-- Se arregla colapsando los espacios en blanco: un hecho, una línea.
-- ───────────────────────────────────────────────────────────────────────────

create or replace function public.verificar_esquema()
returns table (linea text)
language sql
stable
security invoker
set search_path = ''
as $$

  -- Un hecho por línea, siempre. Sin esto, las condiciones de las políticas
  -- llegan formateadas en varias líneas y el diff del script se vuelve
  -- ilegible — ver el comentario de arriba.
  select pg_catalog.regexp_replace(pg_catalog.btrim(cruda), '\s+', ' ', 'g')
  from (

    -- ── Tablas y columnas ─────────────────────────────────────────────────
    select format(
             'tabla       %s.%s  %s %s %s%s',
             n.nspname, c.relname, a.attname,
             pg_catalog.format_type(a.atttypid, a.atttypmod),
             case when a.attnotnull then 'not-null' else 'nullable' end,
             coalesce(' default=' || pg_catalog.pg_get_expr(d.adbin, d.adrelid), '')
           ) as cruda
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    join pg_catalog.pg_attribute a on a.attrelid = c.oid
    left join pg_catalog.pg_attrdef d on d.adrelid = c.oid and d.adnum = a.attnum
    where n.nspname = 'public' and c.relkind = 'r'
      and a.attnum > 0 and not a.attisdropped

    union all

    -- ── Restricciones: claves, unicidad, checks y el ON DELETE de cada FK ──
    select format('restriccion %s.%s  %s  %s',
                  n.nspname, c.relname, con.conname,
                  pg_catalog.pg_get_constraintdef(con.oid))
    from pg_catalog.pg_constraint con
    join pg_catalog.pg_class c on c.oid = con.conrelid
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'

    union all

    -- ── Índices, con la definición completa ───────────────────────────────
    --
    -- Ahí se ve el `where es_portada` del índice parcial de portada. Un índice
    -- único que perdiera esa cláusula seguiría llamándose igual y haría otra
    -- cosa: impediría tener más de una foto por producto.
    select format('indice      %s.%s  %s', schemaname, tablename, indexdef)
    from pg_catalog.pg_indexes
    where schemaname = 'public'

    union all

    -- ── Disparadores ──────────────────────────────────────────────────────
    select format('disparador  %s.%s  %s  %s',
                  n.nspname, c.relname, t.tgname,
                  pg_catalog.pg_get_triggerdef(t.oid))
    from pg_catalog.pg_trigger t
    join pg_catalog.pg_class c on c.oid = t.tgrelid
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and not t.tgisinternal

    union all

    -- ── RLS activado, tabla por tabla ─────────────────────────────────────
    --
    -- Una tabla de `public` sin RLS queda expuesta por la API automática de
    -- Supabase. Es lo primero que hay que mirar si esta foto cambia.
    select format('rls         %s.%s  %s',
                  n.nspname, c.relname,
                  case when c.relrowsecurity then 'activado' else 'DESACTIVADO' end)
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'

    union all

    -- ── Políticas, con su condición entera ────────────────────────────────
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

    -- ── Permisos de tabla para anon y authenticated ───────────────────────
    --
    -- La segunda capa de docs/seguridad.md: el `revoke` de insert/update/
    -- delete. Que aparezca acá un INSERT para `anon` es un incidente.
    --
    -- Se lee de `pg_class.relacl` y no de `information_schema`: esa vista solo
    -- muestra permisos de roles de los que el usuario que consulta es
    -- miembro, así que se comería justo los de `anon` y devolvería una lista
    -- vacía — que se lee como «no hay permisos de más» cuando en realidad es
    -- «no miré».
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

    -- ── Permisos de ejecución de las funciones de public ──────────────────
    --
    -- Ojo con `proacl` nulo: en Postgres una función recién creada **la puede
    -- ejecutar todo el mundo**. Nulo no significa «sin permisos», significa
    -- «los de fábrica», y los de fábrica incluyen a PUBLIC. Por eso se informa
    -- distinto en vez de mostrar una lista vacía.
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

    -- ── El bucket ─────────────────────────────────────────────────────────
    --
    -- `publico` es del bucket, no del esquema: si alguna vez sale `t`,
    -- cualquiera con la URL descarga la foto de la casa de un cliente.
    select format('bucket      %s  publico=%s  tope=%s  tipos=%s',
                  b.id, b.public,
                  coalesce(b.file_size_limit::text, '-'),
                  coalesce(array_to_string(b.allowed_mime_types, ','), '-'))
    from storage.buckets b

    union all

    -- ── Políticas de storage.objects ──────────────────────────────────────
    --
    -- Tiene que estar VACÍO. Sin ninguna política, ni anon ni authenticated
    -- pueden listar, leer, subir ni borrar — docs/seguridad.md.
    select format('storage     %s  cmd=%s  roles=%s', p.polname, p.polcmd,
                  coalesce((
                    select string_agg(r.rolname, ',' order by r.rolname)
                    from pg_catalog.pg_roles r where r.oid = any (p.polroles)
                  ), 'public'))
    from pg_catalog.pg_policy p
    join pg_catalog.pg_class c on c.oid = p.polrelid
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'storage' and c.relname = 'objects'

  ) as hechos
  order by 1
$$;

comment on function public.verificar_esquema() is
  'Foto ordenada del esquema real, un hecho por línea. Se compara contra supabase/esquema.txt con scripts/verificar-esquema.mjs — decisión 31.';

revoke execute on function public.verificar_esquema() from public;
revoke execute on function public.verificar_esquema() from anon, authenticated;
grant  execute on function public.verificar_esquema() to service_role;
