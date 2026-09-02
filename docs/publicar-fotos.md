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
│   ├── roller-blackout/
│   │   ├── 1.jpg
│   │   ├── 2.jpg
│   │   └── 3.jpg
│   └── venecianas-de-aluminio/
│       └── 1.jpg
└── proyectos/
    └── casa-en-nordelta/
        ├── 1.jpg
        └── 2.jpg
```

**Tres reglas y ninguna más:**

| Regla                                                    | Por qué                                        |
| -------------------------------------------------------- | ---------------------------------------------- |
| El nombre de la carpeta **es el slug**                   | así se unen las fotos con su producto          |
| El **orden alfabético** es el de la galería              | `1, 2, 10` ordena bien; `a, b, c` también      |
| **La primera es la portada** y conviene que sea vertical | los listados del sitio usan siempre la portada |

Se aceptan `.jpg`, `.png`, `.webp`, `.tif` y **`.heic`** — no hace falta
convertir las del iPhone.

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

Sale algo así:

```
productos/roller-blackout
  1. 1.jpg                        2560×3200  medidas: 480 · 960 · 1600 · 2560
  2. 2.jpg                        1206×2144  medidas: 480 · 960 · 1206
```

**Leé los avisos**, que empiezan con `!`. No cortan la corrida pero suelen
importar — más abajo está qué significa cada uno.

---

## 3. Comprobar que no quedó ninguna coordenada

```bash
npm run fotos:revisar
```

**Este paso no es opcional.** Es el que confirma que ninguna foto publicada
lleva la dirección de la casa de un cliente. Recorre todo `public/fotos/` y
devuelve error si encuentra algo.

Lo que tiene que decir de cada archivo:

```
480.webp
  WebP  66,3 kB  480 × 853
  · Perfil de color ICC (480 bytes)
```

**El perfil de color está bien que quede.** Describe el espacio de color y nada
más; sin él, los colores de las telas se ven apagados. Lo que **no** puede
aparecer es una línea que diga `EXIF`, `XMP`, `IPTC` o `COORDENADAS GPS`.

---

## 4. Escribir el producto o el proyecto

Si es contenido nuevo, agregá el bloque en `contenido/productos.ts`:

```ts
{
  slug: "roller-blackout",
  nombre: "Roller Blackout",
  descripcion: "Es un tipo de cortina enrollable, que puede ser…",
  variantes: ["Manual", "Motorizado"],
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

---

## 5. Publicar

```bash
npm run build
```

Si eso pasa, no falta ningún campo ni hay ningún slug mal escrito. Después:

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

### `no se pudo preparar — Input file contains unsupported image format`

Ese archivo no es una imagen que `sharp` pueda leer, o está dañado. **Las demás
se procesaron igual**: solo hay que resolver esa.

### `quedó sin ninguna foto utilizable`

Ninguna foto de esa carpeta se pudo leer. Suele ser una carpeta con capturas de
pantalla o archivos que no son imágenes.

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

No tiene que ver con las fotos: falta `NEXT_PUBLIC_SITE_URL` en `.env.local`.

---

## Dónde queda cada cosa

| Ruta                 | Qué es                              | ¿Se versiona? |
| -------------------- | ----------------------------------- | ------------- |
| `fotos-originales/`  | los originales, con su EXIF intacto | **no**        |
| `public/fotos/`      | lo que se publica, ya limpio        | sí            |
| `contenido/fotos.ts` | el manifiesto, generado             | sí            |

**Los originales no se versionan a propósito:** tienen las coordenadas adentro,
así que commitearlos publicaría justo lo que todo esto evita. Guardalos en el
Drive de la empresa — decisión 18.

Y **`contenido/fotos.ts` no se edita a mano.** Se pisa entero en cada corrida.
