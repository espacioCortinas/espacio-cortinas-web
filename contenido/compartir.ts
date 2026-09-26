import type { FotoParaCompartir } from "./tipos";

/**
 * La foto que lleva cada página cuando alguien pega su enlace en WhatsApp.
 *
 * **Es una foto, a sangre, y nada más** — decisión 63, que reemplaza a la 62:
 * sin logo, sin texto y sin composición. La marca ya va en el título —«Roller ·
 * Espacio Cortinas»—, así que la imagen no tiene que cargarla.
 *
 * Y una foto a sangre no se puede cortar mal. WhatsApp recorta desde el centro
 * cuando la imagen no coincide con su recuadro, y cualquier recorte de una
 * foto sigue siendo una foto de la cortina. Lo que se cortaba mal en la
 * decisión 59 era la composición: el logo contra un borde y la foto contra el
 * otro.
 *
 * `scripts/preparar-compartir.mjs` lee esto y arma un JPEG de 1200 × 630 por
 * página, desde el archivo más grande que hay de esa foto: bajando, nunca
 * agrandando.
 *
 * # Cómo se elige
 *
 * 1. **Una apaisada de la galería de la página.** Recortada a 1,91:1 pierde
 *    poco: una 4:3 conserva el 70 % del alto.
 * 2. **Si no tiene ninguna, la portada.** Una 4:5 conserva el 42 % del alto y
 *    puede dejar una cortina sin techo ni piso, que se lee como una pared de
 *    tela. Por eso va segunda.
 * 3. **Recorte alto**, el mismo del sitio (`50% 15%`), salvo que la línea diga
 *    otra cosa.
 *
 * **Y después se mira.** Las doce de abajo se miraron una por una, con una
 * sola pregunta: ¿se entiende que es una foto de una cortina? Donde la regla
 * daba una que no, al lado está escrito qué pasaba.
 *
 * # Una página que no está acá
 *
 * Un producto o un proyecto nuevo sin su línea **no se queda sin imagen**: el
 * script le aplica la regla —la primera apaisada de su galería, o la portada—
 * y lo avisa con un `!` para que alguien la mire y la anote acá. Inicio, los
 * listados y Contacto no tienen galería propia, así que esos cuatro tienen que
 * estar siempre.
 *
 * # Para cambiar una
 *
 * Se cambia la línea y se corre `npm run compartir`. La imagen nueva sale con
 * otro nombre, que es lo que hace que WhatsApp la vuelva a pedir: guarda cada
 * vista previa por su dirección.
 */
export const fotosParaCompartir: Record<string, FotoParaCompartir> = {
  /*
   * La foto que abre Inicio, así quien toca el enlace llega a la misma imagen
   * que vio en el chat. Al centro y no alto: con el recorte alto es todo
   * cielorraso de hormigón; al centro, las lamas llenan el cuadro con el río
   * detrás.
   */
  "/": { foto: "productos/venecianas-madera/2", enfoque: "centro" },

  /*
   * Un roller screen y una veneciana en el mismo cuadro: el catálogo es más de
   * un producto. Al centro: con el recorte alto, la mitad es cielorraso.
   */
  "/productos": { foto: "productos/roller/screen/1", enfoque: "centro" },

  /*
   * La primera apaisada de su galería, `roller/2`, no se lee como un roller:
   * los screen a media altura parecen vidrio polarizado, la protagonista es la
   * lámpara, y en el medio queda la ropa tendida del patio, que
   * `docs/diseno.md` ya pide no mostrar grande (decisión 42). La de su
   * variante Blackout es un roller blanco a media altura entre dos voiles.
   * Abajo a la izquierda se lee un nombre bordado en un almohadón: es un nombre
   * de pila, ya publicado en la galería, y no identifica a nadie.
   */
  "/productos/roller": { foto: "productos/roller/blackout/2" },

  /*
   * Tiene dos apaisadas. En la primera, `compacta-blackout/2`, el recorte alto
   * se llena de techo de madera y ventilador, y el roller queda chico en una
   * esquina. En esta, las dos ventanas con el roller a media altura son el
   * cuadro entero.
   */
  "/productos/compacta-blackout": { foto: "productos/compacta-blackout/3" },

  /*
   * La primera apaisada, `cortinas-tela/3`, se lee bien, pero contra el borde
   * izquierdo tiene el pelo y el hombro de una persona, cortados por el
   * cuadro. No se la reconoce; igual, ninguna tarjeta lleva ni un pedazo de
   * alguien. Esta es la apaisada de su variante Riel: voile blanco, balcón y
   * río, sin nadie.
   */
  "/productos/cortinas-tela": { foto: "productos/cortinas-tela/riel/2" },

  /*
   * La regla: no tiene ninguna apaisada, así que va la portada recortada alta.
   * Acá funciona: las lamas llenan el cuadro de borde a borde.
   */
  "/productos/venecianas-madera": { foto: "productos/venecianas-madera/1" },

  /*
   * Tiene dos apaisadas. La primera, `venecianas-pvc/2`, se entiende, pero es
   * la obra en curso: la caja de herramientas y los trapos quedan adentro del
   * cuadro aun con el recorte alto. Esta es la misma veneciana en una casa
   * habitada.
   */
  "/productos/venecianas-pvc": { foto: "productos/venecianas-pvc/3" },

  /*
   * Su única apaisada, `toldos/3`, tiene una persona justo en el centro del
   * cuadro, y `docs/diseno.md` pide no mostrarla grande (decisión 42). Así
   * que va la portada, y al centro: con el recorte alto el brazo del toldo
   * queda cortado; al centro entra el toldo entero contra el cielo.
   */
  "/productos/toldos": { foto: "productos/toldos/1", enfoque: "centro" },

  /* La regla, sin tocar: la primera apaisada. Bandas negras en una oficina. */
  "/productos/bandas-verticales": { foto: "productos/bandas-verticales/2" },

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

  /*
   * La mejor foto del archivo según `docs/diseno.md` —«luz, caída, sombras en
   * el piso, ambiente vacío»— para la página que importa. Contacto no muestra
   * ninguna foto, así que la tarjeta tiene que decir «cortinas» sola.
   */
  "/contacto": { foto: "productos/cortinas-tela/1" },
};
