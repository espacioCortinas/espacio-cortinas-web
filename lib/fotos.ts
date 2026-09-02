import type { Foto } from "@/contenido/tipos";

/**
 * Cómo se sirve una foto.
 *
 * **Todo lo de acá sale del manifiesto, nunca de una constante del código.**
 * Es la regla más fácil de romper del proyecto y la que falla en silencio:
 * `MEDIDAS_IMAGEN` de `lib/constantes.ts` dice qué anchos INTENTA generar el
 * script, no cuáles existen de una foto concreta. Una foto de 1206 px de ancho
 * tiene tres medidas y no cuatro, y armar el `srcset` con la constante haría
 * que el navegador pida `2560.webp` de una carpeta donde no está.
 *
 * Decisiones 32 (las medidas son anchos y se leen por foto) y 37 (el formato
 * también se lee por foto).
 */

/** El archivo de una medida concreta: `/fotos/productos/roller/1/960.webp`. */
export function rutaDeFoto(foto: Foto, ancho: number): string {
  return `/fotos/${foto.carpeta}/${ancho}.${foto.formato}`;
}

/**
 * El `srcset`, con un candidato por medida que existe de verdad.
 *
 * El descriptor `w` es el ancho real del archivo, que es también su nombre —
 * por eso el script comprueba que coincidan en vez de confiar (decisión 32).
 */
export function srcSetDe(foto: Foto): string {
  return foto.medidas
    .map((ancho) => `${rutaDeFoto(foto, ancho)} ${ancho}w`)
    .join(", ");
}

/**
 * La medida del atributo `src`, que es la que reciben los pocos clientes que
 * ignoran `srcset` — hoy, sobre todo los bots de previsualización de enlaces.
 *
 * Se elige la más grande que no pase de 1600: mandarles la de 2560 sería
 * hacerles descargar de más, y la más chica se ve mal como miniatura de
 * WhatsApp. Si la foto es tan chica que ninguna entra, se usa la única que hay.
 */
export function medidaPredeterminada(foto: Foto): number {
  const razonables = foto.medidas.filter((ancho) => ancho <= 1600);
  return razonables.length > 0
    ? Math.max(...razonables)
    : Math.min(...foto.medidas);
}

/** La URL absoluta de una medida, para Open Graph y datos estructurados. */
export function urlAbsolutaDeFoto(
  foto: Foto,
  ancho: number,
  urlSitio: string,
): string {
  return `${urlSitio}${rutaDeFoto(foto, ancho)}`;
}

/**
 * La portada: siempre la primera del arreglo.
 *
 * No hay campo que la marque. El orden del arreglo es el de la galería y el
 * primero es la portada — así, reordenar es mover un archivo de lugar en
 * `fotos-originales/` y no editar un dato. Devuelve `null` cuando la entidad
 * todavía no tiene fotos, que hoy es el caso de todas: la galería vacía es
 * información, no un error.
 */
export function portadaDe(fotos: Foto[]): Foto | null {
  return fotos[0] ?? null;
}
