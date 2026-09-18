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
- **Regla de bypass de caché para `/admin/*`** en Cloudflare, más
  `Cache-Control: private, no-store` en las respuestas del panel. Con el proxy
  obligatorio hay una caché compartida delante de la aplicación, y una respuesta
  autenticada cacheada se le puede servir a otra persona — ver `docs/seguridad.md`

Arrastrado de la Fase 1:

- Completar `.dev.vars` con las mismas variables que `.env.local`. Hoy solo tiene
  `NEXTJS_ENV`, y alcanzaba porque nada leía Supabase en runtime; con el login
  deja de alcanzar y `npm run preview` va a fallar en local
- Agregar `ADMIN_USER_ID` a las obligatorias, y cargarla en `.env.local` y en las
  **dos** listas del Worker
- Confirmar en la consola de Supabase que el registro público está desactivado.
  `docs/infraestructura.md` lo da por hecho pero nunca se verificó
- Con el primer componente cliente, comprobar que la `anon key` sí entra al
  bundle y que la `service_role` sigue afuera

**Terminado cuando:**

- `/admin` redirige al login sin sesión
- `/admin` rechaza una sesión que no sea la del administrador
- `/admin` responde con `cf-cache-status: BYPASS` o `DYNAMIC`, nunca `HIT`
- Consultar las tablas con la clave anónima solo devuelve contenido activo
- Escribir con la clave anónima falla
- El bucket de imágenes no es accesible públicamente

---

## Fase 3 — Panel de administración — HECHA, y después REVERTIDA

Se construyó entera, se verificó y se desplegó. Se sacó a propósito una vez
terminada: el contenido cambia pocas veces al año y quien desarrolla prefiere
editarlo a mano. **Decisión 36**, que incluye la objeción que eso deja abierta
—la empresa deja de poder publicar sola— y por qué se decidió seguir igual.

Lo que llegó a funcionar, verificado en producción y desde un iPhone real: ABML
de productos y proyectos, publicar y destacar, galería con subida, orden,
portada y borrado, compresión y limpieza de EXIF en el navegador, subida por URL
firmada, y caché incremental compartido sobre Workers KV y D1.

**Está todo en el historial.** Commits `bcb9f19` a `e524d4c`. Volver atrás es
recuperar archivos, no reescribirlos.

Lo que sí sobrevive de esta fase, porque no dependía del panel:

- Se confirmó que un push a `main` despliega de verdad, que estaba sin comprobar
  desde la mudanza
- `scripts/revisar-metadatos.mjs`, que dice si una imagen conserva GPS
- Las decisiones 30 y 32

---

## Fase 3.5 — Sacar el panel

El contenido pasa a archivos del repositorio y Supabase se va entero.
**Decisión 36.**

### Paso 0 — Conservar lo que vale

Las fotos cargadas eran de prueba y se descartan. Lo único que se conserva son
los ocho nombres del catálogo, que son los de verdad y son el punto de partida
de `contenido/productos.ts`:

```
Roller Blackout · Roller Screen · Compacta Blackout · Cortinas de tela
Venecianas de aluminio · Venecianas de madera o PVC
Toldos de brazos · Toldos vertical
```

**Va primero de todo igual**, porque es el único paso que después no se puede
deshacer: una vez borrado el proyecto de Supabase no hay de dónde sacarlos.

### Paso 1 — Dónde vive el contenido

Módulos TypeScript, no JSON ni MDX:

```
contenido/
├── productos.ts
├── proyectos.ts
└── tipos.ts
```

**Por qué TypeScript y no JSON:** este contenido se edita a mano, así que
conviene que el editor autocomplete y que `tsc` frene el build si falta un
campo, si un booleano está mal escrito o si una foto apunta a una carpeta que no
existe. Con JSON esos errores aparecen en producción, como una página en blanco.

Los campos son los mismos que tenían las tablas —decisiones 8 y 11 siguen
valiendo— menos los que existían solo por el panel: `id`, `creado_en`,
`actualizado_en` y `orden` desaparecen. El orden pasa a ser el del arreglo, que
es más fácil de leer y de cambiar.

### Paso 2 — El pipeline de imágenes

```
scripts/preparar-fotos.mjs
   entrada:  una carpeta con los originales
   salida:   public/fotos/{slug}/{n}-{ancho}.webp
             + el manifiesto con ancho, alto y medidas de cada foto
```

`sharp` entra como dependencia **de desarrollo**: no llega al sitio. Descarta
los metadatos salvo que se le pidan, y `.rotate()` sin argumentos aplica la
orientación EXIF antes de recomprimir — o sea que el borrado sigue siendo
estructural y no un paso que alguien pueda olvidar.

WebP para todas, sin la rama JPEG de la decisión 35: ya no comprime ningún
navegador.

**Los datos técnicos los calcula el script.** Anchos, alto y qué medidas existen
dejan de ser algo que una persona pueda cargar mal, que es la diferencia central
con la alternativa de dejar el contenido en Supabase y editarlo a mano.

**Pendiente de decidir antes de cargar el archivo histórico:** si las fotos van
en git, en `git-lfs` o fuera del repositorio. Son unas 300 por cuatro medidas,
del orden de 240 MB, y git guarda todas las versiones de cada archivo que se
reemplace. Con las pocas de hoy no importa; con 300 sí. No bloquea nada de esta
fase.

### Paso 3 — Borrar el panel

En este orden, para que el build siga pasando entre paso y paso:

```
app/admin/                     10 archivos    724 líneas
acciones/                       5 archivos  1.145 líneas
components/panel/               7 archivos  1.197 líneas
lib/panel/                      4 archivos    541 líneas
lib/imagenes.ts                               391 líneas
lib/auth.ts                                   107 líneas
middleware.ts                                 124 líneas
lib/supabase/                   3 archivos    107 líneas
lib/revalidacion.ts                            42 líneas
lib/estado-del-servidor.ts                     47 líneas
```

**`components/ui/` se queda**: botón, campo, aviso y diálogo los usa el
formulario de contacto de la Fase 4.6.

Salen de `package.json` `@supabase/ssr` y `@supabase/supabase-js`. Entra `sharp`
como `devDependency`.

Se achican `lib/entorno.ts`, `lib/entorno-servidor.ts`,
`lib/entorno-validacion.ts`, `instrumentation.ts` y `next.config.ts`: queda una
sola variable obligatoria.

### Paso 4 — Desmontar la infraestructura

**Con el sitio nuevo ya desplegado y respondiendo**, nunca antes. El orden
importa: si se borra un recurso que el Worker todavía referencia, el sitio se
cae.

1. Sacar los bindings de KV y D1 de `wrangler.jsonc` y vaciar
   `open-next.config.ts` — decisión 29 sin objeto
2. Desplegar y verificar que el sitio responde
3. Borrar el namespace de KV y la base D1
4. Borrar de las **dos** listas del Worker `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` y
   `ADMIN_USER_ID`. Sobrevive `NEXT_PUBLIC_SITE_URL`
5. Último de todo, y con una exportación guardada por las dudas: el proyecto de
   Supabase

### Paso 5 — La documentación

| Documento                 | Qué pasa                                                   |
| ------------------------- | ---------------------------------------------------------- |
| `docs/modelo-de-datos.md` | se reemplaza entero: describe archivos, no tablas          |
| `docs/seguridad.md`       | queda un tercio: sin panel no hay auth, ni RLS, ni subidas |
| `docs/producto.md`        | se va la sección «Panel de administración»                 |
| `docs/arquitectura.md`    | stack, estructura y la sección de imágenes                 |
| `docs/infraestructura.md` | Supabase sale de los servicios                             |
| `CLAUDE.md`               | las reglas 2, 3 y 5 dejan de tener sentido                 |
| `supabase/`               | se borra la carpeta entera, con las seis migraciones       |

**Terminado cuando:**

- Los ocho productos están en `contenido/productos.ts` y el sitio los lee de ahí
- `npm run build`, `tsc --noEmit`, eslint y prettier pasan limpios
- No queda ninguna referencia a Supabase en el código
- Producción responde 200 en `/`, y `/admin` devuelve 404
- `npx wrangler secret list` no devuelve ninguno
- El correo sigue intacto: el MX sigue siendo `smtp.google.com`

---

## Fase 4 — Diseño y sitio público

La fase más larga. Se subdivide, pero **la dirección visual se define primero y
una sola vez**.

**4.0 Armazón — HECHA.** El sitio público existe, con el contenido leído de
`contenido/`, las rutas generadas desde ahí, el componente de imagen, la
metadata por página, `sitemap.ts`, `robots.ts`, los datos estructurados y el
WhatsApp contextual. **Sin nada visual decidido:** maquetación mínima con los
valores por defecto de Tailwind, a propósito, para no condicionar la 4.1.

La metadata, el sitemap, el robots y los datos estructurados estaban en la Fase
5 y se adelantaron acá — decisión 38: `generateMetadata()` vive en el mismo
archivo que la página, así que dejarla para el final significaba volver a abrir
los diez archivos.

**4.1 Dirección visual — HECHA.** Análisis de las 23 fotos una por una, tres
direcciones alternativas renderizadas con el material real en `/muestra`, y una
elegida: **«Cal» con el acento de «Regla»** — decisión 43. Los tokens están
fijados en `app/globals.css`, las dos familias se cargan con `next/font` en
`app/tipografias.ts`, y `docs/diseno.md` quedó reescrito con la dirección
ganadora y con las dos descartadas al final.

El logo llegó durante esta fase y cambió la paleta: su amarillo `#FFF100` no
puede ser el acento —1,06:1 contra el papel— así que el acento es el negro del
propio logo y el amarillo es un color de superficie con reglas de uso propias.

~~**Queda para la 4.2 la imagen de Open Graph de reserva**~~ — hecha:
`public/marca/og.jpg`, 1200×630, con el logo sobre el papel y `cortinas-tela/1`
dentro de su margen. Sin texto sobre la foto.

**4.2 Sistema y estructura — HECHA.** Los tokens de la 4.1 se volvieron
componentes: botón con tres variantes, chip, campo, aviso, estado vacío y la
columna de la página. Encabezado y pie de verdad, con el logo procesado desde
`fotos-originales/logo.jpg`. `components/foto.tsx` pasó a recibir proporción y
recorte, con **recorte alto por defecto** porque el piso es la zona más oscura y
más desordenada de casi todas las fotos. Estados de carga, vacío y error, con
`/proyectos` diciendo que está vacía en vez de taparlo. Y la imagen de Open Graph
de reserva, que venía arrastrada de la 4.1.

**El problema de la fase era el logo sobre el papel**, y se resolvió apoyándolo
directo sobre el papel de cal, sin campo propio y sin mover `--color-fondo`:
medido, las tres salidas posibles se separan menos de dos unidades de ΔE2000 y
ninguna compra lo que cuesta — decisión 44.

**Sigue sin haber favicon**, y ahora está escrito por qué: el círculo amarillo
viene cortado por el borde superior del archivo fuente, así que el recorte
literal sale sucio y cualquier otra composición sería un lockup nuevo que la
empresa no autorizó — decisión 45.

**4.3 Proyectos.** `/proyectos` y `/proyectos/[slug]`, con galería.

**4.4 Productos.** `/productos` y `/productos/[slug]`, con variantes.

**4.5 Inicio.** Se compone al final, cuando ya existe todo lo que tiene que
anticipar.

**Y se borra el andamio de la 4.1:** `app/muestra/` entera —página, estilos y
tipografías— más `public/muestra-logo.png`. Era para elegir la dirección visual
y deja de tener sentido apenas el sitio está compuesto. Ninguna otra ruta los
importa. Decisión 41.

**4.6 Contacto.** Formulario con Resend, y WhatsApp contextual en todo el sitio.

**Terminado cuando:**

- Se ve bien en 320, 375, 768, 1024 y 1440
- "Ver código fuente" muestra el contenido, no un `div` vacío
- Ninguna de las reglas prohibidas de `docs/diseno.md` está presente
- El mensaje de WhatsApp cambia según desde dónde se lo abrió

---

## Fase 5 — SEO, rendimiento y publicación

Los cuatro primeros puntos se adelantaron a la Fase 4.0 — decisión 38. Quedan
tachados acá para que no se hagan dos veces, y con lo que sí falta de cada uno:

- ~~Metadata y Open Graph por página, con imagen propia~~ — y la **imagen de
  reserva**, hecha en la Fase 4.2
- ~~`sitemap.ts` y `robots.ts`~~
- ~~URLs canónicas~~
- ~~Datos estructurados de negocio local~~ — falta `address` y horario, que no
  se pueden inventar; sale junto con el Perfil de Empresa de Google
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
