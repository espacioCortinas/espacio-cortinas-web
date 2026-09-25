import type { Metadata } from "next";

import { og } from "@/contenido/marca";
import { entornoPublico } from "@/lib/entorno";

/**
 * La metadata de cada página pública: título, descripción, canónica y Open
 * Graph, armados en un solo lugar.
 *
 * **Por qué esto es lo primero que se construye y no un adorno del final.** El
 * sitio se comparte por WhatsApp e Instagram, y los bots que arman la
 * previsualización de un enlace no ejecutan JavaScript: leen el HTML crudo. Si
 * cada producto no trae su propio título, su descripción y su miniatura, todos
 * los enlaces del sitio se ven iguales al pegarlos en un chat — que es
 * exactamente el motivo por el que este proyecto usa Next y no un SPA
 * (decisión 1).
 */

/** El nombre que acompaña a cada título en una previsualización de enlace. */
const MARCA = "Espacio Cortinas";

/**
 * Descripción de reserva.
 *
 * Sale del posicionamiento escrito en docs/producto.md, no de una frase
 * inventada acá.
 */
export const DESCRIPCION_SITIO =
  "Cortinas, rollers, venecianas y toldos a medida, con asesoramiento y " +
  "colocación profesional en Buenos Aires.";

/**
 * Recorta una descripción a lo que un buscador y una previsualización muestran
 * de verdad. Más largo no suma: se corta con puntos suspensivos y ocupa lugar
 * en el HTML de todas las páginas.
 */
function paraMeta(texto: string): string {
  const limpio = texto.trim().replace(/\s+/g, " ");
  if (limpio.length <= 160) return limpio;
  const corte = limpio.slice(0, 160);
  const ultimoEspacio = corte.lastIndexOf(" ");
  return `${(ultimoEspacio > 100 ? corte.slice(0, ultimoEspacio) : corte).trimEnd()}…`;
}

type Entrada = {
  /** Sin la marca: la agrega la plantilla de `app/layout.tsx`. */
  titulo: string;
  descripcion: string;
  /** Empezando con barra: `/productos/roller-blackout`. */
  ruta: string;
};

export function metadataDePagina({
  titulo,
  descripcion,
  ruta,
}: Entrada): Metadata {
  const descripcionCorta = paraMeta(descripcion);

  // Relativa a `metadataBase`, que se fija una vez en `app/layout.tsx`. Next
  // la resuelve a absoluta al renderizar, así que el valor sale siempre de
  // NEXT_PUBLIC_SITE_URL y no hay dos formas de escribir la misma URL.
  const canonica = ruta;

  /*
   * La imagen que se ve al compartir el enlace: **el logo centrado sobre el
   * papel, la misma para todas las páginas** — decisión 62. Lo que distingue
   * un enlace de otro al compartirlo son el título y la descripción, que sí son
   * de cada página.
   *
   * Es apaisada, 1200 × 630, que es lo que hace que WhatsApp la muestre grande
   * y no como miniatura al costado del texto. Hubo dos versiones antes —el logo
   * a la izquierda con una foto a la derecha, y en la Fase 4.6 una por producto
   * y proyecto con su portada— y **WhatsApp las recortaba**: corta desde el
   * centro cuando la imagen no coincide con su recuadro, y se perdía un pedazo
   * del logo y otro de la foto. El logo solo, centrado, entra en cualquier
   * recorte.
   *
   * Sale del manifiesto generado, con su ancho y su alto: si algún día cambia
   * de tamaño, esto la sigue sola.
   */
  const imagen = {
    url: og.ruta,
    width: og.ancho,
    height: og.alto,
    alt: MARCA,
    type: "image/jpeg",
  };

  return {
    title: titulo,
    description: descripcionCorta,
    alternates: { canonical: canonica },
    openGraph: {
      type: "website",
      siteName: MARCA,
      locale: "es_AR",
      url: canonica,
      title: `${titulo} · ${MARCA}`,
      description: descripcionCorta,
      images: [imagen],
    },
    twitter: {
      // La imagen es apaisada, 1200 × 630, así que siempre es la tarjeta
      // grande.
      card: "summary_large_image",
      title: `${titulo} · ${MARCA}`,
      description: descripcionCorta,
      images: [imagen.url],
    },
  };
}

/** La URL absoluta de una ruta del sitio, para el sitemap y los datos JSON-LD. */
export function urlAbsoluta(ruta: string): string {
  return `${entornoPublico.urlSitio}${ruta}`;
}
