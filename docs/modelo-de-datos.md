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

| Columna                       | Tipo          | Notas                                           |
| ----------------------------- | ------------- | ----------------------------------------------- |
| `id`                          | `uuid`        | PK                                              |
| `producto_id` / `proyecto_id` | `uuid`        | FK, `ON DELETE CASCADE`                         |
| `ruta`                        | `text`        | ruta dentro del bucket de Storage               |
| `ancho`                       | `integer`     | necesario para reservar espacio y evitar saltos |
| `alto`                        | `integer`     |                                                 |
| `alt`                         | `text`        | ver más abajo                                   |
| `orden`                       | `integer`     | posición en la galería                          |
| `es_portada`                  | `boolean`     |                                                 |
| `creado_en`                   | `timestamptz` |                                                 |

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

Un bucket **privado**, `imagenes`:

```
imagenes/
├── productos/{producto_id}/{uuid}.webp
└── proyectos/{proyecto_id}/{uuid}.webp
```

Nombres de archivo con UUID, no con el nombre original: los nombres que vienen del
teléfono son inútiles y pueden filtrar información.

El bucket es privado y el sitio público sirve las imágenes a través de URLs
firmadas o de una política de lectura acotada. Al eliminar un producto o proyecto,
la cascada borra las filas: **borrar los archivos de Storage es responsabilidad de
la Server Action**, no de la base.

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
