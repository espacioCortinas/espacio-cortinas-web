# Plan de desarrollo

Cinco fases. Cada una termina con algo verificable, no con "está avanzado".

El repositorio es la fuente de verdad, no la conversación. Cada fase deja los
documentos actualizados si algo cambió.

---

## Fase 0 — Antes de escribir código

Sin esto, las fases siguientes trabajan a ciegas.

- [ ] Auditar el material fotográfico real: cuántos trabajos hay documentados,
      cuántas fotos utilizables por trabajo, qué calidad
- [ ] Pasar `docs/fotografia.md` a quien saca las fotos y **sacar un juego de
      prueba vertical** de un trabajo, para diseñar contra material del formato
      definitivo y no contra el archivo histórico
- [ ] Delegar `espaciocortinas.com.ar` a Cloudflare desde NIC Argentina
- [ ] Agregar el dominio como alias en Google Workspace y verificar que
      `contacto@espaciocortinas.com.ar` recibe
- [ ] Crear el proyecto en Supabase y desactivar el registro público
- [ ] Crear el repositorio en GitHub

**Terminado cuando:** hay fotos reales para diseñar y el correo del dominio nuevo
funciona.

---

## Fase 1 — Cimientos

Solo estructura. Nada de páginas.

- Proyecto Next con App Router y TypeScript estricto
- Tailwind con los tokens del sistema
- Estructura de carpetas de `docs/arquitectura.md`
- Clientes de Supabase: servidor, navegador y `admin` con `server-only`
- Variables de entorno y su validación al arrancar
- Linter, formateo y `tsc --noEmit` en verde
- Despliegue con el dominio apuntando (se hizo en Vercel y se mudó a Cloudflare
  Workers al terminar la fase — decisión 24)

**Terminado cuando:** el sitio despliega en el dominio real, muestra una página
vacía y el build pasa limpio.

**No hacer:** empezar a diseñar páginas.

---

## Fase 2 — Base de datos y autenticación

- Migraciones de las cinco tablas de `docs/modelo-de-datos.md`
- Índice único parcial de portada
- Trigger de `actualizado_en`
- RLS activado, con las políticas de lectura pública
- Bucket privado de imágenes
- Usuario administrador creado a mano
- `verificarAdmin()` y el middleware de redirección
- Login y logout funcionando

**Terminado cuando:**

- `/admin` redirige al login sin sesión
- `/admin` rechaza una sesión que no sea la del administrador
- Consultar las tablas con la clave anónima solo devuelve contenido activo
- Escribir con la clave anónima falla

---

## Fase 3 — Panel de administración

Antes que el sitio público, a propósito: cuando exista el sitio público va a hacer
falta contenido real para diseñarlo, y el contenido se carga desde acá.

- ABML de productos, con variantes
- ABML de proyectos
- Activar / desactivar, destacar / quitar destacado
- Galería: subir, eliminar, reordenar, elegir portada
- Compresión y limpieza de EXIF en el navegador
- **Generación de las cuatro medidas al subir** (480/960/1600/2560, WebP) y
  registro de cuáles existen — decisión 25
- Subida por URL firmada
- Confirmación antes de eliminar
- Revalidación de las rutas afectadas al guardar
- **Caché incremental compartido del adaptador de Cloudflare** (Workers KV o R2)
  en `open-next.config.ts`: sin eso, revalidar desde el panel toca una sola
  instancia del Worker y el resto sigue sirviendo lo viejo

**Terminado cuando:**

- Se sube una foto de 8 MB desde un celular y funciona
- La foto publicada, descargada, no tiene GPS ni EXIF, en las cuatro medidas
- Guardar en el panel se ve reflejado en el sitio público sin esperar
- Se cargan dos productos y dos proyectos completos de punta a punta
- El panel se usa cómodo desde un teléfono

---

## Fase 4 — Diseño y sitio público

La fase más larga. Se subdivide, pero **la dirección visual se define primero y
una sola vez**.

**4.1 Dirección visual.** Con las fotos reales a la vista: color, tipografía,
ritmo, tratamiento de imagen. Sin escribir componentes todavía.

**4.2 Sistema y estructura.** Componentes base, navegación y pie, estados de carga,
vacío y error.

**4.3 Proyectos.** `/proyectos` y `/proyectos/[slug]`, con galería.

**4.4 Productos.** `/productos` y `/productos/[slug]`, con variantes.

**4.5 Inicio.** Se compone al final, cuando ya existe todo lo que tiene que
anticipar.

**4.6 Contacto.** Formulario con Resend, y WhatsApp contextual en todo el sitio.

**Terminado cuando:**

- Se ve bien en 320, 375, 768, 1024 y 1440
- "Ver código fuente" muestra el contenido, no un `div` vacío
- Ninguna de las reglas prohibidas de `docs/diseno.md` está presente
- El mensaje de WhatsApp cambia según desde dónde se lo abrió

---

## Fase 5 — SEO, rendimiento y publicación

- Metadata y Open Graph por página, con imagen propia
- `sitemap.ts` y `robots.ts`
- URLs canónicas
- Datos estructurados de negocio local
- Cloudflare Web Analytics activado, con evento propio para los clics a WhatsApp
- Revisión de Core Web Vitals en móvil
- Alta en Google Search Console
- **Alta del Perfil de Empresa de Google** — para búsquedas locales pesa más que
  cualquier optimización del sitio
- Checklist de seguridad de `docs/seguridad.md`, completo
- Revisión con `/code-review` y `/security-review`

**Terminado cuando:**

- Pegar un enlace de un proyecto en WhatsApp muestra su foto, su título y su
  descripción
- Lighthouse móvil en verde en rendimiento y accesibilidad
- El checklist de seguridad está entero tildado

---

## Después de V1

En orden de valor probable, no comprometido:

1. Guía de fotografía para la empresa — sube la calidad del sitio más que
   cualquier cambio de código
2. Analítica, una vez elegida
3. Relación entre productos y proyectos
4. Vista previa antes de publicar
5. Segundo administrador

---

## Cómo trabajar

- Una fase por vez. No adelantar trabajo de fases posteriores.
- Al empezar una fase, leer `CLAUDE.md`, `docs/decisiones.md` y el documento de la
  fase.
- Si aparece una decisión no contemplada: preguntar, decidir, y **anotarla en
  `docs/decisiones.md`** antes de seguir.
- Si algo de la documentación resulta equivocado al implementarlo, se corrige el
  documento en el mismo commit que el código.
