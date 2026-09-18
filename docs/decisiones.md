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

## Decisiones abiertas

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

**La ficha de negocio local está incompleta y no se puede completar con datos
inventados.** `LocalBusiness` sin `address` es JSON-LD válido pero Google no lo
muestra como resultado enriquecido. Falta saber si hay una dirección publicable
—la empresa trabaja a domicilio— y con qué horario. Se resuelve junto con el
alta del Perfil de Empresa de Google, que es donde ese dato importa de verdad
(Fase 5).

~~**Falta una imagen de Open Graph de reserva.**~~ Resuelto en la Fase 4.2:
`public/marca/og.jpg`, que arma `scripts/preparar-marca.mjs` con el logo y
`cortinas-tela/1`. La usan Inicio, los dos listados, Contacto y cualquier
producto que todavía no tenga fotos.

Cuando aparezca una decisión no contemplada durante la implementación: preguntar,
decidir, y anotarla acá antes de seguir.
