# Seguridad

El sitio no maneja pagos ni datos sensibles, pero sí un panel que puede modificar
todo el contenido público, y fotos de domicilios de clientes. Eso alcanza para
tomarse en serio dos cosas: el acceso al panel y la privacidad de las imágenes.

## Capas

```
Navegador
    │
    ▼
Middleware        ── redirige a login si no hay sesión (esto NO es autorización)
    │
    ▼
Server Action     ── verifica sesión E IDENTIDAD. Acá se autoriza de verdad.
    │
    ▼
Supabase
    │
    ▼
RLS               ── protege el camino público, no el del panel
```

Cada capa cubre algo distinto. Ninguna alcanza sola.

## El middleware no autoriza

El archivo es `middleware.ts` en la raíz. Next 16 pide renombrarlo a `proxy.ts`
en cada build y **no hay que hacerlo**: `proxy.ts` obliga al runtime de Node y
el adaptador de Cloudflare solo admite middleware de edge. Se probó y se
revirtió — decisión 26.

El middleware solo mejora la experiencia: si alguien entra a `/admin` sin sesión,
lo manda al login. **No se puede confiar en él como control de acceso.**

Está escrito para que se note: `middleware.ts` ni siquiera lee `ADMIN_USER_ID`.
Comprueba si hay sesión y nada más. Si el archivo se borrara entero, el panel
seguiría siendo inaccesible para cualquiera que no sea la administradora — solo
se perdería la redirección amable.

En 2025 se publicó CVE-2025-29927: una cabecera HTTP permitía saltear por completo
el middleware de Next.js. Cualquier autorización que viviera únicamente ahí quedaba
anulada.

**Regla:** toda Server Action y todo Route Handler verifica por su cuenta, sin
asumir que el middleware corrió. Es una llamada, no cuesta nada.

Mantener Next actualizado.

## Un solo administrador

Que haya un único administrador es una configuración que hay que hacer, no algo que
pase solo. **Supabase Auth permite registro público por defecto.** Si no se
desactiva, cualquiera se crea una cuenta, queda como `authenticated`, y si el panel
solo pregunta "¿hay sesión?", entra.

Obligatorio:

1. **Desactivar el registro público** en la configuración de Auth del proyecto
2. **Crear el único usuario a mano** desde el panel de Supabase
3. **Verificar la identidad concreta**, no solamente que exista sesión

La diferencia es entre _estás logueado_ y _sos vos_:

```ts
// lib/auth.ts
export async function verificarAdmin() {
  const {
    data: { user },
  } = await supabaseServidor().auth.getUser();
  if (!user) throw new Error("No autenticado");
  if (user.id !== process.env.ADMIN_USER_ID) throw new Error("No autorizado");
  return user;
}
```

Toda Server Action del panel arranca llamando a `verificarAdmin()`. Sin
excepciones.

Sin registro, sin roles, sin invitaciones, sin gestión de usuarios. Si algún día
hace falta un segundo administrador, se crea a mano y se pasa de una variable a una
tabla.

## Qué protege realmente RLS

Hay que ser preciso para no generar confianza falsa.

Las escrituras del panel pasan por el servidor con la `service_role key`, que
**saltea RLS por diseño**. Entonces:

- **RLS no protege el panel.** Al panel lo protege `verificarAdmin()`.
- **RLS protege el sitio público**, que lee con la clave anónima.

Las políticas que hacen falta:

```sql
-- solo contenido activo, y solo select
create policy "lectura publica de productos activos"
  on productos for select to anon, authenticated using (activo = true);

create policy "lectura publica de proyectos activos"
  on proyectos for select to anon, authenticated using (activo = true);
```

Las variantes y las imágenes van en la misma línea, heredando la condición del
padre con un `exists`: si el producto no está activo, sus imágenes tampoco se
ven.

**Por qué también `authenticated` y no solo `anon`:** el sitio público se
renderiza con la clave anónima más las cookies de la petición. Si la
administradora navega el sitio público con la sesión abierta, su rol en Postgres
es `authenticated`, y con `to anon` a secas vería el sitio vacío. Es lectura de
contenido que ya es público, así que no agranda nada — decisión 27.

**Ninguna política de `insert`, `update` o `delete` para `anon` ni para
`authenticated`.** Nadie escribe desde el navegador.

Y una segunda capa sobre lo mismo, porque Supabase concede esos permisos por
defecto:

```sql
revoke insert, update, delete, truncate on <las cinco tablas>
from anon, authenticated;
```

Sin políticas, RLS ya rechaza toda escritura. El `revoke` la rechaza un paso
antes, a nivel de permisos, y **sigue rechazándola aunque alguien agregue una
política permisiva por error**. No afecta al panel: `service_role` es otro rol y
conserva sus permisos.

RLS activado en todas las tablas. Una tabla sin RLS en Supabase queda expuesta a
través de la API automática.

### Storage

`storage.objects` viene con RLS activado de fábrica y **no se le crea ninguna
política**. Con eso, ni `anon` ni `authenticated` pueden listar, leer, subir ni
borrar nada. Todo el acceso a las fotos pasa por el servidor con `service_role`:
URLs firmadas para subir (después de `verificarAdmin()`) y URLs firmadas para
servir.

## Claves

| Clave                           | Dónde puede estar       |
| ------------------------------- | ----------------------- |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | navegador, sin problema |
| `SUPABASE_SERVICE_ROLE_KEY`     | **solo servidor**       |
| `RESEND_API_KEY`                | solo servidor           |
| `ADMIN_USER_ID`                 | solo servidor           |

`lib/supabase/admin.ts` lleva `import "server-only"` en la primera línea, para que
el build falle si alguien lo importa desde un componente cliente.

Cualquier cosa con prefijo `NEXT_PUBLIC_` termina en el paquete que descarga el
navegador. No hay excepciones ni forma de ocultarlo.

## Subida de archivos

El navegador nunca sube por su cuenta. Pide una URL firmada, y el servidor la emite
solo después de verificar la identidad.

Validación en el servidor, antes de firmar:

- Tipo MIME entre los permitidos (`image/webp`, `image/jpeg`, `image/png`)
- Tamaño dentro del máximo
- Ruta de destino armada por el servidor, nunca recibida del cliente

Validación en el navegador, antes de subir: extensión, tamaño, y que el archivo se
pueda decodificar como imagen. Es conveniencia, no seguridad — se puede saltear.

Bucket **privado**. Nombres de archivo con UUID.

## Privacidad de las imágenes

Las fotos son de casas particulares de clientes.

**Las fotos de celular llevan coordenadas GPS en el EXIF.** Publicarlas sin
limpiar expone la dirección exacta del domicilio de un cliente a cualquiera que
descargue la imagen. Es el riesgo más concreto de todo el proyecto y no es
hipotético: cualquier visor de metadatos lo muestra.

La recompresión a WebP en canvas descarta el EXIF, y no por un paso que haya
que acordarse de dar: un canvas es un búfer de píxeles y no tiene dónde guardar
metadatos, así que no hay ningún camino por el que el EXIF pueda sobrevivir.

**Igual hay que verificarlo**, porque es el tipo de cosa que se rompe en
silencio el día que alguien cambia el flujo de subida. Desde la Fase 3 es un
comando y no una inspección a ojo:

```
node scripts/revisar-metadatos.mjs foto-original.jpg foto-publicada.webp
```

Dice qué metadatos tiene cada archivo, imprime las coordenadas si las hay, y
devuelve 1 si alguna imagen las conserva. **Se corre sobre las cuatro medidas,
no solo sobre la más grande.**

Verificado en la Fase 3 con dos fotos, y la segunda es la que importa: **una
foto sacada con el teléfono de la empresa, en la casa de un cliente, con la
ubicación activada.** Traía EXIF de iPhone, IPTC y las coordenadas del
domicilio, con precisión de metros. Las tres medidas que generó el panel
salieron sin EXIF, sin XMP y sin GPS, y una búsqueda cruda sobre los bytes no
encuentra ni «Exif», ni «GPS», ni «Apple».

Lo único que sobrevive es el perfil de color ICC (456 bytes), que describe el
espacio de color y no dice nada del lugar, del equipo ni de la fecha. Se
conserva a propósito: sin él los colores de las telas se ven distintos según el
navegador.

**Esa foto es el argumento entero de esta sección**, y conviene tenerlo
presente en vez de leerlo como un requisito abstracto: publicada sin limpiar,
cualquiera que la descargara del sitio abría la dirección exacta de la casa de
un cliente en un mapa.

Aparte de esto: no publicar fotos donde se vean personas, documentos, correspondencia
con direcciones, o el frente de la casa con el número. Es una regla de contenido, no
de código, pero va escrita en el panel.

## Formulario de contacto

- Validación de entrada en el servidor
- Escape del contenido en el email (nada de HTML del usuario)
- Campo trampa oculto contra bots
- Límite por IP
- Los mensajes no se guardan en la base: van al correo y ahí quedan

## Cabeceras

En `next.config`:

- `Content-Security-Policy` acotada a los orígenes propios y Supabase
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

## El panel no se cachea en el borde

Desde la mudanza a Cloudflare, **el proxy es obligatorio**: un Custom Domain de
Workers no funciona en modo "solo DNS". Esto derogó la decisión 15 y trajo una
consecuencia de seguridad que no existía en la etapa anterior.

Ahora hay una caché compartida delante de la aplicación. Si una respuesta
autenticada de `/admin` quedara guardada ahí, Cloudflare podría servírsela a otra
persona. No es un riesgo teórico: es el modo clásico de filtrar una sesión.

Obligatorio antes de que exista el panel:

- Una regla explícita de **bypass de caché para `/admin/*`**, incluidas las
  Server Actions y cualquier Route Handler del panel
- Las respuestas del panel salen con `Cache-Control: private, no-store`
- El sitio público **sí** se cachea: ahí la caché es deseable

La regla va en Cloudflare (Caching → Cache Rules) **y** en las cabeceras que
emite la aplicación. Las dos, porque cada una cubre un hueco de la otra: la regla
protege aunque la aplicación se equivoque, y las cabeceras protegen si algún día
se cambia de proveedor.

Cómo se verifica — **y acá el criterio original no se puede aplicar tal cual**.

La idea era mirar `cf-cache-status` y exigir `BYPASS` o `DYNAMIC`. Al probarlo en
producción apareció que **las rutas servidas por el Worker no llevan esa
cabecera**, ni `/admin` ni la página pública. Solo la llevan los archivos
estáticos, que los sirve el binding de assets:

```
/admin/login                    → (sin cf-cache-status)
/                               → (sin cf-cache-status)
/_next/static/chunks/….css      → CF-Cache-Status: MISS
```

Tiene sentido: en un Custom Domain de Workers la petición va directo al Worker,
que es a la vez borde y origen, así que no pasa por el pipeline de caché que
reporta esa cabecera. **Que esté ausente es más fuerte que `BYPASS`**, no más
débil: no hay caché de por medio.

Lo que sí se verifica, que es lo que la cabecera intentaba aproximar:

1. La respuesta del panel sale con `Cache-Control: private, no-store`.
2. `cf-cache-status` **nunca** es `HIT`.
3. **La prueba que de verdad importa:** pedir `/admin/login` dos veces, una con
   sesión y otra sin, y confirmar que devuelven cosas distintas — y en
   particular que el correo de la sesión **no** aparece en la respuesta que
   recibe un anónimo. Si hubiera una caché compartida sirviendo respuestas
   autenticadas, eso se ve enseguida.

El punto 3 es el que hay que correr; los otros dos son necesarios pero no
suficientes.

## Checklist antes de publicar

- [ ] Registro público desactivado en Supabase Auth
- [ ] RLS activado en todas las tablas
- [ ] Sin políticas de escritura para `anon` ni `authenticated`
- [ ] `service_role key` ausente del paquete del navegador (buscarla en el build)
- [ ] Toda Server Action del panel llama a `verificarAdmin()`
- [ ] `npm run esquema` da verde: la base coincide con el repositorio
- [ ] `/admin` inaccesible sin sesión
- [ ] `/admin` inaccesible con una sesión que no sea la del administrador
- [ ] `/admin` sale con `Cache-Control: private, no-store` y `cf-cache-status`
      nunca es `HIT` (en rutas del Worker la cabecera directamente no aparece)
- [ ] `/admin/login` devuelve contenido distinto con sesión y sin ella, y el
      correo de una sesión no aparece en la respuesta a un anónimo
- [ ] Una foto publicada, descargada, no conserva GPS ni EXIF, en las cuatro
      medidas (`node scripts/revisar-metadatos.mjs`)
- [ ] El bucket no es público
- [ ] El formulario resiste un envío automatizado básico
- [ ] Next en la última versión estable
