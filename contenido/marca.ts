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
 * El logo, sin fondo, para el encabezado.
 *
 * La imagen para compartir ya no está acá: es una foto por página, en
 * `contenido/imagenes-para-compartir.ts` — decisión 63.
 */
export const logo: ArchivoDeMarca = {
  ruta: "/marca/logo.png",
  ancho: 600,
  alto: 186,
};
