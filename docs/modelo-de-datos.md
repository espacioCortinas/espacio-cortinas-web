# Modelo de datos

PostgreSQL en Supabase. Nombres de tablas y columnas en español, en minúscula y
con guión bajo.

## Diagrama

```
productos ──< producto_variantes
    │
    └──< producto_imagenes

proyectos ──< proyecto_imagenes
```

No hay relación entre productos y proyectos en V1.

## productos

| Columna          | Tipo          | Notas                    |
| ---------------- | ------------- | ------------------------ |
| `id`             | `uuid`        | PK, `gen_random_uuid()`  |
| `nombre`         | `text`        | obligatorio              |
| `slug`           | `text`        | único, obligatorio       |
| `descripcion`    | `text`        | breve, texto plano       |
| `activo`         | `boolean`     | `false` por defecto      |
| `destacado`      | `boolean`     | `false` por defecto      |
| `orden`          | `integer`     | posición en el catálogo  |
| `creado_en`      | `timestamptz` | `now()`                  |
| `actualizado_en` | `timestamptz` | se actualiza por trigger |

## producto_variantes

| Columna       | Tipo      | Notas                                 |
| ------------- | --------- | ------------------------------------- |
| `id`          | `uuid`    | PK                                    |
| `producto_id` | `uuid`    | FK → `productos`, `ON DELETE CASCADE` |
| `nombre`      | `text`    | ej. "Dos paños", "Motorizados"        |
| `orden`       | `integer` |                                       |

Las variantes no tienen descripción, slug ni foto propia. Son una lista de
nombres. Si en el futuro hace falta una foto por variante, se agrega entonces.

## proyectos

| Columna          | Tipo          | Notas                        |
| ---------------- | ------------- | ---------------------------- |
| `id`             | `uuid`        | PK                           |
| `titulo`         | `text`        | obligatorio                  |
| `slug`           | `text`        | único, obligatorio           |
| `ubicacion`      | `text`        | ej. "Nordelta, Buenos Aires" |
| `descripcion`    | `text`        | texto plano                  |
| `activo`         | `boolean`     | `false` por defecto          |
| `destacado`      | `boolean`     | `false` por defecto          |
| `orden`          | `integer`     |                              |
| `creado_en`      | `timestamptz` |                              |
| `actualizado_en` | `timestamptz` |                              |

`ubicacion` es texto libre, no una tabla de localidades. Se muestra como chip.

## producto_imagenes / proyecto_imagenes

Dos tablas separadas, con la misma forma:

| Columna                       | Tipo          | Notas                                         |
| ----------------------------- | ------------- | --------------------------------------------- |
| `id`                          | `uuid`        | PK                                            |
| `producto_id` / `proyecto_id` | `uuid`        | FK, `ON DELETE CASCADE`                       |
| `ruta`                        | `text`        | carpeta dentro del bucket — no un archivo     |
| `medidas`                     | `integer[]`   | qué anchos existen. Ej. `{480,960,1600,2560}` |
| `formato`                     | `text`        | la extensión de los archivos: `webp` o `jpg`  |
| `ancho`                       | `integer`     | de la medida más grande                       |
| `alto`                        | `integer`     | de la medida más grande                       |
| `alt`                         | `text`        | ver más abajo                                 |
| `orden`                       | `integer`     | posición en la galería                        |
| `es_portada`                  | `boolean`     |                                               |
| `creado_en`                   | `timestamptz` |                                               |

### `medidas` y `ruta`

Cada imagen no es un archivo: son **cuatro WebP del mismo original**, generados en
el navegador al subir (480, 960, 1600 y 2560 px de **ancho**) y servidos con
`srcset`. En Cloudflare no hay optimización de imágenes al servir — decisión 25.

Por eso `ruta` guarda la **carpeta**, no el archivo, y el nombre de cada archivo
es su ancho más la extensión que diga `formato`:

```
productos/{producto_id}/{uuid}/480.webp
productos/{producto_id}/{uuid}/960.webp
productos/{producto_id}/{uuid}/1600.webp
productos/{producto_id}/{uuid}/2560.webp
```

**`formato` existe por la misma razón que `medidas`: no adivinar, registrar.**
No todas las fotos son WebP. WebKit no sabe generarlo desde un canvas, y en iOS
todos los navegadores son WebKit, así que lo que se carga desde el teléfono
queda en JPEG y lo que se carga desde una computadora queda en WebP — decisión 35. Dos fotos del mismo proyecto pueden tener formatos distintos, y armar el
nombre del archivo desde una constante del código fallaría con la primera que
no coincida.

**`medidas` existe para no tener que adivinar.** Dos motivos concretos:

- Una foto original de 900 px de ancho no genera la medida de 1600 ni la de
  2560: agrandarla no agrega detalle, solo bytes, y además mentiría en el
  `srcset`. Esa fila tiene `{480,900}` —las medidas fijas que le entran, más
  su propio ancho— y el `srcset` sale con dos entradas.
- Si algún día hace falta un corte nuevo (1200 px, o AVIF), se puede agregar
  **fila por fila**, sin tener que regenerar las 300 fotos de una vez para que el
  sitio no se rompa a la mitad.

Armar el `srcset` a partir de una constante en el código, en vez de leer esta
columna, funcionaría hoy y fallaría con la primera foto chica: el navegador
pediría un archivo que no existe.

**`ancho` y `alto` son los de la medida más grande.** Todas comparten la misma
relación de aspecto, así que con ese par alcanza para reservar el espacio y para
saber la orientación.

**Por qué dos tablas y no una tabla polimórfica** (`entidad` + `entidad_id`): una
tabla polimórfica no puede tener clave foránea real, así que Postgres deja de
garantizar integridad y el borrado en cascada hay que hacerlo a mano. Con solo dos
entidades, la duplicación es mínima y la integridad vale más. El componente de
galería del panel se comparte igual, recibiendo la entidad como parámetro.

**Una sola portada por entidad**, garantizado por índice único parcial:

```sql
create unique index una_portada_por_producto
  on producto_imagenes (producto_id) where es_portada;
```

Si se elimina la imagen de portada, se promueve automáticamente la de menor
`orden`.

**Texto alternativo:** se genera solo al subir, a partir de la entidad
(`"Casa en Nordelta — foto 3"`). Es editable, pero no se pide en el momento de la
carga. Obligar a escribirlo en cada foto haría que se cargue cualquier cosa, que es
peor que un texto generado razonable.

## Slugs

Se generan del nombre o del título al crear: minúsculas, sin tildes, espacios por
guiones. Si ya existe, se agrega un sufijo numérico.

**El slug no se regenera al cambiar el nombre.** Es un campo propio y editable,
pero cambiarlo rompe cualquier enlace ya compartido por WhatsApp. En el panel, el
campo aparece con esa advertencia.

## Activo y destacado

Son independientes:

```
activo = true                    → aparece en /productos o /proyectos
activo = true  y destacado = true → además puede aparecer en Inicio
activo = false                   → no aparece en ningún lado
```

Un elemento inactivo pero destacado no se muestra: `activo` manda.

El tope de Inicio (`PROYECTOS_DESTACADOS_HOME`, `PRODUCTOS_DESTACADOS_HOME`) se
aplica **al consultar**, ordenando por `orden`. No se impone al guardar: se pueden
marcar más destacados de los que entran, y solo aparecen los primeros. Así se puede
reordenar sin tener que desmarcar primero.

## Storage

Un bucket **privado**, `imagenes`. Una carpeta por imagen, y dentro las medidas:

```
imagenes/
├── productos/{producto_id}/{uuid}/{ancho}.webp
└── proyectos/{proyecto_id}/{uuid}/{ancho}.webp
```

Carpetas con UUID, no con el nombre original: los nombres que vienen del teléfono
son inútiles y pueden filtrar información.

**Por qué una carpeta por imagen y no `{uuid}-480.webp` suelto:** borrar una
imagen es borrar un prefijo, no armar cuatro nombres a mano y esperar acertar con
todos. Con la lista de medidas cambiando entre filas, esa diferencia evita
archivos huérfanos.

El bucket es privado y el sitio público sirve las imágenes a través de URLs
firmadas o de una política de lectura acotada. Al eliminar un producto o proyecto,
la cascada borra las filas: **borrar los archivos de Storage es responsabilidad de
la Server Action**, no de la base — y ahora son cuatro archivos por fila.

## Cómo se comprueba que esto es cierto

Las migraciones se aplican a mano (decisión 28), así que este documento y la
base pueden separarse sin que nada avise. La comprobación es un comando:

```
npm run esquema
```

Compara el esquema real contra la foto versionada en `supabase/esquema.txt` y
muestra qué sobra y qué falta. Después de aplicar una migración se corre
`npm run esquema:actualizar` y se commitea el diff junto con el `.sql`.
Decisión 31.

## Datos iniciales

**Ninguno.** Las tablas arrancan vacías. Todo el contenido se carga desde el panel
en la Fase 3, antes de la fase de diseño, para diseñar contra material real.

El catálogo previsto es Cortinas · Roller Blackout · Venecianas · Toldos, pero se
cargan a mano.

## Orientación de las imágenes

`ancho` y `alto` no son solo para reservar espacio: con ellos se sabe la
orientación sin abrir el archivo.

**La portada tiene que ser vertical** (`alto > ancho`). El panel lo valida al
marcar una imagen como portada. Mientras el archivo histórico siga siendo
horizontal, se admite una horizontal recortada a 4:5 en el navegador antes de
subir. Ver `docs/diseno.md`.
