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
  mejor pero generarlo en el navegador es lento y el beneficio es marginal

**Consecuencias concretas:** `next/image` pasa a usarse con `unoptimized`, o
directamente `<img>`. Ver `docs/arquitectura.md` (sección «Subida de imágenes») y
`docs/modelo-de-datos.md` (columna `medidas`).

**Esto es documentación, no implementación.** El código es de la Fase 3.

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

## Decisiones abiertas

Ninguna en este momento.

Cuando aparezca una decisión no contemplada durante la implementación: preguntar,
decidir, y anotarla acá antes de seguir.
