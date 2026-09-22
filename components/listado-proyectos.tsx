import { TarjetaProyecto } from "@/components/tarjeta-proyecto";
import type { ConFotos, Proyecto } from "@/contenido/tipos";

/**
 * La lista de proyectos, pensada para uno y para veinte — decisión 52.
 *
 * # El problema
 *
 * Hoy hay un proyecto. **Una grilla pensada para muchos se ve rota con uno**:
 * una tarjeta de un tercio de ancho y dos tercios de papel vacío al lado se
 * leen como algo que no terminó de cargar. **Una composición pensada para uno
 * no escala**: veinte filas como las del catálogo, con la foto al costado y la
 * descripción, son del orden de 14.000 px de página en escritorio —el catálogo
 * de siete ya mide 5.900 (decisión 49)—.
 *
 * # La regla
 *
 * **El primero del arreglo va en fila; todos los demás, en grilla.**
 *
 *     1 proyecto     una fila: portada al costado, título, ubicación,
 *                    descripción y «Ver el proyecto». Es exactamente la fila de
 *                    /productos, así que con uno la página no se ve a medio
 *                    hacer: se ve igual que el catálogo
 *     2 a 20         la fila, y debajo una grilla de tarjetas —portada 4:5,
 *                    título y chip— de una columna en teléfono, dos desde 640 y
 *                    tres desde 1024
 *
 * **La fila no es decorativa: es la apertura del portfolio**, y cuál abre lo
 * decide el orden de `contenido/proyectos.ts`, que es donde ya se decide todo
 * el orden del sitio. Con veinte, la página queda en una fila más siete
 * renglones de tres: **5.751 px a 1440**, medido con copias temporales —lo
 * mismo que el catálogo de siete—. A 375, donde las tarjetas van de a una,
 * 12.491 px: dos columnas en teléfono dejan 155 px por tarjeta, y el chip de
 * ubicación, que no parte línea, no entra.
 *
 * **Lo que queda imperfecto, y está asumido:** con dos proyectos, la grilla
 * tiene una sola tarjeta. Es un estado de paso —el tercero la completa en
 * teléfono y tablet— y es preferible a una regla que cambie de forma según
 * cuántos haya, que es la clase de cosa que nadie recuerda por qué pasa. Un
 * último renglón incompleto en una grilla de muchos es normal; en una grilla de
 * uno es lo que se ve roto, y eso es lo que la fila evita.
 *
 * # Por qué la tarjeta de la grilla es más chica que la foto de la fila
 *
 * Tres columnas dan 325 px a 1440 de ancho; la fila, 416. Si fueran dos
 * columnas, cada tarjeta mediría 488 y el proyecto de apertura tendría la
 * portada más chica de la página, que es la jerarquía al revés.
 *
 * Es una sola `<ul>`: son N proyectos, no uno más una lista aparte. El primer
 * `<li>` ocupa todas las columnas.
 */

/**
 * El ancho de una tarjeta de la grilla, del lado del navegador. **Es el mismo
 * dato que las columnas de abajo**, así que cambian juntos:
 *
 *     ≥ 1024   (100vw − 96 de margen − 2 × 24 de hueco) / 3, con tope en
 *              (1024 − 48) / 3 = 325 cuando la columna llega a su máximo
 *     ≥ 768    (100vw − 96 − 24) / 2
 *     ≥ 640    (100vw − 40 − 24) / 2
 *     < 640    el ancho de la columna
 */
const SIZES_TARJETA =
  "(min-width: 1024px) min(calc((100vw - 9rem) / 3), 325px), " +
  "(min-width: 768px) calc((100vw - 7.5rem) / 2), " +
  "(min-width: 640px) calc((100vw - 4rem) / 2), " +
  "calc(100vw - 2.5rem)";

export function ListadoProyectos({
  proyectos,
  nivel,
  prioridad = false,
}: {
  proyectos: ConFotos<Proyecto>[];
  /** El nivel de los títulos: `2` en `/proyectos`, `3` en Inicio. */
  nivel: 2 | 3;
  /** Si la portada del primero es lo primero que se ve en la página. */
  prioridad?: boolean;
}) {
  if (proyectos.length === 0) return null;

  return (
    <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {proyectos.map((proyecto, i) =>
        i === 0 ? (
          <li
            key={proyecto.slug}
            // El mismo filete de 1 px arriba y abajo que las filas del
            // catálogo: es lo que separa la apertura de la grilla sin agregar
            // un recurso. Sin grilla debajo, cierra la lista igual.
            className="border-linea border-y py-10 sm:col-span-2 md:py-16 lg:col-span-3"
          >
            <TarjetaProyecto
              proyecto={proyecto}
              forma="fila"
              nivel={nivel}
              prioridad={prioridad}
            />
          </li>
        ) : (
          <li key={proyecto.slug}>
            <TarjetaProyecto
              proyecto={proyecto}
              forma="tarjeta"
              nivel={nivel}
              sizes={SIZES_TARJETA}
            />
          </li>
        ),
      )}
    </ul>
  );
}
