-- ═══════════════════════════════════════════════════════════════════════════
-- 0006 — En qué formato quedó cada imagen
--
-- POR QUÉ APARECE ESTA COLUMNA. El panel recomprime cada foto en el navegador
-- antes de subirla, y hasta ahora se daba por hecho que el resultado era WebP.
-- Al probar el panel desde el teléfono de la empresa apareció que **WebKit no
-- sabe generar WebP desde un canvas**: `toBlob("image/webp")` devuelve un PNG
-- sin avisar. Y en iOS todos los navegadores son WebKit —Chrome y Firefox en
-- iPhone son Safari por dentro— así que no hay ninguno que sirva.
--
-- La salida es usar el mejor formato que cada navegador sepa generar: WebP
-- donde se pueda, JPEG donde no. Eso significa que dos fotos del mismo
-- proyecto pueden estar en formatos distintos, según desde dónde se cargaron,
-- y el sitio público necesita saber cuál es cada una para armar el `srcset`.
--
-- Es exactamente el mismo razonamiento que ya justificaba la columna
-- `medidas`: **no adivinar, registrar.** Armar el nombre del archivo a partir
-- de una constante del código funcionaría hoy y fallaría con la primera foto
-- cargada desde el otro dispositivo — el navegador pediría `960.webp` de una
-- foto que en realidad es `960.jpg` y la imagen no cargaría.
--
-- Decisión 35 de docs/decisiones.md.
--
-- Se pega en el SQL Editor de Supabase. Es idempotente.
-- ═══════════════════════════════════════════════════════════════════════════

-- El valor guardado es LA EXTENSIÓN DEL ARCHIVO, no el tipo MIME: así el
-- nombre sale de concatenar (`{ancho}.{formato}`) sin ninguna tabla de
-- equivalencias en el medio, que es donde se cometen los errores.
--
-- `default 'webp'` es para las filas que ya existieran; a partir de acá el
-- panel siempre manda el valor explícito.

alter table public.producto_imagenes
  add column if not exists formato text not null default 'webp';

alter table public.proyecto_imagenes
  add column if not exists formato text not null default 'webp';

-- Solo estos dos. Un valor libre acá permitiría que una fila apunte a una
-- extensión que Storage no tiene, y eso se ve como una imagen rota en el
-- sitio público, que es de las cosas más molestas de rastrear.
alter table public.producto_imagenes
  drop constraint if exists producto_imagenes_formato_check;
alter table public.producto_imagenes
  add constraint producto_imagenes_formato_check check (formato in ('webp', 'jpg'));

alter table public.proyecto_imagenes
  drop constraint if exists proyecto_imagenes_formato_check;
alter table public.proyecto_imagenes
  add constraint proyecto_imagenes_formato_check check (formato in ('webp', 'jpg'));

comment on column public.producto_imagenes.formato is
  'Extensión de los archivos de esta fila: webp o jpg. WebKit no sabe generar WebP, así que las fotos cargadas desde un iPhone son JPEG — decisión 35.';
comment on column public.proyecto_imagenes.formato is
  'Extensión de los archivos de esta fila: webp o jpg — decisión 35.';
