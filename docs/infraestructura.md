# Infraestructura

Estado real de los servicios. Se actualiza cuando algo cambia.

**Acá no van claves ni contraseñas.** Las credenciales viven en el gestor de
contraseñas de la empresa y en las variables de entorno. Ver
`docs/arquitectura.md`.

## Titularidad

Todas las cuentas de servicios están a nombre de **`ventas@conceptoespacio.com`**,
una dirección de la empresa, no personal. Es deliberado: si la persona que
desarrolla el sitio deja la empresa, la empresa conserva el control.

`ventas@espaciocortinas.com.ar` es un alias de esa misma casilla — las dos
direcciones entran al mismo buzón.

## Dominio

`espaciocortinas.com.ar`

|                   |                               |
| ----------------- | ----------------------------- |
| Registrador       | NIC Argentina                 |
| Alta              | 21/07/2026                    |
| **Vencimiento**   | **21/07/2027**                |
| Titular registral | persona física, no la empresa |
| DNS               | Cloudflare, plan Free         |

**Poner recordatorio de renovación para junio de 2027.** Un dominio vencido tira
el sitio y el correo a la vez, y si otro lo registra puede ser irrecuperable.

El acceso a NIC es con Clave Fiscal de AFIP del CUIT titular, con el servicio
"NIC Argentina" adherido en el Administrador de Relaciones.

### Delegación

```
leia.ns.cloudflare.com
simon.ns.cloudflare.com
```

Activa y verificada.

## Registros DNS

Todo se administra en Cloudflare.

### Correo — NO TOCAR

Estos cinco registros hacen funcionar el correo de la empresa. Si se rompen, la
empresa se queda sin mail. **Ninguna tarea de hosting los toca**: `MX` y `TXT` ni
siquiera son proxeables, así que encender o apagar el proxy del sitio no los
afecta.

| Tipo | Nombre              | Contenido                                                 | Para qué                 |
| ---- | ------------------- | --------------------------------------------------------- | ------------------------ |
| MX   | `@`                 | `smtp.google.com` (prio 1)                                | correo de Workspace      |
| TXT  | `@`                 | `google-site-verification=…`                              | verificación del dominio |
| TXT  | `@`                 | `v=spf1 include:_spf.google.com ~all`                     | SPF                      |
| TXT  | `google._domainkey` | `v=DKIM1; k=rsa; p=…`                                     | DKIM                     |
| TXT  | `_dmarc`            | `v=DMARC1; p=none; rua=mailto:ventas@conceptoespacio.com` | DMARC                    |

Comprobación obligatoria después de cualquier cambio de DNS:

```powershell
Resolve-DnsName -Name espaciocortinas.com.ar -Type MX -Server leia.ns.cloudflare.com
```

Tiene que devolver `smtp.google.com` con prioridad `1`. Nada más.

### Sitio

| Tipo       | Nombre | Contenido                        | Proxy       | Para qué                    |
| ---------- | ------ | -------------------------------- | ----------- | --------------------------- |
| gestionado | `@`    | el Worker `espacio-cortinas-web` | 🟠 proxeado | el sitio                    |
| AAAA       | `www`  | `100::`                          | 🟠 proxeado | solo para redirigir al apex |

**El registro del apex no se carga a mano.** Lo crea Cloudflare al agregar el
Custom Domain en el Worker, aparece marcado como gestionado por Workers y no se
edita desde DNS. Para que pueda crearlo, antes hay que borrar el registro `A` que
ocupaba ese nombre.

**`100::` es una dirección reservada de descarte, no un error.** Es el
placeholder que documenta Cloudflare para un nombre que solo existe para
redirigir: como el registro está proxeado, la petición nunca sale hacia esa
dirección — la atiende Cloudflare y la Redirect Rule la manda al apex. Lo que
importa es que `www` **no** es un Custom Domain del Worker, así que no puede
servir el sitio duplicado ni por accidente.

Los dos van **proxeados (nube naranja)**. Es obligatorio: un Custom Domain de
Workers no funciona en modo "solo DNS", y una Redirect Rule no se aplica a un
nombre que no esté proxeado. Ver decisión 15, que decía lo contrario y quedó
superada.

### Registros que se eliminaron en la mudanza

| Tipo  | Nombre | Contenido                             |
| ----- | ------ | ------------------------------------- |
| A     | `@`    | `216.198.79.1`                        |
| CNAME | `www`  | `18643b45bdd17525.vercel-dns-017.com` |

Apuntaban a Vercel. El destino del `CNAME` era propio de aquel proyecto: no es un
valor genérico y no sirve para volver atrás si el proyecto se borró.

## Dominio principal

`espaciocortinas.com.ar`, sin `www`. `www` existe solo para redirigir al apex con
un 308 — decisión 22.

En Cloudflare las tres respuestas no las da el hosting: las da una **Redirect
Rule** (Rules → Redirect Rules), que se ejecuta en el borde antes que el Worker.
Una sola regla cubre los dos casos.

| Campo                     | Valor                                                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| Nombre                    | `Canonizar al apex en https`                                                                         |
| Expresión (custom filter) | `(http.host eq "www.espaciocortinas.com.ar") or (not ssl and http.host eq "espaciocortinas.com.ar")` |
| URL de destino            | expresión dinámica: `concat("https://espaciocortinas.com.ar", http.request.uri.path)`                |
| Código                    | **308** — permanente, y a diferencia de un 301 conserva el método y el cuerpo                        |
| Preserve query string     | activado                                                                                             |

Los `www` por `http` entran por la primera condición y se resuelven en **un solo
salto** hasta `https://espaciocortinas.com.ar`, sin pasar por `https://www`.

**No usar "Always Use HTTPS"** para la parte de `http`: responde 301, no 308, y
se pisaría con esta regla.

Verificado:

```
http://espaciocortinas.com.ar       → 308 → https://espaciocortinas.com.ar/
https://www.espaciocortinas.com.ar  → 308 → https://espaciocortinas.com.ar/
https://espaciocortinas.com.ar      → 200
```

## HSTS

Vercel servía `Strict-Transport-Security` solo. **Cloudflare no: hay que
activarlo a mano**, y es lo primero que se olvida al mudarse.

SSL/TLS → Edge Certificates → HTTP Strict Transport Security (HSTS) → Enable.

| Opción             | Valor                    |
| ------------------ | ------------------------ |
| Max Age Header     | 12 months — es el máximo |
| Include subdomains | no                       |
| Preload            | no                       |
| No-Sniff           | opcional                 |

**Diferencia con Vercel:** Vercel enviaba `max-age=63072000` (24 meses);
Cloudflare tope en 12 meses (`31536000`). Es menos, pero 12 meses ya es el mínimo
que exige la lista de precarga de HSTS, así que en la práctica no cambia nada.

**`includeSubDomains` va en no a propósito.** El dominio tiene subdominios de
correo y de verificación; incluirlos sin revisarlos uno por uno es la forma
clásica de dejar algo inaccesible durante un año sin poder revertirlo.

Se activa **después** de confirmar que el sitio responde 200 por HTTPS, nunca
antes: HSTS mal puesto sobre un sitio caído lo deja inaccesible hasta que venza
el `max-age`.

Va en Cloudflare y no en `next.config.ts` porque acá cubre también las respuestas
de la Redirect Rule, que nunca llegan a ejecutar código nuestro.

### Notas para diagnosticar

- Cloudflare publica los cambios casi al instante, pero los resolvers públicos
  **cachean las respuestas negativas**. Si un registro recién agregado "no
  aparece", consultar directo al autoritativo antes de concluir que falta:

  ```
  Resolve-DnsName -Name <dominio> -Type MX -Server leia.ns.cloudflare.com
  ```

- Una clave DKIM completa termina en `IDAQAB`. Si termina en otra cosa, el panel
  la cortó al pegarla.

- **Desde la mudanza, el apex resuelve a una IP de Cloudflare.** Antes eso era
  señal de que el proxy estaba mal encendido; ahora es lo correcto y esperable.
  Para saber quién sirve el sitio ya no sirve mirar la IP: hay que mirar las
  cabeceras de la respuesta (`server: cloudflare` y `cf-ray`).

- Si una petición al sitio devuelve un error `1xxx` de Cloudflare en vez de una
  página, el problema es de configuración del borde (DNS, Custom Domain o
  Redirect Rule), no del código. Los errores de la aplicación salen en los
  registros del Worker, que están activados en `wrangler.jsonc`.

## Correo

Google Workspace, dominio principal `conceptoespacio.com`.

`espaciocortinas.com.ar` está agregado como **alias de dominio** (gratis, no
consume licencias). Cambiar el dominio principal quedó descartado por ahora —
decisión 13.

Verificado de punta a punta: entrada y salida funcionando, con SPF, DKIM y DMARC
publicados.

DMARC está en `p=none` a propósito: monitorea sin bloquear. Se puede endurecer a
`p=quarantine` dentro de unos meses, una vez confirmado que todo firma bien.

## Repositorio

`github.com/espacioCortinas/espacio-cortinas-web` — privado.

`espacioCortinas` es una cuenta personal de GitHub, no una organización. El repo
es suyo, y quien desarrolla entra como **colaborador con permiso de escritura**
(hoy `faculuna1097`). Es lo mismo que persigue la regla de titularidad: si cambia
el desarrollador, se le quita el acceso y la empresa no pierde nada.

**Por qué conviene que siga privado:** el código no tiene secretos, pero este
mismo documento publica el vencimiento del dominio, quién es el titular registral
y que el acceso a NIC es por Clave Fiscal. Nada de eso tiene por qué estar
indexado.

## Base de datos y archivos

Supabase, plan gratuito, organización Espacio Cortinas, región São Paulo.

- Registro público de usuarios **desactivado** (requisito de `docs/seguridad.md`)
- El usuario administrador se crea a mano en Fase 2
- Sin copias automáticas: exportación manual periódica — decisión 18

## Hosting

**Cloudflare Workers, plan gratuito**, en la misma cuenta de Cloudflare que ya
administraba el DNS.

El sitio estuvo en Vercel durante la Fase 1 y se mudó en julio de 2026 —
decisión 24. **El motivo es de encuadre:** el plan Hobby de Vercel es para uso
personal y no comercial, y este es el sitio institucional de una empresa. El plan
gratuito de Cloudflare sí admite uso comercial.

| Concepto       | Valor                    |
| -------------- | ------------------------ |
| Worker         | `espacio-cortinas-web`   |
| Adaptador      | `@opennextjs/cloudflare` |
| Custom Domain  | `espaciocortinas.com.ar` |
| Node del build | fijada en `.nvmrc`       |

### Despliegue automático

Cloudflare **Workers Builds**, conectado al repositorio de GitHub. Cada push a
`main` construye y publica.

| Ajuste             | Valor                              |
| ------------------ | ---------------------------------- |
| Rama de producción | `main`                             |
| Directorio raíz    | `/`                                |
| Build command      | `npx opennextjs-cloudflare build`  |
| Deploy command     | `npx opennextjs-cloudflare deploy` |

**Workers Builds no mira quién firmó el commit.** Es la diferencia que hace que
la decisión 23 quede sin objeto: ya no hace falta commitear con la identidad de
la empresa para que el sitio despliegue.

### Variables de entorno

Van **dos veces**, en dos listas distintas del mismo Worker. Es el error de
operación más fácil de cometer al venir de Vercel, donde había una sola.

| Lista                                              | Para qué                                                                     |
| -------------------------------------------------- | ---------------------------------------------------------------------------- |
| Settings → Build → **Build variables and secrets** | el build. Acá se incrustan las `NEXT_PUBLIC_*` y acá valida `next.config.ts` |
| Settings → **Variables and Secrets**               | el runtime, en cada petición que toque el servidor                           |

Las cuatro de la Fase 1 van en las dos listas:

| Variable                        | Tipo       | Valor en producción              |
| ------------------------------- | ---------- | -------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Text       | igual que en `.env.local`        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Text       | igual que en `.env.local`        |
| `NEXT_PUBLIC_SITE_URL`          | Text       | `https://espaciocortinas.com.ar` |
| `SUPABASE_SERVICE_ROLE_KEY`     | **Secret** | igual que en `.env.local`        |

`NEXT_PUBLIC_SITE_URL` es la única que difiere del archivo local, sin `www` y sin
barra final — decisión 22.

**`SUPABASE_SERVICE_ROLE_KEY` se carga como Secret, nunca como Text, en las dos
listas.** Un Secret queda cifrado y no se puede volver a leer desde el panel ni
desde la CLI. Si se pierde, se rota en Supabase y se carga de nuevo; eso es el
comportamiento correcto, no un problema.

Que una clave secreta haga falta también en el build no es un descuido: es
consecuencia de que `next.config.ts` valide el entorno antes de construir
(decisión 21). Un despliegue al que le falte una variable corta el build y la
versión anterior sigue sirviendo.

**Si falta alguna, el build falla a propósito con la lista completa de
faltantes.** Es el comportamiento buscado.

`NEXT_PUBLIC_SUPABASE_ANON_KEY` es pública por diseño y lo que se puede hacer con
ella lo decide RLS. Ver `docs/seguridad.md`.

### Portabilidad

La arquitectura resultó portable, que es lo que este documento anticipaba antes
de la mudanza: el flujo de subida de imágenes esquiva por diseño los límites de
las funciones serverless, así que no hubo que rehacerlo. **Ninguna decisión de
producto cambió por mudarse de proveedor.**

Lo único que sí era propio de Vercel y hubo que reemplazar está listado en la
decisión 24.

## Pendiente de dar de alta

- Google Search Console
- **Perfil de Empresa de Google** — para búsquedas locales pesa más que cualquier
  optimización del sitio
- Cloudflare Web Analytics — decisión 17. Gratuito y sin cookies, se agrega en la
  Fase 5 con una etiqueta en el layout raíz

Los tres tienen que quedar bajo la cuenta de la empresa, no una personal.
