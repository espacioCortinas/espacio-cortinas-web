/**
 * Topes y límites del sistema.
 *
 * No hay pantalla de configuración en V1: agregar una tercera sección al panel
 * solo para cambiar un número es desproporcionado (decisión 9). Se cambian acá
 * y se despliega.
 */

/** Cuántos proyectos destacados muestra el Inicio. */
export const PROYECTOS_DESTACADOS_HOME = 6;

/** Cuántos productos destacados muestra el Inicio. */
export const PRODUCTOS_DESTACADOS_HOME = 4;

/**
 * Los anchos, en píxeles, que el navegador genera de cada foto al subirla.
 *
 * **Son anchos, no «lado mayor».** La diferencia importa y la documentación
 * llegó a decir las dos cosas: el descriptor `w` de un `srcset` es el ancho
 * real del archivo, así que si `1600.webp` no midiera 1600 de ancho, el
 * navegador elegiría mal el tamaño en cada pantalla. El ejemplo de `srcset` de
 * docs/arquitectura.md ya estaba escrito así (`width="1600" height="2000"`) y
 * docs/modelo-de-datos.md también («el nombre de cada archivo es su ancho»);
 * lo que estaba mal escrito era «px de lado mayor» en la decisión 25.
 *
 * **Están congelados para la V1.** Agregar un corte nuevo obliga a regenerar
 * las fotos ya cargadas, y por eso cada fila registra en la columna `medidas`
 * cuáles existen de verdad para ella — decisión 25.
 */
export const MEDIDAS_IMAGEN = [480, 960, 1600, 2560] as const;

/** Ancho máximo, en píxeles, al que se redimensiona una foto antes de subirla. */
export const IMAGEN_LADO_MAXIMO = 2560;

/** Peso máximo aceptado, en MB, antes de comprimir en el navegador. */
export const IMAGEN_PESO_MAXIMO_MB = 8;

/**
 * Qué se acepta que la administradora elija del carrete.
 *
 * Se valida en el navegador (comodidad), en la Server Action antes de firmar
 * (seguridad) y en el propio bucket (lo único que no se puede saltear).
 * HEIC queda afuera: es lo que sacan los iPhone por defecto, pero el navegador
 * no lo sabe decodificar y el mensaje de error del panel explica qué hacer.
 */
export const TIPOS_DE_IMAGEN_ACEPTADOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/**
 * En qué formato sale la foto recomprimida, **en orden de preferencia**.
 *
 * No es una sola opción y esa es la parte que hay que entender: **WebKit no
 * sabe generar WebP desde un canvas.** `toBlob("image/webp")` no falla — le
 * devuelve un PNG y sigue como si nada. Y en iOS todos los navegadores son
 * WebKit (Chrome y Firefox en iPhone son Safari por dentro), así que el
 * teléfono desde el que se va a cargar la mayoría de las fotos no puede
 * producir un solo WebP.
 *
 * Entonces se usa el mejor que cada navegador sepa generar de verdad, y cada
 * fila registra cuál le tocó — decisión 35. La calidad del JPEG es más baja a
 * propósito: 0,75 en JPEG se ve como 0,82 en WebP y pesa apenas un 10-17% más,
 * en vez del 30-40% que costaría a igual número.
 *
 * `extension` es literalmente lo que va en el nombre del archivo y lo que se
 * guarda en la columna `formato`, para que armar la ruta sea concatenar y no
 * traducir.
 */
export const FORMATOS_DE_SUBIDA = [
  { tipo: "image/webp", extension: "webp", calidad: 0.82 },
  { tipo: "image/jpeg", extension: "jpg", calidad: 0.75 },
] as const;

/** `webp` o `jpg`. Es lo que se guarda en la columna `formato`. */
export type FormatoDeImagen = (typeof FORMATOS_DE_SUBIDA)[number]["extension"];

export const EXTENSIONES_VALIDAS: readonly string[] = FORMATOS_DE_SUBIDA.map(
  (f) => f.extension,
);

export const TIPOS_SUBIBLES: readonly string[] = FORMATOS_DE_SUBIDA.map(
  (f) => f.tipo,
);

/** Relación de aspecto de las portadas: vertical 4:5 — decisión 14. */
export const PORTADA_RELACION = 4 / 5;

/** El bucket privado de Storage. */
export const BUCKET = "imagenes";
