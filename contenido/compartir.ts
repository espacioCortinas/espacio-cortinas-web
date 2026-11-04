import type { FotoParaCompartir } from "./tipos";

/**
 * La foto que lleva cada página cuando alguien pega su enlace en WhatsApp.
 *
 * **Es una foto de la página, y abajo el logo** — decisiones 63 y 64. La foto
 * va arriba, a todo el ancho; el logo de línea, centrado en una banda de 150
 * px del color del fondo del sitio —`#EDEFF0`, decisión 66—. Nada más: ni
 * texto ni nada encima de la foto.
 *
 * WhatsApp recorta desde el centro cuando la imagen no coincide con su
 * recuadro. Lo que se cortaba mal en la decisión 59 era un logo contra un
 * borde y una foto contra el otro; un logo centrado entra entero hasta en la
 * miniatura cuadrada, y cualquier recorte de una foto sigue siendo la cortina.
 *
 * `scripts/preparar-compartir.mjs` lee esto y arma un JPEG de 1200 × 630 por
 * página, desde el archivo más grande que hay de esa foto: bajando, nunca
 * agrandando.
 *
 * # Cómo se elige
 *
 * 0. **En un producto, la «wpp» de número más bajo**: desde noviembre de 2026
 *    la empresa elige las apaisadas para esto, y las marca con «wpp» en el
 *    nombre (decisión 67). Las publica `productos/<slug>/wpp`.
 * 1. **Una apaisada de la galería de la página.** Su lugar en la tarjeta es
 *    1200 × 480, o sea 2,5:1: una 4:3 conserva el 53 % del alto, una 3:2 el
 *    60 %.
 * 2. **Si no tiene ninguna, la portada.** Una 4:5 conserva el 32 % del alto y
 *    puede dejar una cortina sin techo ni piso, que se lee como una pared de
 *    tela. Por eso va segunda.
 * 3. **Recorte alto**, el mismo del sitio (`50% 15%`), salvo que la línea diga
 *    otra cosa.
 *
 * **Y después se mira.** Las de abajo se miraron una por una, con una sola
 * pregunta: ¿se entiende que es una foto de una cortina? Donde la regla daba
 * una que no, al lado está escrito qué pasaba.
 *
 * # Una página que no está acá
 *
 * Un producto o un proyecto nuevo sin su línea **no se queda sin imagen**: el
 * script le aplica la regla —la primera apaisada de su galería, o la portada—
 * y lo avisa con un `!` para que alguien la mire y la anote acá. Inicio, los
 * listados y Contacto no tienen galería propia, así que esos cuatro tienen que
 * estar siempre. Nosotros sí tiene: sus tres fotos.
 *
 * # Para cambiar una
 *
 * Se cambia la línea y se corre `npm run compartir`. La imagen nueva sale con
 * otro nombre, que es lo que hace que WhatsApp la vuelva a pedir: guarda cada
 * vista previa por su dirección.
 */
export const fotosParaCompartir: Record<string, FotoParaCompartir> = {
  /*
   * La foto que abre Inicio desde el 07/10/2026, así quien toca el enlace
   * llega a la misma imagen que vio en el chat: dos rollers screen sobre un
   * ventanal, en un living. Al centro: arriba es todo cielorraso.
   */
  "/": { foto: "productos/roller/screen/3", enfoque: "centro" },

  /*
   * Un roller screen y una veneciana en el mismo cuadro: el catálogo es más de
   * un producto. Al centro: con el recorte alto, la mitad es cielorraso.
   */
  "/productos": { foto: "productos/roller/screen/1", enfoque: "centro" },

  /* Las «wpp» que eligió la empresa, la de número más bajo (decisión 67). */
  "/productos/roller": { foto: "productos/roller/wpp/1" },
  "/productos/cortinas-tela": { foto: "productos/cortinas-tela/wpp/1" },
  "/productos/venecianas": { foto: "productos/venecianas/wpp/1" },
  "/productos/toldos": { foto: "productos/toldos/wpp/1" },
  "/productos/bandas-verticales": { foto: "productos/bandas-verticales/wpp/1" },

  /*
   * Sin fotos nuevas, sigue la de antes. Tiene dos apaisadas. En la primera,
   * `compacta-blackout/2`, el recorte alto se llena de techo de madera y
   * ventilador, y el roller queda chico en una esquina. En esta, las dos
   * ventanas con el roller a media altura son el cuadro entero.
   */
  "/productos/compacta-blackout": { foto: "productos/compacta-blackout/3" },

  /*
   * El piso de oficinas curvo con todos los rollers: la escala de un proyecto
   * integral. Es otra foto que la del proyecto, para que compartir el listado
   * y compartir el proyecto no den la misma tarjeta.
   */
  "/proyectos": { foto: "proyectos/cowork-nordelta/4" },

  /*
   * Tiene cuatro apaisadas. En la primera, `cowork-nordelta/2`, los screen se
   * leen como vidrio polarizado: parece una oficina con ventanales. En esta,
   * los rollers a distintas alturas son tela a la vista.
   */
  "/proyectos/cowork-nordelta": { foto: "proyectos/cowork-nordelta/3" },

  /* La primera de sus tres fotos, la que abre la página. */
  "/nosotros": { foto: "paginas/nosotros/1", enfoque: "centro" },

  /*
   * La mejor foto del archivo según `docs/diseno.md` —«luz, caída, sombras en
   * el piso, ambiente vacío»—, que fue la portada de Cortinas de confección
   * hasta noviembre de 2026 y hoy es de su variante Riel. Contacto no muestra
   * ninguna foto, así que la tarjeta tiene que decir «cortinas» sola.
   */
  "/contacto": { foto: "productos/cortinas-tela/riel/3" },
};
