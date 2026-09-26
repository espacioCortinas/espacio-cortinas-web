# Modelo de datos

**No hay base de datos.** El contenido son archivos de este repositorio, se
edita a mano y se publica con un `git push` — decisión 36.

Hasta la Fase 3 esto describía cinco tablas de PostgreSQL en Supabase, con RLS,
migraciones y un bucket privado. Todo eso se sacó junto con el panel. La
historia está en la decisión 36 y el código, en el historial de git.

## Dónde vive cada cosa

```
contenido/
├── productos.ts      se edita a mano
├── proyectos.ts      se edita a mano
├── inicio.ts         se edita a mano: los textos de Inicio
├── contacto.ts       se edita a mano: casilla, redes y zonas donde trabaja
├── compartir.ts      se edita a mano: qué foto lleva cada página al compartirla
├── fotos.ts          GENERADO por scripts/preparar-fotos.mjs
├── videos.ts         GENERADO por scripts/preparar-fotos.mjs
├── marca.ts          GENERADO por scripts/preparar-marca.mjs
├── imagenes-para-compartir.ts   GENERADO por scripts/preparar-compartir.mjs
├── tipos.ts          la forma de todo lo anterior
└── index.ts          une el contenido con sus fotos, y es lo que leen las páginas

public/fotos/         las imágenes ya recomprimidas, generadas
public/videos/        los videos publicados y su cuadro de cartel, generados
public/compartir/     la imagen para compartir de cada página, generada
fotos-originales/     los originales. NO se versiona
```

## Datos de contacto

`contenido/contacto.ts` — decisión 60. Lo leen `/contacto`, el pie y la ficha
de negocio local (JSON-LD), así que los tres dicen siempre lo mismo.

| Campo            | Tipo                                 | Notas                                                                                              |
| ---------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `email`          | `string`                             | la casilla que se publica; la misma del formulario                                                 |
| `telefono`       | `{ visible, internacional } \| null` | solo si es otro número que el de WhatsApp. `null`: se llama al mismo                               |
| `redes`          | `Red[]`                              | nombre, usuario y URL. Van al pie, a la página y al `sameAs`                                       |
| `perfilDeGoogle` | `string \| null`                     | cuando se dé de alta                                                                               |
| `zonas`          | `string[]`                           | **dónde trabaja**, con nombres concretos: es lo que responde «¿quién hace cortinas en zona norte?» |

**El número de WhatsApp no está acá**: es `NEXT_PUBLIC_WHATSAPP`, y de esa misma
variable salen el enlace y el número que se lee en la página.

**Ni dirección ni horario**, porque la empresa no dio ninguno para publicar. Se
agregan acá el día que los dé; inventarlos para completar un formato sería
publicar un dato falso sobre la empresa.

## Archivos de marca

`contenido/marca.ts`, que escribe `scripts/preparar-marca.mjs`, exporta uno
solo: `logo`, el logo sin fondo del encabezado, con `ruta`, `ancho` y `alto`
del archivo escrito.

Hasta la decisión 63 exportaba también `og`, la imagen para compartir, que era
el logo sobre el papel y la misma para todas las páginas. Ya no es de la marca:
es una foto por página, y tiene su propio par de archivos, abajo.

## La imagen para compartir

La que se ve al pegar el enlace de una página en WhatsApp: **una foto a
sangre, distinta en cada página** — decisión 63. Son dos archivos, uno a mano
y uno generado:

`contenido/compartir.ts`, **a mano**: qué foto lleva cada página, por su ruta.

| Campo     | Tipo                           | Notas                                                                              |
| --------- | ------------------------------ | ---------------------------------------------------------------------------------- |
| `foto`    | `string`                       | la carpeta de la foto en `contenido/fotos.ts`: `productos/roller/blackout/2`       |
| `enfoque` | `"alto" \| "centro" \| "bajo"` | por dónde pasa el corte a 1,91:1. Sin decir nada, `alto`, el mismo sesgo del sitio |

**La foto va por su nombre, no por su lugar en la galería.** Un índice seguiría
apuntando al mismo lugar aunque la galería se reordenara, y la página
cambiaría de foto sin que nadie la eligiera. Al lado de cada línea está escrito
por qué esa foto. La de un producto o un proyecto tiene que ser de su propia
galería —la del producto o la de una de sus variantes—: el script corta si no.

`contenido/imagenes-para-compartir.ts`, **generado**: el archivo que salió para
cada página.

| Campo   | Notas                                                                              |
| ------- | ---------------------------------------------------------------------------------- |
| `ruta`  | `/compartir/productos-roller.a034f2fa.jpg`: el nombre lleva la huella de los bytes |
| `ancho` | 1200, leído del archivo escrito                                                    |
| `alto`  | 630, ídem                                                                          |
| `alt`   | el mismo texto que la foto tiene en el sitio: «Roller Blackout — foto 2»           |
| `foto`  | de qué foto salió                                                                  |

`lib/metadata.ts` la busca por la ruta de la página. Una página que no tiene la
suya —un producto recién agregado, antes de correr `npm run compartir`— usa la
de Inicio.

**Lo escrito a mano y lo generado nunca comparten archivo.** Si estuvieran
juntos, regenerar las fotos pisaría los textos. Se juntan al leer, en
`contenido/index.ts`, por el slug.

## Por qué TypeScript y no JSON

Esto se edita a mano, así que conviene que el editor autocomplete y que `tsc`
frene el build si falta un campo, si un booleano está mal escrito o si algo
apunta a una carpeta que no existe. Con JSON esos errores no aparecen hasta que
alguien visita la página.

## Producto

| Campo         | Tipo         | Notas                                              |
| ------------- | ------------ | -------------------------------------------------- |
| `slug`        | `string`     | la parte final del enlace, y la clave de las fotos |
| `nombre`      | `string`     |                                                    |
| `descripcion` | `string`     | breve, texto plano                                 |
| `variantes`   | `Variante[]` | ver abajo                                          |
| `activo`      | `boolean`    |                                                    |
| `destacado`   | `boolean`    |                                                    |

### Variante

Las variantes **no** son productos independientes: `Toldos motorizados` es una
variante de `Toldos`, no una entrada más del catálogo — decisión 40.

| Campo         | Tipo      | Notas                                       |
| ------------- | --------- | ------------------------------------------- |
| `nombre`      | `string`  | lo que se lee. Ej. `"Riel motorizado"`      |
| `descripcion` | `string?` | solo donde la diferencia hay que explicarla |
| `clave`       | `string?` | con qué carpeta y qué video se une          |

**Sí pueden tener descripción, fotos y video**, contra lo que decía este
documento hasta la Fase 4.4. La descripción llegó con la decisión 40 —existe
donde la diferencia decide la compra: «screen deja pasar luz, blackout no»— y
las fotos y el video, con la 48. Lo que siguen sin tener es **slug y página
propia**: una variante se lee dentro de la página de su producto.

**`clave` se escribe a mano y no se deriva del nombre.** Es el nombre de la
carpeta dentro de `fotos-originales/productos/<slug>/` y también el del archivo
de video. Derivarla con `aSlug(nombre)` funcionaría hoy y se rompería en
silencio la primera vez que alguien corrija el nombre visible: la clave
cambiaría, las fotos dejarían de encontrarse y la página se dibujaría igual,
sin fotos y sin error. Es la misma regla que ya vale para el slug de un
producto — decisiones 10 y 48.

Es **opcional**: una variante que no tiene nada que mostrar no la lleva. De las
nueve del catálogo, cuatro tienen fotos, dos tienen video y tres no tienen
nada.

## Proyecto

| Campo         | Tipo      | Notas                                     |
| ------------- | --------- | ----------------------------------------- |
| `slug`        | `string`  |                                           |
| `titulo`      | `string`  |                                           |
| `ubicacion`   | `string`  | texto libre. Ej. "Nordelta, Buenos Aires" |
| `descripcion` | `string`  | texto plano                               |
| `activo`      | `boolean` |                                           |
| `destacado`   | `boolean` |                                           |

**Cuatro campos y no más** — decisión 11. Sin categoría, sin fecha, sin cliente,
sin superficie, sin qué productos se usaron. Cada campo agregado es un campo que
hay que completar en cada carga.

**El primero del arreglo abre el listado**: va en fila, con la portada al
costado, y el resto en grilla — decisión 52. No hay un campo que lo marque:
cuál abre se cambia moviendo el bloque, como todo el orden del sitio.

**Las descripciones las redacta la empresa.** Mientras no llegan, la de cada
proyecto lleva un comentario `PROVISORIO` y dice solo lo que se ve en las fotos
—nunca metros, cantidad de ventanas, cliente ni plazos—, con la misma
convención que `contenido/inicio.ts`.

### Lo que la página recibe: `fotos` y `galeria`

`contenido/index.ts` le da a cada proyecto dos listas, y no es redundante:

| Campo     | Qué tiene                                     | Quién lo usa                      |
| --------- | --------------------------------------------- | --------------------------------- |
| `fotos`   | solo fotos, en orden; la primera, portada     | listados, la apertura del detalle |
| `galeria` | fotos **y videos**, en el orden de la carpeta | la galería del detalle            |

`galeria` se arma insertando cada video de proyecto en su `posicion` — decisión 51. La portada queda primera aunque la carpeta empiece con un video.

## Fotos

`contenido/fotos.ts` es un mapa a una lista de fotos. La clave es
`<entidad>/<slug>` para la galería de un producto o un proyecto, y
`<entidad>/<slug>/<clave de la variante>` para la de una variante — la clave de
la variante cuelga de la del producto, así que no hace falta un mapa aparte:

```ts
"productos/roller-blackout": [
  {
    carpeta: "productos/roller-blackout/1",
    medidas: [480, 960, 1600, 2560],
    formato: "webp",
    ancho: 2560,
    alto: 3200,
  },
]
```

| Campo     | Notas                                                     |
| --------- | --------------------------------------------------------- |
| `carpeta` | dentro de `public/fotos/`. Adentro, un archivo por medida |
| `medidas` | qué anchos existen de verdad para esta foto               |
| `formato` | la extensión, sin el punto. Hoy `"webp"` en todas         |
| `ancho`   | de la medida más grande                                   |
| `alto`    | de la medida más grande                                   |

**Nada de esto se escribe a mano.** Lo calcula `scripts/preparar-fotos.mjs` a
partir del archivo que efectivamente escribió, no de una cuenta — que es lo que
evita que el manifiesto describa una foto distinta de la que hay en el disco.

### `medidas` existe para no adivinar

Una foto de 900 px de ancho no genera la medida de 1600 ni la de 2560: agrandar
no agrega detalle, solo bytes, y además **mentiría en el `srcset`**, donde el
descriptor `w` es por definición el ancho real del archivo. Esa foto tiene
`{480, 900}` — las medidas fijas que le entran, más su propio ancho.

Armar el `srcset` a partir de una constante del código funcionaría hoy y
fallaría con la primera foto chica: el navegador pediría un archivo que no
existe. **Se lee de la lista, siempre.** Decisión 32.

### `ancho` y `alto` no son decorativos

Van al `<img>`. Sin ellos el navegador no puede reservar el espacio y la página
salta mientras carga. Y con ese par se sabe la orientación sin abrir el archivo.

### Cómo se sirven

```html
<img
  src="/fotos/productos/roller-blackout/1/1600.webp"
  srcset="
    /fotos/productos/roller-blackout/1/480.webp   480w,
    /fotos/productos/roller-blackout/1/960.webp   960w,
    /fotos/productos/roller-blackout/1/1600.webp 1600w,
    /fotos/productos/roller-blackout/1/2560.webp 2560w
  "
  sizes="(max-width: 768px) 100vw, 50vw"
  width="2560"
  height="3200"
  alt="Roller Blackout — foto 1"
  loading="lazy"
  decoding="async"
/>
```

Las tres cosas que este `<img>` tiene que respetar, y que fallan en silencio si
no: los candidatos del `srcset` salen de `medidas` y no de una constante, el
descriptor `w` es el ancho real del archivo —que es también su nombre—, y
`width` y `height` van siempre para que la página no salte mientras carga.

### `formato` existe por la misma razón que `medidas`

Hoy el script genera WebP para todas —la rama JPEG existía porque WebKit no sabe
codificar WebP y el panel se usaba desde un iPhone, y con el panel se fue— así
que el campo dice `"webp"` en todas las filas. **Se registra igual, y se lee
igual.** Armar el nombre del archivo concatenando una constante del código
funciona hasta la primera foto que no siga la regla, y ahí el navegador pide un
archivo que no existe. Es exactamente el error de `medidas` con otro nombre —
decisión 37.

**El optimizador de `next/image` no se usa.** Los tamaños ya están generados; en
Cloudflare, dejarlo activo gastaría cuota de Transformations rehaciendo un
trabajo hecho — decisión 25. `next.config.ts` lo apaga con
`images.unoptimized`, y el sitio sirve las fotos con `<img>` a través de
`components/foto.tsx`.

### El orden, la portada y el texto alternativo

- **El orden del arreglo es el orden de la galería.** No hay campo `orden`.
- **La primera foto es la portada**, y tiene que ser vertical: los listados usan
  siempre la portada, y es lo que hace que las grillas queden parejas aunque la
  galería mezcle orientaciones (decisión 14). Si la primera es apaisada, el
  script la recorta a 4:5 por el centro y lo avisa.
- **No hay campo `alt`.** Se arma al renderizar con `altAutomatico()`, a partir
  del nombre y la posición: «Casa en Nordelta — foto 3». Pedirlo por foto haría
  que se cargue cualquier cosa, que para un lector de pantalla es peor que un
  texto generado razonable.

## Videos

`contenido/videos.ts` es un mapa de clave a **un** video, y hay dos clases de
clave:

- `productos/<slug>/<clave de la variante>` — el video de una variante
  motorizada. Cuelga de la variante y no del producto: lo que documenta es la
  motorización, que es lo único que una foto no puede mostrar — decisión 40. Se
  reproduce en bucle.
- `proyectos/<slug>/<nombre del archivo>` — un elemento de la galería de un
  proyecto, que no tiene variantes. Lleva `posicion` y va en bucle, como los de variante —
  decisión 51.

```ts
"productos/roller/motorizado": {
  archivo: "roller/motorizado",
  formato: "mp4",
  formatoPoster: "webp",
  ancho: 1280,
  alto: 720,
  duracion: 11,
}
```

| Campo           | Notas                                                                                 |
| --------------- | ------------------------------------------------------------------------------------- |
| `archivo`       | dentro de `public/videos/`, sin extensión                                             |
| `formato`       | la extensión del video, sin el punto                                                  |
| `formatoPoster` | la del cuadro de cartel, que se llama igual                                           |
| `ancho`, `alto` | del archivo que se publica, no del original                                           |
| `duracion`      | en segundos, redondeada. Se escribe al lado del video                                 |
| `posicion`      | **solo de proyecto**: el lugar en la galería, desde 1, contando fotos y videos juntos |

`archivo` **no lleva la entidad adelante en los de variante**
(`roller/motorizado`) **y sí en los de proyecto**
(`proyectos/cowork-nordelta/7`). Es heredado y a propósito: los de variante ya
estaban publicados cuando llegó el primer video de proyecto, y moverlos sería
reescribirlos en git — decisión 51.

Un vertical se publica con el **lado mayor** a 1280 px, no el ancho: sale a
720 × 1280 y no se agranda. Ver `VIDEO_LADO_MAYOR` en `lib/constantes.ts`.

**Tampoco se carga a mano**, y por la misma razón que las fotos: lo mide
`ffprobe` sobre el archivo publicado, y el cartel lo extrae el script del primer
cuadro de ese mismo archivo. El nombre del cartel sale de `formatoPoster` y no
de una constante — la misma regla de la decisión 37.

**Un video ya publicado no se vuelve a convertir.** `public/videos/` está en
git: reencodearlo con otros bytes suma su peso otra vez a la historia, para
siempre. Ver la decisión 48.

## Slugs

Se escriben a mano, en minúsculas, sin tildes y con guiones. Son la clave con la
que se buscan las fotos, así que tienen que coincidir con el nombre de la
carpeta en `fotos-originales/`.

**No se cambian una vez publicados.** Rompen los enlaces ya compartidos por
WhatsApp, que es por donde se comparte este sitio — decisión 10.

## Activo y destacado

Son independientes:

```
activo = true                     → aparece en /productos o /proyectos
activo = true  y destacado = true → además puede aparecer en Inicio
activo = false                    → no aparece en ningún lado
```

Un elemento inactivo pero destacado no se muestra: **`activo` manda**.

El tope de Inicio (`PROYECTOS_DESTACADOS_HOME`, `PRODUCTOS_DESTACADOS_HOME`) se
aplica **al leer**, tomando los primeros del arreglo. Se pueden dejar más
destacados de los que entran y solo aparecen los primeros, así que se cambia qué
sale en la portada moviendo un bloque de lugar, sin desmarcar nada.

## Cómo se agrega contenido

1. Se ponen los originales en `fotos-originales/<entidad>/<slug>/`, numerados.
   El orden alfabético es el de la galería y **el primero es la portada**.

   Las fotos de una variante van un nivel más adentro, en una carpeta con el
   nombre de su `clave`, y su video al lado con el mismo nombre:

   ```
   fotos-originales/productos/roller/
   ├── 1.jpg  2.jpg  3.jpg     la galería del producto
   ├── screen/1.jpg  2.jpg     la de la variante «Screen»
   └── motorizado.mp4          el video de la variante «Motorizado»
   ```

   **Ninguna foto de variante es portada**, así que ninguna se recorta a 4:5.

   En un **proyecto**, que no tiene variantes, los videos van en la misma
   carpeta que las fotos y numerados como ellas: `7.mp4` entra en la galería
   después de `6.jpg` — decisión 51.

2. `npm run fotos` — recorta, redimensiona, borra los metadatos y reescribe
   `contenido/fotos.ts`. Al terminar rehace las imágenes para compartir.
3. `npm run fotos:revisar` — comprueba que ninguna foto **ni ningún video**
   conserve GPS. **No es opcional**: son casas de clientes. Ver
   `docs/seguridad.md`.
4. Se agrega o edita el bloque en `contenido/productos.ts` o `proyectos.ts`.
   Si se cargaron fotos o un video de variante, la variante necesita su
   `clave`. El script avisa si una carpeta quedó sin variante que la reclame, o
   una clave sin carpeta.
5. Si la página es nueva, `npm run compartir`: le arma su imagen para compartir
   con la regla —la primera apaisada de su galería, o la portada— y lo avisa.
   **Mirala**, y anotá la foto en `contenido/compartir.ts`, con el porqué.
6. `npm run build` para que `tsc` valide, y `git push`.

El cambio tarda lo que tarde el build: entre 2 y 9 minutos.

### Lo publicado es append-only, y los parámetros están congelados

`public/fotos/` y `public/videos/` viven en git, que guarda **todas** las
versiones de cada archivo que se reemplace. Agregar fotos suma; regenerar las
que ya están con otros bytes duplicaría su peso en la historia para siempre, y
sacarlo después obliga a reescribir la historia.

Por eso `IMAGEN_CALIDAD`, `MEDIDAS_IMAGEN` e `IMAGEN_LADO_MAXIMO` de
`lib/constantes.ts` **están congelados**. Mientras no se toquen, `npm run fotos`
es seguro de correr cuantas veces haga falta: `sharp` es determinista y
regenerar una foto con los mismos parámetros da un archivo idéntico byte a byte,
así que `git status` no la marca. Está verificado. El día que uno de esos
números cambie, deja de serlo, y hay que decidir el costo antes.

Con los videos es más directo: un video que ya está en `public/videos/` no se
reconvierte, y el script lo dice en pantalla — decisión 48.

Las imágenes para compartir siguen la misma regla con sus propios números,
congelados en `scripts/preparar-compartir.mjs`: medida, sesgos del recorte y
calidad. Correr `npm run compartir` de nuevo no cambia ningún byte —verificado
dos veces seguidas con los SHA-256—; cambiar uno de esos números cambia las
doce imágenes y su peso se suma a la historia. Y como el nombre de cada una
lleva la huella de sus bytes, una imagen que cambia sale siempre con otro
nombre: es lo que hace que WhatsApp la vuelva a pedir — decisión 63.

## Copias de seguridad

Todo el contenido está en git, con historial. **Los originales de las fotos no**:
viven en el Drive de la empresa, porque lo que se publica está recomprimido y
sin metadatos y de ahí no se recupera el original — decisión 18.
