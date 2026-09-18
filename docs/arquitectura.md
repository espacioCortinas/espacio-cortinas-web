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
y no un montón de archivos estáticos.

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
│   ├── contacto/page.tsx
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
├── fotos.ts                     GENERADO por scripts/preparar-fotos.mjs
├── marca.ts                     GENERADO por scripts/preparar-marca.mjs
├── tipos.ts
└── index.ts                     une contenido y fotos; es lo que leen las páginas
components/
├── foto.tsx                     el <img> con srcset, proporción y recorte
├── logo.tsx                     el logo del encabezado
├── encabezado.tsx               logo y navegación
├── navegacion.tsx               los cuatro enlaces. ÚNICO "use client" público
├── pie.tsx
├── whatsapp.tsx                 el enlace, con el mensaje según la página
├── datos-estructurados.tsx      JSON-LD del negocio local
└── ui/                          botón, chip, campo, aviso, vacío, contenedor
lib/
├── entorno.ts                   variables públicas
├── entorno-servidor.ts          variables secretas — SOLO servidor
├── entorno-validacion.ts        qué es obligatorio y desde qué fase
├── fotos.ts                     rutas y srcset. Lo ÚNICO que arma rutas de fotos
├── metadata.ts                  title, description, canonical y Open Graph
├── whatsapp.ts                  el mensaje contextual y el enlace
├── texto.ts                     slugs y textos derivados
├── navegacion.ts                los enlaces del menú, en un solo lugar
└── constantes.ts
scripts/
├── preparar-fotos.mjs           recorta, redimensiona y borra los metadatos
├── preparar-marca.mjs           el logo sin fondo y la imagen de Open Graph
└── revisar-metadatos.mjs        comprueba que ninguna publicada conserve GPS
public/fotos/                    las imágenes generadas
public/marca/                    logo.png y og.jpg, GENERADOS
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

| Comando            | Qué hace                                                    |
| ------------------ | ----------------------------------------------------------- |
| `npm run dev`      | Next en local. Es el de todos los días                      |
| `npm run marca`    | rehace `public/marca/` y `contenido/marca.ts` desde el logo |
| `npm run build`    | solo `next build`. Es el que verifica que el código compila |
| `npm run build:cf` | además arma el Worker. Lo que corre el despliegue           |
| `npm run preview`  | levanta el Worker real en local, sobre `workerd`            |
| `npm run deploy`   | despliega a mano. Normalmente no se usa: despliega `main`   |

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
   El orden alfabético es el de la galería y el primero es la portada
        ↓
2. npm run fotos
   sharp: aplica la orientación del EXIF, recorta la portada a 4:5 si hace
   falta, genera un WebP por cada medida y BORRA TODOS LOS METADATOS
        ↓
3. Escribe public/fotos/ y el manifiesto contenido/fotos.ts
        ↓
4. npm run fotos:revisar  — comprueba que ninguna conserve GPS
        ↓
5. git push. El sitio se reconstruye con las fotos adentro
```

**Por qué acá y no en el navegador.** Hasta la Fase 3 esto lo hacía el navegador
de quien subía, y no por gusto: el runtime de Workers no ejecuta módulos nativos
—`sharp` no corre ahí— y la persona que cargaba el contenido no era técnica.
Con el contenido en el repositorio las dos razones desaparecen (decisión 36), y
lo que queda es más simple, más rápido y no depende de qué navegador tenga
nadie. De paso se recuperó WebP para todas las fotos: la rama JPEG existía
porque WebKit no sabe codificar WebP y el panel se usaba desde un iPhone.

**Se borra el EXIF siempre, y por diseño.** `sharp` descarta los metadatos salvo
que se le pidan con `.withMetadata()`, cosa que ese script no hace. Las fotos
son de casas de clientes y traen las coordenadas del domicilio; **igual se
verifica**, porque es lo que se rompe en silencio el día que alguien toca el
pipeline. Ver `docs/seguridad.md`.

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
Formulario → Server Action → validación → Resend → contacto@espaciocortinas.com.ar
```

Sin bandeja en el panel. Los mensajes viven en el correo.

La casilla se resuelve agregando `espaciocortinas.com.ar` como **alias de dominio**
en el Google Workspace existente (`conceptoespacio.com`): sin costo, y los mensajes
caen en la casilla que ya usa. No hace falta cambiar el dominio principal del
Workspace para que el sitio funcione.

Protección contra spam: campo trampa oculto más límite por IP. Sin captcha —
agrega fricción y hay poco volumen.

## Dominio y DNS

`espaciocortinas.com.ar`, registrado en NIC Argentina y delegado a Cloudflare.

```
NIC Argentina  →  nameservers de Cloudflare  →  registros
                                                 ├── @   → el Worker  (proxeado)
                                                 ├── www → placeholder (proxeado,
                                                 │         solo para redirigir)
                                                 ├── MX  → Google Workspace
                                                 ├── TXT → SPF, DKIM, verificación
                                                 └── TXT → verificación de Resend
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
NEXT_PUBLIC_WHATSAPP               número en formato internacional
RESEND_API_KEY                     SOLO SERVIDOR
EMAIL_CONTACTO                     destino del formulario
```

Quedaron cuatro, y solo la primera es obligatoria hoy: las tres restantes se
cargan en la Fase 4.6 con el formulario de contacto. Las cuatro de Supabase se
fueron con la base — decisión 36.

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

- las `NEXT_PUBLIC_*` van en el bloque `vars` de `wrangler.jsonc`, en el
  repositorio. Terminan en el navegador de todas formas, así que no hay nada que
  proteger y sí algo que ganar: el valor de producción se lee en un diff, con
  historial, en vez de ser un Secret ilegible — decisión 30;
- las secretas se cargan con `npx wrangler secret put NOMBRE` y **nunca** van al
  archivo.

**Cargar una variable de texto a mano en el panel del Worker sin declararla en
`wrangler.jsonc` no sirve:** la borra el próximo despliegue. El archivo manda.

**No todas son obligatorias al mismo tiempo.** Solo se exigen las que la fase en
curso ya usa; la lista vive en `lib/entorno-validacion.ts` y cada fase suma la
suya (decisión 21). La verificación corre en el build y al arrancar el servidor:
si falta alguna, corta con la lista completa en vez de fallar más tarde.

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
