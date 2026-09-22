import type { Video } from "./tipos";

/**
 * ARCHIVO GENERADO — no editar a mano.
 *
 * Lo escribe `scripts/preparar-fotos.mjs` y se pisa entero en cada corrida.
 * Dos clases de clave. `productos/<slug>/<clave de la variante>`: el video
 * documenta una variante motorizada — decisión 40.
 * `proyectos/<slug>/<nombre del archivo>`: es un elemento de la galería del
 * proyecto, y `posicion` dice en qué lugar va entre las fotos — decisión 51.
 *
 * Va aparte de `fotos.ts` porque la forma es otra y porque quien busca un
 * video tiene que encontrarlo en un archivo que se llame así.
 */
export const videos: Record<string, Video> = {
  "productos/cortinas-tela/riel-motorizado": {
    archivo: "cortinas-tela/riel-motorizado",
    formato: "mp4",
    formatoPoster: "webp",
    ancho: 1280,
    alto: 720,
    duracion: 11,
  },
  "productos/roller/motorizado": {
    archivo: "roller/motorizado",
    formato: "mp4",
    formatoPoster: "webp",
    ancho: 1280,
    alto: 720,
    duracion: 11,
  },
  "proyectos/cowork-nordelta/7": {
    archivo: "proyectos/cowork-nordelta/7",
    formato: "mp4",
    formatoPoster: "webp",
    ancho: 1280,
    alto: 720,
    duracion: 15,
    posicion: 7,
  },
  "proyectos/cowork-nordelta/8": {
    archivo: "proyectos/cowork-nordelta/8",
    formato: "mp4",
    formatoPoster: "webp",
    ancho: 720,
    alto: 1280,
    duracion: 22,
    posicion: 8,
  },
};
