# Arquitectura

## Stack

| Capa           | Elección                  |
| -------------- | ------------------------- |
| Framework      | Next.js, App Router       |
| Lenguaje       | TypeScript, modo estricto |
| Estilos        | Tailwind CSS              |
| Base de datos  | PostgreSQL (Supabase)     |
| Autenticación  | Supabase Auth             |
| Archivos       | Supabase Storage          |
| Envío de email | Resend                    |
| Analítica      | Vercel Analytics          |
| Hosting        | Vercel                    |
| DNS            | Cloudflare                |
| Repositorio    | GitHub                    |

La versión de Next se fija en `package.json` sin rango abierto y se actualiza a
propósito, no por arrastre.

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
│   ├── login/page.tsx
│   ├── productos/
│   ├── proyectos/
│   └── layout.tsx               verifica sesión e identidad
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
└── migraciones/
instrumentation.ts               validación de entorno al arrancar
```

Los componentes del panel y los del sitio público comparten `components/ui/` pero
no se mezclan: el panel prioriza densidad y claridad, el público prioriza
composición.

## Subida de imágenes

Este es el punto que más restricciones tiene y hay que respetarlo tal cual.

**El problema:** en Vercel el cuerpo de una petición a una función serverless tope
en ~4.5 MB, y las Server Actions de Next vienen limitadas a 1 MB por defecto. Una
foto de celular pesa entre 3 y 8 MB. Mandar el archivo a través de una Server
Action falla con la primera foto real.

**El flujo correcto:**

```
1. La administradora elige fotos
        ↓
2. NAVEGADOR: normaliza orientación EXIF, redimensiona a 2560px de lado
   mayor, convierte a WebP, borra todo el EXIF
        ↓
3. SERVER ACTION: verifica identidad, valida tipo y tamaño,
   devuelve una URL firmada de subida
        ↓
4. NAVEGADOR: sube el archivo directo a Supabase Storage con esa URL
        ↓
5. SERVER ACTION: guarda la fila en la tabla de imágenes
   (ruta, ancho, alto, orden)
        ↓
6. Se revalidan las rutas afectadas
```

Sigue estando autorizado por el servidor: el navegador no puede subir nada sin una
URL firmada que el servidor emitió después de verificar quién es.

**Por qué se comprime en el navegador y no en el servidor:**

- Esquiva el límite de 4.5 MB
- La subida desde un celular es mucho más rápida
- No consume cuota de transformación de imágenes de Vercel, que en el plan
  gratuito es limitada y este sitio es intensivo en fotos
- Cumple el requisito de "optimización automática" sin infraestructura extra

**Se borra el EXIF siempre.** Las fotos son de casas de clientes y traen
coordenadas GPS. Publicarlas con metadatos expondría la dirección del domicilio.
La recompresión a WebP en canvas ya descarta el EXIF; hay que verificarlo, no
darlo por hecho.

**Hay que normalizar la orientación antes de recomprimir.** Si no, las fotos
sacadas con el teléfono girado aparecen rotadas.

En el sitio público, `next/image` sirve el tamaño que corresponde a cada pantalla
a partir del archivo ya optimizado.

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

`espaciocortinas.com.ar`, registrado en NIC Argentina, hoy sin delegar.

```
NIC Argentina  →  nameservers de Cloudflare  →  registros
                                                 ├── A / CNAME → Vercel
                                                 ├── MX → Google Workspace
                                                 ├── TXT → SPF, DKIM, verificación
                                                 └── TXT → verificación de Resend
```

**Cloudflare en modo "solo DNS", sin proxy.** Proxyear Vercel detrás de Cloudflare
sin configurarlo bien produce bucles de redirección.

**No se toca el DNS de `conceptoespacio.com` en ningún momento.** Todo el trabajo
es sobre el dominio nuevo, que está vacío.

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
que no se versiona, y en Vercel.

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
