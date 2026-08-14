-- ═══════════════════════════════════════════════════════════════════════════
-- 0002 — Bucket de imágenes
--
-- Un solo bucket, `imagenes`, PRIVADO. Va aparte de la migración del esquema
-- porque toca el schema `storage`, no `public`.
--
-- Se pega en el SQL Editor de Supabase, igual que 0001. Es idempotente.
-- ═══════════════════════════════════════════════════════════════════════════

-- `public = false` es lo único que no se negocia acá: con el bucket público,
-- cualquiera con la URL descarga la foto de la casa de un cliente sin pasar
-- por ningún control. El sitio público las sirve con URLs firmadas.
--
-- `file_size_limit` = 8 MB, igual que IMAGEN_PESO_MAXIMO_MB de
-- lib/constantes.ts. Es el tope del ORIGINAL: lo que se sube de verdad son
-- los WebP ya recomprimidos en el navegador, bastante más livianos.
--
-- `allowed_mime_types` repite la lista de docs/seguridad.md. La Server Action
-- valida el tipo antes de firmar la subida; esto lo vuelve a validar del lado
-- de Storage, que es donde no se puede saltear.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'imagenes',
  'imagenes',
  false,
  8388608,
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- ───────────────────────────────────────────────────────────────────────────
-- Sin políticas sobre storage.objects, a propósito.
--
-- `storage.objects` viene con RLS activado de fábrica. Al no crear ninguna
-- política, `anon` y `authenticated` no pueden listar, leer, subir ni borrar
-- nada: ni con la clave anónima ni con una sesión iniciada.
--
-- Todo el acceso pasa por el servidor con `service_role`, que saltea RLS:
--   - subir  → URL firmada que emite la Server Action después de
--              `verificarAdmin()`, con la ruta armada por el servidor
--   - servir → URL firmada de lectura, con vencimiento
--   - borrar → responsabilidad de la Server Action, no de la base: la cascada
--              borra las filas pero no los archivos (docs/modelo-de-datos.md)
--
-- Si en algún momento hace falta una política de lectura acotada acá, va con
-- su propia migración y con su razón escrita.
-- ───────────────────────────────────────────────────────────────────────────
