import { FotoImg } from "@/components/foto";
import type { Foto } from "@/contenido/tipos";
import { esApaisada, sizesConTope, topeDeAncho } from "@/lib/fotos";
import { altAutomatico } from "@/lib/texto";

/**
 * Una galería de fotos que mezcla orientaciones y le da a cada una el tamaño
 * que sus píxeles aguantan.
 *
 * # El tamaño del módulo sale de la foto, no de su posición
 *
 * Es la idea que la dirección «Regla» dejó disponible —decisión 43— resuelta
 * con los datos del manifiesto en vez de con la tabla de calidad de
 * `docs/diseno.md`. El porqué de esa elección está en la decisión 48. Son dos
 * reglas y las dos salen de `contenido/fotos.ts`:
 *
 * **1. La orientación elige el módulo.** Apaisada al ancho de la columna,
 * vertical a media columna. No es gusto: una vertical a 1024 px de ancho mide
 * 1280 de alto y empuja el resto de la página fuera de la pantalla, y una
 * apaisada a media columna mide 500 × 375 y se lee como una miniatura. El
 * archivo es mitad y mitad —doce verticales y once apaisadas— así que esto
 * produce una galería de dos anchos de verdad y no una columna disfrazada.
 *
 * **2. `topeDeAncho()` lo baja si los píxeles no dan.** Ninguna foto se muestra
 * más ancha que sus píxeles divididos por dos. Hoy muerde en las dos que la
 * documentación señala como problema:
 *
 *     toldos/3                1600 px → 800 px de CSS, en un módulo de 1024
 *     cortinas-tela/barral/2  1028 px → 514 px de CSS, en un módulo de 1024
 *
 * **El aire que queda al lado es la curaduría.** Una foto mediana rodeada de
 * papel se lee como una lámina; la misma foto estirada se lee como un error
 * (`docs/diseno.md`, «La tesis»). Que `toldos/3` no salga nunca del módulo
 * chico deja de ser una limitación y pasa a ser una decisión editorial, que es
 * exactamente lo que «Regla» perseguía.
 *
 * # Lo que NO hace
 *
 * **No recorta ninguna foto.** `proporcion="propia"`: cada una conserva la
 * suya, porque una galería que supone un formato se rompe la mitad de las veces
 * en este archivo. El recorte a 4:5 es cosa de las portadas y de los listados.
 *
 * **No pone texto encima de ninguna foto**, nunca — `docs/diseno.md`.
 */

/**
 * En teléfono todo ocupa el ancho de la columna: a 375 px de ancho, una foto
 * son 335 px de CSS, o sea 670 de archivo, y la más chica del catálogo tiene
 * 1028. El módulo solo existe de 768 para arriba.
 */
const TRAMOS_ANCHO = [
  // Arriba de 1216 el contenedor ya está topeado en 1120 y el margen es de 48,
  // así que la columna mide 1024 y no crece más.
  { desde: "1216px", ancho: "1024px" },
  { desde: "768px", ancho: "calc(100vw - 6rem)" },
  { ancho: "calc(100vw - 2.5rem)" },
];

/**
 * Media columna, descontando el hueco de 24 px de la grilla. Es el mismo dato
 * que `gap-6` y `md:grid-cols-2` de abajo, escrito dos veces: si se separan, el
 * navegador descarga de más en el teléfono o de menos en el escritorio.
 */
const TRAMOS_MEDIO = [
  { desde: "1216px", ancho: "500px" },
  { desde: "768px", ancho: "calc((100vw - 7.5rem) / 2)" },
  { ancho: "calc(100vw - 2.5rem)" },
];

export function Galeria({
  fotos,
  nombre,
  desde = 1,
  prioridad = false,
}: {
  fotos: Foto[];
  /** Para el texto alternativo: «Roller — foto 3». */
  nombre: string;
  /**
   * La posición de la primera foto de este arreglo dentro de la galería
   * completa, empezando en 1.
   *
   * Existe porque la página de producto muestra la portada arriba y manda acá
   * el resto: la primera de este arreglo es la foto 2 del producto, y el texto
   * alternativo tiene que decir «foto 2» y no «foto 1» — es la misma
   * numeración que ve el visitante.
   */
  desde?: number;
  /** La primera foto de la página, si esta galería es lo primero que se ve. */
  prioridad?: boolean;
}) {
  if (fotos.length === 0) return null;

  return (
    /*
     * Dos columnas desde 768, y las apaisadas ocupan las dos. Es una grilla y
     * no un `flex` con envoltura porque las verticales tienen que quedar
     * alineadas entre sí; `items-start` es lo que deja que cada una conserve su
     * alto en vez de estirarse hasta el de su vecina.
     */
    <ul className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
      {fotos.map((foto, i) => {
        const ancha = esApaisada(foto);
        const tope = topeDeAncho(foto);

        return (
          <li
            key={foto.carpeta}
            className={ancha ? "md:col-span-2" : undefined}
            /*
             * El tope, aplicado a la caja. Sin esto la foto se estira hasta el
             * ancho del módulo y se ve blanda; con esto se queda en lo que sus
             * píxeles dan y el resto queda en papel.
             *
             * Va en el `<li>` y no en la foto para que el hueco de la grilla lo
             * respete: la caja mide lo que la foto puede, y lo que sobra es
             * margen de la celda.
             */
            style={{ maxWidth: `${tope}px` }}
          >
            <FotoImg
              foto={foto}
              alt={altAutomatico(nombre, desde + i)}
              // El mismo tope otra vez, ahora del lado del navegador: si el
              // `sizes` no lo tuviera, descargaría un archivo más grande del
              // que va a mostrar.
              sizes={sizesConTope(foto, ancha ? TRAMOS_ANCHO : TRAMOS_MEDIO)}
              prioridad={prioridad && i === 0}
            />
          </li>
        );
      })}
    </ul>
  );
}
