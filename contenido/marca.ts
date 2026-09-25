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

/** El logo, sin fondo, para el encabezado. */
export const logo: ArchivoDeMarca = {
  ruta: "/marca/logo.png",
  ancho: 504,
  alto: 145,
};

/**
 * La imagen que se ve al pegar un enlace del sitio en WhatsApp: el logo
 * centrado sobre el papel. Una sola para todas las páginas — decisión 62.
 */
export const og: ArchivoDeMarca = {
  ruta: "/marca/og-logo.jpg",
  ancho: 1200,
  alto: 630,
};
