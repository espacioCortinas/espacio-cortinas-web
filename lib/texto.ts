/**
 * Slugs y textos derivados.
 *
 * Sin `server-only`: no hay nada secreto acá y lo usan las páginas públicas,
 * que se renderizan en el build.
 */

/**
 * Convierte un nombre en un slug: minúsculas, sin tildes, espacios por guiones.
 *
 * **Hoy no la usa nadie, y está bien que siga acá.** Desde que se sacó el panel
 * los slugs se escriben a mano en `contenido/productos.ts` y en
 * `contenido/proyectos.ts` (docs/modelo-de-datos.md), así que ya no hay ningún
 * momento en que se genere uno solo. Queda como la regla escrita de cómo se
 * escribe un slug de este proyecto, que es lo que hay que respetar al agregar
 * contenido a mano.
 *
 * **Y no se regenera al cambiar el nombre** — decisión 10: cambiar un slug
 * rompe todos los enlaces ya compartidos por WhatsApp, que es justamente por
 * donde se comparte este sitio.
 */
export function aSlug(texto: string): string {
  return (
    texto
      .normalize("NFD")
      // Marcas diacríticas: es lo que separa `NFD` de la letra base. Así
      // «Cortinás» y «Cortinas» dan el mismo slug en vez de uno con basura.
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      // La eñe la come el paso anterior (queda «n»), y está bien: una URL con
      // caracteres no ASCII se comparte mal por mensajería.
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80)
      .replace(/-+$/, "")
  );
}

/**
 * Texto alternativo automático: `"Casa en Nordelta — foto 3"`.
 *
 * Se genera solo y no se pide al cargar. Obligar a escribirlo en cada foto
 * haría que se cargue cualquier cosa —«imagen», «foto», «asd»— que es peor
 * para un lector de pantalla que un texto generado razonable. Por eso no hay
 * campo `alt` en el manifiesto — docs/modelo-de-datos.md.
 *
 * La posición es la de la galería, empezando en 1: la foto 1 es la portada.
 */
export function altAutomatico(nombreDeLaEntidad: string, posicion: number) {
  return `${nombreDeLaEntidad.trim()} — foto ${posicion}`;
}

/**
 * Lo que va al lado de un video que arranca solo y no tiene controles: no hay
 * otra forma de saber cuánto dura ni que no hay audio que encender. El número
 * sale del manifiesto.
 */
export function leyendaDeVideo(video: { duracion: number }): string {
  return `Video de ${video.duracion} segundos, en bucle y sin sonido.`;
}

/**
 * Recorta un texto para mostrarlo en un listado, sin cortar una palabra por la
 * mitad ni dejar un espacio antes de los puntos suspensivos.
 */
export function recortar(texto: string, largo: number): string {
  const limpio = texto.trim();
  if (limpio.length <= largo) return limpio;
  const corte = limpio.slice(0, largo);
  const ultimoEspacio = corte.lastIndexOf(" ");
  return `${(ultimoEspacio > largo * 0.6 ? corte.slice(0, ultimoEspacio) : corte).trimEnd()}…`;
}
