# Arquitectura

## Stack

| Capa                | Elección                                |
| ------------------- | --------------------------------------- |
| Framework           | Next.js, App Router                     |
| Lenguaje            | TypeScript, modo estricto               |
| Estilos             | Tailwind CSS                            |
| **Contenido**       | **archivos de este repositorio**        |
| Imágenes            | `sharp`, en la máquina de desarrollo    |
| Envío de email      | Resend                                  |
| Analítica           | Cloudflare Web Analytics                |
| Hosting             | Cloudflare Workers                      |
| Adaptador           | `@opennextjs/cloudflare`                |
| CDN, DNS y TLS      | Cloudflare                              |
| Despliegue continuo | Cloudflare Workers Builds, desde `main` |
| Repositorio         | GitHub                                  |

**No hay base de datos.** Hubo una —PostgreSQL en Supabase, con autenticación,
RLS y un bucket privado— y se sacó junto con el panel de administración en la
decisión 36. El contenido son archivos versionados que se editan a mano y se
publican con un `git push`.

La versión de Next se fija en `package.json` sin rango abierto y se actualiza a
propósito, no por arrastre.

El sitio estuvo en Vercel durante la Fase 1 y se mudó a Cloudflare en julio de
2026 — decisión 24. El motivo es de encuadre, no técnico: el plan Hobby de
Vercel es para uso personal y no comercial.

## Por qué Next y no un SPA

El sitio se comparte por WhatsApp e Instagram. **Los bots que arman la
previsualización de un enlace no ejecutan JavaScript**: leen el HTML crudo. En un
SPA todas las URLs devuelven el mismo HTML vacío, así que cada producto y cada
proyecto compartirían la misma miniatura y el mismo título.

Para un negocio visual que se difunde por mensajería, eso anula buena parte del
valor del sitio. Detalle completo en `docs/decisiones.md`.

## Estrategia de renderizado

| Ruta                              | Cómo se renderiza |
| --------------------------------- | ----------------- |
| `/`                               | estático          |
| `/productos`, `/productos/[slug]` | estático          |
| `/proyectos`, `/proyectos/[slug]` | estático          |
| `/contacto`                       | estático          |

**Todo es estático, y ahora de verdad.** Antes decía «estático, revalidado»,
porque el contenido venía de una base y el panel revalidaba las rutas al
guardar. Con el contenido dentro del build no hay nada que revalidar: cambiar
una foto o un texto es construir de nuevo, y no existe ninguna copia guardada
que pueda quedar vieja. Por eso tampoco hace falta el caché incremental
compartido, que se sacó con sus dos recursos — decisión 36.

**Lo único que ejecuta código en respuesta a un visitante** es la Server Action
del formulario de contacto (Fase 4.6). Por eso el sitio sigue siendo un Worker
y no un montón de archivos estáticos. **`/contacto` sigue siendo estática**: la
página se genera en el build, y lo que corre en el servidor es el envío, cuando
alguien lo pide — un `POST` a la misma ruta.

## Estructura

```
app/
├── (public)/
│   ├── page.tsx                 inicio
│   ├── productos/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── proyectos/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── contacto/
│   │   ├── page.tsx
│   │   └── acciones.ts          la Server Action del formulario. Lo único que
│   │                            corre en respuesta a un visitante
│   ├── layout.tsx               encabezado, salto al contenido y pie
│   ├── loading.tsx              mientras llega la página siguiente
│   └── error.tsx                si se corta la navegación. "use client"
├── not-found.tsx                404. En la raíz: una URL sin ruta no entra
│                                al grupo (public) y no hereda su layout
├── sitemap.ts
├── robots.ts
├── globals.css                  los tokens del sistema
└── layout.tsx
contenido/
├── productos.ts                 se edita a mano
├── proyectos.ts                 se edita a mano
├── contacto.ts                  se edita a mano: casilla, redes y zonas donde trabaja
├── inicio.ts                    se edita a mano: los textos de Inicio
├── fotos.ts                     GENERADO por scripts/preparar-fotos.mjs
├── videos.ts                    GENERADO por scripts/preparar-fotos.mjs
├── marca.ts                     GENERADO por scripts/preparar-marca.mjs: el logo
│                                y las imágenes de Open Graph
├── tipos.ts
└── index.ts                     une contenido y medios; es lo que leen las páginas
components/
├── foto.tsx                     el <img> con srcset, proporción y recorte
├── galeria.tsx                  la tira que se desliza, con fotos y videos
├── video-mudo.tsx               el video mudo, en bucle. "use client" (uno de tres)
├── tarjeta-producto.tsx         la portada y el nombre; la grilla de Inicio
├── tarjeta-proyecto.tsx         el proyecto en fila o en tarjeta
├── listado-proyectos.tsx        el primero en fila y el resto en grilla
├── logo.tsx                     el logo del encabezado
├── encabezado.tsx               logo y navegación
├── navegacion.tsx               los cuatro enlaces. "use client" (uno de tres)
├── formulario-contacto.tsx      el formulario y sus estados. "use client" (uno de tres)
├── pie.tsx
├── whatsapp.tsx                 el enlace, con el mensaje según la página
├── datos-estructurados.tsx      JSON-LD del negocio local
└── ui/                          botón, chip, campo, aviso, vacío, contenedor
lib/
├── entorno.ts                   variables públicas
├── entorno-servidor.ts          las del correo — SOLO servidor
├── entorno-validacion.ts        qué es obligatorio, en el build y al arrancar
├── consulta.ts                  los campos del formulario y su validación, la
│                                misma en el navegador y en el servidor
├── correo.ts                    el correo de la consulta y su envío por Resend
│                                — SOLO servidor
├── fotos.ts                     rutas, srcset y el tope de ancho de cada medio.
│                                Lo ÚNICO que arma rutas de fotos y de videos
├── metadata.ts                  title, description, canonical y Open Graph
├── whatsapp.ts                  el mensaje contextual, el enlace y el número
├── texto.ts                     slugs y textos derivados
├── navegacion.ts                los enlaces del menú, en un solo lugar
└── constantes.ts
scripts/
├── preparar-fotos.mjs           recorta, redimensiona y borra los metadatos
├── preparar-marca.mjs           el logo sin fondo y las imágenes de Open Graph
└── revisar-metadatos.mjs        comprueba que ninguna publicada conserve GPS
public/fotos/                    las imágenes generadas
public/videos/                   los videos publicados y su cuadro de cartel
public/marca/                    logo.png y og.jpg, GENERADOS
public/og/                       la imagen de Open Graph de cada producto y
                                 proyecto, 1200 × 630, GENERADAS
fotos-originales/                los originales. NO se versiona
docs/
next.config.ts
open-next.config.ts
wrangler.jsonc
.nvmrc                           versión de Node del build
```

**Lo escrito a mano y lo generado nunca comparten archivo.** Si estuvieran
juntos, regenerar las fotos pisaría los textos.

## Despliegue

El sitio corre como un **Cloudflare Worker**. Next no sabe nada de Cloudflare: el
adaptador `@opennextjs/cloudflare` toma la salida de `next build` y la envuelve
en un Worker.

```
next build                    →  .next/          (Next, sin cambios)
opennextjs-cloudflare build   →  .open-next/
                                 ├── worker.js   el servidor
                                 └── assets/     estáticos, servidos sin
                                                 ejecutar el Worker
opennextjs-cloudflare deploy  →  Cloudflare
```

Ni `.open-next/` ni `.wrangler/` se versionan: los regenera el build.

### Los tres archivos de configuración

| Archivo               | Qué define                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| `next.config.ts`      | Next. No tiene nada específico de Cloudflare                                                   |
| `open-next.config.ts` | cómo el adaptador traduce Next a Worker: el caché incremental compartido — ver más abajo       |
| `wrangler.jsonc`      | el Worker: nombre, entrada, compatibilidad, estáticos, bindings de caché y las `vars` públicas |

Dos cosas de `wrangler.jsonc` no son opcionales:

- **`nodejs_compat`**, sin la cual el servidor de Next no arranca. Es lo que hace
  que Workers exponga las APIs de Node.
- **`compatibility_date`**, que congela el comportamiento del runtime. Se sube a
  propósito, igual que la versión de Next.

### El caché incremental de `open-next.config.ts`

Tuvo un caché compartido —Workers KV para las páginas y D1 para las etiquetas—
porque el panel revalidaba rutas al guardar, y sin un almacén compartido esa
revalidación tocaba una sola instancia del Worker mientras el resto seguía
sirviendo lo viejo. **Al sacar el panel dejó de haber qué revalidar**
(decisión 36) y los dos recursos se borraron.

**Y ahí quedó un archivo vacío, que rompía el sitio en producción.** El caché
incremental no sirve solo para revalidar: **también es de donde el servidor de
Next lee las páginas ya prerenderizadas**. Sin ningún override, el adaptador
deja el caché `dummy`, que falla todas las búsquedas. Una ruta estática se
vuelve a renderizar y no se nota; `/productos/[slug]`, con
`dynamicParams = false`, no puede renderizarse fuera de su lista de params y
devuelve **404**.

Hoy el archivo usa `staticAssetsIncrementalCache`: las páginas prerenderizadas
viajan entre los assets estáticos del Worker, que ya es donde vive el resto del
sitio. No agrega ningún recurso de Cloudflare que administrar, se reemplaza
entero en cada build y no puede quedar viejo. Detalle en la decisión 39.

**El `tagCache` sigue sin ir.** Si alguna vez vuelve a haber contenido que
cambie sin build, hay que enchufar **las dos** piezas, no una: sin el
`tagCache`, `revalidatePath()` no hace nada y no avisa — decisión 29.

### Comandos

| Comando            | Qué hace                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| `npm run dev`      | Next en local. Es el de todos los días                                                         |
| `npm run marca`    | rehace el logo, las imágenes de Open Graph y `contenido/marca.ts`. Lo encadena `npm run fotos` |
| `npm run build`    | solo `next build`. Es el que verifica que el código compila                                    |
| `npm run build:cf` | además arma el Worker. Lo que corre el despliegue                                              |
| `npm run preview`  | levanta el Worker real en local, sobre `workerd`                                               |
| `npm run deploy`   | despliega a mano. Normalmente no se usa: despliega `main`                                      |

`npm run preview` es lo que hay que correr antes de dar por buena cualquier cosa
que dependa del servidor: es el único que ejecuta el código en el mismo runtime
que producción. `npm run dev` corre sobre Node y **no** detecta un uso de API que
Workers no soporte.

**Y no es solo cuestión de APIs.** `npm run dev` tampoco usa el caché
incremental del adaptador, así que no ve nada de cómo `@opennextjs/cloudflare`
traduce Next a Worker. En la Fase 4.0 eso escondió un 404 en todas las páginas
de producto, con el build y el servidor de desarrollo en verde — decisión 39.
Si el cambio toca rutas, renderizado o caché, `preview` no es opcional.

Lee las variables de `.env.local` gracias a `NEXTJS_ENV=development` en
`.dev.vars`, que no se versiona.

### Despliegue automático

Cloudflare Workers Builds está conectado al repositorio de GitHub. Cada push a
`main` construye y publica. La rama, los comandos y las variables están en
`docs/infraestructura.md`.

La versión de Node del build se fija en `.nvmrc`. Si falta, Cloudflare usa la
suya por defecto, y este proyecto prefiere que eso no cambie sin que nos
enteremos.

## Preparación de imágenes

Las fotos se preparan **una vez, en la máquina de quien desarrolla**, con
`scripts/preparar-fotos.mjs`. Ni el servidor procesa fotos ni se transforma nada
al servir.

```
1. Los originales van en fotos-originales/<entidad>/<slug>/, numerados.
   El orden alfabético es el de la galería y el primero es la portada.
   Un nivel más adentro, una carpeta por variante; y su video al lado,
   con el mismo nombre que la carpeta. En un proyecto, los videos van
   entre las fotos, numerados como ellas
        ↓
2. npm run fotos
   ffmpeg: pasa cada HEIC a JPEG antes, porque sharp no decodifica HEVC;
   uno truncado NO se publica y la corrida termina con error
   sharp: aplica la orientación del EXIF, recorta la portada a 4:5 si hace
   falta, genera un WebP por cada medida y BORRA TODOS LOS METADATOS
   ffprobe/ffmpeg: convierte cada video nuevo, lo mide y le saca el primer
   cuadro de cartel
        ↓
3. Escribe public/fotos/, public/videos/ y los manifiestos
   contenido/fotos.ts y contenido/videos.ts. Y encadena preparar-marca.mjs,
   que arma con cada portada la imagen de Open Graph de su página, en
   public/og/, y la anota en contenido/marca.ts — decisión 59
        ↓
4. npm run fotos:revisar  — comprueba que ninguna conserve GPS, también las
   de public/marca/ y public/og/, que salen de fotos de casas de clientes
        ↓
5. git push. El sitio se reconstruye con las fotos adentro
```

**Las variantes entran un nivel más abajo.** La carpeta de una variante se llama
como su `clave` en `contenido/productos.ts`, y su clave en el manifiesto cuelga
de la del producto: `productos/roller/screen`. El script importa
`contenido/productos.ts` y **avisa en las dos direcciones** —una carpeta que
ninguna variante reclama, una clave sin carpeta— porque las dos fallan calladas.
Decisión 48.

**Ninguna foto de variante es portada**, así que ninguna se recorta a 4:5: los
listados usan siempre la portada del producto.

**El video se mide, no se supone**, y si ya está publicado no se reconvierte:
`public/videos/` está en git y reencodearlo duplicaría su peso en la historia.
Los parámetros de la conversión, para lo que entre de ahora en adelante, están
en `convertirVideo()`; `-map_metadata -1` es la línea que borra las coordenadas,
que un video de celular trae igual que una foto. El lado mayor va a 1280 —no el
ancho: un vertical saldría agrandado— y un video de más de 25 MiB no se publica
(decisión 51).

**Los videos de un proyecto van en su galería**, en el lugar que les da el orden
de la carpeta, y el manifiesto registra ese lugar en `posicion`. Decisión 51.

**Un HEIC de iPhone no lo lee `sharp`**: su binario no trae decodificador HEVC.
El script lo convierte con ffmpeg a un JPEG temporal si está sano, y **se niega**
si está truncado, diciendo cuál es y cómo rescatarlo. Decisión 53.

**Por qué acá y no en el navegador.** Hasta la Fase 3 esto lo hacía el navegador
de quien subía, y no por gusto: el runtime de Workers no ejecuta módulos nativos
—`sharp` no corre ahí— y la persona que cargaba el contenido no era técnica.
Con el contenido en el repositorio las dos razones desaparecen (decisión 36), y
lo que queda es más simple, más rápido y no depende de qué navegador tenga
nadie. De paso se recuperó WebP para todas las fotos: la rama JPEG existía
porque WebKit no sabe codificar WebP y el panel se usaba desde un iPhone.

**Se borra el EXIF siempre, y por diseño.** `sharp` descarta los metadatos salvo
que se le pidan con `.withMetadata()`, cosa que ese script no hace, y los videos
se convierten con `-map_metadata -1`. Las fotos y los videos son de casas de
clientes y traen las coordenadas del domicilio; **igual se verifica**, porque es
lo que se rompe en silencio el día que alguien toca el pipeline. Ver
`docs/seguridad.md`.

`npm run fotos:revisar` lee JPEG, WebP, PNG y MP4 —las dos cajas de ubicación
que existen, `©xyz` de QuickTime y `loci` de 3GPP— y **un formato que no sabe
leer cuenta como fallo**. Hasta la Fase 4.4 lo daba por bueno, y así los dos
videos pasaban sin que nadie los mirara (decisión 48).

**Hay que aplicar la orientación antes de recomprimir.** Si no, las fotos
sacadas con el teléfono girado aparecen rotadas — y después el EXIF ya no existe,
así que no hay segunda oportunidad.

**Los originales no se versionan.** Tienen el EXIF intacto, así que commitearlos
publicaría justamente lo que hay que evitar. Viven en el Drive de la empresa —
decisión 18.

### Cómo se sirven

Con `srcset` y `sizes`, apuntando a las medidas que ya existen en `public/fotos/`:

```html
<img
  src="…/1600.webp"
  srcset="
    …/480.webp   480w,
    …/960.webp   960w,
    …/1600.webp 1600w,
    …/2560.webp 2560w
  "
  sizes="(max-width: 768px) 100vw, 50vw"
  width="1600"
  height="2000"
  alt="…"
/>
```

`width` y `height` salen de las columnas `ancho` y `alto`, y no son decorativos:
sin ellos el navegador no puede reservar el espacio y la página salta mientras
carga.

**El optimizador de `next/image` no se usa.** Si se usa el componente, va con
`unoptimized`; si no, `<img>` directo. Lo que **no** hay que hacer es dejar el
optimizador activo: en Cloudflare gasta la cuota de Transformations por cada
tamaño de cada foto, que es exactamente lo que la decisión 25 evita.

`srcset` es HTML estándar y no depende del hosting. Si el sitio se mudara otra
vez, esta parte no se toca.

**Qué medidas existen, y en qué formato, se lee del manifiesto — no se asume.**
Los campos `medidas` y `formato` de cada foto de `contenido/fotos.ts` dicen
cuáles se generaron para esa foto y con qué extensión. Una foto chica no tiene
las cuatro medidas: una de 1206 px de ancho tiene tres, y armar el `srcset` con
`MEDIDAS_IMAGEN` haría que el navegador pida dos archivos que no existen
(decisiones 32 y 37). Antes esos dos datos eran columnas de una tabla; hoy son
campos de un archivo generado, y la regla es la misma.

Está en `lib/fotos.ts`, y es lo único que arma rutas de imágenes. El componente
que las muestra es `components/foto.tsx`.

Implementación: Fase 4.0.

## Formulario de contacto

```
components/formulario-contacto.tsx   valida en el navegador (lib/consulta.ts)
        │  onSubmit, sin <form action>: lo escrito no se pierde nunca
        ▼
Cloudflare, en el borde              rate limiting de /contacto: 5 cada 10 s
        │
        ▼
app/(public)/contacto/acciones.ts    campo trampa → la MISMA validación otra vez
        │
        ▼
lib/correo.ts                        texto y HTML escapado → fetch a Resend
        │
        ▼
Resend → ventas@espaciocortinas.com.ar, con Reply-To de quien escribió
```

No hay bandeja: los mensajes viven en el correo y no se guardan en ningún otro
lado (decisión 12). Si el envío falla por cualquier razón —la red, el 429 del
borde, Resend, una clave que falta— el formulario conserva lo escrito y ofrece
WhatsApp con el texto ya puesto. El detalle está en las decisiones 54 a 58.

**Sin SDK de Resend y sin librería de formularios**: enviar es un `fetch` con un
JSON, y el formulario son cinco campos del sistema de componentes.

**Lo que cuesta en el Worker es poco, y es a propósito.** El plan gratuito da
10 ms de CPU por pedido: la acción lee el formulario, valida y arma dos textos
de un par de kilobytes. Esperar a Resend es espera de red, que no cuenta.

La casilla se resuelve agregando `espaciocortinas.com.ar` como **alias de dominio**
en el Google Workspace existente (`conceptoespacio.com`): sin costo, y los mensajes
caen en la casilla que ya usa. No hace falta cambiar el dominio principal del
Workspace para que el sitio funcione.

## Dominio y DNS

`espaciocortinas.com.ar`, registrado en NIC Argentina y delegado a Cloudflare.

```
NIC Argentina  →  nameservers de Cloudflare  →  registros
                                                 ├── @   → el Worker  (proxeado)
                                                 ├── www → placeholder (proxeado,
                                                 │         solo para redirigir)
                                                 ├── MX  → Google Workspace
                                                 ├── TXT → SPF, DKIM, verificación
                                                 └── sitio → Resend: CNAME en
                                                             send.sitio y rsend.sitio,
                                                             DKIM en
                                                             resend._domainkey.sitio
```

**El tráfico HTTP va proxeado por Cloudflare**, que es la única forma posible:
el sitio _es_ un Worker de Cloudflare. La decisión 15 pedía lo contrario, pero
existía para no encadenar dos CDN; con un solo proveedor esa razón desapareció.

**El correo no se ve afectado por el proxy.** Solo se proxean registros de
tráfico HTTP (`A`, `AAAA`, `CNAME`); `MX` y `TXT` no son proxeables. Los
registros de Workspace no se tocan nunca.

Los valores exactos, y qué se verifica de cada uno, están en
`docs/infraestructura.md`.

**No se toca el DNS de `conceptoespacio.com` en ningún momento.** Todo el trabajo
es sobre el dominio nuevo.

## Variables de entorno

```
NEXT_PUBLIC_SITE_URL               para canonical, sitemap y Open Graph
NEXT_PUBLIC_WHATSAPP               número en formato internacional, solo cifras
RESEND_API_KEY                     SOLO SERVIDOR, y la única secreta
EMAIL_CONTACTO                     destino del formulario. No es secreta
```

Son cuatro, y desde la Fase 4.6 el build exige las cuatro. Las cuatro de
Supabase se fueron con la base — decisión 36.

Cualquier variable con `NEXT_PUBLIC_` termina en el navegador. Antes de agregar
una, verificar que sea información pública.

La plantilla versionada es `.env.example`; los valores reales van en
`.env.local`, que no se versiona, y en Cloudflare.

**En Cloudflare van dos veces.** Es la diferencia de operación más fácil de
pasar por alto al venir de Vercel, donde había una sola lista:

| Dónde                                              | Cuándo se usa    | Qué necesita                                                           |
| -------------------------------------------------- | ---------------- | ---------------------------------------------------------------------- |
| Settings → Build → **Build variables and secrets** | durante el build | todas. `NEXT_PUBLIC_*` se incrustan acá, y `next.config.ts` valida acá |
| El Worker, en cada petición                        | en runtime       | las que el servidor lee al ejecutarse                                  |

Y en la de runtime **no todas se administran igual**:

- las que no son secretas —las dos `NEXT_PUBLIC_*` y `EMAIL_CONTACTO`— van en
  el bloque `vars` de `wrangler.jsonc`, en el repositorio. No hay nada que
  proteger y sí algo que ganar: el valor de producción se lee en un diff, con
  historial, en vez de ser un Secret ilegible — decisiones 30 y 55;
- la secreta, `RESEND_API_KEY`, se carga con `npx wrangler secret put` y
  **nunca** va al archivo.

**Cargar una variable de texto a mano en el panel del Worker sin declararla en
`wrangler.jsonc` no sirve:** la borra el próximo despliegue. El archivo manda.

**No todas son obligatorias al mismo tiempo.** Solo se exigen las que la fase en
curso ya usa; la lista vive en `lib/entorno-validacion.ts` y cada fase suma la
suya (decisión 21). La verificación corre en el build y al arrancar el servidor:
si falta alguna, corta con la lista completa en vez de fallar más tarde.

**Y el arranque no exige lo mismo que el build** — decisión 56. El build exige
las cuatro; el arranque, solo lo que usan las páginas. Las dos del correo las
comprueba el envío del formulario: si falta la clave en el Worker, falla ese
envío y no el sitio entero. Las dos validan además la **forma**: el número solo
con cifras y empezando por 54, la casilla con forma de dirección, la clave
empezando por `re_`.

## Constantes

No hay pantalla de configuración en V1. Los topes viven en `lib/constantes.ts`:

```ts
export const PROYECTOS_DESTACADOS_HOME = 6;
export const PRODUCTOS_DESTACADOS_HOME = 4;
export const IMAGEN_LADO_MAXIMO = 2560;
export const IMAGEN_PESO_MAXIMO_MB = 8;
```

## Copias de seguridad

- **Código y contenido:** GitHub. El contenido es parte del repositorio, así que
  tiene historial y se recupera como cualquier archivo.
- **Imágenes publicadas:** también en el repositorio, en `public/fotos/`.
- **Originales de las fotos:** fuera del sistema, en el Drive de la empresa. Lo
  que se publica está recomprimido y sin metadatos, y de ahí no se recupera el
  original — decisión 18.

Ya no hay base de datos que exportar.
