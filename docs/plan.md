# Plan de desarrollo

Cinco fases. Cada una termina con algo verificable, no con "está avanzado".

El repositorio es la fuente de verdad, no la conversación. Cada fase deja los
documentos actualizados si algo cambió.

---

## Fase 0 — Antes de escribir código

Sin esto, las fases siguientes trabajan a ciegas.

- [ ] Auditar el material fotográfico real: cuántos trabajos hay documentados,
      cuántas fotos utilizables por trabajo, qué calidad — la parte del
      catálogo se hizo en la 4.1 (`docs/diseno.md`, «El material real»)
- [ ] Pasar `docs/fotografia.md` a quien saca las fotos y **sacar un juego de
      prueba vertical** de un trabajo, para diseñar contra material del formato
      definitivo y no contra el archivo histórico
- [x] Delegar `espaciocortinas.com.ar` a Cloudflare desde NIC Argentina
- [x] Agregar el dominio como alias en Google Workspace y verificar que
      `contacto@espaciocortinas.com.ar` recibe — el formulario terminó yendo a
      `ventas@espaciocortinas.com.ar`, que ya recibía (Fase 4.6), y lo
      verificado es esa: `contacto@` no se usó
- [x] Crear el proyecto en Supabase y desactivar el registro público — y
      después se borró, en la Fase 3.5 (decisión 36)
- [x] Crear el repositorio en GitHub

**Terminado cuando:** hay fotos reales para diseñar y el correo del dominio nuevo
funciona.

---

## Fase 1 — Cimientos — HECHA

Solo estructura. Nada de páginas.

- Proyecto Next con App Router y TypeScript estricto
- Tailwind con los tokens del sistema
- Estructura de carpetas de `docs/arquitectura.md`
- Clientes de Supabase: servidor, navegador y `admin` con `server-only` —
  se fueron en la Fase 3.5
- Variables de entorno y su validación al arrancar
- Linter, formateo y `tsc --noEmit` en verde
- Despliegue con el dominio apuntando (se hizo en Vercel y se mudó a Cloudflare
  Workers al terminar la fase — decisión 24)

**Terminado cuando:** el sitio despliega en el dominio real, muestra una página
vacía y el build pasa limpio.

**No hacer:** empezar a diseñar páginas.

---

## Fase 2 — Base de datos y autenticación — HECHA, y después REVERTIDA

Todo lo de esta fase se sacó en la 3.5 —decisión 36—. Queda como registro.

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

## Fase 3.5 — Sacar el panel — HECHA

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

Después la decisión 40 los reordenó en siete productos con variantes.

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
(Lo de la carpeta no resultó así: `tsc` no ve el disco — ver
`docs/modelo-de-datos.md`, «Por qué TypeScript y no JSON».)

Los campos son los mismos que tenían las tablas —decisiones 8 y 11 siguen
valiendo— menos los que existían solo por el panel: `id`, `creado_en`,
`actualizado_en` y `orden` desaparecen. El orden pasa a ser el del arreglo, que
es más fácil de leer y de cambiar.

### Paso 2 — El pipeline de imágenes

```
scripts/preparar-fotos.mjs
   entrada:  una carpeta con los originales
   salida:   public/fotos/{entidad}/{slug}/{n}/{ancho}.webp
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

**`components/ui/` se queda**: botón, campo y aviso los usa el formulario de
contacto de la Fase 4.6. El diálogo de confirmación, `confirmar.tsx`, era del
panel y se borró en este mismo paso.

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
   `open-next.config.ts` — decisión 29 sin objeto. Vaciarlo del todo rompió
   las páginas de producto: la decisión 39 le volvió a poner un caché, sobre
   los assets estáticos
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
dentro de su margen. Sin texto sobre la foto. Reemplazada en la 4.6 por el logo
solo, centrado: WhatsApp recortaba esta composición — decisión 62. Y después,
por una foto distinta en cada página, con el logo abajo — decisiones 63 y 64.

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

**4.3 Proyectos — HECHA.** `/proyectos` y `/proyectos/[slug]`, destrabada por el
primer proyecto cargado, `cowork-nordelta`: seis fotos y dos videos, uno de
ellos el primer vertical del sitio.

- **Los videos van intercalados en la galería**, en el lugar que les da la
  carpeta, en bucle como los de producto — decisión 51. `components/video-variante.tsx`
  se generalizó a `components/video-mudo.tsx`, que entra en una diapositiva
  con su propia proporción; `components/galeria.tsx` acepta fotos y videos.
- **El listado está pensado para uno y para veinte**: el primero en fila, el
  resto en grilla de tres — decisión 52. Medido con veinte: 5.751 px a 1440.
- **Inicio suma su sector de proyectos**, con la misma regla, a pedido de quien
  desarrolla y con un solo proyecto — decisión 52.
- **El pipeline**: el lado mayor de un video va a 1280 —el vertical se habría
  agrandado—, un video de más de 25 MiB no se publica, y un HEIC se convierte
  con ffmpeg o, si está truncado, no se publica y se dice por qué — decisiones
  51 y 53.

**Queda pendiente de la 4.3, y lo resuelve la empresa:** la descripción del
proyecto, que es provisoria y está marcada así en `contenido/proyectos.ts`.

**4.4 Productos — HECHA.** `/productos` es **una fila por producto**, con la
portada de un lado y el nombre, la descripción y las variantes del otro, y el
lado alternado en escritorio. Se eligió entre tres composiciones renderizadas
con el material real en un andamio que ya se borró — decisión 49: siete
productos no se reparten parejo en ninguna grilla, y una fila por producto no
deja huérfano en ningún ancho. `/productos/[slug]` se compuso en cuatro sectores
—apertura, variantes, más fotos, cierre—, con las variantes **antes** que el
resto de la galería porque es lo que decide la compra.

`components/tarjeta-producto.tsx` queda para Inicio, que sigue siendo una grilla
de anticipo, y perdió la prop `nivel` que había durado una sola decisión.

Lo grande de la fase fueron **las ocho fotos de variante**, que estaban en el
disco y que el pipeline no veía. Se resolvieron las tres capas: el script baja
un nivel y cruza lo que encuentra contra `contenido/productos.ts`, `Variante`
gana una `clave` escrita a mano, y la galería las muestra en la posición de su
variante. Y **los dos videos**, con su cuadro de cartel extraído por el script,
en bucle, mudos, sin saltar a pantalla completa y sin reproducirse con
`prefers-reduced-motion`.

De la dirección «Regla» se tomó la idea que quedaba: **el tamaño del módulo de
cada foto sale de la foto y no de su posición**, pero leído del manifiesto y no
de la tabla de calidad de `docs/diseno.md`. Decisión 48, que también anota dos
hallazgos de contenido sobre los videos y que el control de metadatos daba por
buena cualquier cosa que no supiera leer.

**Queda pendiente de la 4.4, y lo resuelve la empresa:** `venecianas-madera` y
`venecianas-pvc` tienen la misma descripción palabra por palabra y ahora quedan
en filas consecutivas con el párrafo a la vista —se publica así a propósito,
decisión 49—; el video del roller motorizado no muestra un roller; y el de
cortinas de tela es vertical dentro de una caja 16:9. Acortar las descripciones
además bajaría el alto de la página, que ronda los 6.000 px en escritorio.

**4.5 Inicio — HECHA, fuera de orden.** Se adelantó a pedido: la página se
compuso antes que `/proyectos` (4.3) y `/productos` (4.4), porque el armazón
de la 4.2 la dejaba sin estructura. Cinco sectores —apertura, qué hacemos, cómo
trabajamos, arquitectos y oficinas, cierre— decididos mirando cuatro sitios
profesionales del rubro, con los textos provisorios en `contenido/inicio.ts`
esperando la redacción de la empresa. Decisión 47.

Al ir a construirla apareció que **los siete productos tenían `destacado:
false`** y que no hay ningún proyecto, así que las dos secciones con contenido
que este plan pedía para Inicio renderizaban vacío las dos. Se marcaron cuatro
destacados por criterio de venta, no fotográfico.

~~**Queda pendiente de la 4.5:** el sector de proyectos, que entra cuando haya
contenido cargado.~~ Entró en la Fase 4.3, con el primer proyecto — decisión 52.

**El andamio de la 4.1 se borró el 29/09/2026, y era lo único que quedaba de
la 4.5:** `app/muestra/` entera —página, estilos y tipografías— más
`public/muestra-logo.png`. Era para elegir la dirección visual y dejó de tener
sentido apenas el sitio estuvo compuesto. Ninguna otra ruta los importaba.
Decisión 41.

**4.6 Contacto — HECHA.** Es la página que importa: el objetivo comercial del
sitio es que alguien termine escribiendo por WhatsApp.

- **`/contacto` compuesta**: WhatsApp como único botón principal, los otros
  medios —teléfono, email, redes y dónde trabaja la empresa— en una lista con
  filetes, y el formulario para quien prefiere escribir con tiempo. Sigue siendo
  estática.
- **El formulario**: cinco campos, tres obligatorios, validación en el
  navegador y **otra vez en el servidor**, correo en texto y HTML escapado con
  `Reply-To`, campo trampa, y lo escrito no se pierde nunca: si el envío falla,
  ofrece WhatsApp con el texto ya puesto — decisión 57.
- **Resend sobre `sitio.espaciocortinas.com.ar`**, sin tocar un solo registro
  del correo de Google — decisión 54.
- **El límite de envíos**, una regla de rate limiting en el borde, con lo que da
  el plan gratuito — decisión 58.
- **WhatsApp obligatorio y encendido en todo el sitio**, y el mensaje de
  producto corregido: decía «el Venecianas de PVC» — decisión 61.
- ~~**La imagen para compartir es una sola: el logo centrado sobre el
  papel**~~ — decisiones 59 y 62. **Reemplazada después de la fase por la
  decisión 63: una foto distinta en cada página**, y en la 64 se le sumó el
  logo, centrado en una banda de papel abajo. Lo que WhatsApp cortaba era un
  logo contra el borde en la 59, no la idea de una imagen por página. Doce
  imágenes de 1200 × 630, entre 68 y 149 kB, elegidas y miradas una por una en
  `contenido/compartir.ts`.
- **La ficha de negocio local**, con zonas, teléfono, email y redes, desde
  `contenido/contacto.ts` — decisión 60.
- **Después de la fase, los medios directos** — decisión 65: el número
  completo, `+54 9 11 3311 1686`; el logo de WhatsApp, el de Instagram y un
  sobre al lado de cada medio; y «Llamar», la variante para arquitectos,
  estudios y oficinas, en `/contacto` y en Inicio.
- Las variables del correo ya no pueden tirar el sitio: el build exige las
  cuatro, el arranque solo lo que usan las páginas — decisiones 55 y 56.

**Terminado cuando:**

- Se ve bien en 320, 375, 768, 1024 y 1440
- "Ver código fuente" muestra el contenido, no un `div` vacío
- Ninguna de las reglas prohibidas de `docs/diseno.md` está presente
- El mensaje de WhatsApp cambia según desde dónde se lo abrió

---

## Fase 4.7 — Rediseño a partir del boceto de la empresa — EN CURSO

**Por qué existe.** En octubre de 2026 la empresa miró el sitio terminado y lo
rechazó en lo visual: «no tiene diseño, se nota que lo hizo una IA», y tampoco
le gustaron los colores. La estructura sí le pareció bien. Armó un boceto en
Wix, publicado en `ventas35961.wixsite.com/my-site`, con sus colores, su armado
y un logo nuevo.

Tenía razón, y tiene nombre: el fondo crema, la Fraunces en los títulos, la
lista numerada con filetes y las etiquetas chicas en mayúscula espaciada están
hoy entre las marcas más repetidas de los sitios generados con IA. Y el sitio no
tenía ni un color propio.

**Se adapta el sitio a la idea del boceto; no se copia el boceto.** No anda en
el teléfono —la versión móvil la armó Wix sola, y el sitio se va a ver casi
entero desde uno—, usa fotos de muestra de la plantilla, tiene párrafos enteros
en mayúscula, mezcla dos letras en los títulos y deja restos de plantilla
(`info@misitio.com`, «My Site»).

**Reabre las decisiones 43 y 44**: la dirección «Cal» y el amarillo como única
marca. La decisión nueva se escribe en la etapa 5, con el resultado a la vista.

### Cómo se trabaja

- **En la rama `rediseno`.** `main` no se toca hasta que la empresa apruebe, y
  hay un commit por etapa: cualquiera se puede deshacer sola.
- **Cada etapa se muestra al terminar**, con capturas a 375 y a 1440. La
  empresa revisa después de la 1 y de la 2, para ver la dirección antes de que
  se componga el resto.
- **Lo que sale de las fotos se mantiene; lo que era gusto, no.** Siguen
  valiendo: nada de texto sobre una foto, ninguna foto más ancha que su tope
  —regla 4 de `CLAUDE.md`— y las portadas 4:5 en los listados. Cambian el
  papel, las letras, el acento y la composición.

### Etapas

**1. Sistema: color, letra y logo — HECHA.** Cambia la cara de todas las
páginas sin tocar su armado.

- La paleta del boceto, medida de su código: fondo `#EDEFF0`, texto `#2F2F2F`,
  pizarra `#405357` para títulos, enlaces y botón principal, azul verdoso
  `#80A6AD` como color de superficie y el teal oscuro `#607D82` en el pie.
- Dos arreglos de contraste: **sobre el azul verdoso el texto va oscuro** —el
  blanco del boceto da 2,3:1, y hacen falta 3 aun en letra grande— y **el pie
  se oscurece un poco**, porque el blanco sobre `#607D82` da 4,42:1.
- Raleway para todo, con cifras de línea: por defecto trae las antiguas, que
  suben y bajan y desparejan un teléfono o «25 mm». Se van Fraunces y Karla.
  Tahoma, que el boceto usa en algunos títulos, no: es de Windows, en los
  teléfonos no está.
- El logo nuevo, de círculos de línea. El archivo que mandó la empresa pasa a
  `fotos-originales/logo-vacio.png`, que no se versiona, y
  `scripts/preparar-marca.mjs` publica la medida que hace falta.
- Encabezado, pie y un botón flotante de WhatsApp abajo a la derecha, como el
  «¡Chateá con nosotros!» del boceto. Resuelve además lo que la decisión 49
  dejó pendiente: en el catálogo, desde el teléfono, WhatsApp quedaba al final
  de una página de más de 7.000 px.

Lo que salió distinto de lo previsto: **el pie perdió su botón de WhatsApp**,
que con el flotante quedaba repetido. Y **el menú del teléfono se probó como
un botón «Menú»** desplegable y se volvió a los enlaces a la vista, a pedido:
a 13 px y sin espaciado entre letras, los cuatro entran en una fila desde los
teléfonos de 360 de ancho; con «Nosotros», en la etapa 4, van a pasar a dos
renglones.

**2. Inicio — HECHA.**

- Apertura: el bloque azul verdoso con el logo, montado sobre el borde de una
  foto nuestra, y el lema debajo. En el teléfono, la foto a lo ancho y el
  bloque pisando su borde de abajo. El bloque es opaco: no hay texto sobre la
  foto.
- Productos: cada uno con su portada y un bloque azul verdoso con el nombre,
  alternando lados, con las tres frases del boceto intercaladas.
- «Cómo trabajamos»: de la lista 01–04 a la grilla de 2×2 con líneas finas de
  las páginas de producto del boceto.
- El sector de proyectos pasa a llamarse «Nuestros trabajos».
- El cierre, en azul verdoso.

Lo que salió distinto de lo previsto:

- **La frase del boceto «Brindamos asesoramiento e instalación…» abre el
  sector de productos** y no la apertura, que es donde la pone el boceto: es
  la que presenta su zigzag. La apertura se queda con nuestra bajada, que dice
  qué se vende y dónde, cosa que el lema no dice.
- **El logo grande pidió un archivo más**, `public/marca/logo-grande.png`, de
  1.200 px: en el bloque se ve de hasta 416, y el de 600 se quedaba corto en
  una pantalla de doble densidad. Es nuevo, no se reescribió el de 600.
- **El enlace del sistema pasó a heredar el color** de lo que lo rodea: la
  pizarra sobre el azul verdoso da 3,08:1, y en el cierre hay un enlace.
- «Cortinas de tela» pasó a «Cortinas de confección» acá y no en la etapa 3,
  porque el nombre se ve en los destacados de Inicio.
- **En Inicio el encabezado no lleva el logo**, después de la primera
  revisión: con el del encabezado y el del bloque, en el teléfono el logo
  salía dos veces en la primera pantalla. Es lo que hace el boceto —su
  encabezado no tiene logo—, y en el resto de las páginas el logo sigue
  arriba. Con eso, en el teléfono el bloque pasó arriba de la foto.
- **Instagram en la apertura**, debajo del lema, que es donde lo pone el
  boceto.

**3. Producto y proyecto — HECHA.** El lema arriba del título, el título centrado, y
las variantes en el damero de 2×2 del boceto: foto y texto alternados, con
líneas finas y de borde a borde. **Las fotos no se recortan**: cada celda toma
la proporción de su foto. A media pantalla casi todas tienen resolución de
sobra; a pantalla completa no alcanzaría ninguna (`docs/diseno.md`, punto 2 del
análisis). Los campos nuevos —`lema` y `recuadro`— van en `contenido/tipos.ts`.

Cómo quedó:

- **Qué va en cada celda lo decide `lib/damero.ts`**, que explica la regla, y
  `components/damero.tsx` lo dibuja. Lo corto: la portada con el recuadro del
  producto; Screen y Blackout de Roller, que en el boceto tenían página
  propia, con su propio 2×2; las demás variantes juntas en una celda de texto,
  sin esconder ninguna; y lo suelto de a dos, con el nombre de su variante
  arriba de cada foto.
- **La portada dejó de ir sola en la apertura**: es la primera celda del
  damero. Y la tira que se desliza (decisión 50) ya no la usa ninguna página:
  `components/galeria.tsx` se borra en la etapa 5 si la empresa aprueba el
  damero, y si no, se vuelve a ella.
- **Las fotos no hacen saltar la página al cargar.** Con ancho automático, una
  foto diferida mide 300 px hasta que llega: en Roller la página pasaba de
  4.814 a 6.503 px mientras cargaban. El ancho de cada foto sale ahora de una
  cuenta con su proporción, y el alto queda fijo desde el principio.
- **Cortinas de confección perdió su explicación de riel y barral** con la
  descripción del boceto, así que esa parte de la descripción anterior se
  repartió en las variantes, sin reescribirla, como en la decisión 40.

**4. Listados, Contacto y Nosotros — HECHA.**

- Las grillas de portadas 4:5 se quedan, con el nombre en una banda azul
  verdosa debajo de la foto.
- Contacto con el armado del boceto —los datos a la izquierda, el formulario a
  la derecha— y WhatsApp como único botón principal.
- **Página nueva, `/nosotros`**, con los textos del boceto: la empresa pidió
  sumarla. Entra al menú, al sitemap y a la ficha de negocio local.
- El menú queda: Inicio, Productos, Nuestros trabajos, Nosotros, Contacto.
  **La dirección `/proyectos` no cambia**, solo su nombre en pantalla: los
  enlaces que ya circulan siguen andando (decisión 10).

Cómo quedó:

- **El menú entra en una fila, con «Trabajos» y en minúscula**: la empresa no
  quería dos renglones, y con «Nuestros trabajos» o en mayúscula no hay forma
  —medido con la letra real en `components/navegacion.tsx`—. La página sigue
  llamándose «Nuestros trabajos». Probado en una fila a 320, 360, 375 y 768.
- **El catálogo y el listado de trabajos no quedaron en grilla con banda**,
  como decía arriba, sino como filas del damero de las páginas de producto,
  con las mismas piezas (`components/damero.tsx` las exporta): así lo que se
  lista y lo que se abre se leen como lo mismo. La regla de la decisión 52
  sigue: el primer trabajo en fila y el resto en grilla.
- **Nosotros** junta las dos páginas del boceto, con una foto del archivo al
  lado de cada texto. La ficha de negocio local no lista páginas, así que no
  hubo nada que sumarle; y la imagen para compartir es la de Inicio hasta la
  etapa 5, que la hace propia.
- **Se fueron todas las etiquetas chicas en mayúscula espaciada** que quedaban:
  la de Contacto, las de sus datos, las de los listados, la del estado vacío,
  la de la página que no existe y la de error.
- Verificado en el runtime de producción con `npm run preview`: todas las
  páginas responden 200, `/nosotros` está en el sitemap y una ruta que no
  existe da 404.

**5. Cierre.**

- Las doce imágenes para compartir, de nuevo, con el logo nuevo.
- El favicon, que nunca hubo (decisión 45), a partir de los círculos del logo.
- La documentación: `docs/diseno.md` con la dirección nueva —y «Cal» al final,
  con las otras descartadas—, la decisión nueva en `docs/decisiones.md`,
  `/nosotros` en `docs/producto.md` y los campos nuevos en
  `docs/modelo-de-datos.md`.
- Merge a `main`, con la aprobación de la empresa.

**Terminado cuando:**

- La empresa aprobó el resultado en su teléfono
- Se ve bien en 320, 375, 768, 1024 y 1440
- Ningún texto sobre el azul verdoso queda por debajo de 4,5:1, ni el del pie
- `npm run build`, `tsc --noEmit`, eslint y `npm run preview` pasan, y
  `npm run fotos:revisar` da verde

### Los textos

**Se usan todos los del boceto**, a pedido de la empresa, con el criterio que
ya se siguió con las descripciones de `contenido/productos.ts`: se corrigen la
ortografía, las tildes y la puntuación, no las palabras ni el tono. Los
párrafos que el boceto escribe en mayúscula van en minúscula, con su mayúscula
inicial. Donde el boceto no tiene texto —«Cómo trabajamos», arquitectos y
oficinas, el cierre, las variantes que no son de roller— queda el que hay.

Se copian acá porque el boceto es un sitio de Wix que la empresa puede cambiar
o borrar, y el repositorio es la fuente de verdad.

**Inicio**

- Lema: «hacé de tus espacios / tu mejor compañía», con la minúscula del
  boceto en la entrada.
- La frase que abre los productos: «Brindamos asesoramiento e instalación de
  nuestros productos.»
- Las tres frases que van entre los productos:
  1. «Dar a cada espacio la luz natural que requiere es nuestra tarea.
     Combinando estética y funcionalidad.»
  2. «La luz, el calor y el aire son elementos vitales para el planeta. El
     control de estos elementos es un desafío para el hombre, desarrollando
     cada vez más instrumentos y tecnología.»
  3. «Nuestros productos son la respuesta más inteligente a este desafío.
     Controlar estos elementos sin perjudicarlos mejora nuestra calidad de
     vida, creándonos un hábitat ideal.»

**Productos.** Cada página del boceto trae un lema, una descripción y un
recuadro con un título y dos o tres frases. Así se reparten entre los siete
productos del sitio:

| Página del boceto      | Va a                                                                     |
| ---------------------- | ------------------------------------------------------------------------ |
| Roller Screen          | la variante Screen de `roller`                                           |
| Roller Blackout        | la variante Blackout de `roller`                                         |
| Cortinas de confección | `cortinas-tela`, que pasa a llamarse así; la dirección no cambia         |
| Venecianas             | `venecianas-madera` y `venecianas-pvc`, el mismo texto, como ya pasa hoy |
| Toldos                 | `toldos`                                                                 |
| —                      | `compacta-blackout` y `bandas-verticales`: textos nuevos, con su estilo  |

_Roller_ — lema «filtrar u oscurecer», que junta los de sus dos páginas; la
descripción del producto queda.

- Screen, «filtrar la luz»: «Los tejidos microperforados permiten ver hacia el
  exterior, contribuyendo a mejorar el confort visual de quien vive o trabaja
  en ambientes interiores. Difunden la luz y garantizan la privacidad en los
  ambientes. El sistema más eficaz para filtrar la luz y reducir el calor.
  Disponible en distintos factores de apertura adaptables a cada necesidad.»
  Recuadro: «manuales y automatizadas» — «Disfrutar los espacios de interior.
  Una luz para relajarse. Una luz para la creatividad.»
- Blackout, «oscurecer»: «Las cortinas roller blackout permiten generar
  oscuridad en los ambientes. El blackout es un tejido que puede ser sintético
  o entelado, totalmente opaco a la luz, combinando practicidad y estética.
  Complementados con perfilería de aluminio, garantizan un sistema totalmente
  impermeable a la luz.» Recuadro: «manuales y automatizadas» — «Modulando la
  luz con las cortinas, cada espacio adquiere un significado diferente. La luz
  define la relación entre el ambiente y los que lo habitan.»

_Cortinas de confección_ — «calidez»: «Combinar la calidez de las telas nos
permite dar a cada ambiente un sello particular. Combinando distintas
texturas, las cortinas de confección cubren grandes superficies cumpliendo
todas las funciones: filtran la luz, dan intimidad y oscurecen. Amplían los
ambientes y pueden combinar muy bien en cualquier espacio.» Recuadro:
«manuales y automatizadas» — «Los géneros brindan calidez a los ambientes.
Generan buena acústica y amplitud.»

_Venecianas de madera y de PVC_ — «estilo»: «Las cortinas venecianas modulan la
luz. En sus varias versiones —aluminio, PVC y madera— se transforman en un
objeto decorativo. Muy funcionales y prácticas, proporcionan la solución ideal
para cada necesidad.» Recuadro: «venecianas: 25 mm aluminio, 50 mm aluminio,
50 mm PVC, 50 mm madera» — «Funcionales y decorativas.»

_Toldos_ — «vivir el aire libre»: «Los toldos son sistemas de protección solar
de uso externo. De brazos extensibles, verticales o punto recto, estos sistemas
permiten disfrutar de los espacios abiertos. La variedad de lonas, tejidos y
mecanismos los convierte en el complemento ideal a la hora de proteger
viviendas y comercios. La estética en sus formas acompaña siempre fachadas y
contrafrentes.» Recuadro: «manuales y automatizados» — «Los toldos detienen el
impacto directo del sol. Permiten que podamos disfrutar de los espacios
abiertos.»

_Compacta Blackout_ — **texto nuevo**, con el estilo del boceto y los datos de
la descripción que había: «descansar»: «Las cortinas compactas blackout logran
la oscuridad más completa en los ambientes. La tela se enrolla dentro de un
cajón y corre por guías laterales que impiden el paso de la luz por los
costados. Manuales o motorizadas, son la solución ideal para dormitorios y
espacios de descanso, dentro de las medidas que permite el sistema.» Recuadro:
«manuales y automatizadas» — «Oscuridad completa, a cualquier hora del día. Un
ambiente pensado para descansar.»

_Bandas verticales_ — **texto nuevo**, igual: «orientar la luz»: «Las bandas
verticales permiten orientar la luz y regular la privacidad, girando sobre su
propio eje. Se recogen hacia un costado y dejan la ventana despejada. En telas
translúcidas o blackout, son la solución ideal para grandes ventanales,
puertas corredizas y oficinas.» Recuadro: «translúcidas o blackout» — «La luz
justa para cada momento del día. Orden y amplitud en los espacios de trabajo.»

**Nosotros** — página nueva:

- Título: «Nosotros». Bajada: «Ofrecemos soluciones para cada exigencia,
  brindando protección y regulación de la luz natural, con tecnología en cada
  detalle.»
- «Propósito»: «Con vasta experiencia en el rubro, seguimos cada proyecto de
  principio a fin. La calidad de nuestra materia prima garantiza los
  resultados. Siempre a disposición del cliente, estudiamos cada solución.
  Brindamos asesoramiento para particulares y profesionales. Servicio de
  posventa.»
- «Visión»: «Preservando la calidad de nuestros productos, garantizamos como
  resultado un producto confiable y duradero. Incorporamos tecnología y confort
  en nuestros productos.»
- «Cuidamos los detalles»: «Contamos con un servicio de asesoramiento a
  domicilio, acompañando a profesionales en sus proyectos y a clientes
  particulares.»

**Nuestros trabajos** — el título de `/proyectos` y del sector de Inicio. El
boceto dice «trabajos realizados»; la empresa eligió «Nuestros trabajos».

**Lo que se corrigió**, para que se pueda revisar: intalación, compañia,
estetica, desafio, mas, tecnologia, creandonos, habitat, confeccion, generos,
acustica, relacion, proteccion y regulacion llevan su tilde; experiecia,
brindandondo, tranforman, pemiten, sienpre, «untejido que puede puede» y «post
venta» se escriben bien; «mejorar en confort» pasa a «mejorar el confort»; «la
variedad… los convierten» concuerda en singular; y salen las comas entre sujeto
y verbo —«…que requiere, es nuestra tarea», «…materia prima, garantiza»,
«…sus formas, acompaña»—.

---

## Fase 5 — SEO, rendimiento y publicación — PENDIENTE

Al 28/09/2026 no hay analítica —ninguna página carga el script de Cloudflare—,
ni cabeceras de seguridad, ni Perfil de Empresa (`perfilDeGoogle` sigue en
`null`).

Los cuatro primeros puntos se adelantaron a la Fase 4.0 — decisión 38. Quedan
tachados acá para que no se hagan dos veces, y con lo que sí falta de cada uno:

- ~~Metadata y Open Graph por página, con imagen propia~~ — la imagen propia
  de cada página es una foto con el logo abajo, desde las decisiones 63 y 64.
  Falta confirmar en un WhatsApp de verdad cómo se ve la tarjeta con la banda:
  los bots piden bien la imagen, pero la tarjeta la dibuja la aplicación
- ~~`sitemap.ts` y `robots.ts`~~
- ~~URLs canónicas~~
- ~~Datos estructurados de negocio local~~ — completados en la Fase 4.6 con
  zonas, teléfono, email y redes (decisión 60). Falta `address` y horario, que
  no se pueden inventar; sale junto con el Perfil de Empresa de Google
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

1. ~~Guía de fotografía para la empresa~~ — existe: `docs/fotografia.md`. Lo
   que falta es pasársela a quien saca las fotos (Fase 0)
2. ~~Analítica, una vez elegida~~ — elegida en la decisión 17, y está en la
   Fase 5
3. Relación entre productos y proyectos
4. Vista previa antes de publicar
5. ~~Segundo administrador~~ — sin objeto: no hay panel (decisión 36)

---

## Cómo trabajar

- Una fase por vez. No adelantar trabajo de fases posteriores.
- Al empezar una fase, leer `CLAUDE.md`, `docs/decisiones.md` y el documento de la
  fase.
- Si aparece una decisión no contemplada: preguntar, decidir, y **anotarla en
  `docs/decisiones.md`** antes de seguir.
- Si algo de la documentación resulta equivocado al implementarlo, se corrige el
  documento en el mismo commit que el código.
