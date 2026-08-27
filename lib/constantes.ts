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
 * Calidad del WebP. 0,82 es el punto donde una foto de interiores deja de
 * mejorar de forma perceptible y sigue engordando el archivo.
 */
export const IMAGEN_CALIDAD_WEBP = 0.82;

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

/** Lo único que se sube: todo se recomprime a WebP antes de salir del navegador. */
export const TIPO_SUBIDO = "image/webp";

/** Relación de aspecto de las portadas: vertical 4:5 — decisión 14. */
export const PORTADA_RELACION = 4 / 5;

/** El bucket privado de Storage. */
export const BUCKET = "imagenes";
