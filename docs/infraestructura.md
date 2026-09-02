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

Verificado el 29/07/2026, ya sobre Cloudflare:

```
https://espaciocortinas.com.ar       → 200   (x-opennext: 1, server: cloudflare)
https://www.espaciocortinas.com.ar   → 308 → https://espaciocortinas.com.ar/
http://espaciocortinas.com.ar        → 308 → https://espaciocortinas.com.ar/
http://www.espaciocortinas.com.ar    → 308 → https://espaciocortinas.com.ar/
```

El último caso es el que conviene no perder de vista: `http://www` llega al apex
en **un solo salto**, sin escalar por `https://www`. La ruta y la query se
conservan, que es lo que evita romper enlaces ya compartidos:

```
https://www.espaciocortinas.com.ar/proyectos/x?utm=wsp
  → https://espaciocortinas.com.ar/proyectos/x?utm=wsp
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

Verificado el 29/07/2026:

```
https://espaciocortinas.com.ar       → Strict-Transport-Security: max-age=31536000
https://www.espaciocortinas.com.ar   → Strict-Transport-Security: max-age=31536000
http://espaciocortinas.com.ar        → sin la cabecera
```

Que **no** aparezca en la respuesta por HTTP es correcto, no un faltante: la
especificación dice que HSTS solo vale sobre una conexión cifrada, y los
navegadores ignoran la cabecera si llega por HTTP. Cloudflare la omite ahí a
propósito.

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

**Ya se volvió público una vez** entre la Fase 1 y la mudanza, sin que nadie lo
notara hasta que apareció en un reporte. No es un estado que se pueda dar por
sentado. Se verifica sin autenticar, que es la única comprobación que vale:

```powershell
Invoke-RestMethod -Uri 'https://api.github.com/repos/espacioCortinas/espacio-cortinas-web' -Headers @{'User-Agent'='check'}
```

Si responde con datos, es público. Si devuelve 404, es privado. Mirar la página
en el navegador no sirve: la sesión propia la muestra igual en los dos casos.

## Base de datos y archivos — YA NO HAY

Hubo un proyecto de Supabase con PostgreSQL, autenticación y un bucket privado.
**Se dio de baja al sacar el panel** — decisión 36. El contenido vive ahora en
el repositorio y las imágenes en `public/fotos/`, generadas en el build.

Lo que esto elimina de la operación: un proyecto que se pausaba solo por
inactividad, una `service_role key` que administrar, migraciones que aplicar a
mano y copias de seguridad que hacer.

## Hosting

**Cloudflare Workers, plan gratuito**, en la misma cuenta de Cloudflare que ya
administraba el DNS.

El sitio estuvo en Vercel durante la Fase 1 y se mudó en julio de 2026 —
decisión 24. **El motivo es de encuadre:** el plan Hobby de Vercel es para uso
personal y no comercial, y este es el sitio institucional de una empresa. El plan
gratuito de Cloudflare sí admite uso comercial.

| Concepto       | Valor                                         |
| -------------- | --------------------------------------------- |
| Worker         | `espacio-cortinas-web`                        |
| Adaptador      | `@opennextjs/cloudflare`                      |
| Custom Domain  | `espaciocortinas.com.ar`                      |
| URL directa    | `espacio-cortinas-web.ventas-ccf.workers.dev` |
| Node del build | fijada en `.nvmrc`                            |

La **URL directa** no es para dar a nadie: es la del Worker sin pasar por el
dominio. Sirve para diagnosticar, porque saltea el DNS, la Redirect Rule y el
certificado. Si el dominio falla y esta anda, el problema es del borde, no de la
aplicación.

**El subdominio de la cuenta es `ventas-ccf.workers.dev`.** Solo, sin el nombre
del Worker adelante, no resuelve: no es una dirección, es el espacio de nombres.

### Cloudflare inyecta su propio `robots.txt` delante del nuestro

Descubierto al verificar el despliegue de la Fase 4.0. `app/robots.ts` genera
esto:

```
User-Agent: *
Allow: /

Host: https://espaciocortinas.com.ar
Sitemap: https://espaciocortinas.com.ar/sitemap.xml
```

Y lo que sirve el dominio son unas cincuenta líneas más, **antes** de las
nuestras, entre `# BEGIN Cloudflare Managed content` y `# END`: las Content
Signals (`search=yes,ai-train=no,use=reference`) y un `Disallow: /` para
`GPTBot`, `ClaudeBot`, `CCBot`, `Bytespider`, `Amazonbot`,
`Applebot-Extended`, `Google-Extended` y `meta-externalagent`.

**No lo pusimos nosotros y no está en el repositorio.** Lo agrega Cloudflare en
el borde, desde el panel de la zona.

**No rompe nada de lo que importa**, y por eso se deja como está: `Googlebot` no
está en la lista y `search=yes` declara que indexar está permitido, así que el
buscador —que es de donde tiene que llegar el tráfico— entra igual. Lo que se
bloquea son los rastreadores de entrenamiento de modelos, que para este negocio
no aportan nada.

**Lo que sí hay que tener presente:** `app/robots.ts` dejó de ser toda la
verdad. El archivo servido tiene **dos** grupos `User-agent: *` —el de
Cloudflare y el nuestro—; hoy los dos permiten todo, pero si algún día hiciera
falta un `Disallow`, hay que mirar el archivo servido y no solo el código. Y si
el bloque de Cloudflare cambia, cambia sin pasar por un commit.

Se verifica igual que todo lo demás:

```bash
curl -s https://espaciocortinas.com.ar/robots.txt
```

### Límites de los assets del Worker — verificado

Las fotos son **assets estáticos del Worker**: `opennextjs-cloudflare build` las
copia de `public/` a `.open-next/assets/` y Cloudflare las sirve directamente,
sin ejecutar el Worker. Antes de cargar el archivo histórico había que saber si
ese camino aguanta, porque si no aguanta se reabre una decisión de
infraestructura y conviene saberlo antes de mover 300 fotos.

Verificado contra la documentación de Cloudflare en septiembre de 2026
(`developers.cloudflare.com/workers/platform/limits/`, sección «Static Assets»):

| Límite                     | Plan gratuito        | Plan pago            | Lo que necesitamos        |
| -------------------------- | -------------------- | -------------------- | ------------------------- |
| Archivos por versión       | 20.000               | 100.000              | ~1.200 · **6 % del tope** |
| Tamaño de un archivo       | 25 MiB               | 25 MiB               | ~5 MB la más pesada       |
| Tamaño total de los assets | sin tope documentado | sin tope documentado | ~240 MB                   |

**El camino resiste, y con margen amplio.** Unas 300 fotos por cuatro medidas
son ~1.200 archivos: con los estáticos que genera Next —JS, CSS, el sitemap—
el total queda en el orden de 1.500, contra un tope de 20.000. Ninguna foto se
acerca a 25 MiB: la medida de 2560 px de una foto de interiores ronda los 5 MB
en el peor caso, y las otras tres pesan mucho menos. **No hay tope documentado
de tamaño total de assets**, que es el número que hubiera sido el problema.

Dos advertencias que salen de mirarlo:

- **El tope es por VERSIÓN del Worker, no acumulado.** Reemplazar una foto no
  suma: cada despliegue publica el conjunto entero de nuevo. Lo que hay que
  vigilar es cuántos archivos tiene el sitio en un momento dado, no cuántos se
  subieron alguna vez.
- **El de 100.000 pide `wrangler` 4.34.0 o superior**; las versiones anteriores
  siguen aplicando el de 20.000 aunque la cuenta sea de pago. Este proyecto
  tiene `wrangler ^4.115.0`, así que no aplica hoy, pero es la clase de detalle
  que aparece el día que haga falta.

**Donde sí aprieta es en el repositorio, no en Cloudflare.** Los ~240 MB de
fotos entran en `public/fotos/`, que se versiona, y **git guarda todas las
versiones de cada archivo que se reemplace**: un clon nuevo se lleva el
histórico completo, no el estado actual. Cambiar la calidad de compresión o
recortar de nuevo las portadas reescribiría los ~1.200 archivos de una vez y
sumaría otros ~240 MB al repositorio, para siempre. Eso es lo que sigue abierto
en `docs/decisiones.md` —git a secas, `git-lfs`, o fuera del repositorio— y lo
que hay que decidir **antes** de cargar el archivo, no después: sacar archivos
grandes de la historia de git obliga a reescribirla.

### Recursos de caché — dados de baja

Hubo un Workers KV (`cache-incremental`) y una base D1
(`espacio-cortinas-etiquetas`) para el caché incremental compartido, que existía
porque el panel revalidaba rutas al guardar. **Se borraron los dos** al sacar el
panel: sin contenido que cambie fuera del build no hay nada que revalidar —
decisión 36.

Se desataron de `wrangler.jsonc` y se desplegó **antes** de borrarlos. El orden
importa: borrar un recurso que el Worker todavía referencia tira el sitio.

**No volvieron, y no hacen falta.** En la Fase 4.0 se descubrió que el caché
incremental además es de donde Next lee las páginas prerenderizadas, y que sin
ninguno `/productos/[slug]` devolvía 404 en el Worker (decisión 39). Se resolvió
con `staticAssetsIncrementalCache`, que guarda esas páginas entre los **assets
estáticos del Worker**: se publica con el mismo despliegue y **no hay ningún
recurso nuevo de Cloudflare que dar de alta ni administrar**. Ni KV, ni D1, ni
binding en `wrangler.jsonc`.

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

**El builder instala con `npm ci`, y con su propio npm.** Hoy son Node 22.16.0
(`.nvmrc`) y npm 10.9.2, que el builder trae aparte del Node. La máquina de
desarrollo puede tener otro npm, y eso ya rompió un build una vez: si la
instalación de dependencias falla en Cloudflare y en local no, empezar por ahí.
Está explicado en la decisión 24, sección del `overrides`.

Para reproducir el build de Cloudflare sin desplegar:

```bash
npx npm@10.9.2 ci --dry-run
```

### Variables de entorno

Van **dos veces**, en dos listas distintas del mismo Worker. Es el error de
operación más fácil de cometer al venir de Vercel, donde había una sola.

| Lista                                              | Para qué                                                                     |
| -------------------------------------------------- | ---------------------------------------------------------------------------- |
| Settings → Build → **Build variables and secrets** | el build. Acá se incrustan las `NEXT_PUBLIC_*` y acá valida `next.config.ts` |
| Settings → **Variables and Secrets**               | el runtime, en cada petición que toque el servidor                           |

Quedó **una sola** obligatoria al sacar el panel (decisión 36). Las tres que
faltan se cargan en la Fase 4.6, con el formulario de contacto:

| Variable               | Dónde vive el valor de runtime | Valor en producción              |
| ---------------------- | ------------------------------ | -------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | `wrangler.jsonc` → `vars`      | `https://espaciocortinas.com.ar` |
| `NEXT_PUBLIC_WHATSAPP` | `wrangler.jsonc` → `vars`      | Fase 4.6                         |
| `RESEND_API_KEY`       | **Secret** del Worker          | Fase 4.6                         |
| `EMAIL_CONTACTO`       | **Secret** del Worker          | Fase 4.6                         |

`NEXT_PUBLIC_SITE_URL` es la única que difiere del archivo local, sin `www` y sin
barra final — decisión 22.

**Por qué las tres primeras están en el repositorio y no en el panel.** Llevan
prefijo `NEXT_PUBLIC_`, así que Next las incrusta en el paquete que descarga el
navegador: cualquiera que abra el sitio ya las tiene. No hay nada que proteger,
y sí algo que ganar — hasta la Fase 2 estaban cargadas como Secret, y un Secret
**no se puede volver a leer**. Eso dejaba la configuración de producción de
solo escritura: cuando `NEXT_PUBLIC_SUPABASE_URL` se cargó con `/rest/v1`
pegado y rompió el login, el valor que estaba puesto era invisible. Ahora se lee
en un diff, con historial. Decisión 30.

**Por qué eso además arregla el borrado.** `wrangler deploy` trata al bloque
`vars` de `wrangler.jsonc` como la fuente de verdad: deja el Worker con esas
variables y borra cualquier otra de texto. Antes el archivo no tenía ese bloque,
así que cada despliegue barría con todo lo cargado a mano —eso fue el incidente
del 14/08— y el parche era cargarlas como Secret para que wrangler no las
tocara. Declararlas en el archivo ataca la causa en vez del síntoma: ahora
wrangler las escribe, no las borra.

**Las dos secretas siguen siendo Secret y nunca van a `wrangler.jsonc`.** Se
cargan con `npx wrangler secret put NOMBRE` y wrangler no las toca porque se
administran fuera del archivo de configuración.

En la lista de **build** el tipo sigue siendo indistinto (esa lista wrangler no
la toca) y las cinco tienen que estar igual. Que una clave secreta haga falta
también en el build no es un descuido: es consecuencia de que `next.config.ts`
valide el entorno antes de construir (decisión 21). Un despliegue al que le
falte una variable corta el build y la versión anterior sigue sirviendo.

**Si falta alguna en la lista de _build_, el build falla a propósito con la lista
completa de faltantes.** Es el comportamiento buscado.

### Los dos incidentes de las variables — historial

Las dos secciones que siguen hablan de variables de Supabase que **ya no
existen**. Se conservan porque lo que enseñan sigue valiendo palabra por
palabra: cómo trata wrangler al bloque `vars`, y que un build en verde no dice
nada sobre si producción funciona.

### Incidente del 29/07/2026 — el sitio caído tras la mudanza

Qué pasó: las variables se cargaron en **Build variables and secrets** pero no en
**Variables and Secrets**. El build pasó limpio, el Worker se publicó, y al
arrancar la validación de entorno del runtime no encontró nada y lanzó. Resultado:

```
https://espaciocortinas.com.ar → 500
{ "message": "Server failed to respond.", "details": {} }
```

Nada en el build avisó. Un despliegue verde puede dejar producción caída.

**Regla que sale de esto: las dos listas se actualizan juntas, siempre.** Agregar
una variable a una sola es una operación incompleta, no un paso intermedio.

### Repetición del 14/08/2026, y la causa raíz de verdad

El mismo 500 volvió a aparecer en el primer despliegue de la Fase 2, con las
variables **ya cargadas en las dos listas**. O sea que la explicación de arriba
era incompleta.

**La causa real: `wrangler deploy` borra las variables de texto.** Wrangler trata
a `wrangler.jsonc` como la fuente de verdad del bloque `vars`; como este proyecto
no tiene ese bloque, cada despliegue deja el Worker **sin ninguna variable de
texto**, incluidas las que se acababan de cargar a mano en el panel.

**Los secretos no se borran.** Se administran por fuera del archivo de
configuración y sobreviven a cualquier despliegue.

La evidencia fue limpia: después del despliegue, de las cinco variables de
runtime sobrevivió exactamente una, `SUPABASE_SERVICE_ROLE_KEY` — la única que
este documento mandaba cargar como Secret. Las otras cuatro, cargadas como Text,
habían desaparecido:

```
npx wrangler secret list
[ { "name": "SUPABASE_SERVICE_ROLE_KEY", "type": "secret_text" } ]
```

**La regla de entonces —cargar TODAS como Secret, no solo las secretas— era un
parche al síntoma**, y funcionó: un Secret es el único tipo que sobrevive a un
`wrangler deploy`. Pero dejaba la configuración de producción de solo
escritura, y ese costo se cobró el mismo día con la URL de Supabase mal cargada
(más abajo).

**Desde la Fase 3 la regla es otra, y ataca la causa:** las tres variables
públicas se declaran en el bloque `vars` de `wrangler.jsonc`. Wrangler no las
borra porque ahora están donde él manda, y de paso el valor queda auditable en
el repositorio. Las dos secretas siguen siendo Secret. Decisión 30.

Lo que **no** cambia y sigue siendo la trampa: una variable de texto cargada a
mano en el panel, sin declararla en `wrangler.jsonc`, la sigue borrando el
próximo despliegue. El archivo es la fuente de verdad; el panel, no.

Por qué esto no se había visto: en la Fase 1 las variables se cargaron a mano
_después_ del último despliegue, así que nada volvió a pisarlas. El primer push
posterior era el que iba a romperlo, y fue el de la Fase 2.

**Cómo verificar que quedó bien**, después de cualquier despliegue:

```
npx wrangler secret list
```

Hoy tiene que devolver **una lista vacía**: las dos que había
—`SUPABASE_SERVICE_ROLE_KEY` y `ADMIN_USER_ID`— se borraron con el panel, y las
de la Fase 4.6 todavía no se cargaron.

Que aparezca un Secret con el mismo nombre que una variable declarada en
`wrangler.jsonc` **no es tranquilizador, es un problema**: hay dos valores para
el mismo nombre y no está claro cuál gana.

Las declaradas en el archivo se verifican leyéndolo, que es todo el punto:

```
npx wrangler deploy --dry-run
```

lista los bindings con su valor, incluidas las tres `vars`. Sin desplegar nada.

**Ojo con `wrangler secret list` después de `wrangler versions upload`:** informa
sobre la **última versión subida**, no sobre la que está sirviendo. Durante la
migración de la Fase 3 las tres desaparecieron de la lista apenas se subió la
versión nueva, con producción todavía sirviendo la anterior. No era un error;
era la lista contestando por otra versión.

**Por qué la validación de entorno no lo evita:** `lib/entorno-validacion.ts`
lee `process.env[nombre]` con acceso dinámico, que Next no puede reemplazar en
el build. Eso es deliberado y correcto —es lo que hace que la comprobación sirva
en runtime— pero implica que esas variables tienen que existir de verdad en el
Worker, no alcanza con que hayan existido durante el build.

### El otro error del 14/08 — `NEXT_PUBLIC_SUPABASE_URL` con `/rest/v1`

Ya con el sitio en pie apareció un segundo problema, independiente del anterior.
La variable estaba cargada en la lista de **build** así:

```
https://irqqimwcoevkvuyexlhg.supabase.co/rest/v1     ← estaba
https://irqqimwcoevkvuyexlhg.supabase.co             ← va
```

El panel de Supabase muestra varias URLs para copiar y esa es una de ellas.

**El síntoma no se parecía a la causa.** El sitio respondía 200, `/admin`
redirigía bien, y el build salía verde. Pero `getUser()` pedía
`…/rest/v1/auth/v1/user`, que no existe, y el gateway de Supabase devolvía:

```
AuthApiError: Invalid path specified in request URL
```

Como el código trataba cualquier fallo de `getUser()` como «no hay sesión», el
panel mandaba al login **a todo el mundo, incluida la administradora**. O sea:
el login estaba roto para todos, y desde afuera se veía como si la contraseña
estuviera mal.

Dos arreglos salieron de acá, los dos en el código:

- `lib/auth.ts` **registra** el error de `getUser()` con el host contra el que
  llamó. Sin eso, «no hay sesión» y «la URL de Supabase está mal» son
  indistinguibles desde afuera.
- `lib/entorno-validacion.ts` valida la **forma** de la variable, no solo que
  exista: tiene que ser el origen pelado y por `https`. Un valor con ruta corta
  el build.

**La lección general de la Fase 2**, que se aplicó tres veces en el mismo día:
un build en verde no dice nada sobre si producción funciona. `proxy.ts`, las
variables de tipo Text y esta URL pasaron el build las tres veces.

**Cómo se diagnosticó, que sirve para la próxima:**

1. `npm run preview` sobre el mismo commit. Ejecuta el runtime real de Workers en
   local. Si responde 200, el código está bien y el problema es del entorno
   desplegado. Descarta la mitad del espacio de búsqueda en dos minutos.
2. Volver al despliegue anterior desde el panel (Worker → Deployments) para
   restaurar el servicio **antes** de investigar. El rollback arregla el
   despliegue activo, no el repositorio: el próximo push vuelve a romper.
3. Para capturar la excepción real sin volver a romper producción:

   ```bash
   npx wrangler versions upload   # publica una versión con URL propia
   npx wrangler tail              # en otra terminal, mientras se la visita
   ```

**`wrangler tail` solo muestra algo si el Worker que está sirviendo es el que
falla.** Correrlo después de un rollback no devuelve nada, y parece que no
hubiera error.

### `.dev.vars` y el preview local

`.dev.vars` alimenta el runtime cuando se corre `npm run preview`. Durante la
Fase 1 tenía solo `NEXTJS_ENV=development` y alcanzaba, porque ningún código
leía Supabase en tiempo de ejecución.

**Con el login de la Fase 2 dejó de alcanzar**, y el preview local fallaría por
la misma razón por la que falló producción el 29/07. Desde la Fase 2 `.dev.vars`
tiene **las mismas variables que `.env.local`**, más `NEXTJS_ENV`.

Como `.dev.vars` no se versiona, se regenera copiando `.env.local` y agregando
esa línea. Si se agrega una variable al proyecto, son **tres** lugares en local
—`.env.local`, `.dev.vars` y `.env.example`— además de las dos listas del
Worker.

`NEXTJS_ENV` vale `development` en local y **`production` en el Worker**. Es el
único valor que difiere a propósito entre los dos entornos.

`NEXT_PUBLIC_SUPABASE_ANON_KEY` es pública por diseño y lo que se puede hacer con
ella lo decide RLS. Ver `docs/seguridad.md`.

### Cloudflare Pages no, Workers sí

Durante la mudanza se intentó primero por **Pages**, y no funciona. Queda
anotado porque el error no lo dice de frente:

```
A Wrangler configuration file was found but it does not appear to be valid.
Did you mean to use wrangler.toml to configure Pages? If so, then make sure
the file is valid and contains the `pages_build_output_dir` property.
```

`pages_build_output_dir` solo existe en Pages. Son dos productos distintos y este
proyecto necesita Workers: en Pages el camino era `@cloudflare/next-on-pages`, el
adaptador viejo que obliga al runtime _edge_ y que se descartó por eso mismo
(decisión 24).

Además usan **GitHub Apps distintas**: tener conectado Pages no alcanza para
Workers Builds.

### Portabilidad

La arquitectura resultó portable, que es lo que este documento anticipaba antes
de la mudanza: el flujo de subida de imágenes esquiva por diseño los límites de
las funciones serverless, así que no hubo que rehacerlo. **Ninguna decisión de
producto cambió por mudarse de proveedor.**

Lo único que sí era propio de Vercel y hubo que reemplazar está listado en la
decisión 24.

## Vercel — desconectado

**Hecho el 14/08/2026.** El proyecto de Vercel ya no existe: dominios quitados,
repositorio desconectado, variables de entorno borradas y proyecto eliminado. Con
eso, la `service_role key` dejó de estar guardada en un proveedor sin uso, que era
la condición para no rotarla.

**Cloudflare Pages, borrado el mismo día.** Era el resto del intento fallido de la
mudanza y construía en cada push sin servir para nada. Se eliminó el proyecto
entero, no solo su conexión con el repositorio. Al borrarlo hay que mirar la
columna de tipo en `Workers & Pages`, no el nombre: el Worker
`espacio-cortinas-web` es el que sirve el sitio y borrarlo lo tira abajo.

Verificado después de la limpieza: `/` responde 200, `/admin` redirige con 307,
las canónicas siguen en 308 y el MX sigue intacto.

Queda como registro el orden en que se hizo, por si alguna vez hay que repetirlo
con otro proveedor:

1. **Quitar los dominios del proyecto** — Vercel → el proyecto → Settings →
   Domains: sacar `espaciocortinas.com.ar` y `www.espaciocortinas.com.ar`. Es lo
   primero porque mientras estén, Vercel sigue intentando renovar certificados
   para un dominio que ya no controla, y manda avisos de verificación fallida.
2. **Desconectar el repositorio** — Settings → Git → Disconnect. Con esto dejan
   de aparecer los checks rojos en cada commit de GitHub. Es lo que hoy pone en
   rojo el repositorio: `Git author … must have access to the project`.
3. **Borrar las variables de entorno** — Settings → Environment Variables. Hay
   una `SUPABASE_SERVICE_ROLE_KEY` guardada ahí; es una clave viva.
4. **Borrar el proyecto.**
5. **Cerrar la cuenta**, si no se usa para nada más.

**Lo que NO hay que tocar:** nada del DNS —ya está migrado— ni nada de Supabase,
Google Workspace o el registro del dominio en NIC. La cuenta de Vercel no toca
ninguno de esos.

### Sobre rotar la `service_role key` — decidido que no

Se evaluó rotarla y **se decidió no hacerlo**. La exposición real es acotada:

- `.env.local` está en `.gitignore` desde antes del primer commit, así que la
  clave **nunca estuvo en el repositorio**. Que el repo haya sido público un
  tiempo expuso documentos y código, no credenciales
- Hoy vive en tres lugares: la máquina de desarrollo, los Secrets del Worker y
  las variables de entorno del proyecto de Vercel

Los dos primeros son lugares legítimos. **El tercero es el que hay que cerrar**, y
por eso el punto 3 de la limpieza —borrar las variables de Vercel— deja de ser
prolijidad y pasa a ser obligatorio. Sin rotación, es lo único que saca la clave
de un lugar donde no corresponde que siga.

Si en algún momento aparece evidencia de que la clave se filtró, la decisión se
revierte: se rota en Supabase y se actualiza en `.env.local`, en `.dev.vars` y en
la lista de runtime del Worker, como Secret.

## Pendiente de dar de alta

- Google Search Console
- **Perfil de Empresa de Google** — para búsquedas locales pesa más que cualquier
  optimización del sitio
- Cloudflare Web Analytics — decisión 17. Gratuito y sin cookies, se agrega en la
  Fase 5 con una etiqueta en el layout raíz

Los tres tienen que quedar bajo la cuenta de la empresa, no una personal.
