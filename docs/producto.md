# Producto

## Qué es

Sitio institucional para **Espacio Cortinas**, empresa de cortinas, rollers
blackout, venecianas y toldos con colocación propia, que trabaja en todo Buenos
Aires.

El objetivo comercial es uno solo:

> Que alguien que llega al sitio termine escribiendo por WhatsApp.

Todo lo demás está subordinado a eso. El sitio no vende online, no toma pedidos y
no publica precios.

## Para quién

| Público                    | Qué necesita ver                                  |
| -------------------------- | ------------------------------------------------- |
| **Particulares**           | que queda lindo; fotos de casas reales terminadas |
| **Arquitectos y estudios** | que la empresa puede trabajar dentro de una obra  |
| **Oficinas y empresas**    | que tiene capacidad para instalaciones grandes    |

Un solo sitio para los tres. No hay secciones separadas por público.

## Posicionamiento

No "venta de cortinas", sino:

> Soluciones de cortinas y protección solar a medida, con asesoramiento y
> colocación profesional, para hogares, estudios de arquitectura y espacios
> corporativos en Buenos Aires.

**La colocación no es un producto.** Es parte de la propuesta de valor:
asesoramiento + provisión a medida + colocación.

Lo que el sitio tiene que transmitir, en orden:

1. **Estética** — queda bien
2. **Calidad** — los productos son buenos
3. **Profesionalismo** — saben lo que hacen
4. **Integral** — asesoran y colocan

Los proyectos reales son la evidencia de las cuatro. Por eso pesan más que
cualquier texto.

## Estructura

```
INICIO              Apertura, productos destacados, cómo trabajamos,
                    nuestros trabajos, arquitectos y oficinas, cierre

PRODUCTOS           Catálogo
                    Producto → lema, descripción, recuadro, variantes, fotos, CTA

NUESTROS TRABAJOS   /proyectos: el listado de trabajos realizados
                    Proyecto → título, ubicación, descripción, fotos y videos

NOSOTROS            Propósito, visión y cómo trabajamos, con los textos de la empresa

CONTACTO            WhatsApp, teléfono, email, formulario, redes
```

**El menú dice Inicio, Productos, Trabajos, Nosotros y Contacto**, en ese orden,
que es el del boceto de la empresa. «Trabajos» y no «Nuestros trabajos», que es
el nombre de la página: con el nombre entero, los cinco enlaces no entran en una
fila en un teléfono. **La dirección sigue siendo `/proyectos`**: los enlaces que
ya circulan siguen andando — decisiones 10 y 66.

**`/nosotros` entró en la Fase 4.7**, a pedido de la empresa, con los textos de
su boceto.

Inicio se compuso en cinco sectores y **«Empresa» dejó de abrir la página** —
decisión 47. Con el rediseño de la Fase 4.7 los sectores son los mismos, con el
armado del boceto de la empresa — decisión 66. Es la apertura más débil posible para un negocio visual y además no
hay con qué: ni foto de equipo, ni taller, ni años documentados. Lo que la
empresa es se dice en la bajada del titular y en «cómo trabajamos», que es donde
vive el diferencial de verdad: la colocación es propia.

**El sector de proyectos está solo si hay proyectos destacados.** Una página de
inicio no promete lo que no existe. Entró en la Fase 4.3 con el primero, y se
compone igual que `/proyectos` —el primero en fila, el resto en grilla— para
que con uno no parezca una grilla incompleta. Si todos quedan inactivos,
desaparece solo — decisión 52.

**Los textos son de la empresa.** Desde la Fase 4.7 el sitio usa los de su
boceto: el lema y las frases de Inicio, la descripción, el lema y el recuadro
de cada producto, y Nosotros entero. Se corrigieron la ortografía, las tildes y
la puntuación, no las palabras ni el tono, y están copiados en `docs/plan.md`,
Fase 4.7, porque el boceto es un sitio que la empresa puede cambiar o borrar.
Donde el boceto no tenía texto —la bajada de la apertura, «Cómo trabajamos»,
arquitectos y oficinas, los cierres— quedó el que había, que es provisorio.

Viven en `contenido/`: `inicio.ts`, `productos.ts` y `nosotros.ts`. En
`inicio.ts` está escrito, además, qué no se puede afirmar sin confirmarlo: años
de trayectoria, cantidad de trabajos, marcas y garantías.

**Productos vive como sección aparte del recorrido institucional.** Inicio,
Nuestros trabajos y Contacto son el recorrido comercial; Productos es el catálogo, que se
explora por separado. En Inicio aparecen algunos productos como anticipo, nunca el
catálogo completo.

La distinción tiene que quedar clara para el visitante:

- **Productos = qué vendemos**
- **Nuestros trabajos = qué hicimos**

## Contenido

### Producto

- Nombre
- Lema: una o dos palabras en minúscula, arriba del nombre — «filtrar u
  oscurecer»
- Descripción breve
- Recuadro: dos o tres frases, y a veces un título —«translúcidas o
  blackout»—. Desde la decisión 67, lo de manual o motorizado es una sección
  propia, con los videos
- Variantes (ej. Cortinas de confección → riel, riel motorizado, barral; Toldos
  → de brazos, motorizado)
- Fotos, con una de portada
- Activo / inactivo · Destacado / no destacado

Las variantes **no** son productos independientes. `Toldos motorizados` es una
variante de `Toldos`, no una entrada más del catálogo.

Catálogo: Roller · Compacta Blackout · Cortinas de confección · Venecianas de
madera · Venecianas de PVC · Toldos · Bandas verticales — decisión 40.
«Cortinas de confección» se llamó «Cortinas de tela» hasta la Fase 4.7; la
dirección, `/productos/cortinas-tela`, no cambió.

### Proyecto

- Título
- Ubicación
- Descripción
- Fotos y videos, con una foto de portada
- Activo / inactivo · Destacado / no destacado

Nada más. Sin categoría, sin fecha, sin cliente, sin superficie, sin productos
utilizados. Cada campo agregado es un campo que hay que completar en cada carga.

En la tarjeta, el título es el trabajo y la ubicación va como chip:

```
Casa en Nordelta
[ Nordelta, Buenos Aires ]
```

## Visibilidad

Dos estados independientes:

- **Activo / inactivo** — controla si existe públicamente. Inactivo sigue
  guardado, no se muestra en ningún lado.
- **Destacado / no destacado** — controla si puede aparecer en Inicio.

```
Todos los activos     → /productos y /proyectos
Los destacados        → Inicio (con tope)
```

Así se puede rotar lo que aparece en Inicio sin borrar nada, y el tope de Inicio
nunca limita el portfolio completo.

**Desactivar no es eliminar.** Eliminar es borrar el bloque del archivo, y queda
en el historial de git.

## Cómo se carga el contenido

**No hay panel de administración.** Se construyó en la Fase 3, funcionó, y se
sacó a propósito: el contenido cambia pocas veces al año y quien desarrolla
prefiere editarlo a mano — decisión 36, que incluye lo que eso deja abierto.

El contenido son archivos del repositorio:

```
contenido/productos.ts     nombre, lema, descripción, recuadro, variantes,
                           activo, destacado
contenido/proyectos.ts     título, ubicación, descripción, activo, destacado
contenido/inicio.ts        los textos de Inicio
contenido/nosotros.ts      los textos de Nosotros
fotos-originales/          las fotos, que un script prepara y limpia
```

Publicar un cambio es editar un archivo y hacer `git push`. Tarda lo que tarde
el build: entre 2 y 9 minutos. El procedimiento está en
`docs/modelo-de-datos.md`.

**Consecuencia, y está anotada:** la empresa no puede publicar sola. Cada foto y
cada corrección de texto pasan por quien desarrolla.

## Contacto

WhatsApp es el canal principal. El mensaje se arma según de dónde salió el clic:

```
Desde /productos/roller
→ "Hola, vi en su página web el producto Roller:
   https://espaciocortinas.com.ar/productos/roller
   Quisiera consultar..."

Desde /proyectos/cowork-nordelta
→ "Hola, vi en su página web el proyecto Cowork en Nordelta y quisiera consultar..."

Desde cualquier otra página
→ "Hola, vi en su página web y quisiera consultar..."
```

Eso permite saber que la consulta vino del sitio y sobre qué. **«El producto
X» y no «el X»**: con los nombres del catálogo, «el X» salía «el Venecianas de
PVC» — decisión 61. **El de producto lleva la dirección de la página**, para
que el chat muestre la tarjeta con su foto; el de proyecto no — decisión 68.

Hay además un formulario que envía a `ventas@espaciocortinas.com.ar`, para
quien prefiere escribir con tiempo. Cinco campos —nombre, email, teléfono, qué
está buscando y el mensaje—, tres obligatorios. El correo llega con `Reply-To`
de quien escribió, así que se contesta con «Responder». No hay bandeja: los
mensajes van por email y no se guardan en ningún otro lado. Si el envío falla,
el formulario ofrece WhatsApp con lo escrito ya puesto — decisión 57.

**Para arquitectos, estudios y oficinas hay además «Llamar»**, un enlace que
llama al número, en la apertura de `/contacto` y en su sector de Inicio. No va
en el resto del sitio: el canal sigue siendo WhatsApp, y la invitación a llamar
va solo donde el sitio les habla a los profesionales, que suelen preferir
hablarlo. En los demás lugares el número se lee completo, `+54 9 11 3311 1686`,
con el logo de WhatsApp adelante, y tocarlo abre el chat — decisión 65.

Los datos de contacto —casilla, redes y las zonas donde trabaja la empresa—
viven en `contenido/contacto.ts` y los redacta la empresa, igual que los demás
textos.

## Fuera del alcance de V1

Nada de esto se construye ahora:

- E-commerce, carrito, precios, stock, pagos
- Panel de administración de cualquier tipo, propio o de terceros
- Roles, permisos, varios administradores
- Bandeja de mensajes
- CRM, estadísticas administrativas
- Vista previa antes de publicar
- Historial de versiones
- Blog
- Varios idiomas
- Relación entre productos y proyectos ("productos usados en este proyecto")

Algunas de estas se evaluaron y se descartaron con razones. Ver
`docs/decisiones.md` antes de reintroducir cualquiera.
