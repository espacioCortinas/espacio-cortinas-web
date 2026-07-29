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

### 15. Cloudflare en modo solo DNS

Sin proxy. Proxyear Vercel detrás de Cloudflare sin configurarlo con cuidado
produce bucles de redirección y comportamientos de caché difíciles de diagnosticar.
El beneficio no justifica el riesgo en un sitio de este tamaño.

---

### 16. La marca del sitio es "Espacio Cortinas"

Confirmado. El Workspace sigue sobre `conceptoespacio.com`, pero el sitio, el
dominio, la metadata y el perfil de Google son de **Espacio Cortinas**. El correo
del dominio nuevo se resuelve con alias (decisión 13), sin tocar el otro.

---

### 17. Analítica: Vercel Analytics

**Alternativas evaluadas:** Google Analytics 4, Plausible.

**Por qué:** viene incluido con el hosting, se activa con una línea y **no requiere
cartel de cookies**, porque no sigue individuos. GA4 es más completo pero obliga
legalmente al banner de consentimiento, que es fricción en la primera pantalla a
cambio de un detalle que este negocio no necesita. Plausible cubre lo mismo que
Vercel Analytics pero es pago.

Mide lo que importa: visitas, páginas más vistas y clics a WhatsApp como evento.
Si algún día hace falta más profundidad, GA4 se puede sumar encima.

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

- En `next.config.ts`, que Next evalúa antes que nada: falla el **build**. En
  Vercel eso significa que un despliegue mal configurado no llega a publicarse.
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
se agrega igual en Vercel, pero solo para redirigir al apex.

**Por qué el apex y no `www`:** es lo que dice toda la documentación del proyecto
y es lo que se va a escribir en las tarjetas, en Instagram y en el Perfil de
Empresa de Google. Un dominio `.com.ar` ya es largo; sumarle cuatro caracteres no
ayuda.

Vercel suele recomendar `www` como principal porque el apex no admite CNAME y
obliga a una IP fija. Acá no es un problema: el DNS está en Cloudflare en modo
solo DNS (decisión 15) y el registro A apunta directo a Vercel.

**Consecuencia práctica:** `NEXT_PUBLIC_SITE_URL` en producción es
`https://espaciocortinas.com.ar`, sin `www` y sin barra final. De ahí salen las
URLs canónicas, el sitemap y el Open Graph en la Fase 5. Si alguna vez se
invierte, hay que cambiar la variable en el mismo movimiento.

---

### 23. Los commits se firman con la cuenta de la empresa

Todos los commits van a nombre de `espacioCortinas`
(`310341945+espacioCortinas@users.noreply.github.com`), con la autoría real en
`Co-Authored-By`. Está configurado en el `.git/config` del repositorio, no en la
configuración global de la máquina, así que no afecta a otros proyectos.

**Por qué:** el plan Hobby de Vercel no admite colaboradores. Cuando el autor de
un commit no es el dueño de la cuenta, Vercel **bloquea el despliegue** con
"the commit author does not have contributing access". No es una advertencia: no
despliega.

**Alternativas evaluadas:** pasar Vercel a Pro (USD 20 por mes, la única que
permite dos identidades) o mover el proyecto de Vercel a la cuenta personal del
desarrollador. La primera es cara para lo que resuelve; la segunda contradice la
regla de titularidad de `docs/infraestructura.md`, que existe para que la empresa
no dependa de quién programa.

**Lo que hay que recordar:** si alguna vez el sitio deja de desplegarse después
de un push y el error habla de _contributing access_, es que se commiteó con otra
identidad. Se arregla con:

```
git config user.name "espacioCortinas"
git config user.email "310341945+espacioCortinas@users.noreply.github.com"
```

---

## Decisiones abiertas

Ninguna en este momento.

Cuando aparezca una decisión no contemplada durante la implementación: preguntar,
decidir, y anotarla acá antes de seguir.
