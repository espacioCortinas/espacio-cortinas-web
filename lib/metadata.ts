import type { Metadata } from "next";

import type { Foto } from "@/contenido/tipos";
import { entornoPublico } from "@/lib/entorno";
import { medidaPredeterminada, rutaDeFoto } from "@/lib/fotos";

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

/** Lo que se muestra cuando algo todavía no tiene foto propia. */
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
  /** La portada. `null` mientras la entidad no tenga fotos. */
  foto?: Foto | null;
  /** Para el `alt` de la imagen de Open Graph. */
  altFoto?: string;
};

export function metadataDePagina({
  titulo,
  descripcion,
  ruta,
  foto = null,
  altFoto,
}: Entrada): Metadata {
  const descripcionCorta = paraMeta(descripcion);

  // Relativa a `metadataBase`, que se fija una vez en `app/layout.tsx`. Next
  // la resuelve a absoluta al renderizar, así que el valor sale siempre de
  // NEXT_PUBLIC_SITE_URL y no hay dos formas de escribir la misma URL.
  const canonica = ruta;

  // Sin foto no va imagen, y es a propósito: una imagen de reserva sería una
  // decisión visual —logo, color, tipografía— y eso se define en la Fase 4.1,
  // con las fotos reales del negocio delante. Un enlace sin miniatura se ve
  // pobre; uno con una miniatura provisoria se ve mal y además condiciona.
  const imagenes = foto
    ? [
        {
          url: rutaDeFoto(foto, medidaPredeterminada(foto)),
          // Es la medida elegida: el ancho es el nombre del archivo y el alto
          // sale de la proporción de la foto, que la conocemos por `ancho` y
          // `alto` del manifiesto.
          width: medidaPredeterminada(foto),
          height: Math.round(
            (medidaPredeterminada(foto) * foto.alto) / foto.ancho,
          ),
          alt: altFoto ?? titulo,
        },
      ]
    : undefined;

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
      images: imagenes,
    },
    twitter: {
      card: imagenes ? "summary_large_image" : "summary",
      title: `${titulo} · ${MARCA}`,
      description: descripcionCorta,
      images: imagenes?.map((i) => i.url),
    },
  };
}

/** La URL absoluta de una ruta del sitio, para el sitemap y los datos JSON-LD. */
export function urlAbsoluta(ruta: string): string {
  return `${entornoPublico.urlSitio}${ruta}`;
}
