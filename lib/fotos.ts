import type { Foto, Medio, Video } from "@/contenido/tipos";
import { DENSIDAD_DE_REFERENCIA } from "@/lib/constantes";

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

/* ────────────────────────────────────────────────────────────────────────────
 * El tamaño del módulo sale de la foto, no de su posición — decisión 48
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * ¿Es apaisada?
 *
 * Es lo que decide el **módulo** que le toca en la galería: las apaisadas van
 * al ancho de la columna y las verticales a media columna. No es una
 * preferencia estética sino una consecuencia de la proporción — una vertical a
 * 1024 px de ancho mide 1280 de alto y empuja todo lo demás fuera de la
 * pantalla, y una apaisada a media columna mide 500 × 375 y se lee como una
 * miniatura en vez de como una fotografía.
 *
 * El archivo es mitad y mitad —doce verticales y once apaisadas
 * (`docs/diseno.md`)— así que esto produce una galería de dos anchos de verdad
 * y no una columna disfrazada.
 */
export function esApaisada(foto: Foto): boolean {
  return foto.ancho > foto.alto;
}

/**
 * **El ancho máximo, en píxeles de CSS, al que este medio se puede mostrar sin
 * verse blando.**
 *
 * Es la idea que la dirección «Regla» dejó disponible —que el tamaño del módulo
 * de cada foto salga de una propiedad de la foto y no del orden en que
 * aparece— resuelta con el dato del manifiesto en vez de con la tabla de
 * calidad de `docs/diseno.md`. El porqué de esa elección está en la decisión 48;
 * lo corto es que la tabla es un juicio escrito a mano sobre 23 fotos concretas
 * y el archivo va camino a 300, mientras que esto lo calcula el script a partir
 * del archivo que efectivamente escribió.
 *
 * Hoy muerde en tres medios, y son exactamente los tres que la documentación
 * señala como problema:
 *
 *     toldos/3                  1600 px  →  tope de  800 px de CSS
 *     cortinas-tela/barral/2    1028 px  →  tope de  514 px de CSS
 *     los dos videos            1280 px  →  tope de  640 px de CSS
 *
 * Los tres son apaisados, o sea que el módulo que les toca es el ancho de la
 * columna —1024 px— y el tope los baja. **El aire que queda al lado es la
 * curaduría**: una foto mediana rodeada de papel se lee como una lámina, y la
 * misma foto estirada se lee como un error (`docs/diseno.md`, «La tesis»).
 *
 * Se aplica en dos lugares a la vez y los dos hacen falta: `max-width` en la
 * caja, para que no se estire, y el `sizes` del `<img>`, para que el navegador
 * no descargue un archivo más grande del que va a mostrar.
 */
export function topeDeAncho(medio: Pick<Foto, "ancho">): number {
  return Math.floor(medio.ancho / DENSIDAD_DE_REFERENCIA);
}

/**
 * El `sizes` de una foto, con su tope aplicado a cada tramo.
 *
 * `sizes` y el ancho real de la caja son el mismo dato escrito dos veces, así
 * que el tope tiene que entrar en los dos o el navegador descarga de más. Los
 * tramos se escriben del más ancho al más angosto, como en un `sizes` a mano:
 *
 *     sizesConTope(foto, [
 *       { desde: "1216px", ancho: "1024px" },
 *       { desde: "768px", ancho: "calc(100vw - 6rem)" },
 *       { ancho: "calc(100vw - 2.5rem)" },
 *     ])
 *
 * Sale un `min()` por tramo. Si un navegador no entendiera `min()` dentro de
 * `sizes` —son todos los actuales, pero por las dudas— el tramo queda inválido
 * y el navegador vuelve a suponer `100vw`: descarga la medida más grande de esa
 * foto, que por definición es la que el tope permitía. Se ve igual y pesa un
 * poco más; no se rompe nada.
 */
export function sizesConTope(
  medio: Pick<Foto, "ancho">,
  tramos: { desde?: string; ancho: string }[],
): string {
  const tope = `${topeDeAncho(medio)}px`;
  return tramos
    .map(({ desde, ancho }) => {
      const valor = `min(${ancho}, ${tope})`;
      return desde ? `(min-width: ${desde}) ${valor}` : valor;
    })
    .join(", ");
}

/* ────────────────────────────────────────────────────────────────────────────
 * Video
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * El archivo del video.
 *
 * Vive acá, y no en un `lib/videos.ts` aparte, por la misma razón por la que
 * este archivo existe: **es el único lugar que arma rutas de medios**, y el
 * cuadro de cartel de un video es una imagen. Dos lugares que arman rutas son
 * dos lugares donde una constante del código puede dejar de coincidir con el
 * manifiesto.
 */
/**
 * ¿Este elemento de galería es un video?
 *
 * Por la forma: un video tiene `archivo` y una foto tiene `carpeta`, los dos
 * obligatorios en su tipo. Ver `Medio` en `contenido/tipos.ts`.
 */
export function esVideo(medio: Medio): medio is Video {
  return "archivo" in medio;
}

export function rutaDeVideo(video: Video): string {
  return `/videos/${video.archivo}.${video.formato}`;
}

/**
 * El cuadro de cartel: lo que se ve antes de que el video empiece, y lo único
 * que se ve si nunca empieza —con `prefers-reduced-motion`, o si el navegador
 * bloquea la reproducción automática—.
 *
 * Es el primer cuadro del video, así que cuando arranca no hay salto.
 */
export function rutaDePosterDeVideo(video: Video): string {
  return `/videos/${video.archivo}.${video.formatoPoster}`;
}
