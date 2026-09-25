# Decisiones

Por qué el proyecto es como es. Varias cosas que parecen mejorables fueron
descartadas a propósito.

**Antes de revertir cualquiera de estas, leer la razón.** Si la razón ya no aplica,
cambiarla y actualizar esta entrada.

Fecha de las decisiones iniciales: julio de 2026.

---

### 1. Next.js con App Router, no React + Vite

**Alternativa evaluada:** SPA con React + Vite, que era la inclinación inicial.

**Por qué se descartó:** el sitio se comparte por WhatsApp e Instagram. Los bots
que arman la previsualización de un enlace no ejecutan JavaScript: leen el HTML
crudo. En un SPA todas las URLs devuelven el mismo HTML vacío, así que cada
producto y cada proyecto tendrían el mismo título, la misma descripción y la misma
miniatura. Para un negocio visual que se difunde por mensajería, eso anula buena
parte del valor del sitio.

Google hoy renderiza JavaScript razonablemente bien, así que el problema no es
tanto el buscador: es Open Graph.

Next además resuelve de fábrica metadata por ruta, sitemap, optimización de
imágenes y la ejecución en servidor que necesita el panel.

---

### 2. Astro descartado

Astro rinde mejor en un sitio de contenido puro. Pero acá el panel de
administración vive en el mismo proyecto: login, formularios, subida de archivos,
CRUD. Esa mezcla es exactamente para lo que existe Next. Astro puede, pero no es
donde brilla.

---

### 3. Panel propio, no CMS headless

**Alternativas evaluadas:** Sanity, Payload, Strapi, Directus.

**Por qué se descartó:** el modelo tiene dos entidades. Incorporar un CMS completo
para administrar dos tablas trae actualizaciones, permisos, despliegue y
sincronización propios, y la interfaz nunca queda exactamente como se necesita.

El factor decisivo no es técnico: **la persona que va a usarlo no es técnica.** Un
panel propio, en español, con dos secciones y ningún concepto de CMS a la vista, la
hace autónoma. Un estudio genérico en inglés, no.

---

### 4. Un solo administrador, verificado por identidad

Sin roles, sin permisos, sin invitaciones. Una sola persona administra.

Importante: esto **no** se implementa como "¿hay sesión?". Supabase Auth permite
registro público por defecto; sin desactivarlo, cualquiera se registra y pasa esa
comprobación. Se desactiva el registro, se crea el usuario a mano y se verifica el
`user.id` concreto. Ver `docs/seguridad.md`.

---

### 5. La compresión de imágenes ocurre en el navegador

**Alternativa evaluada:** recibir el archivo en una Server Action y procesarlo en
el servidor con `sharp`. Era el planteo original.

**Por qué se descartó:** en Vercel el cuerpo de una petición a una función
serverless tope en ~4.5 MB, y las Server Actions vienen limitadas a 1 MB por
defecto. Una foto de celular pesa entre 3 y 8 MB. Ese flujo falla con la primera
foto real, y falla de forma confusa. Subir `bodySizeLimit` no alcanza: el techo de
4.5 MB es de la plataforma.

Se comprime en el navegador y se sube directo a Storage con una URL firmada que
emite el servidor tras verificar identidad. Sigue estando autorizado por el
servidor. Además la subida desde un celular es mucho más rápida y no se consume
cuota de transformación de imágenes de Vercel.

**Actualización (julio de 2026, mudanza a Cloudflare — decisión 24).** El límite
de 4.5 MB era de Vercel y ya no aplica: en Cloudflare Workers el cuerpo de la
petición admite bastante más. La decisión igual se mantiene, y ahora por razones
más fuertes:

- **`sharp` no corre en Workers.** Es un módulo nativo sobre libvips; el runtime
  de Workers no ejecuta binarios nativos. La alternativa que se había evaluado
  hoy directamente no existe.
- **El plan gratuito da 10 ms de CPU por invocación.** Redimensionar una foto de
  8 MB está órdenes de magnitud por encima de eso.

O sea que la mudanza no obligó a rehacer el flujo de subida: lo confirmó. Lo que
sí cambia es **cuántos** archivos genera el navegador — ver la decisión 25.

---

### 6. Se borra el EXIF de toda imagen

Las fotos son de casas particulares y las de celular traen coordenadas GPS.
Publicarlas sin limpiar expondría la dirección del domicilio de un cliente. No es
opcional y se verifica en QA.

---

### 7. Dos tablas de imágenes, no una polimórfica

**Alternativa evaluada:** una sola tabla `imagenes` con `entidad` + `entidad_id`.

**Por qué se descartó:** una tabla polimórfica no puede tener clave foránea real,
así que se pierde la integridad referencial y el borrado en cascada hay que
mantenerlo a mano. Con dos entidades, la duplicación es mínima y la integridad vale
más. El componente de galería se comparte igual.

---

### 8. `activo` y `destacado` son dos campos independientes

`activo` controla la existencia pública; `destacado` controla la aparición en
Inicio. Separarlos permite rotar lo que se muestra en la portada sin borrar nada, y
evita que el tope de Inicio termine limitando el portfolio completo.

---

### 9. El tope de destacados es una constante, no una pantalla

**Alternativa evaluada:** una pantalla de configuración para cambiar el número.

**Por qué se descartó:** V1 tiene dos entidades. Agregar una tercera sección al
panel solo para cambiar un número es desproporcionado. Vive en
`lib/constantes.ts`. Si en seis meses aparece la necesidad real, se agrega.

---

### 10. El slug no se regenera al cambiar el título

Se genera al crear y después es un campo propio, editable a mano. Si se
regenerara solo, corregir una falta de ortografía en el título rompería todos los
enlaces ya compartidos por WhatsApp.

---

### 11. El proyecto tiene cuatro campos y no más

Sin categoría, sin fecha, sin cliente, sin superficie, sin productos utilizados. Se
consideró relacionar proyectos con productos ("usado en 14 proyectos") y se dejó
afuera de V1.

**Razón:** cada campo es un campo que hay que completar en cada carga. Cuanto menos
trabajo administrativo, más probable es que el contenido se mantenga actualizado.
El modelo permite agregarlos después sin migración dolorosa.

---

### 12. Los mensajes del formulario van por email, no a la base

No hay bandeja de mensajes en el panel. Con Google Workspace ya pagado, el correo
es mejor bandeja que cualquier cosa que construyamos: se busca, se archiva, se
responde desde el teléfono y ya está integrado a la rutina.

---

### 13. Alias de dominio en Workspace, no cambio de dominio principal

El Workspace existe hoy sobre `conceptoespacio.com`. Agregar
`espaciocortinas.com.ar` como **alias de dominio** es gratis, no cambia el usuario
de login de nadie y hace que el correo del dominio nuevo caiga en la casilla que ya
se usa.

Cambiar el dominio principal es una decisión de marca, tiene más riesgo y es poco
reversible. **No bloquea nada del desarrollo** y se puede hacer después.

---

### 14. Las fotos nuevas se sacan verticales; las horizontales existentes se conservan

**Contexto:** el material existente es todo horizontal, sacado con celular. Al
plantearlo, la empresa ofreció cambiar cómo saca las fotos de ahí en adelante.

**Decisión:** portadas y tarjetas en **vertical 4:5**; la galería admite las dos
orientaciones.

**Por qué vertical:** una cortina es un objeto vertical, va del techo al piso. En
horizontal se corta la caída o se la muestra pequeña dentro del ambiente; en
vertical se ve completa, que es donde se aprecia la confección y cómo cae la tela.
Además el sitio es mobile-first y esas mismas fotos sirven para Instagram.

**La regla que evita las grillas rotas:** las grillas usan siempre la portada, y la
portada siempre es vertical. Aunque la galería mezcle orientaciones, los listados
quedan parejos.

Las horizontales existentes no se descartan: son el piso de contenido y funcionan
bien dentro de la galería. Ver `docs/fotografia.md`.

---

### 15. Cloudflare en modo solo DNS ~~— SUPERADA por la decisión 24~~

**Decía:** sin proxy. Proxyear Vercel detrás de Cloudflare sin configurarlo con
cuidado produce bucles de redirección y comportamientos de caché difíciles de
diagnosticar. El beneficio no justifica el riesgo en un sitio de este tamaño.

**Por qué ya no aplica:** el riesgo era el de encadenar dos CDN, una sobre la
otra. Desde la mudanza el sitio **corre dentro de Cloudflare**, así que no hay
nada detrás que proxyear: el registro del apex apunta al Worker y es
necesariamente naranja (proxeado). Un Custom Domain de Workers no admite el modo
"solo DNS" — no sería alcanzable.

**Lo que sí se conserva de la idea original:** no hay dos capas de caché ni dos
lugares donde se decidan redirecciones. Las redirecciones viven en un solo sitio
(Redirect Rules de Cloudflare) y están escritas en `docs/infraestructura.md`.

**El correo no se ve afectado.** El proxy de Cloudflare solo existe para
registros de tráfico HTTP (`A`, `AAAA`, `CNAME`); `MX` y `TXT` no son proxeables
ni por error. Encender el proxy del apex no toca el correo.

---

### 16. La marca del sitio es "Espacio Cortinas"

Confirmado. El Workspace sigue sobre `conceptoespacio.com`, pero el sitio, el
dominio, la metadata y el perfil de Google son de **Espacio Cortinas**. El correo
del dominio nuevo se resuelve con alias (decisión 13), sin tocar el otro.

---

### 17. Analítica: sin cookies, provista por el hosting

**Alternativas evaluadas:** Google Analytics 4, Plausible.

**Por qué:** viene incluida con el hosting, se activa con una línea y **no
requiere cartel de cookies**, porque no sigue individuos. GA4 es más completo
pero obliga legalmente al banner de consentimiento, que es fricción en la primera
pantalla a cambio de un detalle que este negocio no necesita. Plausible cubre lo
mismo pero es pago.

Mide lo que importa: visitas, páginas más vistas y clics a WhatsApp como evento.
Si algún día hace falta más profundidad, GA4 se puede sumar encima.

**Actualización (mudanza a Cloudflare — decisión 24):** el producto concreto pasa
a ser **Cloudflare Web Analytics** en lugar de Vercel Analytics. Vercel Analytics
solo recoge datos de sitios alojados en Vercel; fuera de ahí el paquete se
instala pero no mide nada.

El criterio que originó esta decisión no cambia: Cloudflare Web Analytics es
gratuito, no usa cookies ni huella digital, y **por eso tampoco necesita cartel
de consentimiento**. Nunca se llegó a activar Vercel Analytics, así que no hay
histórico que migrar ni dependencia que sacar.

Diferencia práctica: se instrumenta con una etiqueta `<script>` en el layout
raíz, no con el componente `<Analytics />` de `@vercel/analytics`. Se activa en
la Fase 5, junto con Search Console.

---

### 18. Supabase se queda en el plan gratuito

**Alternativa evaluada:** pagar el plan Pro por las copias de seguridad
automáticas.

**Por qué se descartó:** el peor caso a recuperar son unas decenas de proyectos con
un título, una ubicación y un párrafo cada uno. Volver a cargar uno son diez
minutos. Las fotos, que es lo único voluminoso, no dependen del backup de la base.
Unas 300 fotos comprimidas rondan los 100-150 MB, muy por debajo del límite del
plan gratuito.

Alcanza con exportar la base a mano cada tanto.

**La regla que sí importa:** los originales de las fotos se guardan en el Drive de
la empresa. Lo que hay en Storage está recomprimido y sin metadatos — de ahí no se
recupera el original.

Nota operativa: los proyectos gratuitos se pausan por inactividad. Con el sitio
publicado y con visitas no ocurre; puede ocurrir durante el desarrollo si queda
quieto una semana. Se despausa con un clic.

---

### 19. Sin contenido inicial cargado por migración

Las tablas arrancan vacías. La administradora carga todo desde el panel en la
Fase 3, antes de la fase de diseño, para que el sitio público se diseñe contra
contenido y fotos reales.

---

### 20. Las dependencias de la Fase 1, una por una

La regla 8 de `CLAUDE.md` pide justificar cada dependencia. Además de Next, React,
TypeScript y Tailwind, la Fase 1 agrega cuatro paquetes y ninguno más:

| Paquete                 | Por qué                                                                                                                                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@supabase/supabase-js` | el cliente oficial. Es el que usa `lib/supabase/admin.ts` con la `service_role key`.                                                                                                                                                 |
| `@supabase/ssr`         | maneja la sesión de Supabase Auth en cookies, que es lo que necesitan los Server Components y las Server Actions. Sin esto habría que escribir a mano el manejo de cookies de sesión, que es justamente la parte fácil de hacer mal. |
| `server-only`           | una línea de código que hace fallar el build si un archivo de servidor se importa desde un componente cliente. `docs/seguridad.md` lo pide explícitamente para `lib/supabase/admin.ts`.                                              |
| `prettier`              | formateador. Solo de desarrollo, no llega al paquete que descarga el navegador.                                                                                                                                                      |

**Alternativa evaluada para el formateo:** Biome, que reemplaza linter y
formateador con una sola herramienta y es más rápido.

**Por qué se descartó:** ESLint ya viene configurado con `eslint-config-next`, y
esa configuración trae reglas propias de Next (Core Web Vitals, uso correcto de
`next/image` y `next/link`) que Biome no replica. Cambiar significaría perderlas
para ganar velocidad en un proyecto donde el linter tarda segundos. Se queda
ESLint para las reglas y Prettier solo para el formato, que es donde no se pisan.

**Lo que no se agregó, habiendo tentación:** una librería de validación de
esquemas (Zod o similar) para las variables de entorno. Son cuatro variables y un
`if`. Se revisará en la Fase 3, cuando haya formularios reales que validar.

---

### 21. La validación de las variables de entorno corre dos veces, y exige por fase

**Corre dos veces:**

- En `next.config.ts`, que Next evalúa antes que nada: falla el **build**. Con
  el despliegue automático eso significa que una configuración incompleta no
  llega a publicarse: el build de Cloudflare corta y la versión anterior sigue
  sirviendo.
- En `instrumentation.ts`, que Next ejecuta al levantar el servidor: falla al
  **arrancar**, por si las variables cambiaron después del build.

Se probó dejarla solo en `instrumentation.ts` y **no alcanza**: el build pasó
limpio sin ninguna variable cargada. Un sitio así se publica y recién falla en la
primera visita, con un error de Supabase que no dice qué pasó.

**Exige por fase, no todo junto.** Solo son obligatorias las variables que ya se
usan:

| Variables                                                                                                        | Obligatorias desde |
| ---------------------------------------------------------------------------------------------------------------- | ------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL` | Fase 1             |
| `ADMIN_USER_ID`                                                                                                  | Fase 2             |
| `NEXT_PUBLIC_WHATSAPP`, `RESEND_API_KEY`, `EMAIL_CONTACTO`                                                       | Fase 4.6           |

**Por qué:** exigir hoy `ADMIN_USER_ID` es pedir el `user.id` de un usuario que se
crea recién en la Fase 2, y `RESEND_API_KEY` es pedir una cuenta que todavía no se
dio de alta. La alternativa sería completarlas con valores falsos para que el build
pase, y una variable con un valor falso es peor que una variable ausente: no
avisa nada y falla en producción.

La lista vive en `lib/entorno-validacion.ts`. **Cada fase suma la suya**, y está
escrito ahí mismo cuál le toca a cada una.

**Matizada por la decisión 56:** desde la Fase 4.6 el build y el arranque ya no
exigen la misma lista. El build exige las cuatro; el arranque, solo lo que usan
las páginas. Las dos del correo las comprueba el envío del formulario, para que
una clave faltante no tire el sitio entero.

---

### 22. El dominio principal es el apex, y `www` redirige

`espaciocortinas.com.ar` es la dirección canónica. `www.espaciocortinas.com.ar`
existe igual, pero solo para redirigir al apex con un 308.

**Por qué el apex y no `www`:** es lo que dice toda la documentación del proyecto
y es lo que se va a escribir en las tarjetas, en Instagram y en el Perfil de
Empresa de Google. Un dominio `.com.ar` ya es largo; sumarle cuatro caracteres no
ayuda.

La objeción clásica al apex es que no admite `CNAME` y obliga a una IP fija. Acá
nunca fue un problema, y desde la mudanza menos: el DNS y el hosting son el mismo
proveedor, y Cloudflare resuelve el apex con aplanado de CNAME sin que haya que
anotar ninguna IP.

**Cómo se implementa desde la mudanza** (antes lo resolvía Vercel solo):

- el apex es un Custom Domain del Worker;
- `www` **no** es un Custom Domain — es un registro proxeado que no sirve
  contenido, y una Redirect Rule lo manda al apex con 308;
- la misma regla sube de `http` a `https` con 308.

Las tres respuestas están escritas en `docs/infraestructura.md` y se verifican
con `curl`. Que `www` no sirva contenido es a propósito: si la regla se rompiera,
`www` falla de forma visible en vez de publicar el sitio duplicado en dos
direcciones, que es lo que castiga el buscador.

**Consecuencia práctica:** `NEXT_PUBLIC_SITE_URL` en producción es
`https://espaciocortinas.com.ar`, sin `www` y sin barra final. De ahí salen las
URLs canónicas, el sitemap y el Open Graph en la Fase 5. Si alguna vez se
invierte, hay que cambiar la variable en el mismo movimiento.

---

### 23. Los commits se firman con la cuenta de la empresa ~~— SUPERADA por la decisión 24~~

**Decía:** todos los commits van a nombre de `espacioCortinas`
(`310341945+espacioCortinas@users.noreply.github.com`), con la autoría real en
`Co-Authored-By`, configurado en el `.git/config` del repositorio.

**Por qué existía:** el plan Hobby de Vercel no admite colaboradores. Cuando el
autor de un commit no era el dueño de la cuenta, Vercel **bloqueaba el
despliegue** con "the commit author does not have contributing access". No era
una advertencia: no desplegaba. Las alternativas eran pagar Vercel Pro (USD 20
por mes) o mover el proyecto a la cuenta personal del desarrollador, que
contradice la regla de titularidad de `docs/infraestructura.md`.

**Por qué ya no aplica:** era una restricción de facturación de Vercel, no una
política del proyecto. **Cloudflare Workers Builds no mira el autor del commit**:
despliega lo que llegue a la rama configurada, venga de quien venga. El plan
gratuito de Cloudflare tampoco tiene el concepto de "colaborador que bloquea el
build".

**Qué cambia en la práctica:** la autoría de los commits vuelve a la normal —
cada quien commitea con su propia identidad. Se puede revertir la configuración
local del repositorio con:

```
git config --unset user.name
git config --unset user.email
```

**Lo que no cambia:** la titularidad de las cuentas de servicios sigue siendo de
la empresa (`docs/infraestructura.md`). Esa regla nunca dependió de la firma de
los commits, y sigue vigente.

**El histórico no se reescribe.** Los commits de la Fase 1 quedan como están: son
públicos en el repositorio y reescribirlos para "arreglar" la autoría cambiaría
todos los hashes a cambio de nada.

---

### 24. El sitio se muda de Vercel a Cloudflare Workers

**Fecha:** julio de 2026, con la Fase 1 recién terminada.

**Por qué se muda:** los términos del plan Hobby de Vercel lo reservan para uso
personal y no comercial. Este es el sitio institucional de una empresa que vende:
está fuera de lo que ese plan admite. La alternativa dentro de Vercel es el plan
Pro, USD 20 por mes. El plan gratuito de Cloudflare **sí admite uso comercial**,
así que la mudanza resuelve un problema de encuadre, no de precio.

**Por qué ahora y no después:** hoy el repositorio tiene una página vacía, cero
tablas y cero imágenes. La mudanza es cambiar cuatro archivos de configuración y
mover siete registros DNS. En la Fase 4, con panel, subidas y revalidación
andando, sería un día de trabajo y con riesgo de romper algo que funcionaba.
**El momento más barato para mudarse es antes de tener algo que mudar.**

**Beneficio secundario:** el DNS del dominio ya estaba en Cloudflare desde la
Fase 0. Ahora DNS, CDN, certificado, redirecciones y hosting son un solo panel y
un solo proveedor. Se elimina toda una categoría de problemas — la de dos
proveedores que se contradicen — que era justamente lo que motivaba la decisión 15.

#### El adaptador: `@opennextjs/cloudflare`

Este ecosistema cambió varias veces y hay guías viejas circulando. Estado
verificado contra la documentación de Cloudflare en julio de 2026:

| Camino                      | Estado                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------- |
| `@opennextjs/cloudflare`    | **el vigente.** Adaptador oficial. Corre Next sobre el runtime de Node de Workers       |
| `@cloudflare/next-on-pages` | anterior, sobre Cloudflare Pages. Solo soportaba el runtime "edge" de Next. **No usar** |
| `next export` estático      | no sirve: el panel necesita ejecución en servidor (regla 3 de `CLAUDE.md`)              |

La diferencia que importa: `next-on-pages` obligaba a marcar cada ruta con
`export const runtime = "edge"`, un subconjunto recortado de APIs. Con
`@opennextjs/cloudflare` el código es Next normal sobre Node. **Nada de la
arquitectura tuvo que cambiar para mudarse.**

#### Las dependencias que agrega, una por una

La regla 8 de `CLAUDE.md` pide justificar cada dependencia. Son dos:

| Paquete                  | Por qué                                                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@opennextjs/cloudflare` | el adaptador. Sin él no hay forma de correr Next con App Router en Workers. No hay alternativa que no sea escribirlo a mano                                  |
| `wrangler`               | la CLI oficial de Cloudflare. Valida `wrangler.jsonc`, levanta el Worker en local (`npm run preview`) y despliega. Solo de desarrollo: no llega al navegador |

Ninguna de las dos entra al paquete que descarga el visitante: las dos corren en
el build.

#### El `overrides` de `package.json`, y por qué existe

No es una dependencia nueva: es un parche a una transitiva rota.

`@napi-rs/wasm-runtime@1.2.0` declara como peer `@emnapi/core` y `@emnapi/runtime`
en `^2.0.0-alpha.3`, **una versión que no está publicada**. Como el rango no se
puede satisfacer, cada versión de npm improvisa distinto: npm 11 escribe un
lockfile sin esas dos entradas, y npm 10 —el que usa el builder de Cloudflare—
lo rechaza con `Missing: @emnapi/core@1.10.0 from lock file`.

El síntoma es feo de diagnosticar porque **el build falla solo en Cloudflare**:
en la máquina de desarrollo `npm ci` pasa, y el paquete culpable no aparece por
ningún lado en el código. Llega por `eslint-config-next` → `unrs-resolver`, y
solo se usa en el binding WASM de reserva, que en x64 no se ejecuta nunca.

El `overrides` fija los peers a un rango que sí existe, y con eso las dos
versiones de npm producen el mismo árbol. Verificado corriendo `npm ci` con las
dos.

**Se puede sacar** cuando `@napi-rs/wasm-runtime` declare un peer publicado. La
forma de comprobarlo es sacarlo y correr:

```
npx npm@10.9.2 ci --dry-run
```

**La lección que conviene no perder:** el lockfile lo consume una versión de npm
distinta de la que lo genera. Si algún día el build de Cloudflare falla en la
instalación de dependencias y en local no, mirar esa diferencia antes que
cualquier otra cosa.

#### Lo que no se conserva de Vercel

- **Vercel Analytics** → Cloudflare Web Analytics (decisión 17)
- **El bloqueo por autor del commit** → deja de existir (decisión 23)
- **HSTS automático** → en Cloudflare se activa a mano, y el tope de `max-age`
  es de 12 meses en vez de los 24 que servía Vercel. Es una diferencia real,
  aunque menor: 12 meses ya es el valor que pide la lista de precarga de HSTS
- **`www` y `http` redirigidos por el hosting** → pasan a ser una Redirect Rule
  de Cloudflare (decisión 22)
- **Una sola casilla para las variables de entorno** → en Cloudflare van dos
  veces: las del **build** y las del **runtime** son listas separadas. Ver
  `docs/infraestructura.md`, que explica cuál va en cuál y por qué

#### Lo que sí se conserva

App Router, Server Actions, Supabase, el flujo de subida de imágenes, el
despliegue automático desde `main` y las cuatro variables de entorno. La
arquitectura resultó portable, que era lo que `docs/infraestructura.md` anticipaba.

---

### 25. Las medidas de cada imagen se generan al subir, no al servir

**Fecha:** julio de 2026, junto con la decisión 24.

**El planteo anterior era:** el navegador sube **un** WebP de 2560 px y
`next/image` genera al vuelo el tamaño que corresponde a cada pantalla.

**Por qué deja de funcionar:** eso lo hacía el optimizador de imágenes de Vercel.
En Cloudflare el equivalente son las Transformations, y en el plan gratuito
vienen con un tope de **5.000 transformaciones únicas por mes**. Pasado el tope
no se degrada: devuelve error 9422 y la imagen no carga.

Ese tope, para este sitio, es bajo. Cada foto multiplicada por los cortes de
`srcset` da varias transformaciones únicas, y el catálogo previsto ronda las 300
fotos. Con cuatro medidas ya son 1.200 solo para mostrar todo el sitio una vez,
sin contar cada vez que se sube una foto nueva. Un sitio que puede dejar de
mostrar fotos el día 20 de cada mes no sirve para lo único que este sitio hace.

**La estrategia nueva:**

```
1. La administradora elige una foto
        ↓
2. NAVEGADOR: normaliza orientación EXIF, borra metadatos, y genera
   CUATRO WebP — de 480, 960, 1600 y 2560 px de ANCHO
        ↓
3. Se suben los cuatro a Supabase Storage, bajo el mismo identificador
        ↓
4. La fila de la tabla de imágenes registra QUÉ medidas existen
        ↓
5. El sitio público sirve un <img> con srcset y sizes
```

**Por qué esto es mejor de lo que parece:**

- **El trabajo se hace una vez, no en cada visita.** Redimensionar al servir
  repite el mismo cómputo para cada visitante nuevo; hacerlo al subir lo hace
  una sola vez, en la máquina de quien sube, que además está ociosa
- **No hay cuota que agotar.** Supabase Storage cobra por bytes guardados, y las
  cuatro medidas de una foto pesan menos que el original sin comprimir. El plan
  gratuito da 1 GB; 300 fotos en cuatro medidas rondan los 250 MB
- **Ya se comprimía en el navegador.** Generar cuatro tamaños en vez de uno es
  el mismo código con un bucle. No hay tecnología nueva
- **`srcset` es HTML estándar.** No depende del hosting. Si el sitio se muda otra
  vez, esto sigue funcionando sin tocar nada

**Lo que cuesta:**

- La subida tarda más: cuatro archivos en vez de uno. Desde un celular, con las
  medidas chicas pesando poco, es aceptable
- **Las medidas quedan congeladas.** Si en dos años hace falta un corte de 1200
  px, hay que regenerarlo para las fotos ya cargadas. Por eso la tabla registra
  qué medidas existen por fila y no se asume que todas tienen todas: permite
  agregar una medida nueva de forma incremental
- No hay AVIF. WebP lo entienden todos los navegadores en uso; AVIF comprime
  mejor pero generarlo en el navegador es lento y el beneficio es marginal.
  **Ojo con esta frase**, que es la que falló: «lo entienden» es sobre MOSTRAR,
  y resultó que lo que faltaba era GENERAR — decisión 35

**Consecuencias concretas:** `next/image` pasa a usarse con `unoptimized`, o
directamente `<img>`. Ver `docs/arquitectura.md` (sección «Subida de imágenes») y
`docs/modelo-de-datos.md` (columna `medidas`).

**Esto es documentación, no implementación.** El código es de la Fase 3.

**Corregida por la decisión 35:** el formato no siempre es WebP. WebKit no
sabe generarlo desde un canvas, y en iOS todos los navegadores son WebKit, así
que las fotos cargadas desde el teléfono son JPEG. Cada fila registra cuál le
tocó.

**Corregida por la decisión 32:** donde acá dice «lado mayor» va **ancho**. La
diferencia no es de redacción — el descriptor `w` de un `srcset` es el ancho
real del archivo, y con el otro criterio el navegador elegiría mal el tamaño en
cada pantalla.

---

### 26. El archivo se queda como `middleware.ts`, NO se renombra a `proxy.ts`

**Fecha:** agosto de 2026, durante la Fase 2.

Next 16 deprecó la convención `middleware.ts` en favor de `proxy.ts`, y lo avisa
en **cada build**:

```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

**Se hizo el rename y se revirtió.** Queda anotado con detalle justamente
porque el aviso invita a rehacerlo.

**Por qué no se puede:** `proxy.ts` **siempre corre en el runtime de Node**, y
Next no permite cambiárselo. No es que el valor por defecto sea Node: declarar
cualquier `runtime` en un archivo `proxy` es un error de build.

```
Route segment config is not allowed in Proxy file.
Proxy always runs on Node.js runtime.
```

Y `@opennextjs/cloudflare` **solo admite middleware de _edge_**. Con `proxy.ts`
el build del adaptador corta:

```
ERROR Node.js middleware is not currently supported.
      Consider switching to Edge Middleware.
```

Las dos condiciones son incompatibles y ninguna de las dos es configurable. No
hay forma de usar `proxy.ts` en este proyecto mientras el hosting sea Cloudflare
Workers con este adaptador.

`middleware.ts`, en cambio, sigue compilándose como middleware de edge y el
adaptador lo acepta sin objeciones.

**Cómo se detectó, que es la parte que importa:** `npm run build` pasa **verde**
con `proxy.ts`. El que falla es `npm run build:cf`, o sea `npm run preview`.
Es exactamente el caso que anticipa `docs/arquitectura.md` cuando dice que
`npm run dev` y `npm run build` no detectan un uso de API que Workers no
soporta. Si esto se hubiera pusheado sin correr `preview`, el build de
Cloudflare habría cortado — sin tirar el sitio, porque la versión anterior
sigue sirviendo, pero con un fallo confuso de diagnosticar.

**Cuándo revisarlo:** cuando `@opennextjs/cloudflare` soporte middleware de
Node, o cuando Next 17 elimine `middleware.ts`. Lo que pase primero. Hasta
entonces el aviso de deprecación se convive a propósito, y hay un comentario
al principio de `middleware.ts` que lo explica para que nadie lo "arregle".

**Lo que nunca estuvo en discusión:** el archivo no autoriza. La regla 4 de
`CLAUDE.md` y lo que `docs/seguridad.md` dice sobre CVE-2025-29927 valen igual
con cualquier nombre — el riesgo nunca fue cómo se llama, sino confiar en que
corrió.

---

### 27. Las políticas de lectura son para `anon` **y** `authenticated`

**Fecha:** agosto de 2026, durante la Fase 2.

`docs/seguridad.md` escribía las políticas como `to anon` a secas. Al
implementarlas apareció un caso que ese texto no contemplaba.

**El problema:** el sitio público se renderiza en el servidor con la clave
anónima **más las cookies de la petición**. Para un visitante cualquiera no hay
cookies y el rol en Postgres es `anon`, así que `to anon` alcanza. Pero si la
administradora navega el sitio público con la sesión del panel abierta, su rol
es `authenticated`, no `anon` — y con `to anon` vería un sitio completamente
vacío.

Eso no se manifiesta como un error: se manifiesta como un catálogo sin
productos, y en la Fase 4 se habría diagnosticado como un bug de las consultas.

**Decisión:** las políticas de `select` van `to anon, authenticated`, siempre
con `using (activo = true)`.

**Lo que no se toca:** sigue sin haber **ninguna** política de `insert`,
`update` ni `delete` para ninguno de los dos roles. Lo que se agranda es solo
la lectura de contenido que ya es público. Un `authenticated` no ve nada que no
vea un anónimo.

---

### 28. Las migraciones son archivos `.sql` que se aplican a mano

**Fecha:** agosto de 2026, durante la Fase 2.

**Alternativa evaluada:** sumar la CLI de Supabase como dependencia de
desarrollo, renombrar `supabase/migraciones` a `supabase/migrations` y aplicar
con `supabase db push`.

**Por qué se descartó:** la regla 8 de `CLAUDE.md` pide justificar cada
dependencia, y acá el beneficio es automatizar un paso que en toda la V1 se va
a ejecutar un puñado de veces. Además `supabase link` pide un access token
personal y la contraseña de la base, o sea dos credenciales más para
administrar, en un proyecto cuyo criterio de titularidad es explícito
(`docs/infraestructura.md`).

**Cómo funciona entonces:** los `.sql` viven numerados en
`supabase/migraciones/` y se pegan en el SQL Editor de Supabase. Están escritos
para ser **idempotentes**: se pueden volver a correr enteros sin romper nada.

**Lo que se conserva, que es lo que importa:** el repositorio sigue siendo la
fuente de verdad del esquema. Nunca se cambia la base desde el panel de
Supabase sin que el cambio quede en un archivo acá.

**Se revisará** si en algún momento hay que sincronizar varios entornos, que es
donde la CLI empieza a pagar lo que cuesta. Hoy hay uno solo.

**Lo que a esta decisión le faltaba** —cómo comprobar que la base real se parece
a lo que dicen los archivos— está en la decisión 31.

---

### 29. El caché incremental es Workers KV, y el de etiquetas es D1

**Fecha:** agosto de 2026, al empezar la Fase 3.

`docs/arquitectura.md` dejaba esto explícitamente para esta fase: sin un caché
compartido, `revalidatePath()` desde el panel invalida la copia de **una**
instancia del Worker y las demás siguen sirviendo la página vieja. La
administradora guardaría un cambio y lo vería o no según qué instancia la
atienda. Es la condición para que «guardo y lo veo enseguida» sea cierto.

**Lo primero que apareció al implementarlo: no es una pieza, son dos.**

| Pieza              | Qué guarda                       | Qué pasa si falta                                     |
| ------------------ | -------------------------------- | ----------------------------------------------------- |
| `incrementalCache` | la página ya renderizada         | cada instancia renderiza por su cuenta; nada se rompe |
| `tagCache`         | cuándo se revalidó cada etiqueta | **`revalidatePath()` no hace nada**                   |

El enunciado de la fase hablaba solo del caché incremental. Configurar solo eso
habría dado un sistema que parece andar —las páginas se guardan y se sirven
rápido— y en el que el botón de guardar del panel no propaga nada. El
`tagCache` viene en `dummy` por defecto y no avisa.

Cómo funciona, que es lo que explica las dos elecciones de abajo:
`revalidatePath()` no borra nada. Anota en el `tagCache` que la etiqueta de esa
ruta se revalidó recién. En la siguiente visita el adaptador compara esa marca
contra la fecha de lo guardado en el `incrementalCache`, y si la marca es más
nueva trata la entrada como inexistente: Next renderiza en esa misma petición y
devuelve lo nuevo. **No hay ventana de espera.**

#### El caché incremental: KV, no R2

**R2 es lo que recomienda la documentación de OpenNext**, y no se pudo usar:

```
npx wrangler r2 bucket list
X [ERROR] Please enable R2 through the Cloudflare Dashboard. [code: 10042]
```

R2 hay que habilitarlo a mano y con un método de pago cargado, aunque el uso
entre en el nivel gratuito. La cuenta es de la empresa y el proyecto entero está
planteado sobre planes gratuitos sin datos de facturación (decisión 18 para
Supabase, decisión 24 para Cloudflare). Habilitar un producto que pide tarjeta
para ganar una consistencia que acá no hace falta —ver abajo— no valía el
trámite.

**La objeción a KV es que es de consistencia eventual:** una escritura puede
tardar hasta 60 s en verse desde otra región. Acá eso **no se traduce en
contenido viejo**, y la razón es la mecánica de arriba: quien decide si algo
está vencido no es esta caché, es el `tagCache`. Si KV devolviera una copia
atrasada, su fecha sería más vieja que la marca de revalidación y el adaptador
la descartaría igual. **El peor caso es renderizar de más durante un minuto, no
mostrar lo viejo.**

Y para este sitio KV encaja mejor por lo demás: lectura por caché en niveles
desde el borde, y un volumen ridículo —unas decenas de páginas chicas— frente al
argumento de R2, que es ser barato con mucho volumen. El plan gratuito de KV da
100.000 lecturas y 1.000 escrituras por día; acá una jornada intensa de carga de
contenido son unos cientos de escrituras.

#### El caché de etiquetas: D1, no KV ni Durable Objects

Donde la consistencia eventual **sí** dolería es en el `tagCache`, porque es el
que decide. Existe uno de KV (`kv-next-tag-cache`) que ahorraría un recurso, y
el propio adaptador lo marca experimental con este aviso:

> KV is eventually consistent and can take up to 60s to reflect the last write.
> This means that revalidations can take up to 60s to apply.

Eso es exactamente la promesa que esta fase tiene que cumplir, así que queda
descartado sin más.

`doShardedTagCache`, sobre Durable Objects, es el que la documentación
recomienda para tráfico alto o revalidaciones frecuentes. Este sitio es lo
contrario: una persona cargando contenido unas veces por mes. D1 es el que la
documentación indica para carga baja, es fuertemente consistente y estaba
disponible en la cuenta sin habilitar nada.

**Lo que D1 cuesta y hay que medir en la Fase 4:** quedó en la región `ENAM`
porque D1 no ofrece Sudamérica, y cada visita a una página guardada consulta las
etiquetas. Esa latencia se suma al TTFB de todas las páginas públicas. Si
molesta, el reemplazo es `doShardedTagCache`: los Durable Objects se ubican
cerca de quien los crea.

#### Sin `queue`, y esto hay que revisarlo en la Fase 4

El `queue` del adaptador **no interviene en la revalidación bajo demanda** —la
del panel— sino en la **revalidación por tiempo**: la de una página declarada
con `revalidate: 60`, que al vencer se regenera de fondo. Este sitio no tiene
ninguna: el contenido cambia solo cuando la administradora guarda, y ahí ya hay
un `revalidatePath()` explícito. Un `queue` hoy sería un Durable Object más una
referencia de servicio para algo que nunca se dispara.

**Si en la Fase 4 alguna página pública se declara con `revalidate: N`, hay que
agregar el `queue` en el mismo movimiento.** Sin él esa página no se regenera
sola: el adaptador intenta encolar, falla, y lo anota en los registros del
Worker sin que nada más se entere. Sigue sirviendo lo guardado, así que no se
cae — se congela.

#### Lo que hay que saber para operarlo

La tabla `revalidations` de D1 la crea el paso `populateCache` de
`opennextjs-cloudflare deploy`, en cada despliegue. **El Deploy command del
builder tiene que seguir siendo `npx opennextjs-cloudflare deploy`**; con
`wrangler deploy` pelado el caché queda sin inicializar y la revalidación falla
en silencio.

---

### 30. Las variables públicas se declaran en `wrangler.jsonc`, no como Secret

**Fecha:** agosto de 2026, al empezar la Fase 3. Corrige la regla que salió del
incidente del 14/08.

**La regla anterior decía:** en la lista de runtime del Worker, **todas** las
variables se cargan como Secret, incluso las que no tienen nada que ocultar. La
razón era buena: `wrangler deploy` borra las variables de tipo Text, y un Secret
es el único tipo que sobrevive.

**Por qué se cambia:** funcionaba, pero dejaba la configuración de producción de
**solo escritura**. Un Secret no se puede volver a leer, ni desde el panel ni
desde la CLI. Nadie podía auditar qué valor estaba puesto.

Ese costo se cobró el mismo día que se adoptó la regla:
`NEXT_PUBLIC_SUPABASE_URL` estaba cargada con `/rest/v1` pegado al final, el
sitio respondía 200, el build salía verde, y el login estaba roto para todo el
mundo. El valor equivocado era invisible.

**Lo que se hace ahora:**

```
vars (en wrangler.jsonc)   NEXT_PUBLIC_SUPABASE_URL
                           NEXT_PUBLIC_SUPABASE_ANON_KEY
                           NEXT_PUBLIC_SITE_URL

Secrets (del Worker)       SUPABASE_SERVICE_ROLE_KEY
                           ADMIN_USER_ID
```

**Las tres primeras no exponen nada.** Llevan prefijo `NEXT_PUBLIC_`, así que
Next las incrusta en el paquete que descarga el navegador: cualquiera que abra
el sitio ya las tiene. Escribirlas en un archivo versionado no agrega ninguna
exposición. Lo que se puede hacer con la clave anónima lo decide RLS —
`docs/seguridad.md`.

**Y de paso resuelve el borrado por la causa y no por el síntoma.** Wrangler
borra las variables de texto porque trata al bloque `vars` de `wrangler.jsonc`
como la fuente de verdad: deja el Worker con lo que dice el archivo y saca el
resto. El problema nunca fue que las variables fueran de texto — fue que el
archivo no las declaraba. Declaradas ahí, wrangler las escribe en cada
despliegue en vez de borrarlas.

**Lo que no cambia:**

- Las dos secretas **nunca** van a `wrangler.jsonc`. Se cargan con
  `wrangler secret put` y wrangler no las toca.
- La lista de **build** sigue siendo otra cosa y sigue necesitando las cinco.
  Este archivo no la toca.
- Una variable de texto cargada a mano en el panel **sin** declararla en
  `wrangler.jsonc` la sigue borrando el próximo despliegue. El archivo manda;
  el panel, no.

**Cómo se verifica ahora:** `npx wrangler secret list` tiene que devolver
**exactamente dos**. Una tercera no es tranquilizadora: significa que quedó un
Secret viejo con el mismo nombre que una `var`, y hay dos valores para el mismo
nombre. Las otras tres se leen con `npx wrangler deploy --dry-run`, que lista
los bindings con su valor sin desplegar nada.

**Desde la Fase 4.6** son tres `vars` —`NEXT_PUBLIC_SITE_URL`,
`NEXT_PUBLIC_WHATSAPP` y `EMAIL_CONTACTO`— y **un solo** Secret,
`RESEND_API_KEY`. `EMAIL_CONTACTO` no lleva el prefijo público pero tampoco es
secreta, y va a la vista por la misma razón que las demás — decisión 55.

---

### 31. Cómo se verifica que las migraciones coinciden con la base

**Fecha:** agosto de 2026, al empezar la Fase 3. Completa la decisión 28.

La decisión 28 dejó las migraciones como archivos `.sql` que se pegan a mano en
el SQL Editor, y se sostiene: la CLI de Supabase pedía dos credenciales más para
automatizar un paso que en toda la V1 se corre un puñado de veces.

**Lo que le faltaba:** con una sola tanda de migraciones, «el repositorio es la
fuente de verdad del esquema» era cierto por inspección. Con más migraciones deja
de serlo. Una migración que se aplicó a medias, un `alter table` hecho desde el
panel de Supabase para salir del paso, un `revoke` que quedó sin correr — nada de
eso deja huella en el repositorio, y el día que aparezca un problema se va a
buscar en el lugar equivocado.

**Lo que se hace:** el repositorio guarda una **foto** del esquema real, y hay un
comando que la compara contra la base.

```
npm run esquema              compara la base con supabase/esquema.txt
npm run esquema:actualizar   guarda la foto nueva, para commitear el diff
```

Tres piezas:

| Pieza                           | Qué es                                                              |
| ------------------------------- | ------------------------------------------------------------------- |
| `public.verificar_esquema()`    | función SQL que devuelve el estado real, línea por línea y ordenado |
| `supabase/esquema.txt`          | la foto, versionada. Es lo que el repositorio afirma sobre la base  |
| `scripts/verificar-esquema.mjs` | compara las dos y muestra qué sobra y qué falta                     |

**El procedimiento al aplicar una migración**, que es todo el punto:

1. Se pega el `.sql` nuevo en el SQL Editor.
2. Se corre `npm run esquema:actualizar`.
3. **Se lee el diff de `supabase/esquema.txt`.** Tiene que contener exactamente
   lo que la migración pedía y nada más.
4. Se commitea junto con la migración.

El paso 3 es el que hace el trabajo. Si el diff trae algo que la migración no
pedía, eso es un cambio que alguien hizo por fuera — y aparece ahí, en una
revisión de código, en vez de descubrirse meses después.

#### Por qué una foto y no una lista de comprobaciones

La alternativa obvia era escribir asserts: «la tabla `productos` tiene que tener
la columna `slug`», «RLS tiene que estar activado en las cinco tablas». Se
descartó porque **una lista solo encuentra lo que alguien se acordó de
escribir.** Los problemas que este mecanismo tiene que atrapar son justamente los
que nadie previó: la columna de más, la política que quedó de una prueba, el
permiso que Supabase concede por defecto y que el `revoke` de la migración no
alcanzó a sacar.

La foto incluye tablas y columnas con tipo y default, restricciones con el
`on delete` de cada clave foránea, índices con su definición completa —ahí se ve
el `where es_portada` del índice parcial, que si se perdiera dejaría el índice
con el mismo nombre haciendo otra cosa—, disparadores, el estado de RLS tabla por
tabla, las políticas con su condición entera, los permisos de `anon` y
`authenticated`, los permisos de ejecución de cada función, la configuración del
bucket y las políticas de `storage.objects`, que tienen que ser cero.

#### Por qué no la CLI de Supabase, otra vez

`supabase db diff` hace algo parecido y mejor. Sigue costando lo mismo que en la
decisión 28: una dependencia de desarrollo, un `supabase link`, un access token
personal y la contraseña de la base. Esto son 150 líneas de SQL, un script sin
ninguna dependencia nueva y ninguna credencial que no exista ya.

**Se revisará junto con la decisión 28**, cuando haya más de un entorno que
sincronizar.

#### Lo que este mecanismo no hace

No aplica migraciones ni las ordena: sigue habiendo que pegarlas a mano. Tampoco
detecta un cambio en los **datos**. Detecta una sola cosa —que la forma de la
base dejó de coincidir con lo que el repositorio dice— y esa es la que hacía
falta.

La función se expone por la API automática de Supabase, así que se le revoca
`execute` a `anon` y a `authenticated` y solo la puede llamar `service_role`.

---

### 32. Las medidas son ANCHOS, y la última es el ancho del original

**Fecha:** agosto de 2026, durante la Fase 3. Corrige la decisión 25 y precisa
`docs/modelo-de-datos.md`.

**La contradicción, tal como estaba escrita.** La decisión 25 y
`docs/arquitectura.md` decían «480, 960, 1600 y 2560 px de **lado mayor**».
`docs/modelo-de-datos.md` decía dos veces lo contrario: la columna `medidas` es
«qué **anchos** existen» y «el nombre de cada archivo es su **ancho**». Y el
ejemplo de `srcset` de `docs/arquitectura.md`, que es la única parte que
mostraba código, estaba escrito con el criterio del ancho:

```html
<img
  src="…/1600.webp"
  srcset="… …/1600.webp 1600w"
  width="1600"
  height="2000"
/>
```

Ahí `1600.webp` mide 1600 de ancho y 2000 de alto: el número es el ancho, y el
lado mayor es 2000.

**Se resuelve por el ancho, y no es una preferencia.** El descriptor `w` de un
`srcset` es, por definición, el ancho real del archivo en píxeles. Con el
criterio del «lado mayor», una foto vertical 4:5 llamada `2560.webp` mediría
2048 de ancho, el `srcset` la anunciaría como `2560w`, y el navegador elegiría
mal el archivo en toda pantalla intermedia: pediría uno más chico del que
necesita y la foto se vería blanda. Es un error silencioso —nada falla, solo se
ve peor— que se habría manifestado recién en la Fase 4.

Lo que estaba mal escrito era «lado mayor». Corregido en los tres documentos.

**La segunda precisión: la última medida es el ancho del original.** La regla
implementada es «no agrandar nunca», y de ahí sale la lista de cada foto:

```
ancho original ≥ 2560   →  {480, 960, 1600, 2560}      el caso normal
ancho original = 900    →  {480, 900}
ancho original = 1600   →  {480, 960, 1600}
ancho original = 400    →  {400}
```

O sea: las medidas fijas que sean **menores** al ancho del original, más el
ancho del original (con tope en 2560). `docs/modelo-de-datos.md` daba
`{480,960}` para una foto de 900 px, y eso agrandaría — 960 es más que 900.

**Por qué agregar el ancho del original y no cortar en 480.** Una foto vieja de
900 px que solo tuviera la medida de 480 se vería blanda en cualquier teléfono
moderno, que a 2x de densidad necesita unos 750 px para un ancho de 375. Sumar
su propio ancho es gratis —el archivo se genera igual— y da la mejor versión
que esa foto puede dar.

**Esto no reabre la decisión 25.** Las cuatro medidas fijas siguen congeladas
para la V1 y agregar un corte nuevo sigue obligando a regenerar lo ya cargado.
Lo que cambia es solo cómo se lee el número, y qué pasa con las fotos más
chicas que el corte más chico — que es exactamente para lo que la columna
`medidas` era un arreglo por fila y no una constante del código.

**Verificado con una foto de 3024 × 4032:** salieron `{480, 960, 1600, 2560}`,
y la más grande mide 2560 × 1920. Con una de 640 × 480 salieron `{480, 640}`.

---

### 33. El panel reordena con botones, no arrastrando

**Fecha:** agosto de 2026, durante la Fase 3.

**Alternativa evaluada:** arrastrar y soltar para reordenar la galería y los
listados, que es lo que hace cualquier panel moderno.

**Por qué se descartó:**

- **En un teléfono compite con el desplazamiento.** El gesto es el mismo —
  apoyar y mover— así que hay que distinguirlos por tiempo de presión. Eso
  significa que intentar desplazar la página a veces arrastra una foto, y
  arrastrar a veces desplaza. La persona que va a usar esto no es técnica y va
  a estar parada en la casa de un cliente.
- **Con teclado o con un lector de pantalla no existe.** Hacerlo accesible es
  reimplementarlo entero con `aria-grabbed` y atajos, que nadie descubre.
- **Cuesta una dependencia.** Hacerlo bien a mano en móvil es bastante código;
  la alternativa es una librería, y la regla 8 de `CLAUDE.md` pide justificar
  cada una.

**Lo que se hace:** dos botones de 48 px, subir y bajar, con `aria-label` que
dice qué se mueve. El orden se aplica en pantalla al instante y se guarda de
fondo; si el guardado falla, se avisa y se recarga desde el servidor.

**Dónde se paga:** reordenar doce fotos son once toques en vez de tres
arrastres. Para un catálogo que se ordena una vez y después casi no se toca,
es un precio razonable.

**Se revisará** si aparece la necesidad de reordenar galerías largas seguido.

---

### 34. El panel puede reordenar productos y proyectos, no solo fotos

**Fecha:** agosto de 2026, durante la Fase 3.

El alcance de la fase listaba «reordenar» solo dentro de la galería. Al
implementarlo apareció que la columna `orden` de `productos` y `proyectos` no
tenía ninguna forma de cambiarse desde el panel, y **eso la dejaba sin
sentido**: todas las filas quedarían en el mismo valor y el orden del catálogo
sería el que Postgres devuelva.

Peor: `docs/modelo-de-datos.md` dice que el tope de destacados del Inicio se
aplica **al consultar**, ordenando por `orden`, «así se puede reordenar sin
tener que desmarcar primero». Sin una forma de reordenar, esa frase describe
algo que no se puede hacer, y decidir qué sale en la portada obligaría a
desmarcar destacados — justo lo que el modelo quería evitar.

Se agregó con los mismos botones de subir y bajar de la galería, y `orden` se
asigna solo al crear, para que lo nuevo entre al final.

---

### 35. El formato de subida se detecta, y cada imagen registra el suyo

**Fecha:** agosto de 2026, probando el panel de la Fase 3 desde el teléfono de
la empresa. Corrige la decisión 25.

**Cómo apareció.** Al intentar subir la primera foto desde el iPhone, el panel
respondía: «Este navegador no puede guardar las fotos en el formato que usa la
página». Lo mismo desde Safari y desde Chrome.

**Por qué desde los dos.** Porque en iOS son el mismo navegador: Apple obliga a
que todo lo que muestre páginas use WebKit, así que Chrome y Firefox en iPhone
son Safari con otro ícono. Probar «en otro navegador» no prueba nada ahí.

**La causa: WebKit no sabe generar WebP desde un canvas.** Sabe mostrarlo desde
2020, que es lo que la decisión 25 tuvo en cuenta —«WebP lo entienden todos los
navegadores en uso»— pero mostrar y generar son cosas distintas, y esa decisión
solo miró la primera. El equipo de WebKit no implementó la codificación.

**Y lo peor es cómo falla.** `canvas.toBlob("image/webp")` no devuelve error ni
`null`: por especificación, cuando el formato pedido no está soportado, el
navegador **devuelve un PNG**. O sea que preguntar «¿podés WebP?» siempre
contesta que sí. Sin la comprobación de `blob.type` que ya tenía el código, se
habrían subido PNG enormes con nombre `.webp` y el problema habría aparecido
mucho más tarde, como fotos que pesan diez veces lo previsto.

#### Lo que se hace

El navegador prueba, en orden, cuál de los formatos sabe generar de verdad
—codifica un lienzo de 1×1 y mira qué tipo vuelve— y usa el primero que
funcione:

| Dónde                                | Formato |
| ------------------------------------ | ------- |
| Chrome, Edge, Firefox, Android       | WebP    |
| Cualquier navegador en iPhone o iPad | JPEG    |
| Safari en Mac                        | JPEG    |

Y **cada fila de imagen registra cuál le tocó**, en una columna `formato` nueva
(migración 0006). Es el mismo razonamiento que ya justificaba la columna
`medidas`: no adivinar, registrar. Armar el nombre del archivo desde una
constante del código funcionaría hasta la primera foto cargada desde el otro
dispositivo, y ahí el navegador pediría `960.webp` de una foto que en realidad
es `960.jpg`.

El valor guardado es **la extensión**, no el tipo MIME, para que armar la ruta
sea concatenar (`{ancho}.{formato}`) y no traducir.

#### Lo que cuesta, medido y no estimado

Sobre una foto real de la empresa, de 1206 × 2144:

| ancho | WebP @0,82 | JPEG @0,75 |
| ----- | ---------- | ---------- |
| 480   | 61 kB      | 67 kB      |
| 960   | 193 kB     | 226 kB     |
| 1206  | 324 kB     | 361 kB     |

**Entre 10% y 17% más**, no el 30-40% que se suele citar. La diferencia está en
la calidad: 0,75 en JPEG se ve como 0,82 en WebP para fotografía, y comparar
los dos al mismo número es comparar mal. A cambio, el JPEG lo genera el
codificador nativo del sistema, que es instantáneo.

#### Las dos alternativas que se descartaron

**Usar JPEG para todo y no tener columna.** Más simple: un formato, un camino,
sin detección. Se descartó porque el archivo histórico de la empresa son unas
300 fotos que se van a cargar desde una computadora, no desde el teléfono, y
ahí sí se puede generar WebP. Renunciar a eso para ahorrar una columna es pagar
un 10-17% de peso en todas las fotos del sitio, para siempre, en un sitio
mobile-first cuyo contenido es casi exclusivamente fotos.

**Un codificador de WebP en WebAssembly**, para mantener WebP en todos lados.
Es lo que hace la decisión 25 posible tal como estaba escrita, y se descartó
por dos razones: agrega una dependencia (regla 8 de `CLAUDE.md`), y sobre todo
**comprimir en WebAssembly en un teléfono es varias veces más lento que el
codificador nativo**. Cada foto son tres o cuatro medidas; multiplicado por las
300 fotos del archivo, la carga de contenido se volvería una tarea de días. El
10-17% de bytes no vale eso.

#### Lo que no cambia

- Se sigue prefiriendo WebP donde se puede.
- El EXIF se sigue borrando igual, y **se verificó también en el camino JPEG**,
  que es el que importa comprobar: WebP no tiene dónde guardar metadatos, pero
  un JPEG sí. Las tres medidas salieron sin EXIF, sin IPTC y sin GPS — lo único
  que queda es el perfil de color ICC.
- Las medidas siguen siendo las de la decisión 32.

---

### 36. Se saca el panel: el contenido pasa al repositorio y Supabase se va

**Fecha:** agosto de 2026, con la Fase 3 recién terminada y verificada.

**Qué se revierte:** el panel de administración completo, la base de datos, la
autenticación y el almacenamiento de archivos. Productos y proyectos pasan a ser
archivos versionados en el repositorio, y las fotos se preparan con un script en
la máquina de quien desarrolla.

**Quién lo decide y por qué:** el desarrollador, y la razón es que el contenido
cambia pocas veces al año y prefiere editarlo a mano antes que mantener un panel
para eso.

#### La objeción, anotada

La decisión 3 eligió panel propio sobre un CMS headless, y **su factor decisivo
no fue técnico**: «la persona que va a usarlo no es técnica. Un panel propio, en
español, con dos secciones y ningún concepto de CMS a la vista, la hace
autónoma».

Esa razón no desaparece porque el panel se borre: se transfiere. A partir de
acá, **cada foto nueva y cada corrección de texto pasan por el desarrollador**,
y la empresa deja de poder publicar sola. Eso choca de frente con el criterio de
titularidad de `docs/infraestructura.md`, que existe justamente para que la
empresa no dependa de quien desarrolla —«si la persona que desarrolla el sitio
deja la empresa, la empresa conserva el control»—. Hoy conserva el control de
las cuentas, pero no de la capacidad de publicar.

Se plantea y se decide seguir igual. Queda escrito para que la próxima vez que
alguien se pregunte «¿por qué no hay panel?» la respuesta no sea «nunca se
hizo», que sería falso: se hizo, funcionó, se probó desde un teléfono, y se
sacó a propósito.

**Cuándo revisarlo:** si la empresa pide publicar sin intermediario, o si el
ritmo de cambios deja de ser «pocas veces al año». El código del panel queda en
el historial de git —commits `9c5b9cc` a `e524d4c`— así que volver atrás es
recuperar archivos, no reescribirlos.

#### Lo que se gana, que es más de lo que parece

No es solo borrar 4.100 líneas. **Desaparece la restricción que deformaba todo
el diseño de imágenes.** El procesamiento ocurría en el navegador porque el
runtime de Workers no ejecuta módulos nativos y porque quien subía las fotos no
era técnica (decisiones 5 y 25). Con el contenido en el repositorio, las fotos
se preparan en una máquina de desarrollo, donde `sharp` corre sin problema.

De ahí salen tres simplificaciones encadenadas:

- **Vuelve WebP para todas las fotos.** La rama JPEG existía porque WebKit no
  sabe codificar WebP y el panel se usaba desde un iPhone (decisión 35). Ya no
  comprime ningún navegador, así que esa decisión queda sin objeto y se
  recupera el 10-17% de peso.
- **Los datos técnicos de cada foto los calcula el script**, no una persona.
  Anchos, alto y qué medidas existen dejan de ser columnas que alguien pueda
  cargar mal.
- **Se va `middleware.ts`,** y con él la molestia de la decisión 26: el aviso de
  `proxy.ts` en cada build deja de aparecer porque deja de haber middleware.

Y se van, además: el proyecto de Supabase que se pausa solo por inactividad, la
`service_role key`, las migraciones aplicadas a mano, el caché incremental
compartido con sus dos recursos, y cuatro de las cinco variables de entorno.

#### Lo que cuesta, sin maquillar

- **Publicar deja de ser inmediato.** Cambiar una palabra es editar, commitear,
  pushear y esperar el build: medido en la Fase 3, entre 2 y 9 minutos. No se
  puede corregir nada urgente desde un teléfono.
- **La empresa depende del desarrollador** para todo cambio de contenido.
- **El repositorio engorda con las fotos.** El catálogo previsto son unas 300
  fotos por cuatro medidas, del orden de 240 MB, y git guarda todas las
  versiones de cada archivo que se reemplace. Con las pocas fotos de hoy no
  importa; antes de cargar el archivo histórico hay que decidir si van en git,
  en `git-lfs`, o fuera del repositorio.

#### Lo que NO cambia

- **El sitio no se vuelve estático del todo.** El formulario de contacto de la
  Fase 4.6 necesita servidor para hablar con Resend, así que el Worker y
  `@opennextjs/cloudflare` se quedan. Lo que desaparece es la base, la
  autenticación y el caché incremental.
- **El EXIF se sigue borrando, y se sigue verificando.** Cambia el mecanismo
  —`sharp` descarta metadatos salvo que se le pidan, y `.rotate()` aplica la
  orientación antes de recomprimir— pero la regla y la comprobación son las
  mismas. `scripts/revisar-metadatos.mjs` se queda tal cual: es el que responde
  si una foto publicada conserva coordenadas, y ahora puede correr sobre la
  carpeta entera de una vez.
- Las medidas siguen siendo anchos (decisión 32) y el tope de destacados sigue
  siendo una constante (decisión 9).
- La titularidad de las cuentas sigue siendo de la empresa.

#### Decisiones que quedan superadas

| Decisión | Qué le pasa                                                       |
| -------- | ----------------------------------------------------------------- |
| 3        | superada: no hay panel, ni propio ni de terceros                  |
| 4        | superada: no hay autenticación ni administrador                   |
| 5        | superada: la compresión vuelve al servidor, pero al de desarrollo |
| 7        | superada: no hay tablas                                           |
| 18       | superada: no hay Supabase                                         |
| 25       | reformulada: las medidas se generan al preparar, no al subir      |
| 26       | sin objeto: no hay middleware                                     |
| 27       | superada: no hay RLS                                              |
| 28 y 31  | superadas: no hay migraciones que verificar                       |
| 29       | superada: sin base no hay nada que revalidar                      |
| 33 y 34  | sin objeto: no hay panel que reordene                             |
| 35       | superada: WebP para todas, sin detección                          |

De la 30 sobrevive el principio —lo que no es secreto se declara en
`wrangler.jsonc` para poder auditarlo— aplicado ahora a la única variable que
queda, `NEXT_PUBLIC_SITE_URL`.

**La decisión 2 pierde su argumento** y aun así no se toca: Astro se había
descartado porque «el panel de administración vive en el mismo proyecto», y eso
deja de ser cierto. Mudarse ahora sería una migración más para ahorrar poco, y
la razón de la decisión 1 —metadata por ruta para las previsualizaciones de
WhatsApp— la cubren los dos igual. Queda anotado por si alguna vez se replantea.

---

### 37. Cada foto registra su formato, aunque hoy todas sean WebP

**Fecha:** septiembre de 2026, durante la Fase 4.0. Matiza la decisión 36.

**El planteo.** La decisión 36 sacó la rama JPEG de la decisión 35 —existía
porque WebKit no sabe codificar WebP y el panel se usaba desde un iPhone, y ya
no comprime ningún navegador— y con ella se fue la columna `formato`. Al
escribir el componente de imagen apareció la pregunta: ¿el nombre del archivo se
arma con `.webp` fijo en el código, o se lee del manifiesto?

**Se lee del manifiesto, y el script escribe el formato del archivo que
efectivamente generó.** Es la misma regla que ya vale para `medidas` (decisión 32) y por la misma razón: armar una ruta desde una constante del código funciona
hasta la primera foto que no siga la regla, y ahí el navegador pide un archivo
que no existe. Falla en silencio, en producción, y solo para algunas fotos.

**Esto no reabre la rama JPEG.** Hoy el campo dice `"webp"` en todas las filas y
`scripts/preparar-fotos.mjs` tiene un solo formato de salida. Lo que se registra
es un hecho sobre cada archivo, no una detección ni una bifurcación: si algún día
aparece un formato nuevo —AVIF, o un original que convenga dejar en otra cosa—
el manifiesto ya lo dice y el sitio no cambia.

**Lo que cuesta:** un campo más por foto en un archivo generado. No lo carga
nadie a mano.

**Cómo se protege.** El script comprueba que el formato que devolvió `sharp`
coincida con el que puso en el nombre del archivo, y corta si no. Es la misma
comprobación que ya hacía con el ancho, y por el mismo motivo: el nombre del
archivo es un dato del que depende el navegador.

---

### 38. Metadata, sitemap, robots y datos estructurados se adelantan a la Fase 4.0

**Fecha:** septiembre de 2026.

`docs/plan.md` los tenía en la Fase 5, junto con la analítica y el alta en Search
Console. Se adelantan al armazón del sitio público por una razón concreta: la
metadata por ruta **no es una capa que se agregue encima de las páginas**, es
parte de cómo se escribe cada página. `generateMetadata()` vive en el mismo
archivo que la página y lee el mismo contenido; dejarla para el final significaría
volver a abrir los diez archivos y agregarles un bloque.

Es además lo que motivó elegir Next y no un SPA (decisión 1): si el enlace de un
producto pegado en WhatsApp no muestra su foto y su título, buena parte del valor
del sitio no existe. Que eso funcione desde el primer día en que hay páginas es
más barato que descubrir en la Fase 5 que la estructura del contenido no da para
armar un Open Graph decente.

**Lo que se queda en la Fase 5**, porque no depende del código de las páginas:
Cloudflare Web Analytics, el alta en Search Console, el Perfil de Empresa de
Google, las cabeceras de seguridad, la revisión de Core Web Vitals y el checklist
de `docs/seguridad.md`.

---

### 39. Vuelve el caché incremental, ahora sobre los assets estáticos

**Fecha:** septiembre de 2026, durante la Fase 4.0. Corrige la decisión 36.

**Cómo apareció.** `npm run build` en verde, `npm run dev` mostrando
`/productos/roller-screen` perfecta, y `npm run preview` —el Worker real, sobre
`workerd`— devolviendo **404** en esa misma URL. Los listados y las páginas
sueltas respondían 200; las únicas rotas eran las de `/productos/[slug]`.

**La causa.** La decisión 36 sacó Workers KV y D1 con este razonamiento: el
caché incremental existía porque el panel revalidaba rutas al guardar, y sin
panel no hay nada que revalidar. Eso es cierto y sigue siendo cierto. Lo que no
vio es que **el caché incremental no sirve solo para revalidar: también es de
donde el servidor de Next lee las páginas ya prerenderizadas.**

Sin ningún override configurado, el adaptador deja el caché `dummy`, que falla
todas las búsquedas. De ahí sale el comportamiento en dos partes:

| Ruta                    | Falla la búsqueda y…                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `/productos` (estática) | la vuelve a renderizar. **Funciona, y por eso no se nota**                                                                 |
| `/productos/[slug]`     | no puede: con `dynamicParams = false` solo existen los params de `generateStaticParams`, y esos viven en el caché. **404** |

La respuesta lo decía entero y nadie la estaba mirando: `x-nextjs-prerender: 1`
junto con `x-nextjs-cache: MISS`.

**Lo que se hace.** `open-next.config.ts` pasa a usar
`staticAssetsIncrementalCache`, que guarda las páginas prerenderizadas entre los
**assets estáticos del Worker** —donde ya vive el resto del sitio—. Es el
override que el adaptador documenta para aplicaciones que no quieren
revalidación y solo sirven contenido prerenderizado, que es exactamente este
sitio desde la decisión 36.

**Por qué esto y no volver a KV.** KV y D1 eran dos recursos de Cloudflare que
administrar, y existían para que varias instancias del Worker compartieran una
revalidación que ya no ocurre. El caché sobre assets no agrega ningún recurso:
se publica con el mismo despliegue, se reemplaza entero en cada build y no puede
quedar viejo, porque el contenido y el caché salen del mismo `next build`. Lo
que la decisión 36 quería —dejar de administrar infraestructura de caché— se
conserva; lo que se recupera es la capacidad de servir lo prerenderizado.

**El `tagCache` sigue sin ir, y a propósito.** Sin él `revalidatePath()` no hace
nada y no avisa (decisión 29). Acá nadie lo llama.

#### La lección, que es la tercera vez que este proyecto la aprende

Un build en verde no dice nada sobre si producción funciona. Ya había pasado dos
veces con las variables de entorno (`docs/infraestructura.md`, «Los dos
incidentes de las variables») y volvió a pasar acá, con otra causa. **La
diferencia esta vez es que se agarró antes de desplegar**, porque `npm run
preview` corre sobre `workerd` y no sobre Node.

Y el detalle que conviene no perder: `npm run dev` **tampoco** lo detecta. No es
que Workers no soporte una API —el motivo por el que `CLAUDE.md` ya pedía correr
`preview`—, es que el servidor de desarrollo de Next no usa el caché incremental
del adaptador. Cualquier cosa que dependa de cómo el adaptador traduce Next a
Worker solo se ve en `preview`.

---

### 40. El catálogo son siete productos, y las variantes pueden llevar descripción

**Contexto:** la empresa trajo una lista de doce ítems donde varios eran
variantes: `toldos-motorizados`, `roller-motorizada`, `cortina-riel-motorizado`.

**El criterio para separar:** un producto es aparte **solo si la diferencia se
ve en una foto**. Venecianas de madera y de PVC se separan porque se distinguen
a simple vista. Un roller motorizado y uno manual son la misma foto: eso es una
variante, no un producto.

Dos páginas con galerías casi idénticas son peores que una buena — para el que
mira, que busca la diferencia y no la encuentra, y para el buscador, que ve
contenido repetido.

**Lo que la motorización sí necesita es video**, que es lo único que muestra lo
que una foto no puede. Uno por variante motorizada.

**Las variantes pasan de `string` a `{ nombre, descripcion? }`.** La descripción
es opcional y existe donde la diferencia hay que explicar —screen deja pasar luz,
blackout no—, que es justo lo que decide la compra. Al reestructurar el catálogo,
esto permitió que los textos que ya había escrito la empresa sobrevivieran
textuales: la parte común quedó en el producto y la diferencia en la variante,
sin reescribir nada.

Aclaración: hasta acá el código citaba «decisión 11» para esta regla, que trata
de otra cosa. La regla existía en `docs/producto.md` pero nunca había sido una
decisión numerada.

---

### 41. `/muestra` es una página desechable, y rompe dos reglas a propósito

**Contexto:** la Fase 4.1 pide elegir una dirección visual mirando las fotos
reales. Una dirección visual no se puede elegir leyendo una descripción: hay que
verla, con estas fotos y en un teléfono. Por eso existe `/muestra`, que
renderiza tres direcciones completas —paleta, escala tipográfica, escala de
espaciado, tarjeta de producto, galería y bloque de texto— con el contenido y
las fotos de verdad.

**Lo que rompe, y por qué está bien que lo rompa:**

**Carga seis familias tipográficas** contra el máximo de dos de la regla 7 de
`docs/diseno.md`. Comparar tres propuestas tipográficas con las fuentes
equivocadas no compara nada: sería elegir a ciegas, que es justo lo que la fase
existe para evitar. La excepción está acotada a `app/muestra/tipografias.ts` y no
toca `:root`, así que fuera de esa ruta no cambia nada.

**Tiene CSS escrito a mano** en vez de utilidades de Tailwind. La página necesita
tres juegos de variables de color y tipografía **simultáneos**, que es
exactamente lo que un sistema de tokens único no puede representar. Y fijar los
tokens en `app/globals.css` antes de elegir sería decidir antes de mirar.

**Lo que sí respeta:** las diez reglas verificables valen para las tres
propuestas. Ninguna tiene gradiente, sombra difusa, radio mayor a 4 px, ícono
decorativo, grilla de valores, azul o violeta de marca, animación al hacer
scroll ni texto sobre foto sin capa opaca.

**`noindex` por metadata, no por `Disallow`.** Son cosas distintas y combinarlas
es un error clásico: un `Disallow` impide el rastreo, así que el buscador nunca
llega a leer el `noindex` y la página puede terminar indexada igual, sin
descripción. Por eso `app/robots.ts` sigue con la lista vacía y el `noindex` va
en la metadata de la página. Tampoco entra al `sitemap.ts`, que se arma desde el
contenido y no incluye rutas sueltas.

**Sin JavaScript.** El conmutador entre direcciones son tres `input[type=radio]`
ocultos y selectores de hermano en CSS. No hay `"use client"`, no hay estado y la
página es HTML estático: funciona con el JS apagado y se puede leer con «ver
código fuente», igual que el resto del sitio.

**Se borra.** Elegida la dirección, sus valores pasan a `app/globals.css` como
tokens de Tailwind, se reescribe `docs/diseno.md` con la ganadora y **se borra
`app/muestra/` entera** en la Fase 4.5. Está anotado en `docs/plan.md`, en la
cabecera de `app/muestra/page.tsx` y acá. Una página de andamio que sobrevive al
andamio es deuda: queda indexable por error, se desactualiza y nadie se anima a
tocarla porque no sabe si se usa.

---

### 42. «Nada de personas» rige para las fotos nuevas, no para el archivo

**Contexto:** al auditar las 23 fotos para la Fase 4.1 aparecieron dos que
incumplen `docs/fotografia.md`: `roller/3` tiene una persona y un perro en el
borde izquierdo, y `toldos/3` una persona junto a la pileta. `roller/2` tiene
además ropa tendida en el patio vecino.

**Se quedan las tres.** En las dos que tienen personas están de espaldas o
lejos y no son identificables a simple vista, que es lo que la regla existe para
evitar. Sacarlas costaría dos de las ocho fotos que hay de esos dos productos, y
el archivo ya es chico.

**Lo que sí cambia es el alcance de la regla, que estaba sin escribir.**
`docs/fotografia.md` es una guía para quien saca las fotos, así que **rige de
acá en adelante** y no es un criterio retroactivo de depuración del archivo. La
regla no se ablanda: para las fotos nuevas sigue siendo «nada de personas», sin
excepción. Lo que se aclara es que el archivo histórico se mira caso por caso y
el criterio es la identificabilidad, no la presencia.

**Qué lo reabriría:** que alguien sea reconocible, que aparezca la cara de
alguien, o que el cliente de esa casa lo pida. Cualquiera de las tres se
resuelve sacando la foto, que no cuesta nada porque ninguna de las dos es
portada.

Alternativas evaluadas: sacarlas —lo más barato y lo más seguro— y recortarlas.
El recorte se descartó porque en `toldos/3` la persona está casi en el centro, y
esa foto además tiene solo 1600 px, así que no le sobra encuadre.

---

### 43. La dirección visual es «Cal» con el acento de «Regla», y el amarillo del logo es un color de superficie

**Contexto:** la Fase 4.1 propuso tres direcciones y se miraron en `/muestra` con
las fotos reales. El logo apareció después de las tres, y cambió el análisis.

**Lo elegido:** el papel de cal de la dirección A —fondo `#F6F2EC`, Fraunces y
Karla, la foto siempre dentro de la columna, ritmo de 64 a 112— con el acento de
la dirección C: el negro del propio logo, `#211F20`, y ningún color inventado.

#### Lo que decidió el logo, que no es lo que parecía

El amarillo del logo es `#FFF100`: amarillo proceso, croma máximo. Contra
cualquier fondo claro da entre 1,06:1 y 1,18:1, y hace falta 4,5:1 para texto y
3:1 para un elemento de interfaz con significado.

**O sea que el amarillo no puede ser el acento.** No es cuestión de gusto: no
puede ser color de enlace, ni de texto, ni de línea fina, ni el único indicio de
un estado, sobre ningún fondo claro. Lo que sí puede ser es **una superficie con
texto negro encima** —negro sobre amarillo da 13,92:1— o una forma.

Eso reencuadra la pregunta: el amarillo no es un acento, es un color de
superficie. Las reglas de uso están en `docs/diseno.md`, «La marca».

#### Por qué el acento terminó siendo el mismo negro

La dirección A traía un acento terracota `#8C4A2F`. Se descartó por dos razones:
es el vecino de al lado del amarillo en el círculo cromático, así que competía en
vez de acompañar; y sumado al amarillo daba un sitio de cuatro colores, con la
marca peleando contra un acento inventado.

Con el acento en `#211F20` el sitio queda con **papel, negro y amarillo**, que
son exactamente los tres colores del logo. Enlaces negros subrayados, botón
principal negro sólido con papel encima (14,69:1).

**El botón principal no es amarillo, y es deliberado.** Un bloque `#FFF100` sobre
el papel de cal da 1,06:1: sería una mancha clara sobre fondo claro, justo en el
CTA, que es lo único que este sitio tiene que lograr (`docs/producto.md`).

#### Lo que el papel de cal cuesta, anotado

El papel `#F6F2EC` es, en términos de tono, un amarillo desaturado. El amarillo
del logo cae sobre su propio tono y pierde brillo — es el peor de los tres fondos
evaluados para ese color. Se eligió igual porque el papel cálido es lo que
resuelve el problema número uno del archivo fotográfico, que es la disparidad de
calidad, y porque el logo sigue funcionando: lo que se pierde es intensidad del
amarillo, no legibilidad de nada.

Se probaron cinco papeles entre `#FFFFFF` y `#F6F2EC`. El límite donde el
amarillo todavía se lee limpio es alrededor de `#F8F6F2`. **Si en algún momento
el amarillo se ve apagado de más, ese es el valor al que moverse**, y no hace
falta rehacer nada más: es un token.

#### Tipografía: por qué no se copió la geométrica del logo

El logo es una geométrica de la familia Futura. Los títulos del sitio son
Fraunces, una serif. Deliberado: si los títulos también fueran geométricos, el
logo dejaría de leerse como logo y se confundiría con la página. Y las
geométricas tienen altura de x chica, que a 17 px en un teléfono se lee peor.

#### Lo que se descartó

**B · Contraluz** era donde el amarillo rendía al máximo —15,16:1 sobre el fondo
oscuro, sirve hasta como color de texto— pero el producto es luz natural entrando
a una casa y un sitio oscuro trabaja en contra de ese mensaje. Además el logo es
negro y sobre fondo oscuro desaparece.

**C · Regla** se descartó por frialdad, pero aportó el acento y deja una idea
disponible para la Fase 4.3: que el tamaño del módulo de cada foto salga de la
tabla de calidad de `docs/diseno.md` en vez del orden.

#### Lo que esta decisión deja pendiente

Hay que pedirle a la empresa el logo **en vector**, una versión para fondo oscuro
y un favicon. Hoy hay un JPG de 524 px, que alcanza para el encabezado y para
nada más grande.

---

### 44. El logo va sobre el papel de cal, sin campo propio, y el papel no se mueve

**Fecha:** septiembre de 2026, Fase 4.2.

**El problema.** El logo llegó como JPG con fondo blanco y el sitio es papel de
cal `#F6F2EC`. El encabezado está en todas las páginas, así que lo que se decida
acá se ve siempre. La decisión 43 ya había anotado que sobre este papel el
amarillo «pierde brillo», y dejó `#F8F6F2` medido como valor de recambio.

**Lo decidido:** el logo se apoya **directo sobre el papel**, con el fondo blanco
recortado, **sin campo propio**, y **`--color-fondo` se queda en `#F6F2EC`**.

#### Lo primero: el contraste WCAG es el instrumento equivocado para el círculo

Lo que tiene que ser legible es la palabra, y la palabra es negra: `#211F20`
sobre el papel da **14,69:1**. Nada del logo depende de que el amarillo se lea.

El amarillo es el círculo detrás de la «e», que es una **forma**. Y el 1,06:1 que
la decisión 43 midió es contraste de luminancia, que para este par no dice nada
útil: `#FFF100` tiene L\* 93,5 y el papel L\* 95,6, o sea casi la misma claridad.
La separación no es de claridad, es de croma. Medida como diferencia perceptual:

| Fondo del logo         | Contraste WCAG | ΔE2000 |
| ---------------------- | -------------: | -----: |
| papel de cal `#F6F2EC` |         1,06:1 |   28,5 |
| recambio `#F8F6F2`     |         1,09:1 |   29,0 |
| campo blanco `#FFFFFF` |         1,18:1 |   30,3 |

(ΔE2000 está calibrado para diferencias chicas, así que a 28 está extrapolando.
Lo que el número sí sostiene con seguridad es **la comparación entre los tres**,
que están a menos de dos unidades uno de otro.)

#### Por qué se descartó cada una de las otras tres salidas

**Mover el papel a `#F8F6F2` compra 0,5 unidades de ΔE**, por debajo del umbral
en que se nota un cambio —que ronda 2— y a cambio afloja el papel de cal, que es
lo que resuelve el problema número uno del archivo fotográfico: la disparidad de
calidad entre las 23 fotos (`docs/diseno.md`, «El material real»). Se paga el
activo más valioso de la dirección por una mejora que no se ve.

**El campo blanco detrás del logo compra 1,8 unidades**, y a cambio mete en el
encabezado de todas las páginas un color que no está en la paleta, con aspecto de
calcomanía pegada sobre el papel.

**La versión en negro** —sacarle el círculo— tira el único color de la marca en
la única pantalla donde aparece, para arreglar un problema que mide 1,8.

#### Lo que sí hubo que resolver, y era lo técnico

**El fondo blanco del JPG.** Pegado tal cual, el encabezado tendría un recuadro
blanco. Lo recorta `scripts/preparar-marca.mjs`, y **no alcanza con «lo blanco se
vuelve transparente»**: entre la letra negra y el fondo hay una banda de grises
de suavizado, que dejada opaca se ve como un halo gris sobre el papel. El script
deshace la mezcla —`α = 1 − min(r,g,b)/255`, y el color se despeja de ese α— así
que el suavizado sobrevive como transparencia y no como color, y el mismo archivo
sirve sobre papel, sobre blanco o sobre oscuro.

#### La consecuencia sobre el resto del sitio

**El amarillo del logo es el único amarillo de la pantalla.** La regla de «una vez
por pantalla» de `docs/diseno.md` la gasta entera el encabezado, que está en todas
las páginas. Por eso en la Fase 4.2 no hay amarillo en ningún otro lado: ni en el
botón principal (negro sólido, decisión 43), ni en los chips, ni en el foco, ni en
el estado activo del menú, ni en los avisos.

#### Lo que queda abierto

- **El archivo es un JPG de 524 px**, que da 504 después de recortarle el aire.
  Alcanza justo para los 168 px de ancho del encabezado en una pantalla de triple
  densidad, y para nada más grande. El vector sigue pendiente.
- **El círculo viene cortado por el borde superior del archivo fuente**, así que
  arriba tiene una tangente plana. Se ve en el original y se arregla con el
  vector, no con código.

---

### 45. El favicon sigue pendiente, y ahora se sabe por qué no salía

**Fecha:** septiembre de 2026, Fase 4.2.

**El estado.** `docs/diseno.md` lo tenía en «lo que falta pedirle a la empresa»:
«un favicon, o la autorización para recortar el círculo amarillo como favicon».
La Fase 4.2 lo tenía en alcance y **se decidió no hacerlo**.

**El dato nuevo, que es lo que cambia la conversación.** Medido sobre
`fotos-originales/logo.jpg`: el círculo amarillo ocupa de (15, 2) a (98, 86), o
sea que **está cortado por el borde superior del archivo**, y la «e» lo pisa
empezando en x = 59. Un recorte literal del círculo sale con la tangente plana
arriba y con media letra adentro; a 16 px queda una mancha amarilla pálida con
algo oscuro encima.

Las alternativas que sí se leen a 16 px —una baldosa amarilla con la «e» negra
(13,92:1), o una baldosa negra con la «e» en papel— **son un lockup nuevo**: no
existen en el logo de la empresa. Fabricar una marca nueva para una pestaña del
navegador es exactamente la clase de decisión que no le toca a quien programa.

**Lo que se hace mientras tanto:** nada, que es lo que ya pasaba. Sin
`app/icon.*` ni `app/favicon.ico`, el navegador pide `/favicon.ico`, recibe 404 y
muestra su ícono genérico. No se publica el logo de Vercel ni el de Next, que era
lo que la Fase 3 quiso evitar.

**Qué lo destraba:** el vector que `docs/diseno.md` le sigue pidiendo a la
empresa —con el círculo entero—, o la autorización explícita para componer la
baldosa amarilla con la «e».

---

### 46. Los estados no usan color: la paleta se queda en tres

**Fecha:** septiembre de 2026, Fase 4.2.

**Qué se revierte.** `components/ui/aviso.tsx` y `components/ui/campo.tsx` venían
del panel con rojo, verde y ámbar de Tailwind para error, éxito y atención. Eso
tenía su propia justificación escrita —«no son una propuesta visual, son parte del
mensaje»— y valía mientras el panel fuera todo gris y no hubiera paleta.

**Ahora hay paleta, y son tres colores que son los del logo** (decisión 43):
papel, negro y amarillo. Un rojo sería un cuarto color inventado, y el amarillo no
puede marcar un estado: 1,06:1 contra el papel, contra los 3:1 que pide WCAG para
un elemento de interfaz con significado.

**Lo decidido:** los estados se marcan **sin color**. El error va en negro sobre
papel (**14,69:1**), en negrita, con un filete negro de 3 px al costado y la
palabra escrita; una confirmación va igual pero con filete de 1 px y peso normal.
El campo inválido engorda su borde en vez de cambiar de color.

**Por qué esto no pierde nada:**

- **El color nunca podía ir solo.** Una de cada doce personas no distingue rojo de
  verde, así que el aviso ya tenía que decir con palabras qué pasó. Lo que se saca
  es el refuerzo, no la información.
- **Este sitio tiene un solo par de estados en todo el recorrido**, y llega en la
  Fase 4.6: el formulario de contacto se envió o no se envió. No hay una bandeja
  con veinte filas de colores distintos que haga falta barrer con la vista.
- **El borde de los controles sí cambió por contraste:** era `--color-linea`, que
  da 1,29:1 contra el papel y no llega a los 3:1 que pide el borde de un control.
  Pasa a `--color-texto-suave`, 5,23:1.

**Qué lo reabriría:** que aparezca una pantalla con varios estados simultáneos que
haya que distinguir de un vistazo. Hoy no existe ninguna, y `docs/producto.md`
deja el panel y la bandeja de mensajes fuera del alcance de V1.

---

### 47. Inicio se compone por sectores, y no son los que pedía `docs/producto.md`

**Fecha:** septiembre de 2026. Adelanta la Fase 4.5 y **rompe el orden del
plan**: Inicio se compone antes que `/proyectos` (4.3) y `/productos` (4.4).
Lo pidió quien desarrolla, mirando el armazón de la 4.2 y viendo que la página
no tenía estructura.

#### Qué se miró antes de decidir

Cuatro sitios profesionales del rubro, quedándose con la secuencia de sectores
de cada uno y no con su estética:

| Sitio           | Qué es                                  | Cómo ordena su Inicio                                       |
| --------------- | --------------------------------------- | ----------------------------------------------------------- |
| Silent Gliss    | fabricante premium, habla a arquitectos | foto grande con título encima → novedades                   |
| The Shade Store | cortinas a medida con colocación        | foto → CTA → grilla de productos → grilla de servicios      |
| Dino Conte      | el competidor local grande              | foto con título encima + formulario en la primera pantalla  |
| Studio McGee    | estudio de interiorismo                 | foto → frase **debajo** de la foto → grilla → quiénes somos |

Tres cosas salieron de ahí:

1. **Lo único que las cuatro comparten es una grilla de fotos con nombre.**
   Ninguna se sostiene con texto. Por eso el sector de productos es el que lleva
   el peso visual de la página.
2. **Studio McGee valida por su cuenta la regla de no poner texto sobre foto**:
   su frase de posicionamiento va debajo de la foto, sobre fondo sólido. Las
   otras tres ponen texto encima, que acá no se puede.
3. **La grilla de íconos de The Shade Store es exactamente la regla 5 de
   `docs/diseno.md`.** Es el patrón a resolver de otra manera, no a copiar.

#### El hallazgo que cambió el planteo

`docs/producto.md` pedía para Inicio «empresa, productos destacados, proyectos
destacados, servicio de colocación, trabajo con arquitectos, CTA». Al ir a
construirlo, **las dos secciones con contenido renderizaban vacío las dos**:

```
productos destacados ....  0   hay 7 productos, TODOS con destacado: false
proyectos destacados ....  0   contenido/proyectos.ts está vacío
```

`productosDestacados(4)` devolvía un arreglo vacío porque nadie había marcado
ningún producto. No era un problema de diseño: era que el contenido no existía.

#### Los cinco sectores

```
1  APERTURA                  la frase, la foto, una acción
2  QUÉ HACEMOS               los cuatro productos destacados
3  CÓMO TRABAJAMOS           asesoramiento, medición, fabricación, colocación
4  ARQUITECTOS Y OFICINAS    los otros dos públicos
5  CIERRE                    una sola acción
```

**«Empresa» no abre la página**, contra lo que decía `docs/producto.md`. Es la
apertura más débil posible para un negocio visual, y además no hay con qué: ni
foto de equipo, ni taller, ni años documentados. Se disuelve en la bajada y en
«cómo trabajamos». `docs/producto.md` queda corregido.

**Productos antes que proyectos**, porque productos es la única sección con
material.

#### Las tres decisiones de composición

**La frase primero y la foto después.** Es lo contrario de lo que hacen los
cuatro sitios de referencia. Dos razones: la dirección elegida dice que lo que
sostiene las páginas es la tipografía —«la mitad del archivo no da para sostener
nada»— y en un teléfono una foto 4:5 arriba de todo empuja el mensaje abajo del
pliegue. De paso, nos distingue del competidor local.

**No hay sector de proyectos mientras `contenido/proyectos.ts` esté vacío.** Una
página de inicio no promete lo que no existe, y poner ahí el bloque de «todavía
no hay nada» sería gastar la página que más se comparte en decir que falta
contenido. `/proyectos` sigue en el menú con su estado vacío, así que un enlace
ya compartido no cae en el aire. El día que se cargue el primer proyecto, Inicio
suma su sector.

**Los cuatro destacados se eligieron por venta, no por foto:** Roller, Cortinas
de tela, Venecianas de PVC y Toldos, «lo más vendido en el día a día» según la
empresa. Se había propuesto elegirlos por la tabla de calidad fotográfica de
`docs/diseno.md` y **se descartó**: cuál se vende más es el dato que el sitio no
puede deducir solo, y el objetivo comercial manda sobre el lucimiento. La
consecuencia está anotada: la portada del Roller está calificada como «apoyo»,
que es la más floja de las cuatro, y es la primera que se ve.

#### Los textos son provisorios, y viven en un solo archivo

`contenido/inicio.ts`. **Los redacta la empresa, no el desarrollo**, y
reemplazarlos es editar ese archivo: ninguna cadena de Inicio está escrita
dentro de un componente. Es la regla 2 de `CLAUDE.md` aplicada al texto de una
página, y acá vale doble porque **se sabe de antemano que va a cambiar** y lo va
a cambiar alguien que no escribe código.

El archivo lleva escrito qué no se puede afirmar sin confirmarlo: años de
trayectoria, cantidad de trabajos, marcas y garantías **no están documentados en
ningún lado del proyecto**. Es la misma regla que ya sigue
`components/datos-estructurados.tsx` con la dirección y el horario.

#### Lo que esto le deja a las fases 4.3 y 4.4

- **`components/tarjeta-producto.tsx` ya existe** y es el elemento de grilla del
  sitio. La 4.4 lo reusa en `/productos`; no se escribe otro.
- **`contenido/index.ts` ganó `fotoDe()`**, para cuando una página necesita una
  foto concreta y no la galería de una entidad.
- Inicio queda esperando **un sector más**, el de proyectos, que entra solo
  cuando haya contenido.

---

### 48. Las variantes tienen fotos y video propios, y el tamaño de cada módulo sale de la foto

**Fecha:** septiembre de 2026, Fase 4.4.

Esta decisión resuelve tres cosas que aparecieron juntas al componer
`/productos/[slug]`, más dos hallazgos de contenido que hay que escribir antes
de que se olviden.

#### 1. La variante se une a su carpeta por una clave escrita a mano

`Variante` era `{ nombre, descripcion? }` — decisión 40 — y **el nombre visible
no sirve de clave**. Se agregó `clave?: string`.

**Se evaluó derivarla del nombre con `aSlug()` y se descartó.** Funciona con los
seis claves de hoy —`aSlug("Riel motorizado")` da `riel-motorizado`, que es
exactamente el nombre del archivo— y esa coincidencia es justamente la trampa:
el día que alguien escriba «Screen (filtro UV)» o corrija una mayúscula, la
clave cambia, las fotos dejan de encontrarse y **la página se dibuja igual, sin
fotos y sin ningún error**. Es el mismo razonamiento de la decisión 10, que
prohíbe regenerar el slug de un producto al cambiarle el nombre, y de las 32 y
37, que leen del manifiesto en vez de armar rutas con constantes del código.

Como nada en el tipo puede comprobar que una clave apunte a una carpeta que
existe, **lo comprueba el script**, que es el único que ve el disco.
`scripts/preparar-fotos.mjs` importa `contenido/productos.ts` y avisa en las dos
direcciones: una carpeta o un video que ninguna variante reclama, y una clave
declarada que no encontró nada. Las dos fallan calladas.

En el manifiesto la clave de una variante cuelga de la del producto:
`productos/roller/screen`. No hace falta un mapa nuevo.

#### 2. El tamaño del módulo sale de la foto, no de su posición

La dirección «Regla» (decisión 43) dejó disponible una idea: que el tamaño del
módulo de cada foto salga de la **tabla de calidad** de `docs/diseno.md` en vez
del orden. Es la única forma estructural de curar un archivo desparejo.

**Se toma el mecanismo y se descarta la tabla como fuente.** El mecanismo —el
módulo es una propiedad de la foto— es correcto. La tabla no: es un juicio
escrito a mano sobre 23 fotos concretas, y el archivo va camino a unas 300. Una
lista de calificaciones indexada por ruta de foto es una segunda cosa que hay
que mantener al día, que se queda vieja en la primera carga que alguien haga sin
leer este documento, y que falla en silencio — que es exactamente el problema
que las decisiones 32 y 37 resolvieron leyendo del manifiesto.

**La primera de las dos reglas de abajo quedó reemplazada por la decisión 50**,
que convirtió la galería en una tira que se desliza: ahí el tamaño lo da la caja
de la diapositiva y no un módulo de grilla. El tope de píxeles —la segunda— sigue
valiendo en todo el sitio.

**Las dos reglas salen de `contenido/fotos.ts`, que lo escribe el script a
partir del archivo que efectivamente guardó:**

1. **La orientación elige el módulo.** Apaisada al ancho de la columna
   (1024 px), vertical a media columna (500 px). No es gusto: una vertical a
   1024 de ancho mide 1280 de alto y empuja la página fuera de la pantalla, y
   una apaisada a media columna mide 500 × 375 y se lee como una miniatura. El
   archivo es mitad y mitad, así que esto produce dos anchos de verdad y no una
   columna disfrazada.
2. **`topeDeAncho()` lo baja si los píxeles no dan:** ninguna foto se muestra
   más ancha que `ancho / 2`, con el 2 de `DENSIDAD_DE_REFERENCIA`, que es la
   misma cuenta con la que está escrito `docs/diseno.md` («1280 px a doble
   densidad es una caja de 640 px de CSS»).

Medido en el navegador, a 1440 px de ancho:

| Foto                     | Archivo | Módulo | Se muestra a |
| ------------------------ | ------: | -----: | -----------: |
| `cortinas-tela/3`        |    2560 |   1024 |         1024 |
| `toldos/3`               |    1600 |   1024 |      **800** |
| `cortinas-tela/barral/2` |    1028 |   1024 |      **514** |
| los dos videos           |    1280 |   1024 |      **640** |

**El aire que queda al lado es la curaduría.** Que `toldos/3` no salga nunca del
módulo chico deja de ser una limitación y pasa a ser una decisión editorial, que
es lo que «Regla» perseguía. Y `cortinas-tela/barral/2` —1028 × 822, la más
chica del catálogo— cae en un módulo que a lo ancho la dejaría blanda, y el tope
la salva sin que nadie tenga que acordarse.

**Lo que esto NO hace, y hay que saberlo:** no reemplaza la curaduría. La tabla
de `docs/diseno.md` califica por contenido —un auto rojo en el centro, una
cartera sobre el escritorio— y eso ningún número lo deduce. Hay dos fotos
calificadas «apoyo» que igual salen en el módulo ancho porque son apaisadas y
tienen 2560 px: `bandas-verticales/4` y `/5`. **La respuesta a una foto floja es
sacarla**, que es lo que `docs/diseno.md` ya dice —«la curaduría sigue siendo
más importante que el diseño»— y es una decisión de la empresa, no de
maquetación.

#### 3. El video: qué hace el script y qué no

El script **mide** cada video con `ffprobe` y le **extrae el primer cuadro** como
cartel, que pasa por `sharp` con la misma calidad que las fotos. El manifiesto va
en `contenido/videos.ts`, aparte de `fotos.ts` porque la forma es otra y porque
quien busca un video tiene que encontrarlo en un archivo que se llame así.

**No reconvierte un video ya publicado.** `public/videos/` está en git, así que
reencodear los mismos once segundos con otros bytes suma su peso otra vez a la
historia del repositorio, para siempre. Los dos que hay se convirtieron a mano en
la Fase 4.2, con parámetros que nadie anotó, así que se los deja como están y
solo se los mide; lo que entre de ahora en adelante sale de `convertirVideo()`,
con los parámetros escritos (`-an`, `-map_metadata -1`, CRF 28, `+faststart`).

**Es la misma regla que ya valía para las fotos y no estaba escrita en ningún
documento**, solo en el mensaje del commit `7bbf0a4`: lo publicado es
_append-only_ y los parámetros del pipeline están congelados. Se verificó que
`sharp` es determinista —regenerar las 23 fotos con los mismos parámetros da
archivos idénticos byte a byte, y `git status` no las marca— así que correr
`npm run fotos` sigue siendo seguro. **Si alguien cambia `IMAGEN_CALIDAD` o
`MEDIDAS_IMAGEN`, deja de serlo.**

El cartel se toma del **primer** cuadro y no de uno del medio: es lo que se ve
hasta que la reproducción empieza, y tomando el primero el cambio no se nota.

#### 4. Dos hallazgos de contenido, que resuelve la empresa

Al mirar los dos videos cuadro por cuadro aparecieron dos cosas que ninguna
documentación contemplaba:

- **`public/videos/roller/motorizado.mp4` no muestra un roller.** Muestra una
  cortina de tela sobre riel motorizado cerrándose sobre una gasa, en un
  comedor. Los dos videos muestran el mismo producto, así que hoy Roller no
  tiene documentada su motorización —que es lo único que una foto no puede
  mostrar, decisión 40— y Cortinas de tela la tiene dos veces.
- **`public/videos/cortinas-tela/riel-motorizado.mp4` es un video vertical
  metido en una caja 16:9.** `cropdetect` da 464 × 704 de contenido útil: el
  62 % de cada cuadro es negro puro, y en este sitio no hay ninguna superficie
  negra.

**Se decidió dejar cada uno donde está**, a pedido de quien desarrolla, y
anotarlo. Lo que destraba las dos cosas es filmar de nuevo: un video del roller
motorizado, y el de cortinas de tela en apaisado.

#### 5. Un segundo `"use client"` en el sitio público

`components/video-variante.tsx`. `docs/arquitectura.md` decía que
`components/navegacion.tsx` era el único; queda corregido.

**No hay forma declarativa de no reproducir con `prefers-reduced-motion`:** el
CSS puede parar una animación pero no un `<video autoplay>`, y el atributo no se
puede poner desde el servidor porque el servidor no sabe qué prefiere quien
mira. `docs/diseno.md` pide que ahí «queda el cuadro fijo y un control para
iniciarlo», y eso solo se decide en el navegador.

De paso resuelve dos cosas más: **el archivo no se pide hasta que el video está
por entrar en pantalla** —`preload="none"` más un `IntersectionObserver`;
verificado en el navegador: arriba de la página `readyState` es 0 y no hay
ningún pedido del `.mp4`— y **si la reproducción automática está bloqueada
aparece el control**, que es el caso real del modo de bajo consumo de iOS, donde
`play()` se rechaza aunque el video esté mudo y en línea.

El estado de «está en marcha» lo llevan los eventos `play` y `pause` del propio
elemento, y no cada llamada que lo arranca o lo frena. Se escribió al revés
primero y el error se vio en el navegador: al encender «menos movimiento» con la
página abierta, el video seguía en bucle y el botón decía «Pausar» sobre un
video que no se había frenado.

#### 6. El control de metadatos lee MP4, y un formato desconocido reprueba

`scripts/revisar-metadatos.mjs` sabía leer JPEG, WebP y PNG, y **cualquier otra
cosa la daba por buena**. O sea que los dos videos pasaban el control sin que
nadie los mirara, siendo que un video de celular trae las coordenadas del
domicilio igual que una foto — el mismo riesgo de `docs/seguridad.md`.

Ahora lee el árbol de cajas de un MP4 y busca las dos cajas de ubicación que
existen: `©xyz`, la de QuickTime que pone un iPhone, y `loci`, la de 3GPP que
ponen Android y ffmpeg. **Y un formato que no sabe leer cuenta como fallo**, no
como aprobado: todo lo que hay en `public/fotos/` y `public/videos/` es material
que se publica. `npm run fotos:revisar` pasa a cubrir también `public/videos`.

Verificado con dos videos sintéticos, uno con cada caja: los dos se detectan, se
imprime la coordenada y el script devuelve 1.

---

### 49. El catálogo es una fila por producto, con el lado de la foto alternado

**Fecha:** septiembre de 2026, Fase 4.4.

**Cómo se eligió.** Con el mismo mecanismo que usó la 4.1 para la dirección
visual: las alternativas renderizadas con el material real, una al lado de la
otra en `app/muestra-productos/`, y se eligió mirando. El andamio no inventaba
ningún token ni ninguna familia —solo cambiaba la composición— y se borró al
decidir, como hizo `/muestra` en su momento (decisión 41).

Se eligió **C, «Alternada»**: una columna, un producto por fila, la foto y el
texto al lado, y el lado va cambiando. Las otras dos fueron A, «Índice» —una
lista con miniatura de 96 px— y B, «Dos pesos» —la grilla con módulos de uno y
dos anchos según cuánto material tenga cada producto—.

#### Los tres problemas que tenía la grilla, y que C resuelve

**1. El huérfano.** Siete productos en tres columnas dan 3 + 3 + 1, y entre 640
y 1023 dan 2 + 2 + 2 + 1. Siete no se reparte parejo en ninguna grilla, y siete
es el número del catálogo. Una fila por producto no deja huérfano en ningún
ancho.

**2. El módulo único.** La decisión 48 estableció que el tamaño del módulo sale
del material y no de la posición, y se había aplicado solo a
`components/galeria.tsx`. El catálogo forzaba las siete portadas al mismo 4:5 y
al mismo ancho. La caja de foto pasa de 325 a 416 px, que en un archivo sacado
con celular es la diferencia entre ver el cabezal y adivinarlo.

**3. Las variantes invisibles.** Hay nueve en el catálogo —Roller tres,
Cortinas de tela cuatro, Toldos dos— y la grilla no nombraba ninguna, cuando la
decisión 40 dice que la variante es lo que decide la compra. Ahora van como
chips. Esa mejora entraba gane la que gane: las tres alternativas las mostraban.

**Corrección de un número que venía mal.** La 4.4 había escrito «once variantes»
en `contenido/tipos.ts`, en `contenido/index.ts`, en la página de producto y en
`docs/modelo-de-datos.md`, y el andamio lo repitió. Son **nueve**: cuatro con
fotos, dos con video y tres sin nada —y no cinco sin nada, como también decía—.
Corregido en los cinco lugares. De paso queda visible algo que la decisión 48 no
había anotado: hay **tres variantes motorizadas** —`roller/Motorizado`,
`cortinas-tela/Riel motorizado` y `toldos/Motorizado`— y solo dos videos, uno de
los cuales además no muestra el producto que dice. Toldos motorizado no tiene
video ninguno.

#### La objeción asumida: la página es mucho más larga

Se aceptó porque es un catálogo de siete elementos y no de setenta, y porque la
foto grande es lo que este negocio tiene para mostrar.

**El número real es peor que el estimado al elegir.** El andamio calculaba «de
unos 1.300 px a unos 3.600». Medido sobre la página terminada:

| Ancho   | Alto de página |
| ------- | -------------: |
| 320 px  |       6.571 px |
| 375 px  |       6.674 px |
| 768 px  |       4.862 px |
| 1024 px |       5.859 px |
| 1440 px |       5.870 px |

O sea **unos 5.900 px en escritorio y no 3.600**: el séptimo producto queda a
seis pantallas del primero, no a cuatro. La diferencia son las descripciones,
que el cálculo del andamio no tenía porque la grilla no las llevaba, más los
chips. **La decisión no se reabre por esto** —el orden de magnitud es el mismo y
las razones para elegir C no cambian— pero queda escrito con el número medido,
porque si algún día alguien quiere volver sobre esto tiene que hacerlo con el
dato correcto. Lo que lo destrabaría es acortar las descripciones, y eso es de
la empresa.

Curiosamente el alto baja a 768 px: ahí entran las dos columnas pero la columna
de texto todavía es angosta, así que la foto y el párrafo se equilibran. Los
extremos son el teléfono, donde todo se apila, y el escritorio, donde la foto
mide 416 px de alto útil y el texto no la llena.

#### Lo que hubo que decidir al migrar, que el andamio no resolvía

**El nivel de encabezado.** En el andamio los nombres eran `h3` porque cada
propuesta colgaba de un `h2`. En `/productos` la lista cuelga del `<h1>`, así que
son `h2`. Verificado: la página tiene un `h1` y siete `h2` de producto, sin
saltos.

**Un solo encabezado y un solo elemento enfocable.** El andamio dibujaba el
nombre dos veces —uno dentro del enlace con `md:hidden` y otro afuera con
`hidden md:block`— para que en teléfono la zona táctil fuera la foto entera. Era
un apaño del andamio: dos encabezados con el mismo texto en el DOM, y tabular
las siete filas habría anunciado catorce nombres de producto.

Se resolvió con un **enlace estirado**: el `<article>` es `relative` y el enlace
del título lleva `after:absolute after:inset-0`. Queda un nombre accesible, un
elemento enfocable por fila, y toda la fila sigue siendo clickeable. La foto ya
no va envuelta en un enlace. Verificado golpeando cinco puntos de cada fila con
`elementFromPoint`: los cinco responden el enlace del producto.

Lo que cuesta, y es el costo conocido de este patrón: el texto de la fila no se
puede seleccionar, porque la capa del enlace se lo come. En un listado cuyo
texto completo está a un clic de distancia, es aceptable.

**La descripción vuelve al listado, duplicado incluido.** La grilla anterior la
había sacado por tres razones; dos se caen con C, porque al lado de la foto hay
ancho de lectura de verdad y el párrafo entra entero. **La tercera sigue en pie
y ahora se ve:** `venecianas-madera` y `venecianas-pvc` tienen la misma
descripción palabra por palabra y en el arreglo están una al lado de la otra, así
que quedan en filas consecutivas con el párrafo a la vista.

**Se publica igual.** Se evaluaron las tres salidas:

- _Recortar con `recortar()`_ — **no arregla nada.** Los dos textos miden 120
  caracteres, o sea que cualquier tope razonable los devuelve enteros e
  idénticos. Se descartó por aritmética, no por criterio.
- _No mostrar la descripción hasta que el texto esté diferenciado_ — le saca a
  cinco productos su mejor texto para tapar un problema de dos, y deja a C sin
  una de las dos cosas que la hacían mejor que la grilla.
- _Publicarla_ — lo elegido. El duplicado es un problema de contenido que
  corrige la empresa, y la grilla anterior ya lo estaba tapando: lleva así desde
  que se cargó el catálogo y sigue sin corregirse. Que el sitio lo muestre es lo
  que hace que se corrija.

#### `components/tarjeta-producto.tsx` se queda, y pierde una prop

Lo sigue usando **Inicio, y solo Inicio**, que es una grilla de cuatro productos
como anticipo y para eso la tarjeta es exactamente lo correcto. Su comentario
decía que `/productos` lo reusaba y que «no hay una segunda tarjeta»: las dos
cosas dejaron de ser ciertas y quedaron corregidas.

**Se sacó la prop `nivel`**, que había durado una decisión. Se agregó en la 48
únicamente porque `/productos` colgaba la grilla de un `<h1>` y necesitaba `h2`;
con un solo consumidor que usa el predeterminado, es una opción que no elige
nadie. El `h3` vuelve a estar fijo, con el porqué escrito al lado.

#### La apertura de la página, y lo que dice que una fila se abre

Dos cosas que se vieron recién con la página armada y entera.

**El encabezado no tenía presencia.** Era la palabra «Productos» a 56 px y un
párrafo gris debajo: se leía como una etiqueta pegada arriba de una lista. Una
sola palabra no sostiene el tamaño de display, y además no agrega nada —el menú
ya marca «Productos» como la página actual—.

Se reescribió con tres piezas, ninguna de ellas un recurso nuevo del sistema:

- **Un antetítulo con un dato**, en el tratamiento que ya usan el estado vacío y
  la numeración de Inicio —13 px, versalita, tracking de 0,12em, texto suave a
  5,23:1—. Dice «Catálogo · 7 productos», y **el número se cuenta del arreglo**:
  si entra un producto, el número lo sigue solo.
- **El titular dice los productos en vez de nombrarlos en abstracto**:
  «Cortinas, rollers, venecianas y toldos». Es lo mismo que ya decía la
  `description` de la página y lo que alguien busca de verdad, y es una frase que
  aguanta el display. El nombre de la sección lo siguen diciendo el menú y el
  `<title>`.
- **La bajada orienta**, y su última frase avisa que cada fila se abre.

**Nada decía que una fila fuera clickeable, salvo el hover.** El nombre se
subrayaba al pasar por encima y eso era todo, o sea que **en un teléfono no lo
decía nada** — contra la regla explícita de `docs/diseno.md`: «nada depende de
`hover` para funcionar o entenderse».

Cada fila termina ahora en una línea que lo dice: «Ver más →». Va en negro sobre
papel (14,69:1), a 13 px y subrayada, que es la forma que este sitio le da a un
enlace.

**No es un enlace, y eso es lo que la hace posible.** El enlace de la fila sigue
siendo uno solo —el del nombre, estirado por encima de todo— así que tocar esa
línea abre el producto igual. Un segundo `<a>` habría duplicado el nombre
accesible de cada fila y devuelto los catorce elementos enfocables que el
enlace estirado vino a evitar. Verificado: siete filas, siete elementos
enfocables, y tocar la foto, un chip o la línea de acción cae siempre en el
enlace del producto.

**Primero decía cuántas fotos había** —«Ver las 7 fotos y el video»—, contadas
del manifiesto. Se sacó: el número no agregaba nada que el visitante fuera a
usar y le ponía a cada fila un dato que competía con el nombre del producto. La
línea dice que hay más; cuántas se ve al entrar.

La flecha es parte del texto de la acción y va `aria-hidden`. No es el «ícono
decorativo al lado de cada título» que prohíbe la regla 4: no está al lado de un
título y no es decorativa.

#### Una corrección al `sizes` del andamio

El andamio declaraba `(min-width: 768px) 416px, calc(100vw - 2.5rem)`. La
primera mitad es correcta de unos 976 px para arriba; **la segunda está mal en
la franja de 456 a 767 px**, donde `max-w-[26rem]` ya topeó la caja en 416 y el
`sizes` sigue declarando el ancho de la columna entera.

Medido a 700 px de viewport con densidad 2: la caja mide 416, o sea que hacen
falta 832 px de archivo y corresponde `960.webp`. Con el `sizes` del andamio se
declaran 660 px, que a densidad 2 piden 1.320 y caen en `1600.webp` — unos
230 kB de más por foto, por siete fotos, justo en tablets y teléfonos grandes.

Se publicó con el tope en los dos tramos:

```
(min-width: 768px) min(calc((100vw - 9rem) / 2), 26rem),
min(calc(100vw - 2.5rem), 26rem)
```

Verificado: a 700 px el navegador elige `960.webp`. Es la misma regla que ya
vale en todo el proyecto —«`sizes` y el ancho real de la caja son el mismo dato
escrito dos veces»— y es la que el propio enunciado del cambio pedía respetar.

---

### 50. La galería se desliza de costado, y la caja sale de sus propias fotos

**Fecha:** septiembre de 2026, Fase 4.4. **Reemplaza la grilla de dos módulos de
la decisión 48**, que valía para una galería apilada.

**El planteo.** La galería de la página de producto era una grilla: una columna
en teléfono, dos en escritorio, las apaisadas ocupando las dos. O sea que en un
teléfono las fotos quedaban **una debajo de la otra**, y con cuatro fotos la
variante siguiente quedaba a dos pantallas.

**Eso ya contradecía `docs/diseno.md`**, que en la sección mobile-first pide que
«la galería se recorre con el pulgar, gestos naturales». Una pila vertical no se
recorre con el pulgar: se scrollea como el resto de la página. La regla estaba
escrita desde la 4.1 y la 4.4 no la había cumplido.

#### Cómo está hecho: sin JavaScript y sin librería

`overflow-x` con `scroll-snap` del navegador. En un teléfono eso **es** el gesto
nativo, en un trackpad es el deslizamiento de dos dedos, y con el contenedor
enfocable —`tabIndex`, `role="group"` y su etiqueta— las flechas del teclado lo
mueven. Son tres propiedades de CSS: no hay estado, no hay un tercer
`"use client"` y no entra ninguna dependencia.

De paso resuelve solo el `prefers-reduced-motion`: no hay ninguna animación que
suprimir, porque el movimiento lo hace el dedo.

Verificado: empujar la tira 120 px la deja enganchada en 496, que es el paso de
una diapositiva más el hueco.

#### Qué dice que se desliza

**Lo que asoma de la foto siguiente.** La diapositiva mide el 86 % del ancho
disponible, así que siempre hay un pedazo de la próxima a la derecha. Es la
única señal que funciona sin `hover` y sin texto, que es lo que pide la regla
mobile-first.

En escritorio se suma la barra, fina y del gris del sistema —`texto-suave`,
5,23:1, el mismo que la decisión 46 fijó para el borde de un control—. Con
`--color-linea` daría 1,29:1 y no se vería.

**La tira no sangra.** Vive dentro de la columna y contra el mismo margen que el
texto, así que ninguna foto toca el borde de la pantalla. Es lo que pide
`docs/diseno.md` y es lo que separa esto de un carrusel de plantilla, que
justamente sangra para verse «inmersivo».

#### La caja sale de la foto más alta de cada galería

Un carrusel de orientaciones mezcladas tiene que elegir entre recortar, deformar
o dejar aire. **Deja aire**, que es lo único compatible con «Nunca deformar» y
«la proporción propia de cada foto», y con la tesis de la dirección: una foto
rodeada de papel se lee como una lámina.

Todas las diapositivas de una galería miden lo mismo, y esa medida sale de la
foto más alta de esa galería, con tope en 4:5 —la proporción de las portadas, la
única que este sitio declara como propia—. Medido:

| Galería                      | Fotos                |    Caja |
| ---------------------------- | -------------------- | ------: |
| `bandas-verticales`          | cuatro apaisadas 4:3 | **4:3** |
| `roller` y sus dos variantes | mezcla               | **4:5** |
| `toldos`                     | una 3:4 y una 16:9   | **4:5** |

Es la decisión 48 otra vez —el tamaño sale del material, no de la posición—
aplicada a la caja en vez de al módulo. Una galería de puras apaisadas no
desperdicia un píxel de aire.

**Lo que cuesta, y hay que anotarlo:** `toldos` mezcla una 3:4 con una 16:9, así
que en su caja de 4:5 la 16:9 se muestra a 288 × 162 con 198 px de papel arriba
y abajo. Ninguna caja uniforme puede evitarlo cuando el material va de 1,33 a
0,56 de proporción, y las alternativas son peores: recortar está prohibido, y
una tira de altura fija haría que una 16:9 no entre en el ancho de un teléfono.
Es el mismo `toldos/3` que `docs/diseno.md` ya califica como la foto más floja
del archivo, y la respuesta sigue siendo sacarla.

#### El tope de píxeles se mudó a la diapositiva

Antes se aplicaba a la caja de la foto. Ahora va en el `<li>`: una foto no puede
ser más ancha que su diapositiva, así que topear la diapositiva topea la foto
sin inventar una caja intermedia.

**Hoy no llega a morder** —la diapositiva no pasa de 480 px y el tope más bajo
del archivo es el de `cortinas-tela/barral/2`, 514— y va igual, porque es la
garantía de que ensanchar la tira mañana no devuelva una foto blanda.

El primer intento lo puso en un envoltorio de la foto, con la foto en `w-auto`
dentro de un flex de ancho automático. **Las fotos no cargaban**: el ancho del
envoltorio dependía de la foto y el de la foto del envoltorio, la circularidad
resolvía a cero, y con una caja de 0 × 0 el navegador nunca disparaba la carga
diferida. Se vio en el navegador, no leyendo el código.

---

### 51. Los videos de un proyecto van intercalados en su galería, en bucle como los de producto

**Fecha:** septiembre de 2026, Fase 4.3.

**El planteo.** En productos, un video pertenece a una variante motorizada
(decisión 40). **Los proyectos no tienen variantes**, y el primero que se cargó,
`cowork-nordelta`, trae dos videos numerados `7.mp4` y `8.mp4`: o sea, al final
de la secuencia de su galería. Uno es apaisado de 15 segundos; el otro es el
primer video vertical del sitio, 1080 × 1920 y 22 segundos. Mirados cuadro por
cuadro, **los dos son recorridos de cámara por la oficina**, no una cortina que
se mueve.

#### Dónde van: en la galería, en el lugar que les da la carpeta

Se evaluó la lectura directa —la galería admite videos intercalados en su orden,
igual que una foto— contra dos alternativas:

- _Un sector aparte de «videos» debajo de la galería_: separa lo que la carpeta
  junta, y obliga a quien carga a saber que el número del archivo no significa
  nada para los videos. `7.mp4` después de `6.jpg` dice exactamente dónde va.
- _Una etiqueta `tipo` en cada entrada de `contenido/fotos.ts`_: habría cambiado
  las 37 filas de un manifiesto que funciona para decir algo que ya dice su
  forma.

**Se eligió la lectura directa, y así quedó modelada:**

- `contenido/fotos.ts` **no cambia de forma**: sigue teniendo solo fotos. De ahí
  salen la portada, los listados y la miniatura de WhatsApp, y ninguno de los
  tres puede recibir un video.
- `contenido/videos.ts` suma los de proyecto con la clave
  `proyectos/<slug>/<nombre>` y un campo nuevo, `posicion`: el lugar en la
  galería **contando fotos y videos juntos**, que es el orden alfabético de la
  carpeta. Lo calcula el script; no se escribe a mano.
- `contenido/index.ts` arma `galeria` para cada proyecto insertando cada video en
  su posición. **La portada queda primera aunque la carpeta empiece con un
  video**, y el script lo avisa.
- `Medio = Foto | Video`, y se distinguen por su forma —`carpeta` contra
  `archivo`— con `esVideo()` de `lib/fotos.ts`. `components/galeria.tsx` acepta
  `Medio[]`; un `Foto[]` entra tal cual, así que para productos no cambió nada.

**La ruta del archivo lleva la entidad adelante**
(`public/videos/proyectos/cowork-nordelta/7.mp4`) y la de los videos de variante
no (`public/videos/roller/motorizado.mp4`). Es una asimetría heredada y
deliberada: los de variante ya estaban publicados y moverlos sería reescribirlos
en git (decisión 48). El comentario de `Video.archivo` ya lo preveía.

#### Cómo se reproducen: en bucle, igual que en productos

**Primero se hicieron a pedido, y se revirtió después de probarlo.** El
argumento era que el video de variante documenta un gesto —la cortina que sube
y baja sola, que se entiende repetido— y el de proyecto un lugar, un paneo que
al volver a empezar se lee como un salto; que 22 segundos mudos repitiéndose
son movimiento que nadie pidió; y que son los archivos más pesados de la
página. Quedaban en su cuadro de cartel con un botón «Reproducir» debajo.

**Quien desarrolla lo probó y pidió que se comporten como los de productos**:
sin botón, arrancan solos, mudos y en bucle. Pesa más la coherencia del sitio
—un video es un video en cualquier página— que la diferencia entre un gesto y
un recorrido.

Lo que se conserva del planteo anterior es lo que no dependía del modo: **el
archivo no se pide hasta que el video está por entrar en pantalla**, y dentro de
la tira eso es la diapositiva visible —`IntersectionObserver` recorta contra el
contenedor que se desliza—, así que un video que está más allá en la galería no
se descarga hasta que alguien desliza hasta él. Se pausa al salir. Con
`prefers-reduced-motion` o con la reproducción bloqueada aparece el botón, igual
que en productos.

**Sin la barra de controles nativa**: se dibuja **encima** del video, y en este
sitio no va nada sobre una imagen.

`components/video-variante.tsx` pasó a ser `components/video-mudo.tsx` —no se
copió—, con una sola novedad: `caja`, para entrar en una diapositiva de la
galería con su propia proporción. El modo «a pedido» que tuvo durante la fase
se sacó al revertir: no lo usaba nadie.

#### El botón «Pausar» que apareció en un iPhone

Probado en un iPhone real después del despliegue, los dos videos del cowork se
reproducían, pero **debajo del segundo aparecía un botón «Pausar el video»**,
sobre un video que andaba solo. El código venía de la 4.4, pero en productos
el video no está en una tira que se desliza y el caso es mucho menos frecuente,
así que no se había visto.

**La causa:** el componente tomaba **cualquier** rechazo de `play()` como
«reproducción bloqueada» y mostraba el control. Pero `play()` también se
rechaza, con `AbortError`, cuando el video sale de la vista antes de arrancar y
el propio componente lo pausa. En la tira eso pasa cada vez que alguien desliza:
el video asoma, empieza a cargar y se va. Quedaba marcado como bloqueado, y al
volver a entrar arrancaba igual, así que el botón pasaba a decir «Pausar».

**Lo que cambió:**

- Solo `NotAllowedError` cuenta como bloqueo, que es el del modo de bajo
  consumo de iOS o el de una preferencia del navegador. Cualquier otro rechazo
  se ignora: cuando el video vuelve a entrar, el observador llama a `play()`
  otra vez.
- En un bloqueo real, el botón se va apenas el video arranca: existe para
  iniciar lo que no pudo arrancar, no para controlarlo.
- **Con `prefers-reduced-motion` el control se queda**, «Reproducir» y
  «Pausar», porque ahí es de quien pidió que las cosas no se muevan solas.

**Verificado** con un observador falso que imita el deslizamiento —entra, sale
antes de arrancar, vuelve—: con el código anterior aparece el botón, y con el
nuevo no. Con un bloqueo real simulado aparece «Reproducir el video», y al
iniciarlo el video anda y el botón desaparece. Con menos movimiento simulado se
queda el control, que pasa a «Pausar el video». Lo que confirma el caso real es
volver a probarlo en el iPhone.

#### El vertical, sin barras

Dentro de la tira, el `<video>` **se dimensiona a su propia proporción** dentro
de la caja —al alto si es más alto que ella, al ancho si no— en vez de estirarse
a la caja entera, que es donde aparecerían las franjas. Medido: en la caja 4:5
de 480 × 600 el vertical ocupa 338 × 600, y a 375 de ancho, 203 × 360. Justo
9:16.

**Y el tope de la diapositiva se corrigió para medios más altos que la caja.**
`topeDeAncho()` del vertical da 360 px; aplicado tal cual a la diapositiva, la
habría achicado a 360 y la tira quedaba con una caja más baja que las demás,
cuando adentro de 480 × 600 el video se muestra a 338 y le sobra. La cuenta
nueva, `topeDeDiapositiva()`, escala el tope por cuánto más alto que la caja es
el medio. Para las fotos de producto da lo mismo que antes: ninguna tiene el
tope por debajo de los 480 px de la diapositiva.

#### Lo que se encontró en el pipeline: el vertical se habría agrandado

`convertirVideo()` escalaba con `scale=1280:-2` —siempre el ancho a 1280—, que
con los dos videos apaisados de la 4.4 daba bien. **Con el vertical lo habría
agrandado a 1280 × 2276.** Ahora el lado mayor va a `VIDEO_LADO_MAYOR` (1280) y
nunca se agranda: el vertical sale a 720 × 1280. Para un apaisado de 1280 o más
el resultado es idéntico al anterior, y ningún video publicado se reconvierte.

El script además **se niega a publicar un video de más de 25 MiB**, el tope por
archivo de Workers, y borra lo que escribió: el que falla si no es el
despliegue. Los dos salieron en 2,4 y 3,6 MB, sin pista de audio y sin los
metadatos de Clipchamp con que llegaron.

---

### 52. El listado de proyectos: el primero en fila, el resto en grilla — y así también en Inicio

**Fecha:** septiembre de 2026, Fase 4.3.

**El problema.** Hay un proyecto y va a haber veinte. Una grilla pensada para
muchos se ve rota con uno —una tarjeta de un tercio y dos tercios de papel—; una
composición pensada para uno no escala: veinte filas como las del catálogo son
del orden de 14.000 px en escritorio.

**La regla: el primero del arreglo va en fila y todos los demás, en grilla.** La
fila es la de `/productos` —portada 4:5 al costado, título, ubicación como chip,
descripción y «Ver el proyecto →», con el enlace estirado de la decisión 49—; la
grilla son tarjetas —portada, título y chip— en una columna en teléfono, dos
desde 640 y tres desde 1024.

- **Con uno**, la página es una fila y se ve igual que el catálogo, no como una
  grilla a la que le faltan tarjetas.
- **Con veinte**, medido con diecinueve copias temporales: **5.751 px a 1440** y
  **12.491 px a 375**, donde las tarjetas van de a una a todo el ancho.
- **Con dos**, la grilla tiene una tarjeta sola. Es un estado de paso y está
  asumido: es preferible a una regla que cambie de forma según cuántos haya, que
  es la clase de cosa que nadie recuerda por qué pasa.

**Tres columnas y no dos**, porque a dos cada tarjeta mediría 488 px y la foto
del proyecto que abre —416— sería la más chica de la página: la jerarquía al
revés. A tres son 325.

**Dos columnas en teléfono se descartaron**: dejan 155 px por tarjeta, y el chip
de ubicación, que no parte línea, no entra.

**Cuál abre lo decide el orden de `contenido/proyectos.ts`**, que es donde ya se
decide todo el orden del sitio. No hay un campo nuevo: los cuatro de la decisión
11 siguen siendo cuatro.

`components/tarjeta-proyecto.tsx` tiene las dos formas y
`components/listado-proyectos.tsx` la regla. **La tarjeta lleva la prop `nivel`
que la de producto perdió en la decisión 49**, y es coherente con esa decisión:
allá quedaba un solo consumidor; acá hay dos desde el primer día —`/proyectos`
cuelga del `<h1>` y usa `h2`, Inicio cuelga del `<h2>` de su sector y usa `h3`—.

#### El título es «Proyectos integrales», no «Trabajos terminados»

El primer título fue «Trabajos terminados» y se cambió después de probarlo:
sugería que los proyectos son los **únicos** trabajos terminados, cuando las
fotos del catálogo también lo son. Esta sección muestra los proyectos grandes.
«Integral» es el cuarto valor de `docs/producto.md` —asesoran y colocan—: dice
un espacio resuelto entero, no una ventana, y dice escala sin prometer tamaño.
Se descartaron «Obras» —corto, pero pide una bajada que diga de qué tipo— y
«Grandes instalaciones» —con un solo proyecto cargado, suena a más de lo que
hay—. Vale para el `<h1>` de `/proyectos` y para el sector de Inicio; el menú
sigue diciendo «Proyectos».

#### El sector de Inicio entró con un solo proyecto

`docs/producto.md` decía que entraba «cuando se cargue el primero». La
recomendación fue esperar a tener dos o tres —un sector de portada con una
tarjeta puede verse más pobre que no tenerlo— y **quien desarrolla eligió que
entre ahora**. Lo que lo hace sostenible es que usa el mismo listado: con uno, el
sector es una fila, no una grilla incompleta.

**Va cuarto**, después de «Cómo trabajamos» y antes de «Arquitectos y oficinas»:
el sector 3 dice cómo se trabaja y este muestra el resultado; y el primer
proyecto es una oficina, que es la evidencia que el sector 5 no tenía. Sale
solo si hay proyectos destacados: si todos quedan inactivos, desaparece solo y
`/proyectos` vuelve al estado vacío, que sigue en el código.

---

### 53. `sharp` no decodifica ningún HEIC de iPhone: el script lo convierte, y se niega con uno truncado

**Fecha:** septiembre de 2026, Fase 4.3.

**El diagnóstico anterior estaba mal.** Dos tandas de HEIC llegaron del mismo
origen, fallaron en `npm run fotos` con «no se pudo preparar», se rescataron a
mano con ffmpeg y quedaron anotadas como **truncadas**. Medido en esta fase:

- `sharp.format.heif` solo lista `.avif` como entrada. **El binario precompilado
  trae libheif con AV1 y sin HEVC**, y un HEIC de iPhone es HEVC.
- Un HEIC **sano** —decodificado entero por ffmpeg sin un solo error— falla en
  `sharp` con «Decoder plugin generated an error», que se lee como daño aunque no
  lo sea. `metadata()` sí funciona, así que el archivo parece legible hasta que
  se lo quiere procesar.
- Los `.HEIC` que hay en `fotos-originales/productos/` y se publicaron bien son
  en realidad **JPEG con otra extensión**: `sharp` los lee por el contenido.

O sea que `docs/publicar-fotos.md` —«se aceptan `.heic`, no hace falta convertir
las del iPhone»— era falso para cualquier HEIC de verdad, y lo que se atribuyó a
la transferencia pudo haber sido, al menos en parte, el formato. Los originales
de las dos tandas ya no están, así que no se puede saber cuáles estaban cortados
de verdad.

**Lo que se hizo:**

- **HEIC sano → se convierte solo**, con la receta de abajo, a una carpeta
  temporal —el original no se toca—, **y se avisa con `!`**: cuenta en el
  resumen de avisos. No es un problema que haya que resolver, y pedirle a una
  persona que convierta a mano cada foto de iPhone es un paso que se olvida.
- **HEIC truncado o dañado → no se publica.** La prueba es decodificarlo entero
  con ffmpeg: uno cortado da `partial file` o `Invalid NAL unit size`, uno sano
  no da nada. El script dice cuál es, cuánto pesa, qué encontró ffmpeg y el
  comando exacto de rescate con sus rutas. **No se arregla en silencio**: un
  archivo cortado es un problema de transferencia que conviene saber, y el
  rescate puede salir con una franja gris donde faltaban datos, que solo se ve
  mirándolo.
- **Cualquier original que no se publica** —HEIC dañado, JPEG cortado, algo que
  no es una imagen— sale con el mismo formato: `NO SE PUBLICA`, archivo, causa y
  qué hacer. Y la corrida termina con **código 1**, aunque escriba el
  manifiesto: `npm run fotos && git commit` tiene que frenar si falta una foto
  que alguien puso en la carpeta.

Verificado con un HEIC sano, uno truncado a propósito y un JPEG truncado, en una
carpeta de originales aparte.

**La receta**, una sola, que corre el script y que se corre a mano para
rescatar:

```
ffmpeg -i entrada.HEIC -frames:v 1 -update 1 -q:v 2 -map_metadata -1 salida.jpg
```

**Lo que la receta pierde, anotado:** el perfil de color. Un HEIC de iPhone trae
Display P3 y el JPEG sale sin perfil, así que `sharp` lo interpreta como sRGB y
los colores quedan un poco más apagados. Pasa igual con las seis fotos del
cowork, rescatadas a mano. La diferencia es chica y no justifica sumar
dependencias; si algún día importa, la salida es un `sharp` compilado con
libde265, no otra receta.

---

### 54. El formulario sale de un subdominio verificado en Resend, no del dominio principal

**Fecha:** septiembre de 2026, Fase 4.6.

**El planteo.** Resend solo envía desde un dominio cuya propiedad se demostró
cargando registros DNS. El dominio tiene funcionando el correo de Google
Workspace —MX, SPF, DKIM y DMARC, verificados— y es lo que no se puede romper:
dos registros SPF en el mismo nombre invalidan los dos, y el correo de la
empresa empieza a rebotar o a caer en spam.

**Lo decidido:** se verifica `sitio.espaciocortinas.com.ar` y el correo sale de
`formulario@sitio.espaciocortinas.com.ar`, con el nombre «Formulario web».

**Por qué un subdominio, si con el dominio principal tampoco se pisaba nada.**
Resend nunca pide un SPF en la raíz: el suyo va en el subdominio del
Return-Path, `send.` por defecto, y la clave DKIM en `resend._domainkey.`.
Verificando el principal, ninguno de los dos nombres existía, así que el
correo de Google no se tocaba en ninguno de los dos casos. La diferencia está
en la **reputación**: con el principal, el formulario y el correo de la empresa
comparten la misma fama ante Gmail, y un abuso del formulario —alguien que lo
use para mandar basura— podría hacer desconfiar también de los mails de
`ventas@`. Con el subdominio, la mala fama se queda en `sitio`. Es lo que
recomienda la propia documentación de Resend.

**Por qué `sitio.` y no `send.`**, que fue la primera idea: Resend pone el
Return-Path en `send.` del dominio que se verifica, así que verificar
`send.espaciocortinas.com.ar` habría dejado un `send.send.…`. Funciona igual,
pero es la clase de nombre que dentro de un año nadie entiende.

**Nadie responde a esa dirección.** El correo lleva `Reply-To` con el email de
quien escribió, así que «Responder» va directo a esa persona. El remitente es
una etiqueta técnica: lo único que se ve de él es «Formulario web» en la
bandeja.

**DMARC no se toca.** El de la raíz está en `p=none` y sin `sp=`, así que cubre
al subdominio con la misma política. La alineación da bien: la firma DKIM es
de `sitio.espaciocortinas.com.ar`, el mismo dominio del remitente.

**La cuenta de Resend es de la empresa**, a nombre de
`ventas@conceptoespacio.com`, como todas las cuentas de servicios
(`docs/infraestructura.md`, «Titularidad»). La clave tiene permiso **solo de
envío** y **solo sobre ese dominio**: si se filtrara, no sirve para leer nada
ni para mandar desde otra dirección.

Los registros cargados, y cómo se comprueba que el correo de Google sigue
intacto, están en `docs/infraestructura.md`, «Resend».

---

### 55. `EMAIL_CONTACTO` va en el bloque `vars`, no como Secret

**Fecha:** septiembre de 2026, Fase 4.6. Corrige la tabla de variables de
`docs/infraestructura.md`, que la tenía como Secret.

**No es secreta:** la casilla se publica en `/contacto`. Y la decisión 36 ya
había dejado escrito el principio que sobrevivía de la 30: **lo que no es
secreto se declara en `wrangler.jsonc`, a la vista**.

**El caso concreto que lo decide.** Si esta variable se carga con un error de
tipeo, el formulario manda cada consulta a una casilla que no existe, y nadie
se entera: la persona ve «Recibimos tu mensaje» y la empresa no recibe nada.
Como Secret, el valor cargado **no se puede volver a leer**; es exactamente la
trampa de `NEXT_PUBLIC_SUPABASE_URL` del 14/08, que estaba mal y era invisible.
En `vars` se lee en el repositorio, con historial.

**Lo que sigue siendo Secret:** `RESEND_API_KEY`, la única secreta de verdad.
`npx wrangler secret list` tiene que devolver exactamente esa y ninguna más.

---

### 56. Las claves del correo no pueden tirar el sitio: el build exige las cuatro, el arranque no

**Fecha:** septiembre de 2026, Fase 4.6. **Matiza la decisión 21.**

La decisión 21 hace correr la validación de entorno dos veces, en el build y al
arrancar el servidor, con la misma lista. Tenía sentido mientras las variables
eran las de Supabase: sin ellas no había página que servir, y el 29/07 un
arranque sin variables dejó el sitio entero en 500.

**`RESEND_API_KEY` y `EMAIL_CONTACTO` son de otra clase.** Las usa una sola
cosa, el envío del formulario, y el sitio entero se sirve sin ellas. Con la
misma lista en los dos momentos, un Secret que faltara en el Worker tiraría
Inicio, el catálogo, los proyectos y el botón de WhatsApp —el canal
principal— para proteger un formulario que ya tiene salida propia.

**Lo decidido:**

| Momento                  | Exige                                                                            |
| ------------------------ | -------------------------------------------------------------------------------- |
| build (`next.config.ts`) | las cuatro: faltar ahí no cuesta nada, porque corta antes de publicar            |
| arranque                 | solo `NEXT_PUBLIC_SITE_URL`, que es lo que usan las páginas                      |
| el envío del formulario  | sus dos, al enviar: si falta una, falla ese envío, lo registra y ofrece WhatsApp |

`NEXT_PUBLIC_WHATSAPP` tampoco la exige el arranque: Next la incrusta en el
build y las páginas ya salen con el enlace escrito.

**Lo que se pierde es ruido.** Con la lista única, una clave faltante se notaba
porque se caía todo. Ahora se nota en el formulario, que dice que no pudo
enviar, y en los registros del Worker, con el nombre de lo que falta. Por eso
la comprobación después de cada despliegue incluye `npx wrangler secret list`
(`docs/infraestructura.md`).

**La validación de forma sigue en los dos momentos**, y ahora cubre las cuatro:
el número de WhatsApp tiene que ser solo cifras y empezar con 54, la casilla
tiene que tener forma de dirección, y la clave tiene que empezar con `re_`.
Del valor de la clave nunca se imprime nada.

---

### 57. El formulario: cinco campos, tres obligatorios, y lo escrito no se pierde nunca

**Fecha:** septiembre de 2026, Fase 4.6.

#### Los campos

Nombre, email, teléfono, qué está buscando y el mensaje. Nada más: ni
presupuesto, ni cómo nos conoció, ni metros. Cada campo cuesta consultas.

**Obligatorios son tres: nombre, email y mensaje.** El email lo es por una razón
concreta: es el `Reply-To` del correo, lo que permite contestar con un toque.
El teléfono es opcional —para quien prefiere que lo llamen— y «qué está
buscando» también.

**«Qué está buscando» es una lista y no un texto**: elegir entre siete
productos es un toque, y escribirlo son veinte. Sale del mismo arreglo que
`/productos`, con «Todavía no lo sé» primero —es la respuesta honesta de mucha
gente antes de que la asesoren— y «Otra cosa» al final. Es el selector nativo
del sistema: en un teléfono abre la rueda que ya conoce todo el mundo.
`components/ui/campo.tsx` suma ese tercer control; hasta acá tenía dos.

#### La validación es una sola, y corre dos veces

`lib/consulta.ts` limpia y valida. Lo usa el navegador —para decir enseguida
que falta el email, sin ir al servidor— y **lo vuelve a correr entero la Server
Action** sobre lo que llegó. Verificado mandándole a la acción pedidos armados a
mano, sin pasar por la página: un pedido con los cinco campos mal devuelve los
cinco errores, un mensaje de 3.500 caracteres se rechaza, y un nombre con un
salto de línea adentro llega como texto plano, sin partir el asunto.

#### Por qué no usa `<form action>`

Es la forma que Next propone para una Server Action, y falla justo en lo que
este formulario no puede fallar:

- **React vacía el formulario al terminar la acción.** Un envío fallido
  borraría lo que la persona escribió.
- **Si el pedido no llega a la acción, lanza.** Un corte de red, el 429 de la
  regla de rate limiting o un error del Worker suben hasta `error.tsx` y
  reemplazan la página entera, formulario incluido.

Así que el envío lo maneja `onSubmit`, y la acción se llama como una función,
dentro de un `try`. Los campos no son controlados y nadie los vacía. Verificado
en el navegador con los tres casos: Resend rechazando la clave, la acción
devolviendo un error, y un 429 simulado en la respuesta — en los tres, el texto
sigue escrito y aparece el aviso.

**Lo que se resigna es que funcione sin JavaScript.** Sin JavaScript la página
ofrece todo lo demás, que son enlaces comunes: WhatsApp, el teléfono y el
email.

#### Antes de hidratar, el botón está apagado — y por qué

**Se encontró probando el envío real, y no estaba previsto.** Hasta que React
toma el formulario, el formulario es HTML pelado, y enviarlo es el envío nativo
del navegador. Sin `method`, eso es un **GET con los datos en la URL**: una
prueba terminó en `/contacto?nombre=…&email=…&telefono=…&mensaje=…`. Ahí
quedan en el historial del navegador y **en los registros del Worker**, que
guardan la dirección de cada pedido, y la consulta no llega a ningún lado. Es
lo contrario de «los mensajes no se guardan en ningún lado».

**La ventana es más larga de lo que parece.** El contenido de `/contacto` llega
en diferido dentro del mismo HTML —un límite de Suspense que se completa al
final del documento— y React 19.2 lo revela y lo hidrata en el cuadro
siguiente. En un teléfono con una conexión lenta, el formulario se ve segundos
antes de responder; en una pestaña abierta en segundo plano no se revela hasta
que alguien la mira.

**Lo que se hizo:**

- el botón nace **apagado** y se enciende al hidratar (`useSyncExternalStore`,
  que da el valor del servidor durante la hidratación y el del cliente después).
  Un botón de enviar apagado bloquea también el Enter desde un campo, así que no
  hay forma humana de disparar el envío nativo;
- el formulario lleva **`method="post"`** como segunda red: si algo lo
  disparara igual, los datos van en el cuerpo y nunca en la URL. Next no lo toma
  como acción —no lleva `Next-Action`— y vuelve a dibujar la página;
- sin JavaScript, un `<noscript>` dice que el formulario no se puede enviar y
  que WhatsApp, el teléfono y el email están en la misma página.

**Verificado en el preview:** antes de hidratar, el botón está apagado y el
formulario es POST; forzado a enviarse, el pedido llega como
`POST /contacto`, sin nada en la dirección. Después de hidratar, el envío real
sale por la Server Action.

#### Los estados, sin color

Siguen la decisión 46: palabras, peso y filete.

- **Enviando:** el botón dice «Enviando…» con la rueda, no se puede volver a
  tocar y **no se apaga al 50 %**: al 50 % el texto quedaría en 3,12:1, y en
  ese momento es lo único que dice qué está pasando.
- **Enviada:** el formulario se reemplaza por la confirmación, que recibe el
  foco y dice adónde va a llegar la respuesta.
- **Fallida:** un aviso en negrita con filete de 3 px, y **WhatsApp como
  salida, con lo que escribió ya puesto en el mensaje**. El texto dice además
  que el formulario falló, así que quien atiende se entera de que hay algo roto
  sin que nadie le avise.

#### El correo

El asunto dice de qué se trata sin abrirlo —«Consulta web: Roller · María
Gómez»—, va en texto plano y en HTML, y **todo lo que escribió la persona pasa
por `escaparHtml()`**: un `<img onerror>` en el mensaje llega como texto, que es
lo que era. Sin el SDK de Resend: enviar es un pedido HTTP, y lo único que el
SDK hacía solo es mandar `User-Agent`, sin la cual Resend responde 403.

#### El campo trampa

`comentario_adicional`: fuera de la pantalla, fuera del orden de tabulación y
del árbol de accesibilidad. Si llega lleno, la acción **contesta «enviada» sin
enviar nada** —avisarle al robot es enseñarle a esquivarlo— y lo deja escrito
en los registros. El nombre está elegido para que ningún autocompletado lo
llene: un campo «empresa» o «sitio web» lo podría completar Safari con la
tarjeta de contacto de una persona real, que perdería su consulta sin enterarse.

**Sin captcha**, a propósito: agrega fricción justo en el lugar donde no hay que
agregarla, en un sitio que recibe pocas consultas.

---

### 58. El límite de envíos va en el borde, y el plan gratuito lo deja corto

**Fecha:** septiembre de 2026, Fase 4.6.

**Por qué no está en el código.** Sin base ni KV no hay un contador que
compartan las instancias del Worker, y uno en memoria lo reinicia cualquier
instancia nueva: contaría de a pedazos y no limitaría nada. Lo que corresponde
es una regla de rate limiting de Cloudflare, que corta **antes** de que el
pedido llegue al Worker.

**Lo que el plan gratuito permite**, verificado contra la documentación de
Cloudflare en septiembre de 2026: **una sola regla**, que filtra **solo por la
ruta** —no por el método—, cuenta **por IP**, en un período de **10 segundos**,
y bloquea durante **10 segundos**.

**La regla:** ruta igual a `/contacto`, 5 pedidos cada 10 segundos por IP →
bloquear con 429 durante 10 segundos. Cuenta también las visitas a la página,
porque el plan no deja filtrar por método; 5 en 10 segundos no lo alcanza nadie
navegando, y sí un programa que manda en ráfaga. La configuración exacta está
en `docs/infraestructura.md`.

**Lo que no hace, y hay que saberlo:** frena ráfagas, no un goteo. Un robot que
mande uno cada tres segundos no la toca nunca. Contra eso las defensas son las
otras dos —el campo trampa, que descarta a los robots que llenan todo, y la
validación— y un techo que no depende de nosotros: el plan gratuito de Resend
manda 100 correos por día. **El peor caso es que un abuso agote la cuota del
día**: el formulario deja de enviar hasta el siguiente, y cada intento ofrece
WhatsApp con el texto ya escrito. El canal principal no se toca.

**Lo que se evaluó y no se hizo:** el binding de rate limiting de Workers, que
cuenta en código con períodos de hasta 60 segundos. Es por ubicación de
Cloudflare y de consistencia eventual, su propia documentación desaconseja usar
la IP como clave, y su disponibilidad en el plan gratuito no está documentada.
Se revisa si aparece abuso real.

---

### 59. Cada producto y cada proyecto tiene su imagen de Open Graph apaisada

**Fecha:** septiembre de 2026, Fase 4.6.

**El problema.** Un producto compartido por WhatsApp llevaba su portada: un WebP
vertical 4:5 de 1600 × 2001. Los generadores de previsualización muestran la
imagen grande solo cuando es apaisada, cerca de 1,91:1; una vertical sale como
miniatura chica al costado del texto. Es justo lo que motivó elegir Next
(decisión 1), así que tiene que funcionar.

**Lo decidido:** `scripts/preparar-marca.mjs` arma un JPEG de 1200 × 630 por
producto y por proyecto, **con la misma composición que la de reserva**: papel,
el logo a la izquierda y la portada a la derecha, dentro del margen. Es la que
ya se compartía bien, y así cada enlace se reconoce como de la marca. La
portada se recorta a 656 × 534 desde arriba —el piso es la zona desordenada— y
conserva el 65 % de su alto. **Se descartó la portada a sangre**: en 1,91:1
conserva el 42 % y se pierde la caída de la cortina, que es lo que muestra una
foto vertical.

**JPEG y no WebP**: es el formato que lee cualquier bot de previsualización.

**Pesos medidos:** entre 46 y 99 kB cada una —la más pesada es
`venecianas-madera`, por la textura de las lamas—, 506 kB las ocho. La de
Cortinas de tela sale **idéntica byte a byte** a la de reserva, porque es la
misma foto con la misma composición, y git la guarda una sola vez: lo que
suman al repositorio son 448 kB.

**La de reserva no cambió ni un byte**, y está comprobado: la composición pasó a
una función que usan las dos, y el hash de `og.jpg` y de `logo.png` es el mismo
de antes. Es la regla de lo publicado _append-only_ (decisión 48).

**Se regeneran solas.** `npm run fotos` encadena el script de marca, así que
una portada nueva trae su imagen de Open Graph sin un segundo comando que
alguien tenga que recordar. El manifiesto es `contenido/marca.ts`
(`ogPorPagina`), y `lib/metadata.ts` la busca por la clave de la página: la que
no está usa la de reserva. `npm run fotos:revisar` revisa también `public/marca`
y `public/og`: son derivadas de fotos de casas de clientes, y lo que no se
comprueba no se aprueba.

---

### 60. Los datos de contacto viven en `contenido/contacto.ts`, y de ahí sale la ficha de negocio local

**Fecha:** septiembre de 2026, Fase 4.6.

La casilla, el teléfono si es distinto del de WhatsApp, las redes, el Perfil
de Empresa de Google y **las zonas donde trabaja la empresa** están en un solo
archivo de contenido. Los leen `/contacto`, el pie de todas las páginas y la
ficha JSON-LD: los tres dicen siempre lo mismo. El número de WhatsApp sigue
siendo `NEXT_PUBLIC_WHATSAPP`, y el que se lee en la página sale de la misma
variable que arma el enlace.

**La ficha pasa a `HomeAndConstructionBusiness`**, el tipo de `LocalBusiness`
que schema.org define para quien presta servicios en casas y edificios: la
colocación propia es lo que distingue a este negocio. Suma `telephone`,
`email`, `sameAs`, `logo`, `knowsAbout` —el catálogo, del mismo arreglo que
`/productos`— y sobre todo **`areaServed` con zonas concretas**, que es lo que
necesita un buscador o un asistente de IA para contestar «¿a quién le compro
cortinas en zona norte?».

**Sigue sin dirección ni horario**, y es a propósito: la empresa no dio
ninguno de los dos para publicar. Sin `address`, Google lee la ficha pero no la
muestra como resultado enriquecido; eso es preferible a publicar un dato falso.

De paso se corrigió un error de la Fase 4.0 en el escape del JSON-LD: el
reemplazo de `<` escribía `"<"` en el código, que en JavaScript **es** el
carácter `<`, así que no escapaba nada. Nunca importó porque ningún dato tenía
`<`; ahora escribe la secuencia de verdad.

---

### 61. WhatsApp pasa a ser obligatorio, y el mensaje de producto dice «el producto X»

**Fecha:** septiembre de 2026, Fase 4.6.

**Obligatorio.** Hasta la 4.6, sin número cargado el enlace no se dibujaba, y
cada página tenía un camino de reserva que mandaba a `/contacto`. Con
`NEXT_PUBLIC_WHATSAPP` exigida por el build, esos caminos no se recorrían nunca
y se fueron: el enlace está siempre, en la apertura y el cierre de cada página y
en el pie.

**El mensaje de producto estaba mal escrito, y no se había visto.** Decía
«vi en su página web el X», que sirve para «el Roller» y sale mal en el resto
del catálogo: «el Venecianas de PVC», «el Toldos», «el Compacta Blackout».
Nunca se había dibujado, así que nadie lo leyó. Ahora dice «el producto X»,
igual que el de proyecto dice «el proyecto X»: el artículo es el de la palabra
de adelante y el nombre entra tal cual, con su mayúscula, sin un campo nuevo en
el contenido para decir su género. Hace además explícita la distinción entre
qué vendemos y qué hicimos (`docs/producto.md`).

**El pie lleva el mensaje general** en todas las páginas. El que lleva el
nombre del producto o del proyecto es el del cierre de cada una, que está justo
arriba; hacer contextual el del pie habría pedido un componente de cliente más
solo para leer la ruta.

---

## Decisiones abiertas

~~**Los videos no responden a pedidos por rango, y Safari puede no
reproducirlos.**~~ **Descartado como problema: en un iPhone real se reproducen.**
Encontrado al cerrar la Fase 4.3: un pedido con `Range: bytes=0-1023` a
`/videos/roller/motorizado.mp4` en producción devuelve **200 con el archivo
entero** y sin `Accept-Ranges`, no 206. No pasa por el Worker —no hay
`x-opennext`—: lo sirve la capa de assets de Cloudflare, desde caché. Como
Safari pide los videos por rango, se temía que no los reprodujera. Probado en un
iPhone después del despliegue: los videos del cowork se reproducen. El 200 sin
rango queda anotado como dato, por si algún día un video largo necesita saltar
a la mitad sin descargarlo entero; hoy, con archivos de 1 a 4 MB en bucle, no
importa.

**Falta el logo en vector, y una versión para fondo oscuro.** Hoy hay un JPG de
524 px en `fotos-originales/logo.jpg`. Alcanza para el encabezado —160 px a
triple densidad son 480— pero no para nada más grande, y no hay versión clara
para usar sobre un fondo oscuro. Se le pide a la empresa — decisión 43.

**El favicon sigue sin salir, y ya se sabe por qué** — decisión 45. El círculo
amarillo viene cortado por el borde superior del archivo fuente y la «e» lo pisa,
así que un recorte literal sale sucio; cualquier otra cosa sería un lockup nuevo
que la empresa no autorizó. Se destraba con el vector, o con esa autorización.

**No hay ninguna foto 4:5 de repuesto.** Las siete que existen son exactamente
las siete portadas, así que cualquier portada que haya que retirar obliga a
recortar una 3:4. No bloquea la Fase 4.1, pero define qué hay que fotografiar
primero.

**Dónde viven las fotos cuando se cargue el archivo histórico.** Unas 300 fotos
por cuatro medidas son del orden de 240 MB, y git guarda todas las versiones de
cada archivo que se reemplace. Las opciones son git a secas, `git-lfs`, o
dejarlas fuera del repositorio y subirlas en el despliegue. No bloquea nada
hasta que haya que cargar el archivo — decisión 36.

**Del lado de Cloudflare ya está verificado y no es el problema**: ~1.200
archivos contra un tope de 20.000 por versión en el plan gratuito, sin tope
documentado de tamaño total (`docs/infraestructura.md`, «Límites de los assets
del Worker»). El que aprieta es el repositorio, y hay que decidirlo **antes** de
cargar el archivo: sacar archivos grandes de la historia de git después obliga a
reescribirla.

**La ficha de negocio local no tiene dirección ni horario, y no se completan con
datos inventados.** Desde la Fase 4.6 tiene zonas, teléfono, email y redes
(decisión 60). Sin `address` es JSON-LD válido pero Google no lo muestra como
resultado enriquecido. Falta saber si hay una dirección publicable —la empresa
trabaja a domicilio— y con qué horario. Se resuelve junto con el alta del Perfil
de Empresa de Google, que es donde ese dato importa de verdad (Fase 5).

~~**Falta una imagen de Open Graph de reserva.**~~ Resuelto en la Fase 4.2:
`public/marca/og.jpg`, que arma `scripts/preparar-marca.mjs` con el logo y
`cortinas-tela/1`. La usan Inicio, los dos listados, Contacto y cualquier
página que todavía no tenga la suya: desde la Fase 4.6 cada producto y cada
proyecto tiene una propia, con la misma composición (decisión 59).

Cuando aparezca una decisión no contemplada durante la implementación: preguntar,
decidir, y anotarla acá antes de seguir.
