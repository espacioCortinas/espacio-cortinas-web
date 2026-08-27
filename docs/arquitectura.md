# Arquitectura

## Stack

| Capa                | Elección                                |
| ------------------- | --------------------------------------- |
| Framework           | Next.js, App Router                     |
| Lenguaje            | TypeScript, modo estricto               |
| Estilos             | Tailwind CSS                            |
| Base de datos       | PostgreSQL (Supabase)                   |
| Autenticación       | Supabase Auth                           |
| Archivos            | Supabase Storage                        |
| Envío de email      | Resend                                  |
| Analítica           | Cloudflare Web Analytics                |
| **Hosting**         | **Cloudflare Workers**                  |
| Adaptador           | `@opennextjs/cloudflare`                |
| CDN, DNS y TLS      | Cloudflare                              |
| Despliegue continuo | Cloudflare Workers Builds, desde `main` |
| Repositorio         | GitHub                                  |

La versión de Next se fija en `package.json` sin rango abierto y se actualiza a
propósito, no por arrastre.

El sitio estuvo en Vercel durante la Fase 1 y se mudó a Cloudflare en julio de
2026 — decisión 24. El motivo es de encuadre, no técnico: el plan Hobby de Vercel
es para uso personal y no comercial.

## Por qué Next y no un SPA

El sitio se comparte por WhatsApp e Instagram. **Los bots que arman la
previsualización de un enlace no ejecutan JavaScript**: leen el HTML crudo. En un
SPA todas las URLs devuelven el mismo HTML vacío, así que cada producto y cada
proyecto compartirían la misma miniatura y el mismo título.

Para un negocio visual que se difunde por mensajería, eso anula buena parte del
valor del sitio. Detalle completo en `docs/decisiones.md`.

## Estrategia de renderizado

| Ruta                              | Cómo se renderiza                        |
| --------------------------------- | ---------------------------------------- |
| `/`                               | estático, revalidado                     |
| `/productos`, `/productos/[slug]` | estático, revalidado                     |
| `/proyectos`, `/proyectos/[slug]` | estático, revalidado                     |
| `/contacto`                       | estático                                 |
| `/admin/*`                        | dinámico, siempre en servidor, sin caché |

El contenido cambia pocas veces por mes. Las páginas públicas se generan y se
revalidan; al guardar en el panel se revalidan las rutas afectadas para que el
cambio se vea enseguida.

**Regla:** ninguna página pública consulta la base desde el navegador. Los datos
llegan resueltos desde el servidor.

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
│   └── layout.tsx               navegación y pie públicos
├── admin/
│   ├── login/
│   │   ├── page.tsx             decide qué mostrar según la sesión
│   │   └── formulario-login.tsx componente CLIENTE
│   └── (panel)/                 grupo: no agrega segmento a la URL
│       ├── layout.tsx           verifica sesión E IDENTIDAD
│       ├── page.tsx             /admin
│       ├── productos/
│       └── proyectos/
├── sitemap.ts
├── robots.ts
└── layout.tsx
components/
├── ui/                          botón, chip, campo, diálogo
└── ...                          compartidos entre público y admin
lib/
├── supabase/
│   ├── servidor.ts              cliente de servidor
│   ├── navegador.ts             cliente de navegador (solo lectura pública)
│   └── admin.ts                 cliente service_role — SOLO servidor
├── entorno.ts                   variables públicas
├── entorno-servidor.ts          variables secretas — SOLO servidor
├── entorno-validacion.ts        qué es obligatorio y desde qué fase
├── auth.ts                      verificarAdmin()
├── imagenes.ts                  compresión, EXIF, subida
└── constantes.ts
acciones/                        Server Actions, una por entidad
docs/
supabase/
└── migraciones/                 .sql numerados, se aplican a mano (decisión 28)
middleware.ts                    solo redirige. NO renombrar a proxy.ts (dec. 26)
instrumentation.ts               validación de entorno al arrancar
next.config.ts                   configuración de Next
open-next.config.ts              configuración del adaptador de Cloudflare
wrangler.jsonc                   configuración del Worker
.nvmrc                           versión de Node del build
```

**Por qué el grupo `(panel)`:** el layout que verifica identidad no puede
envolver al login, o redirigiría al login desde el propio login y sería un
bucle. Un grupo de rutas resuelve eso sin ensuciar las URLs: los paréntesis no
agregan segmento, así que `app/admin/(panel)/page.tsx` sigue sirviendo `/admin`
y `/admin/login` queda deliberadamente afuera de la verificación — es la puerta.

Los componentes del panel y los del sitio público comparten `components/ui/` pero
no se mezclan: el panel prioriza densidad y claridad, el público prioriza
composición.

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

### Qué hay en `open-next.config.ts`

El caché compartido, resuelto en la Fase 3. Sin él, `revalidatePath()` desde el
panel invalida la copia de **una** instancia del Worker y las demás siguen
sirviendo la página vieja: la administradora guardaría un cambio y lo vería o no
según qué instancia la atienda.

**Son dos piezas, y la de arriba sola no alcanza:**

| Pieza              | Recurso                         | Qué guarda                       |
| ------------------ | ------------------------------- | -------------------------------- |
| `incrementalCache` | Workers KV `cache-incremental`  | la página ya renderizada         |
| `tagCache`         | D1 `espacio-cortinas-etiquetas` | cuándo se revalidó cada etiqueta |

`revalidatePath()` no borra nada: anota en el `tagCache` que la etiqueta de esa
ruta se revalidó recién. En la visita siguiente el adaptador compara esa marca
contra la fecha de lo guardado y, si es más nueva, renderiza de nuevo en esa
misma petición. Sin `tagCache` —que viene en `dummy` por defecto y no avisa—
`revalidatePath()` no hace nada.

Por qué KV y no R2, por qué D1 y no KV para las etiquetas, y por qué no hay
`queue`: decisión 29 de `docs/decisiones.md`.

### Comandos

| Comando            | Qué hace                                                    |
| ------------------ | ----------------------------------------------------------- |
| `npm run dev`      | Next en local. Es el de todos los días                      |
| `npm run build`    | solo `next build`. Es el que verifica que el código compila |
| `npm run build:cf` | además arma el Worker. Lo que corre el despliegue           |
| `npm run preview`  | levanta el Worker real en local, sobre `workerd`            |
| `npm run deploy`   | despliega a mano. Normalmente no se usa: despliega `main`   |

`npm run preview` es lo que hay que correr antes de dar por buena cualquier cosa
que dependa del servidor: es el único que ejecuta el código en el mismo runtime
que producción. `npm run dev` corre sobre Node y **no** detecta un uso de API que
Workers no soporte.

Lee las variables de `.env.local` gracias a `NEXTJS_ENV=development` en
`.dev.vars`, que no se versiona.

### Despliegue automático

Cloudflare Workers Builds está conectado al repositorio de GitHub. Cada push a
`main` construye y publica. La rama, los comandos y las variables están en
`docs/infraestructura.md`.

La versión de Node del build se fija en `.nvmrc`. Si falta, Cloudflare usa la
suya por defecto, y este proyecto prefiere que eso no cambie sin que nos
enteremos.

## Subida de imágenes

Este es el punto que más restricciones tiene y hay que respetarlo tal cual.

**Todo el trabajo sobre la imagen ocurre en el navegador de quien sube, una sola
vez.** Ni el servidor procesa fotos ni se transforma nada al servir. Las dos
razones, que son independientes:

1. **No se puede procesar en el servidor.** `sharp` es un módulo nativo y el
   runtime de Workers no ejecuta binarios nativos. Además el plan gratuito da
   10 ms de CPU por invocación, muy por debajo de lo que cuesta redimensionar una
   foto de 8 MB (decisión 5).
2. **No se puede transformar al servir.** Las Transformations de Cloudflare, en
   el plan gratuito, topan en 5.000 transformaciones únicas por mes y pasado el
   tope devuelven error en vez de degradarse. Para un sitio de 300 fotos con
   cuatro cortes cada una, ese techo se toca (decisión 25).

**El flujo correcto:**

```
1. La administradora elige fotos
        ↓
2. NAVEGADOR: normaliza la orientación EXIF, borra todo el EXIF, y genera
   CUATRO WebP del mismo original — 480, 960, 1600 y 2560 px de lado mayor
        ↓
3. SERVER ACTION: verifica identidad, valida tipo y tamaño,
   devuelve las URLs firmadas de subida
        ↓
4. NAVEGADOR: sube los cuatro archivos directo a Supabase Storage
        ↓
5. SERVER ACTION: guarda la fila en la tabla de imágenes
   (ruta, ancho, alto, orden, y QUÉ MEDIDAS existen)
        ↓
6. Se revalidan las rutas afectadas
```

Sigue estando autorizado por el servidor: el navegador no puede subir nada sin una
URL firmada que el servidor emitió después de verificar quién es.

**Se borra el EXIF siempre.** Las fotos son de casas de clientes y traen
coordenadas GPS. Publicarlas con metadatos expondría la dirección del domicilio.
La recompresión a WebP en canvas ya descarta el EXIF; hay que verificarlo, no
darlo por hecho — en las cuatro medidas, no solo en la grande.

**Hay que normalizar la orientación antes de recomprimir.** Si no, las fotos
sacadas con el teléfono girado aparecen rotadas.

### Cómo se sirven

Con `srcset` y `sizes`, apuntando a las medidas que ya existen en Storage:

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

**Qué medidas existen se lee de la base, no se asume.** La columna `medidas` de
la tabla de imágenes dice cuáles se generaron para esa fila. Ver
`docs/modelo-de-datos.md`.

Implementación: Fase 3.

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
NEXT_PUBLIC_SUPABASE_URL           pública
NEXT_PUBLIC_SUPABASE_ANON_KEY      pública, solo lectura de contenido activo
NEXT_PUBLIC_SITE_URL               para canonical, sitemap y Open Graph
SUPABASE_SERVICE_ROLE_KEY          SOLO SERVIDOR — nunca NEXT_PUBLIC_
ADMIN_USER_ID                      solo servidor — user.id del administrador
RESEND_API_KEY                     solo servidor
EMAIL_CONTACTO                     destino del formulario
NEXT_PUBLIC_WHATSAPP               número en formato internacional
```

Cualquier variable con `NEXT_PUBLIC_` termina en el navegador. Antes de agregar
una, verificar que sea información pública.

La plantilla versionada es `.env.example`; los valores reales van en `.env.local`,
que no se versiona, y en Cloudflare.

**En Cloudflare van dos veces.** Es la diferencia de operación más fácil de pasar
por alto al venir de Vercel, donde había una sola lista:

| Dónde                                              | Cuándo se usa    | Qué necesita                                                           |
| -------------------------------------------------- | ---------------- | ---------------------------------------------------------------------- |
| Settings → Build → **Build variables and secrets** | durante el build | todas. `NEXT_PUBLIC_*` se incrustan acá, y `next.config.ts` valida acá |
| Settings → **Variables and Secrets**               | en cada petición | las que el servidor lee en tiempo de ejecución                         |

Cargarlas en un solo lado falla de dos formas distintas y las dos son confusas:
si faltan en el build, el despliegue corta con la lista de faltantes (que es lo
que se busca); si faltan en el runtime, el sitio se publica y falla en la primera
petición que toque el servidor.

**En el runtime no todas se administran igual, desde la Fase 3.** Las tres
`NEXT_PUBLIC_*` se declaran en el bloque `vars` de `wrangler.jsonc`: terminan en
el navegador de todos modos, así que no hay nada que proteger, y ahí el valor
queda auditable en el repositorio en vez de ser ilegible. Las dos secretas
—`SUPABASE_SERVICE_ROLE_KEY` y `ADMIN_USER_ID`— se cargan como Secret y **nunca**
van al archivo. Un Secret no se puede volver a leer: si se pierde, se rota en
Supabase y se vuelve a cargar. Decisión 30.

En la lista de **build** siguen haciendo falta las cinco, y ahí el tipo es
indistinto: esa lista no la toca wrangler.

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

- **Código:** GitHub
- **Base:** Supabase se queda en el plan gratuito, que **no incluye copias
  automáticas**. Exportación manual cada tanto, que a este volumen de datos
  alcanza (decisión 18)
- **Imágenes:** viven en Supabase Storage. Conservar los originales sin comprimir
  fuera del sistema (Drive de la empresa), porque lo que se sube está recomprimido
