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

El middleware solo mejora la experiencia: si alguien entra a `/admin` sin sesión,
lo manda al login. **No se puede confiar en él como control de acceso.**

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
-- anon solo ve contenido activo
create policy "lectura publica de productos activos"
  on productos for select to anon using (activo = true);

create policy "lectura publica de proyectos activos"
  on proyectos for select to anon using (activo = true);
```

Y las imágenes de entidades activas, en la misma línea.

**Ninguna política de `insert`, `update` o `delete` para `anon` ni para
`authenticated`.** Nadie escribe desde el navegador.

RLS activado en todas las tablas. Una tabla sin RLS en Supabase queda expuesta a
través de la API automática.

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

La recompresión a WebP en canvas descarta el EXIF. **Hay que verificarlo**, no
darlo por sentado: subir una foto de prueba con GPS y revisar los metadatos del
archivo publicado. Va como punto del checklist de QA.

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

## Checklist antes de publicar

- [ ] Registro público desactivado en Supabase Auth
- [ ] RLS activado en todas las tablas
- [ ] Sin políticas de escritura para `anon` ni `authenticated`
- [ ] `service_role key` ausente del paquete del navegador (buscarla en el build)
- [ ] Toda Server Action del panel llama a `verificarAdmin()`
- [ ] `/admin` inaccesible sin sesión
- [ ] `/admin` inaccesible con una sesión que no sea la del administrador
- [ ] Una foto publicada, descargada, no conserva GPS ni EXIF
- [ ] El bucket no es público
- [ ] El formulario resiste un envío automatizado básico
- [ ] Next en la última versión estable
