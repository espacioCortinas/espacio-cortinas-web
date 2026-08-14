-- ═══════════════════════════════════════════════════════════════════════════
-- 0001 — Esquema inicial
--
-- Las cinco tablas de docs/modelo-de-datos.md, el trigger de `actualizado_en`,
-- el índice único parcial de portada y RLS con las políticas de lectura
-- pública.
--
-- Cómo se aplica: se pega entero en el SQL Editor de Supabase y se ejecuta.
-- No hay CLI de Supabase en el proyecto (regla 8 de CLAUDE.md: sin
-- dependencias nuevas sin justificarlas). El archivo se versiona igual, así
-- que el repositorio sigue siendo la fuente de verdad del esquema.
--
-- Es idempotente: se puede volver a correr entero sin romper nada.
--
-- LAS TABLAS ARRANCAN VACÍAS. Ningún `insert` de contenido — decisión 19.
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────────
-- Trigger de `actualizado_en`
--
-- `security invoker` y `search_path` vacío a propósito: una función de
-- trigger con el search_path heredado del llamador es la vía clásica para
-- que alguien la haga ejecutar código propio. Con la lista vacía solo se
-- resuelve `pg_catalog`, que es donde vive `now()`.
-- ───────────────────────────────────────────────────────────────────────────

create or replace function public.marcar_actualizado_en()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

comment on function public.marcar_actualizado_en() is
  'Pone actualizado_en = now() en cada UPDATE. Se engancha a productos y proyectos.';


-- ───────────────────────────────────────────────────────────────────────────
-- productos
-- ───────────────────────────────────────────────────────────────────────────

create table if not exists public.productos (
  id             uuid        primary key default gen_random_uuid(),
  nombre         text        not null check (length(trim(nombre)) > 0),
  slug           text        not null unique check (length(trim(slug)) > 0),
  descripcion    text,
  activo         boolean     not null default false,
  destacado      boolean     not null default false,
  orden          integer     not null default 0,
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

comment on table public.productos is
  'Catálogo. `activo` controla la existencia pública; `destacado`, la aparición en Inicio. Son independientes y `activo` manda — decisión 8.';
comment on column public.productos.slug is
  'No se regenera al cambiar el nombre: eso rompería los enlaces ya compartidos por WhatsApp — decisión 10.';

-- El listado público filtra por `activo` y ordena por `orden`. Parcial porque
-- lo inactivo no se consulta nunca desde el sitio público.
create index if not exists productos_activos_orden
  on public.productos (orden, id) where activo;

drop trigger if exists productos_actualizado_en on public.productos;
create trigger productos_actualizado_en
  before update on public.productos
  for each row execute function public.marcar_actualizado_en();


-- ───────────────────────────────────────────────────────────────────────────
-- producto_variantes
--
-- Una lista de nombres, nada más: sin descripción, sin slug y sin foto
-- propia. Si algún día hace falta una foto por variante, se agrega entonces.
-- Tampoco lleva `creado_en` ni `actualizado_en` — docs/modelo-de-datos.md.
-- ───────────────────────────────────────────────────────────────────────────

create table if not exists public.producto_variantes (
  id          uuid    primary key default gen_random_uuid(),
  producto_id uuid    not null references public.productos (id) on delete cascade,
  nombre      text    not null check (length(trim(nombre)) > 0),
  orden       integer not null default 0
);

comment on table public.producto_variantes is
  'Variantes de un producto. Ej.: "Dos paños", "Motorizados".';

create index if not exists producto_variantes_producto_orden
  on public.producto_variantes (producto_id, orden);


-- ───────────────────────────────────────────────────────────────────────────
-- proyectos
-- ───────────────────────────────────────────────────────────────────────────

create table if not exists public.proyectos (
  id             uuid        primary key default gen_random_uuid(),
  titulo         text        not null check (length(trim(titulo)) > 0),
  slug           text        not null unique check (length(trim(slug)) > 0),
  ubicacion      text,
  descripcion    text,
  activo         boolean     not null default false,
  destacado      boolean     not null default false,
  orden          integer     not null default 0,
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

comment on table public.proyectos is
  'Portfolio. Cuatro campos y no más: sin categoría, sin fecha, sin cliente — decisión 11.';
comment on column public.proyectos.ubicacion is
  'Texto libre, no una tabla de localidades. Se muestra como chip. Ej.: "Nordelta, Buenos Aires".';

create index if not exists proyectos_activos_orden
  on public.proyectos (orden, id) where activo;

drop trigger if exists proyectos_actualizado_en on public.proyectos;
create trigger proyectos_actualizado_en
  before update on public.proyectos
  for each row execute function public.marcar_actualizado_en();


-- ───────────────────────────────────────────────────────────────────────────
-- producto_imagenes / proyecto_imagenes
--
-- Dos tablas con la misma forma, no una tabla polimórfica: una polimórfica no
-- puede tener clave foránea real, así que se pierde la integridad y el
-- borrado en cascada hay que mantenerlo a mano — decisión 7.
--
-- `ruta` es la CARPETA, no el archivo. Cada imagen son hasta cuatro WebP
-- (480/960/1600/2560) generados en el navegador al subir, y `medidas` dice
-- cuáles existen de verdad para esa fila — decisión 25. Una foto original de
-- 900 px no genera la de 1600 ni la de 2560.
-- ───────────────────────────────────────────────────────────────────────────

create table if not exists public.producto_imagenes (
  id          uuid        primary key default gen_random_uuid(),
  producto_id uuid        not null references public.productos (id) on delete cascade,
  ruta        text        not null unique check (length(trim(ruta)) > 0),
  medidas     integer[]   not null check (array_length(medidas, 1) >= 1),
  ancho       integer     not null check (ancho > 0),
  alto        integer     not null check (alto > 0),
  alt         text        not null default '',
  orden       integer     not null default 0,
  es_portada  boolean     not null default false,
  creado_en   timestamptz not null default now()
);

comment on column public.producto_imagenes.ruta is
  'Carpeta dentro del bucket, no un archivo: productos/{producto_id}/{uuid}/. Los archivos son {ancho}.webp.';
comment on column public.producto_imagenes.medidas is
  'Qué anchos existen en Storage para esta fila. Ej.: {480,960,1600,2560}. Se lee de acá para armar el srcset, no se asume.';
comment on column public.producto_imagenes.ancho is
  'De la medida más grande. Con `alto` alcanza para reservar el espacio y para saber la orientación.';

-- Una sola portada por producto. Índice único PARCIAL: la unicidad solo
-- aplica a las filas con `es_portada`, así que las demás no se estorban.
create unique index if not exists una_portada_por_producto
  on public.producto_imagenes (producto_id) where es_portada;

create index if not exists producto_imagenes_producto_orden
  on public.producto_imagenes (producto_id, orden);


create table if not exists public.proyecto_imagenes (
  id          uuid        primary key default gen_random_uuid(),
  proyecto_id uuid        not null references public.proyectos (id) on delete cascade,
  ruta        text        not null unique check (length(trim(ruta)) > 0),
  medidas     integer[]   not null check (array_length(medidas, 1) >= 1),
  ancho       integer     not null check (ancho > 0),
  alto        integer     not null check (alto > 0),
  alt         text        not null default '',
  orden       integer     not null default 0,
  es_portada  boolean     not null default false,
  creado_en   timestamptz not null default now()
);

comment on column public.proyecto_imagenes.ruta is
  'Carpeta dentro del bucket, no un archivo: proyectos/{proyecto_id}/{uuid}/. Los archivos son {ancho}.webp.';

create unique index if not exists una_portada_por_proyecto
  on public.proyecto_imagenes (proyecto_id) where es_portada;

create index if not exists proyecto_imagenes_proyecto_orden
  on public.proyecto_imagenes (proyecto_id, orden);


-- ═══════════════════════════════════════════════════════════════════════════
-- RLS
--
-- Qué protege esto, dicho con precisión para no generar confianza falsa:
--
--   RLS protege el SITIO PÚBLICO, que lee con la clave anónima.
--   RLS NO protege el panel: las escrituras del panel van por el servidor con
--   la `service_role key`, que saltea RLS por diseño. Al panel lo protege
--   `verificarAdmin()` — lib/auth.ts y docs/seguridad.md.
--
-- RLS va activado en LAS CINCO tablas. Una tabla sin RLS queda expuesta a
-- través de la API automática de Supabase.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.productos          enable row level security;
alter table public.producto_variantes enable row level security;
alter table public.proyectos          enable row level security;
alter table public.producto_imagenes  enable row level security;
alter table public.proyecto_imagenes  enable row level security;


-- ── Lectura pública ────────────────────────────────────────────────────────
--
-- Solo `select`, y solo de contenido activo.
--
-- Van para `anon` Y para `authenticated`. docs/seguridad.md escribía `to anon`
-- a secas, pero el sitio público se renderiza con la clave anónima MÁS las
-- cookies de la petición: si la administradora navega el sitio público con la
-- sesión abierta, su rol en Postgres es `authenticated` y no `anon`, y con
-- `to anon` solo vería un sitio vacío. Lo que se lee es contenido ya público,
-- así que no se agranda nada.

drop policy if exists "lectura publica de productos activos" on public.productos;
create policy "lectura publica de productos activos"
  on public.productos for select to anon, authenticated
  using (activo = true);

drop policy if exists "lectura publica de proyectos activos" on public.proyectos;
create policy "lectura publica de proyectos activos"
  on public.proyectos for select to anon, authenticated
  using (activo = true);

-- Las hijas heredan la condición del padre: si el producto no está activo,
-- sus variantes y sus imágenes tampoco se ven.

drop policy if exists "lectura publica de variantes de productos activos" on public.producto_variantes;
create policy "lectura publica de variantes de productos activos"
  on public.producto_variantes for select to anon, authenticated
  using (
    exists (
      select 1 from public.productos p
      where p.id = producto_variantes.producto_id and p.activo
    )
  );

drop policy if exists "lectura publica de imagenes de productos activos" on public.producto_imagenes;
create policy "lectura publica de imagenes de productos activos"
  on public.producto_imagenes for select to anon, authenticated
  using (
    exists (
      select 1 from public.productos p
      where p.id = producto_imagenes.producto_id and p.activo
    )
  );

drop policy if exists "lectura publica de imagenes de proyectos activos" on public.proyecto_imagenes;
create policy "lectura publica de imagenes de proyectos activos"
  on public.proyecto_imagenes for select to anon, authenticated
  using (
    exists (
      select 1 from public.proyectos p
      where p.id = proyecto_imagenes.proyecto_id and p.activo
    )
  );


-- ── Escritura: ninguna política, y además sin permiso ──────────────────────
--
-- No hay ninguna política de `insert`, `update` ni `delete` para `anon` ni
-- para `authenticated`. Nadie escribe desde el navegador (regla 3 de
-- CLAUDE.md).
--
-- El `revoke` es una segunda capa sobre lo mismo. Sin políticas, RLS ya
-- rechaza toda escritura; el `revoke` la rechaza un paso antes, a nivel de
-- permisos, y sigue rechazándola aunque en el futuro alguien agregue una
-- política permisiva por error. Supabase concede estos permisos por defecto a
-- los dos roles, así que hay que sacarlos explícitamente.
--
-- No afecta al panel: `service_role` es otro rol y conserva sus permisos.

revoke insert, update, delete, truncate on
  public.productos,
  public.producto_variantes,
  public.proyectos,
  public.producto_imagenes,
  public.proyecto_imagenes
from anon, authenticated;
