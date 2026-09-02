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
├── fotos.ts          GENERADO por scripts/preparar-fotos.mjs
├── tipos.ts          la forma de todo lo anterior
└── index.ts          une el contenido con sus fotos, y es lo que leen las páginas

public/fotos/         las imágenes ya recomprimidas, generadas
fotos-originales/     los originales. NO se versiona
```

**Lo escrito a mano y lo generado nunca comparten archivo.** Si estuvieran
juntos, regenerar las fotos pisaría los textos. Se juntan al leer, en
`contenido/index.ts`, por el slug.

## Por qué TypeScript y no JSON

Esto se edita a mano, así que conviene que el editor autocomplete y que `tsc`
frene el build si falta un campo, si un booleano está mal escrito o si algo
apunta a una carpeta que no existe. Con JSON esos errores no aparecen hasta que
alguien visita la página.

## Producto

| Campo         | Tipo       | Notas                                              |
| ------------- | ---------- | -------------------------------------------------- |
| `slug`        | `string`   | la parte final del enlace, y la clave de las fotos |
| `nombre`      | `string`   |                                                    |
| `descripcion` | `string`   | breve, texto plano                                 |
| `variantes`   | `string[]` | solo nombres. Ej. `["Dos paños", "Motorizado"]`    |
| `activo`      | `boolean`  |                                                    |
| `destacado`   | `boolean`  |                                                    |

Las variantes **no** son productos independientes: `Toldos motorizados` es una
variante de `Toldos`, no una entrada más del catálogo. No tienen descripción,
slug ni foto propia.

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

## Fotos

`contenido/fotos.ts` es un mapa de `<entidad>/<slug>` a una lista de fotos:

```ts
"productos/roller-blackout": [
  { carpeta: "productos/roller-blackout/1", medidas: [480, 960, 1600, 2560], ancho: 2560, alto: 3200 },
]
```

| Campo     | Notas                                                     |
| --------- | --------------------------------------------------------- |
| `carpeta` | dentro de `public/fotos/`. Adentro, un archivo por medida |
| `medidas` | qué anchos existen de verdad para esta foto               |
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
/>
```

**El optimizador de `next/image` no se usa.** Los tamaños ya están generados; en
Cloudflare, dejarlo activo gastaría cuota de Transformations rehaciendo un
trabajo hecho — decisión 25.

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
2. `npm run fotos` — recorta, redimensiona, borra los metadatos y reescribe
   `contenido/fotos.ts`.
3. `npm run fotos:revisar` — comprueba que ninguna conserve GPS. **No es
   opcional**: son fotos de casas de clientes. Ver `docs/seguridad.md`.
4. Se agrega o edita el bloque en `contenido/productos.ts` o `proyectos.ts`.
5. `npm run build` para que `tsc` valide, y `git push`.

El cambio tarda lo que tarde el build: entre 2 y 9 minutos.

## Copias de seguridad

Todo el contenido está en git, con historial. **Los originales de las fotos no**:
viven en el Drive de la empresa, porque lo que se publica está recomprimido y
sin metadatos y de ahí no se recupera el original — decisión 18.
