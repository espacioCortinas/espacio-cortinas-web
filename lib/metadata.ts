import type { Metadata } from "next";

import { imagenesParaCompartir } from "@/contenido/imagenes-para-compartir";
import type { ImagenParaCompartir } from "@/contenido/tipos";
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

/**
 * La imagen que se ve al compartir una página: **una foto suya, con el logo
 * abajo** — decisiones 63 y 64. Qué foto lleva cada una se elige en
 * `contenido/compartir.ts`; los archivos los arma
 * `scripts/preparar-compartir.mjs`.
 *
 * Una página que todavía no tiene la suya —un producto recién agregado, antes
 * de correr `npm run compartir`— sale con la de Inicio: una foto de cortina es
 * mejor tarjeta que ninguna. Y si falta hasta la de Inicio, **el build se
 * corta** acá y no publica un sitio entero sin vista previa.
 */
export function imagenParaCompartir(ruta: string): ImagenParaCompartir {
  const imagen = imagenesParaCompartir[ruta] ?? imagenesParaCompartir["/"];
  if (!imagen) {
    throw new Error(
      "contenido/imagenes-para-compartir.ts no tiene la imagen de Inicio. " +
        "Corré npm run compartir.",
    );
  }
  return imagen;
}

type Entrada = {
  /** Sin la marca: la agrega la plantilla de `app/layout.tsx`. */
  titulo: string;
  descripcion: string;
  /**
   * Empezando con barra: `/productos/roller`. Es también la clave con la que
   * se busca su imagen para compartir.
   */
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
   * La imagen que se ve al compartir el enlace: **una foto de cortina,
   * distinta en cada página, con el logo en una banda de papel abajo** —
   * decisiones 63 y 64. Es lo que motivó elegir Next y no un SPA (decisión 1):
   * el negocio se difunde reenviando mensajes, y una foto de cortina se abre y
   * un logo solo no.
   *
   * Es apaisada, 1200 × 630, que es lo que hace que WhatsApp la muestre grande
   * y no como miniatura al costado del texto. **Y el logo va centrado.**
   * WhatsApp recorta desde el centro cuando la imagen no coincide con su
   * recuadro, y lo que cortaba en la decisión 59 era un logo contra un borde y
   * una foto contra el otro. Centrado entra entero hasta en la miniatura
   * cuadrada; la foto, recortada, sigue siendo la cortina.
   *
   * Sale del manifiesto generado, con su ancho y su alto: si algún día cambia
   * de tamaño, esto la sigue sola.
   */
  const propia = imagenParaCompartir(ruta);
  const imagen = {
    url: propia.ruta,
    width: propia.ancho,
    height: propia.alto,
    alt: propia.alt,
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
      // Las imágenes son todas apaisadas, 1200 × 630, así que siempre es la
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
