/**
 * Slugs y textos derivados.
 *
 * Sin `server-only`: lo usa la Server Action al crear, y también el formulario
 * del panel para mostrar cómo va a quedar la URL mientras se escribe el
 * nombre. No hay nada secreto acá.
 */

/**
 * Convierte un nombre en un slug: minúsculas, sin tildes, espacios por guiones.
 *
 * **El slug no se regenera al cambiar el nombre** — decisión 10. Esta función
 * corre una sola vez, al crear. Después el campo es propio y editable a mano,
 * con la advertencia puesta en el formulario: cambiarlo rompe todos los
 * enlaces ya compartidos por WhatsApp, que es justamente por donde se comparte
 * este sitio.
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
 * para un lector de pantalla que un texto generado razonable. Es editable
 * desde la galería del panel para cuando valga la pena — docs/modelo-de-datos.md.
 */
export function altAutomatico(nombreDeLaEntidad: string, posicion: number) {
  return `${nombreDeLaEntidad.trim()} — foto ${posicion}`;
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
