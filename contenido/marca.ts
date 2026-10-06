/**
 * ARCHIVO GENERADO por `scripts/preparar-marca.mjs`. NO SE EDITA A MANO:
 * se pisa entero en cada corrida.
 *
 * Las medidas se leen de acá y no se escriben en el código, por la misma razón
 * que las de las fotos: son un dato del archivo que se generó, no una cuenta
 * que alguien pueda hacer mal. Con `ancho` y `alto` el navegador reserva el
 * espacio del logo antes de descargarlo y el encabezado no salta.
 */

export type ArchivoDeMarca = {
  /** Ruta pública, para usar tal cual en `src`. */
  ruta: string;
  ancho: number;
  alto: number;
};

/**
 * El logo, sin fondo: el de la banda de las imágenes para compartir, el de la
 * ficha de negocio local y el chico del `srcset` de la apertura de Inicio.
 *
 * Las imágenes para compartir no están acá: son una foto por página, en
 * `contenido/imagenes-para-compartir.ts` — decisión 63.
 */
export const logo: ArchivoDeMarca = {
  ruta: "/marca/logo.png",
  ancho: 600,
  alto: 186,
};

/**
 * El mismo logo, al doble, para el bloque de la apertura de Inicio: ahí se ve
 * de hasta 416 px de ancho.
 */
export const logoGrande: ArchivoDeMarca = {
  ruta: "/marca/logo-grande.png",
  ancho: 1200,
  alto: 372,
};

/**
 * El logo circular, para el encabezado de todas las páginas menos Inicio, en
 * el lugar del enlace «Inicio».
 */
export const logoCirculo: ArchivoDeMarca = {
  ruta: "/marca/logo-circulo.png",
  ancho: 96,
  alto: 96,
};

/** El mismo, para las pantallas de triple densidad. */
export const logoCirculoGrande: ArchivoDeMarca = {
  ruta: "/marca/logo-circulo-grande.png",
  ancho: 144,
  alto: 144,
};
