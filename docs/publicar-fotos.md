# Cómo publicar fotos

El paso a paso para que una foto llegue al sitio. Cinco minutos la primera vez,
dos las siguientes.

Este documento es sobre **publicar**. Cómo sacarlas está en
`docs/fotografia.md`.

---

## Antes de empezar: qué no se publica

Mirá cada foto antes de ponerla en la carpeta. **No se publican fotos donde se
vea:**

- personas
- documentos o correspondencia con direcciones
- el frente de la casa con el número

Son casas de clientes. Ninguna herramienta atrapa esto: se mira a ojo, una vez,
antes de empezar.

---

## 1. Poner los originales

Van en `fotos-originales/`, que **no se versiona** — vive solo en tu máquina.
Una carpeta por producto o proyecto, con el mismo `slug` que tiene en
`contenido/productos.ts` o `contenido/proyectos.ts`:

```
fotos-originales/
├── productos/
│   ├── roller/
│   │   ├── 1.jpg
│   │   ├── 2.jpg
│   │   └── 3.jpg
│   └── venecianas-pvc/
│       └── 1.jpg
└── proyectos/
    └── cowork-nordelta/
        ├── 1.jpg
        └── 2.jpg
```

**Tres reglas y ninguna más:**

| Regla                                                    | Por qué                                        |
| -------------------------------------------------------- | ---------------------------------------------- |
| El nombre de la carpeta **es el slug**                   | así se unen las fotos con su producto          |
| El **orden alfabético** es el de la galería              | `1, 2, 10` ordena bien; `a, b, c` también      |
| **La primera es la portada** y conviene que sea vertical | los listados del sitio usan siempre la portada |

Se aceptan `.jpg`, `.png`, `.webp`, `.tif` y **`.heic`**. Las del iPhone no
hace falta convertirlas a mano, **pero no es que `sharp` las lea**: no sabe
decodificar HEVC, así que el script las pasa por ffmpeg antes y lo avisa con un
`!` — decisión 53. Hace falta tener ffmpeg instalado, que ya hacía falta para
los videos.

### Si hay videos en un proyecto

Van **en la misma carpeta que las fotos, numerados como ellas**: el orden
alfabético es el de la galería contando fotos y videos juntos, así que `7.mp4`
va después de `6.jpg` — decisión 51.

```
fotos-originales/proyectos/cowork-nordelta/
├── 1.jpg ... 6.jpg     las fotos; la 1 es la portada
├── 7.mp4               entra en la galería después de la foto 6
└── 8.mp4
```

**La portada tiene que ser una foto.** Si el primer archivo de la carpeta es un
video, el script lo avisa y lo pone segundo.

En el sitio, un video de proyecto se ve como el de un producto: mudo, en bucle
y arrancando solo cuando queda a la vista. El script lo convierte sin audio, sin metadatos y con
el lado mayor a 1280 px, y **se niega a publicarlo si pasa de 25 MiB**, que es
el tope por archivo de Cloudflare. Un recorrido de medio minuto queda muy por
debajo: los dos del cowork pesan 2,4 y 3,6 MB.

### Si las fotos son de una variante

Una variante —«Screen», «Barral», «Riel motorizado»— puede tener fotos propias,
y van **un nivel más adentro**, en una carpeta con el nombre de su clave. El
video de una variante motorizada va al lado, con el mismo nombre:

```
fotos-originales/productos/roller/
├── 1.jpg  2.jpg  3.jpg     la galería del producto
├── screen/
│   ├── 1.jpg
│   └── 2.jpg               las fotos de la variante «Screen»
├── blackout/
│   └── …
└── motorizado.mp4          el video de la variante «Motorizado»
```

**El nombre de la carpeta tiene que coincidir con la `clave` de la variante** en
`contenido/productos.ts`. Si no coincide, el script lo avisa por pantalla y las
fotos no se ven en ningún lado — no se rompe nada, simplemente no aparecen.

Acá **ninguna es portada**, así que no hace falta que la primera sea vertical y
ninguna se recorta.

---

## 2. Prepararlas

```bash
npm run fotos
```

Eso hace, para cada foto:

- aplica la rotación que trae el EXIF, para que no salga acostada
- **borra todos los metadatos**, incluidas las coordenadas GPS
- recorta la portada a vertical 4:5 si estaba apaisada, avisando
- genera un archivo por cada medida, en WebP
- reescribe `contenido/fotos.ts` con los datos de cada foto

Y para cada video —el de una variante, o uno de la galería de un proyecto—:

- lo convierte sin audio, sin metadatos y con el lado mayor a 1280 px, sin
  agrandarlo nunca
- lo mide —ancho, alto y duración— y le saca el primer cuadro como cartel
- comprueba que no haya quedado con pista de audio
- reescribe `contenido/videos.ts`
- **si el video ya estaba publicado, no lo vuelve a convertir** y lo dice. Es a
  propósito: los archivos publicados viven en git y volver a escribirlos suma su
  peso otra vez a la historia del repositorio

Y al terminar, **la imagen para compartir de cada página** —la que se ve al
pegar el enlace en WhatsApp—: la foto que dice `contenido/compartir.ts` para
esa página, con el logo en una banda de papel abajo, en 1200 × 630 —
decisiones 63 y 64. Si no cambió ninguna foto elegida, no cambia ningún
archivo. Suelto es `npm run compartir`.

Sale algo así:

```
productos/cortinas-tela
  productos/cortinas-tela/1          2338×2922  medidas: 480 · 960 · 1600 · 2338
  productos/cortinas-tela/2          2560×3413  medidas: 480 · 960 · 1600 · 2560
  productos/cortinas-tela/3          2560×1920  medidas: 480 · 960 · 1600 · 2560
  productos/cortinas-tela/barral/1   2338×2922  medidas: 480 · 960 · 1600 · 2338
  productos/cortinas-tela/barral/2   1028×822  medidas: 480 · 960 · 1028
```

**Leé los avisos**, que empiezan con `!`. No cortan la corrida pero suelen
importar — más abajo está qué significa cada uno.

---

## 3. Comprobar que no quedó ninguna coordenada

```bash
npm run fotos:revisar
```

**Este paso no es opcional.** Es el que confirma que ningún archivo publicado
lleva la dirección de la casa de un cliente. Recorre `public/fotos/`,
`public/videos/`, `public/marca/` y `public/compartir/`, y devuelve error si
encuentra algo. Un video de celular trae las coordenadas igual que una foto.

Si aparece un archivo que el control no sabe leer, **también da error**. No es
un falso positivo que haya que ignorar: todo lo que hay en esas carpetas es
material que se publica, y lo que no se puede comprobar no se da por bueno.

Lo que tiene que decir de cada archivo:

```
480.webp
  WebP  66,3 kB  480 × 853
  · Perfil de color ICC (480 bytes)
```

**El perfil de color está bien que quede.** Es el sRGB genérico que el script le
pone a cada foto —el del teléfono no llega— y no dice nada del lugar, del equipo
ni de la fecha. Lo que **no** puede aparecer es una línea que diga `EXIF`,
`XMP`, `IPTC` o `COORDENADAS GPS`.

---

## 4. Escribir el producto o el proyecto

Si es contenido nuevo, agregá el bloque en `contenido/productos.ts`:

```ts
{
  slug: "roller",
  nombre: "Roller",
  descripcion: "Es un tipo de cortina enrollable, que puede ser…",
  variantes: [
    { nombre: "Screen", clave: "screen", descripcion: "Permite que ingrese…" },
    { nombre: "Motorizado", clave: "motorizado" },
  ],
  activo: false,
  destacado: false,
},
```

O en `contenido/proyectos.ts`, que en vez de `nombre` y `variantes` lleva
`titulo` y `ubicacion`.

**El `slug` tiene que ser igual al nombre de la carpeta de las fotos.** Es lo
único que las une.

Tres cosas que conviene tener claras:

- **`activo: false` no se ve en ningún lado.** Ponelo en `true` cuando esté listo.
- **`destacado: true` solo sirve si además está activo.** Destacado quiere decir
  «puede salir en la portada», no «se muestra».
- **El orden del arreglo es el orden del catálogo**, y decide cuáles de los
  destacados entran en la portada: entran los primeros. Para reordenar, movés el
  bloque.

### La imagen para compartir de una página nueva

Con el bloque escrito, corré:

```bash
npm run compartir
```

Una página nueva todavía no tiene su línea en `contenido/compartir.ts`, así
que el script le elige la foto con la regla —la primera apaisada de su
galería, o la portada si no tiene— y lo avisa con un `!`. **Abrí la imagen**
que dice el aviso, en `public/compartir/`, y preguntate una sola cosa: ¿se
entiende que es una foto de una cortina? Si sí, anotá esa foto en
`contenido/compartir.ts`; si no, elegí otra de su galería y corré el comando
de nuevo. Que no se vea nadie, ni un pedazo de alguien: la tarjeta la ve más
gente que la galería.

---

## 5. Publicar

```bash
npm run build
```

Si eso pasa, no falta ningún campo. Lo que el build no ve es un `slug` que no
coincide con su carpeta: la página sale sin fotos y sin error, y el aviso llega
recién con `npm run compartir`. Después:

```bash
git add -A && git commit -m "Fotos de Roller Blackout"
```

Y `git push`. **El sitio sale entre 2 y 9 minutos después.**

---

## Los avisos, y qué hacer con cada uno

### `es la portada y está apaisada (…): se recorta a … por el centro`

La primera foto de la carpeta no era vertical, así que se recortó a 4:5 tomando
el centro. Si el recorte se comió lo que importaba, poné otra foto primero —
renombrala a `0.jpg`, o renumerá.

### `la portada de … quedó apaisada`

El recorte no alcanzó a hacerla vertical. Va a verse despareja en los listados.

### `… es un HEIC: sharp no decodifica HEVC, así que se convirtió con ffmpeg`

Nada que hacer: el archivo está sano y se publicó. Es un aviso y no un silencio
porque la foto pasó por un paso más que las otras — decisión 53.

### `NO SE PUBLICA`

Un original que no se pudo usar. El aviso dice **cuál es, cuánto pesa, qué le
pasa y qué hacer**, y la corrida termina con error aunque las demás fotos se
hayan procesado, para que nadie commitee sin darse cuenta de que falta una:

```
  ! 3.HEIC: NO SE PUBLICA
      archivo  fotos-originales/proyectos/casa-x/3.HEIC (1,1 MB)
      causa    es un HEIC TRUNCADO: le faltan datos (ffmpeg: «… partial file»).
      qué hacer No se publica. Suele ser una copia que se cortó: lo mejor es pedirlo de nuevo.
                Si no hay otra copia, rescatá lo que tiene con:
                  ffmpeg -i fotos-originales/proyectos/casa-x/3.HEIC … 3.jpg
                Mirá el JPEG a ojo —puede salir con una franja gris— y si sirve, borrá 3.HEIC.
```

Las causas que dice:

- **HEIC truncado o dañado.** Casi siempre, una copia que se cortó —del Drive, de
  un envío por WhatsApp, de un cable—. Lo mejor es pedir el archivo de nuevo. Si
  no hay otra copia, se rescata lo que tiene con la receta de abajo, se mira a
  ojo y, si sirve, se reemplaza el HEIC por el JPEG en la carpeta.
- **JPEG cortado** (`premature end of JPEG image`). Lo mismo: pedirlo de nuevo.
- **No se reconoce como imagen.** Una captura, un PDF o un video con la
  extensión equivocada: sacarlo de la carpeta.
- **Un video de más de 25 MiB.** Acortarlo antes de ponerlo en la carpeta.

**La receta para rescatar un HEIC**, que es la misma que el script usa con los
sanos:

```bash
ffmpeg -i entrada.HEIC -frames:v 1 -update 1 -q:v 2 -map_metadata -1 salida.jpg
```

`-map_metadata -1` ya borra el EXIF con las coordenadas; de todos modos, el
JPEG vuelve a pasar por `npm run fotos` y por `npm run fotos:revisar` como
cualquier otra foto. **No se arregla solo a propósito**: un archivo cortado es
un problema de transferencia que conviene saber, y un rescate puede salir con
una franja gris que solo se ve mirándolo.

### `… no está en contenido/compartir.ts: se usó … por la regla`

Es una página nueva, y su imagen para compartir la eligió la regla. Mirala y
anotala: ver «La imagen para compartir de una página nueva», más arriba.

### `… el recorte a 2,5:1 queda en …, menos que 1200×480`

La foto elegida para compartir es demasiado chica: habría que agrandarla, y no
se agranda nunca. Elegí otra en `contenido/compartir.ts`.

### `quedó sin ninguna foto propia`

La carpeta del producto o del proyecto no dejó ninguna foto publicada: o todas
salieron con `NO SE PUBLICA` —más arriba dice por qué—, o solo tiene carpetas de
variante y videos. Sin fotos propias no hay portada.

---

## Problemas que no dan aviso

### Cambié fotos y el sitio muestra las viejas

`npm run fotos` reescribe `contenido/fotos.ts`, pero el sitio solo cambia
cuando se construye de nuevo. Faltó el `git push`, o el build todavía no
terminó.

### Una foto se ve borrosa en la computadora

Fijate qué medidas generó. Si dice `medidas: 480 · 900`, esa foto original mide
900 px de ancho y **no da para más**: no se agranda ninguna foto, porque
agrandar no agrega detalle y además haría que el navegador elija mal el tamaño.
La única solución es conseguir el original en mejor resolución.

### Borré una foto de la carpeta y sigue en el sitio

`npm run fotos` reconstruye el manifiesto entero, así que la foto desaparece de
`contenido/fotos.ts`. Pero **los archivos viejos quedan en `public/fotos/`**
hasta que se regeneren esa carpeta. Si renumeraste, revisá que no haya quedado
una carpeta suelta de más.

### El build falla con «PROBLEMAS CON LAS VARIABLES DE ENTORNO»

No tiene que ver con las fotos: a `.env.local` le falta una de las cuatro
variables, o tiene una mal escrita. El mensaje dice cuál, y la plantilla es
`.env.example`.

---

## Dónde queda cada cosa

| Ruta                     | Qué es                                    | ¿Se versiona? |
| ------------------------ | ----------------------------------------- | ------------- |
| `fotos-originales/`      | los originales, con su EXIF intacto       | **no**        |
| `public/fotos/`          | lo que se publica, ya limpio              | sí            |
| `contenido/fotos.ts`     | el manifiesto, generado                   | sí            |
| `contenido/compartir.ts` | qué foto lleva cada página al compartirla | sí            |
| `public/compartir/`      | la imagen para compartir de cada página   | sí            |

**Los originales no se versionan a propósito:** tienen las coordenadas adentro,
así que commitearlos publicaría justo lo que todo esto evita. Guardalos en el
Drive de la empresa — decisión 18.

Y **`contenido/fotos.ts` no se edita a mano.** Se pisa entero en cada corrida.
