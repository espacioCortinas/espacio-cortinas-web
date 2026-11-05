import type { Video } from "./tipos";

/**
 * ARCHIVO GENERADO — no editar a mano.
 *
 * Lo escribe `scripts/preparar-fotos.mjs` y se pisa entero en cada corrida.
 * Tres clases de clave. `productos/<slug>/<clave de la variante>`: el video
 * documenta una variante motorizada — decisión 40.
 * `productos/<slug>/<clave de la variante>/<nombre>`: uno de los videos del
 * álbum de la variante, y `posicion` es su lugar en la carpeta — decisión 67.
 * `proyectos/<slug>/<nombre del archivo>`: es un elemento de la galería del
 * proyecto, y `posicion` dice en qué lugar va entre las fotos — decisión 51.
 *
 * Va aparte de `fotos.ts` porque la forma es otra y porque quien busca un
 * video tiene que encontrarlo en un archivo que se llame así.
 */
export const videos: Record<string, Video> = {
  "productos/cortinas-tela/blackout/video-1": {
    archivo: "cortinas-tela/blackout/video-1",
    formato: "mp4",
    formatoPoster: "webp",
    ancho: 1280,
    alto: 720,
    duracion: 16,
    posicion: 6,
  },
  "productos/cortinas-tela/blackout/video-2": {
    archivo: "cortinas-tela/blackout/video-2",
    formato: "mp4",
    formatoPoster: "webp",
    ancho: 720,
    alto: 1280,
    duracion: 10,
    posicion: 7,
  },
  "productos/cortinas-tela/blackout/video-3": {
    archivo: "cortinas-tela/blackout/video-3",
    formato: "mp4",
    formatoPoster: "webp",
    ancho: 720,
    alto: 1280,
    duracion: 14,
    posicion: 8,
  },
  "productos/cortinas-tela/riel-motorizado": {
    archivo: "cortinas-tela/riel-motorizado",
    formato: "mp4",
    formatoPoster: "webp",
    ancho: 710,
    alto: 1076,
    duracion: 11,
  },
  "productos/roller/blackout/video-1": {
    archivo: "roller/blackout/video-1",
    formato: "mp4",
    formatoPoster: "webp",
    ancho: 1080,
    alto: 608,
    duracion: 12,
    posicion: 4,
  },
  "productos/roller/blackout/video-2": {
    archivo: "roller/blackout/video-2",
    formato: "mp4",
    formatoPoster: "webp",
    ancho: 720,
    alto: 1280,
    duracion: 11,
    posicion: 5,
  },
  "productos/roller/screen/video-3": {
    archivo: "roller/screen/video-3",
    formato: "mp4",
    formatoPoster: "webp",
    ancho: 1280,
    alto: 720,
    duracion: 12,
    posicion: 9,
  },
  "productos/roller/screen/video-4": {
    archivo: "roller/screen/video-4",
    formato: "mp4",
    formatoPoster: "webp",
    ancho: 1280,
    alto: 720,
    duracion: 23,
    posicion: 10,
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
