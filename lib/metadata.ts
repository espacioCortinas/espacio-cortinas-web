import type { Metadata } from "next";

import { og, ogPorPagina, type ArchivoDeMarca } from "@/contenido/marca";
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
  /**
   * De quién es la página, con la clave de `contenido/fotos.ts`:
   * `productos/roller`. Es lo que busca su imagen de Open Graph. Sin clave, o
   * si esa página todavía no tiene la suya, va la de reserva.
   */
  clave?: string;
  /** Para el `alt` de la imagen de Open Graph propia. */
  altImagen?: string;
};

export function metadataDePagina({
  titulo,
  descripcion,
  ruta,
  clave,
  altImagen,
}: Entrada): Metadata {
  const descripcionCorta = paraMeta(descripcion);

  // Relativa a `metadataBase`, que se fija una vez en `app/layout.tsx`. Next
  // la resuelve a absoluta al renderizar, así que el valor sale siempre de
  // NEXT_PUBLIC_SITE_URL y no hay dos formas de escribir la misma URL.
  const canonica = ruta;

  /*
   * La imagen que se ve al compartir el enlace.
   *
   * **Cada producto y cada proyecto tiene la suya desde la Fase 4.6**: su
   * portada dentro de la composición de la de reserva —papel, el logo a la
   * izquierda y la foto a la derecha— en un JPEG de 1200 × 630 que arma
   * `scripts/preparar-marca.mjs`. Antes se usaba la portada tal cual, un WebP
   * vertical 4:5, y los generadores de previsualización muestran la imagen
   * grande solo cuando es apaisada: salía como miniatura chica al costado del
   * texto. Decisión 59.
   *
   * **La de reserva**, `public/marca/og.jpg`, es la misma composición con
   * `cortinas-tela/1`, la mejor foto del archivo. La usan Inicio, los dos
   * listados, Contacto y cualquier página que todavía no tenga la suya.
   *
   * Las dos salen del manifiesto generado, con su ancho y su alto: si algún
   * día cambian de tamaño, esto las sigue solo.
   */
  const propia: ArchivoDeMarca | undefined = clave
    ? ogPorPagina[clave]
    : undefined;
  const imagen = propia
    ? {
        url: propia.ruta,
        width: propia.ancho,
        height: propia.alto,
        alt: altImagen ?? `${titulo} — ${MARCA}`,
        type: "image/jpeg",
      }
    : {
        url: og.ruta,
        width: og.ancho,
        height: og.alto,
        alt: `${MARCA} — cortinas de tela en una casa de Buenos Aires`,
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
      // Todas las imágenes son apaisadas, 1200 × 630, así que siempre es la
      // tarjeta grande.
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
