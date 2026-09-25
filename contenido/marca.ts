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
 * La imagen que se ve al pegar en WhatsApp un enlace que no tiene imagen
 * propia: Inicio, los dos listados y Contacto.
 */
export const og: ArchivoDeMarca = {
  ruta: "/marca/og.jpg",
  ancho: 1200,
  alto: 630,
};

/**
 * La imagen de Open Graph de cada producto y cada proyecto: la misma
 * composición que `og`, con su portada. La clave es la de `fotos.ts`,
 * `<entidad>/<slug>`. Una página que no está acá usa `og` — decisión 59.
 */
export const ogPorPagina: Record<string, ArchivoDeMarca> = {
  "productos/bandas-verticales": {
    ruta: "/og/productos/bandas-verticales.jpg",
    ancho: 1200,
    alto: 630,
  },
  "productos/compacta-blackout": {
    ruta: "/og/productos/compacta-blackout.jpg",
    ancho: 1200,
    alto: 630,
  },
  "productos/cortinas-tela": {
    ruta: "/og/productos/cortinas-tela.jpg",
    ancho: 1200,
    alto: 630,
  },
  "productos/roller": {
    ruta: "/og/productos/roller.jpg",
    ancho: 1200,
    alto: 630,
  },
  "productos/toldos": {
    ruta: "/og/productos/toldos.jpg",
    ancho: 1200,
    alto: 630,
  },
  "productos/venecianas-madera": {
    ruta: "/og/productos/venecianas-madera.jpg",
    ancho: 1200,
    alto: 630,
  },
  "productos/venecianas-pvc": {
    ruta: "/og/productos/venecianas-pvc.jpg",
    ancho: 1200,
    alto: 630,
  },
  "proyectos/cowork-nordelta": {
    ruta: "/og/proyectos/cowork-nordelta.jpg",
    ancho: 1200,
    alto: 630,
  },
};
