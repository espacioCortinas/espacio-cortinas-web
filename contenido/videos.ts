import type { Video } from "./tipos";

/**
 * ARCHIVO GENERADO — no editar a mano.
 *
 * Lo escribe `scripts/preparar-fotos.mjs` y se pisa entero en cada corrida.
 * La clave es `<entidad>/<slug>/<clave de la variante>`: un video documenta
 * una variante motorizada y no un producto — decisión 40.
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
};
