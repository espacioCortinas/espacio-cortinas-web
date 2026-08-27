-- ═══════════════════════════════════════════════════════════════════════════
-- 0004 — Funciones del panel
--
-- Tres operaciones de la galería que NO se pueden hacer con una llamada suelta
-- a la API de Supabase, cada una por su motivo. Las demás escrituras del panel
-- son un insert o un update común y no necesitan nada de esto.
--
-- Todas se llaman desde una Server Action que ya pasó por `verificarAdmin()`,
-- con la clave `service_role`. **Ninguna autoriza por su cuenta**: acá no hay
-- una capa más de seguridad, hay atomicidad. La autorización está en
-- lib/auth.ts — docs/seguridad.md.
--
-- Por eso mismo se les revoca `execute` a `anon` y a `authenticated` al final:
-- Supabase se lo concede por defecto y quedarían expuestas por la API
-- automática.
--
-- Reciben la entidad como parámetro en vez de venir duplicadas por tabla. Es
-- lo mismo que hace el componente de galería del panel, y lo que la decisión 7
-- ya preveía cuando eligió dos tablas en vez de una polimórfica: la
-- duplicación que se evitaba era la del código, no la del esquema.
--
-- Se pega en el SQL Editor de Supabase. Es idempotente.
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────────
-- marcar_portada()
--
-- POR QUÉ NO ALCANZA CON UN UPDATE: hay un índice único parcial
-- (`una_portada_por_producto`) que garantiza una sola portada por entidad. Un
-- único `update ... set es_portada = (id = $1)` que apague una fila y prenda
-- otra puede violar ese índice A MITAD de camino, según el orden en que
-- Postgres procese las filas, aunque el estado final sea válido. Un índice
-- único no es diferible, así que la única salida es apagar primero y prender
-- después, en dos sentencias y en la misma transacción.
--
-- Y de paso valida lo que docs/modelo-de-datos.md pide: la portada tiene que
-- ser VERTICAL. Los listados públicos usan siempre la portada, y es lo que
-- hace que las grillas queden parejas aunque la galería mezcle orientaciones
-- (decisión 14). La Server Action lo valida también, antes de llegar acá; esto
-- es la red de abajo.
-- ───────────────────────────────────────────────────────────────────────────

create or replace function public.marcar_portada(
  p_entidad   text,
  p_imagen_id uuid
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_padre uuid;
  v_ancho integer;
  v_alto  integer;
begin
  if p_entidad = 'producto' then
    select producto_id, ancho, alto into v_padre, v_ancho, v_alto
      from public.producto_imagenes where id = p_imagen_id;
  elsif p_entidad = 'proyecto' then
    select proyecto_id, ancho, alto into v_padre, v_ancho, v_alto
      from public.proyecto_imagenes where id = p_imagen_id;
  else
    raise exception 'Entidad desconocida: %', p_entidad;
  end if;

  if v_padre is null then
    raise exception 'No existe la imagen %', p_imagen_id;
  end if;

  if v_alto <= v_ancho then
    raise exception
      'La portada tiene que ser una foto vertical, y esta mide % x % (ancho x alto).',
      v_ancho, v_alto;
  end if;

  if p_entidad = 'producto' then
    update public.producto_imagenes set es_portada = false
      where producto_id = v_padre and es_portada and id <> p_imagen_id;
    update public.producto_imagenes set es_portada = true
      where id = p_imagen_id;
  else
    update public.proyecto_imagenes set es_portada = false
      where proyecto_id = v_padre and es_portada and id <> p_imagen_id;
    update public.proyecto_imagenes set es_portada = true
      where id = p_imagen_id;
  end if;
end;
$$;

comment on function public.marcar_portada(text, uuid) is
  'Cambia la portada en dos sentencias y una transacción: el índice único parcial no admite hacerlo en una sola. Valida que sea vertical.';


-- ───────────────────────────────────────────────────────────────────────────
-- eliminar_imagen()
--
-- POR QUÉ NO ALCANZA CON UN DELETE: si la fila borrada era la portada, la
-- entidad se queda sin ninguna y los listados públicos no tienen qué mostrar.
-- Hay que promover otra, y tiene que pasar en la misma transacción que el
-- borrado o queda una ventana sin portada.
--
-- Se promueve la vertical de menor `orden`. Vertical porque la portada tiene
-- que serlo; si no queda ninguna vertical, la entidad se queda sin portada a
-- propósito y el panel lo muestra como una advertencia. Es preferible eso a
-- promover una horizontal y romper la grilla en silencio.
--
-- DEVUELVE LA RUTA, y eso no es un detalle de comodidad: es lo que la Server
-- Action necesita para borrar los archivos de Storage. La cascada de la base
-- borra filas, nunca archivos — docs/modelo-de-datos.md. Si la función no
-- devolviera la ruta, habría que leerla antes de borrar y el par
-- «leer, borrar» abre la ventana en la que la ruta se pierde.
-- ───────────────────────────────────────────────────────────────────────────

create or replace function public.eliminar_imagen(
  p_entidad   text,
  p_imagen_id uuid
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_padre       uuid;
  v_ruta        text;
  v_era_portada boolean;
begin
  if p_entidad = 'producto' then
    delete from public.producto_imagenes where id = p_imagen_id
      returning producto_id, ruta, es_portada
      into v_padre, v_ruta, v_era_portada;
  elsif p_entidad = 'proyecto' then
    delete from public.proyecto_imagenes where id = p_imagen_id
      returning proyecto_id, ruta, es_portada
      into v_padre, v_ruta, v_era_portada;
  else
    raise exception 'Entidad desconocida: %', p_entidad;
  end if;

  if v_ruta is null then
    raise exception 'No existe la imagen %', p_imagen_id;
  end if;

  if v_era_portada then
    if p_entidad = 'producto' then
      update public.producto_imagenes set es_portada = true
        where id = (
          select id from public.producto_imagenes
          where producto_id = v_padre and alto > ancho
          order by orden, creado_en
          limit 1
        );
    else
      update public.proyecto_imagenes set es_portada = true
        where id = (
          select id from public.proyecto_imagenes
          where proyecto_id = v_padre and alto > ancho
          order by orden, creado_en
          limit 1
        );
    end if;
  end if;

  return v_ruta;
end;
$$;

comment on function public.eliminar_imagen(text, uuid) is
  'Borra la fila, promueve otra portada si hacía falta, y devuelve la ruta para que la Server Action borre los archivos de Storage.';


-- ───────────────────────────────────────────────────────────────────────────
-- reordenar()
--
-- POR QUÉ NO ALCANZA CON VARIOS UPDATE: reordenar una galería de doce fotos
-- serían doce llamadas a la API, cada una con su latencia y su posibilidad de
-- fallar por la mitad. Acá se manda la lista entera en el orden nuevo y
-- `orden` pasa a ser la posición en el arreglo, en una sola sentencia.
--
-- `p_padre_id` acota el alcance: solo se tocan filas de esa entidad. Con un
-- solo administrador es difícil que importe, pero es la diferencia entre una
-- función que reordena una galería y una que puede reordenar cualquier cosa
-- si le llega un id equivocado. Para `productos` y `proyectos` va en null.
--
-- Sin SQL dinámico a propósito: cuatro ramas explícitas en vez de un
-- `format('%I', p_tabla)`. Es más largo y no hay ninguna forma de que un
-- nombre de tabla llegue desde afuera.
-- ───────────────────────────────────────────────────────────────────────────

create or replace function public.reordenar(
  p_tabla    text,
  p_padre_id uuid,
  p_ids      uuid[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if p_tabla = 'productos' then
    update public.productos p
      set orden = x.pos
      from unnest(p_ids) with ordinality as x(id, pos)
      where p.id = x.id;

  elsif p_tabla = 'proyectos' then
    update public.proyectos p
      set orden = x.pos
      from unnest(p_ids) with ordinality as x(id, pos)
      where p.id = x.id;

  elsif p_tabla = 'producto_imagenes' then
    update public.producto_imagenes i
      set orden = x.pos
      from unnest(p_ids) with ordinality as x(id, pos)
      where i.id = x.id and i.producto_id = p_padre_id;

  elsif p_tabla = 'proyecto_imagenes' then
    update public.proyecto_imagenes i
      set orden = x.pos
      from unnest(p_ids) with ordinality as x(id, pos)
      where i.id = x.id and i.proyecto_id = p_padre_id;

  else
    raise exception 'Tabla desconocida: %', p_tabla;
  end if;
end;
$$;

comment on function public.reordenar(text, uuid, uuid[]) is
  'Reescribe `orden` según la posición en el arreglo, en una sola sentencia. Sirve para las cuatro tablas ordenables.';


-- ───────────────────────────────────────────────────────────────────────────
-- Permisos
--
-- Ninguna de las tres autoriza nada por su cuenta: la autorización vive en
-- `verificarAdmin()`, del lado del servidor. Si `anon` o `authenticated`
-- pudieran ejecutarlas, cualquiera con la clave anónima —que es pública—
-- podría reordenar una galería o borrar una imagen. Supabase concede
-- `execute` por defecto, así que hay que sacarlo explícitamente.
-- ───────────────────────────────────────────────────────────────────────────

revoke execute on function public.marcar_portada(text, uuid)        from public;
revoke execute on function public.eliminar_imagen(text, uuid)       from public;
revoke execute on function public.reordenar(text, uuid, uuid[])     from public;

revoke execute on function public.marcar_portada(text, uuid)        from anon, authenticated;
revoke execute on function public.eliminar_imagen(text, uuid)       from anon, authenticated;
revoke execute on function public.reordenar(text, uuid, uuid[])     from anon, authenticated;

grant  execute on function public.marcar_portada(text, uuid)        to service_role;
grant  execute on function public.eliminar_imagen(text, uuid)       to service_role;
grant  execute on function public.reordenar(text, uuid, uuid[])     to service_role;
