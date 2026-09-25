import { entornoPublico } from "@/lib/entorno";

/**
 * El enlace de WhatsApp, con el mensaje ya escrito según de dónde salió el clic.
 *
 * **Para qué sirve que el mensaje cambie:** el objetivo comercial del sitio es
 * uno solo —que alguien termine escribiendo por WhatsApp— y quien atiende
 * necesita saber que la consulta vino del sitio y sobre qué, sin preguntarlo.
 * Ver docs/producto.md.
 *
 *     Desde /productos/venecianas-pvc
 *     → «Hola, vi en su página web el producto Venecianas de PVC y quisiera
 *        consultar...»
 *
 *     Desde /proyectos/casa-en-nordelta
 *     → «Hola, vi en su página web el proyecto Casa en Nordelta y quisiera
 *        consultar...»
 *
 * Sin `server-only`: lo usa también el formulario de contacto, en el
 * navegador, para ofrecer WhatsApp cuando el envío falla. El número es público
 * de todas formas: está escrito en cada página.
 */

export type ContextoWhatsapp =
  | { tipo: "producto"; nombre: string }
  | { tipo: "proyecto"; titulo: string }
  | { tipo: "general" }
  /**
   * El formulario de contacto no pudo enviar, y lo que la persona ya escribió
   * se pasa entero a WhatsApp para que no tenga que volver a escribirlo.
   */
  | { tipo: "consulta"; texto: string };

/**
 * Cuánto del mensaje del formulario viaja en el enlace. El formulario admite
 * 3.000 caracteres y, codificados en una URL, pueden ser tres veces más: un
 * enlace así de largo no siempre abre. Lo que no entra no se pierde —sigue
 * escrito en el formulario, a la vista— y se avisa con los puntos suspensivos.
 */
const TOPE_DE_CONSULTA = 1500;

/** El texto que aparece escrito en el chat antes de que la persona lo mande. */
export function mensajeWhatsapp(contexto: ContextoWhatsapp): string {
  const inicio = "Hola, vi en su página web";
  const cierre = "y quisiera consultar...";

  switch (contexto.tipo) {
    case "producto":
      // «el producto X» y no «el X». Decía «el X», que sirve para «el Roller»
      // y en el resto del catálogo sale mal: «el Venecianas de PVC», «el
      // Toldos», «el Compacta Blackout». No se notó hasta la Fase 4.6 porque
      // hasta entonces el enlace no se dibujaba. Con la palabra adelante, el
      // artículo es siempre el de «producto» y el nombre entra tal cual, con
      // su mayúscula, igual que en el mensaje de proyecto de abajo.
      return `${inicio} el producto ${contexto.nombre.trim()} ${cierre}`;
    case "proyecto":
      // «el proyecto X» y no «el X»: sin la palabra, el nombre de un trabajo
      // —«Casa en Nordelta»— se lee como si fuera un producto del catálogo, y
      // la distinción entre qué vendemos y qué hicimos es justo la que el sitio
      // tiene que dejar clara (docs/producto.md).
      return `${inicio} el proyecto ${contexto.titulo.trim()} ${cierre}`;
    case "general":
      return `${inicio} ${cierre}`;
    case "consulta": {
      // Dice que el formulario falló: quien atiende se entera de que hay algo
      // roto sin que nadie tenga que avisarle.
      const texto = contexto.texto.trim();
      const recortado =
        texto.length > TOPE_DE_CONSULTA
          ? `${texto.slice(0, TOPE_DE_CONSULTA).trimEnd()}…`
          : texto;
      return (
        "Hola, les escribí por el formulario de su página web y no se pudo " +
        `enviar. Mi consulta es:\n\n${recortado}`
      );
    }
  }
}

/**
 * El enlace.
 *
 * `NEXT_PUBLIC_WHATSAPP` es obligatoria desde la Fase 4.6: si faltara, el build
 * corta antes de publicar, así que acá siempre hay número. Viene ya en la forma
 * que `wa.me` acepta —solo cifras, con el código del país— porque
 * `lib/entorno-validacion.ts` rechaza cualquier otra: con un `+` o un espacio,
 * el enlace abre WhatsApp y no encuentra a nadie.
 *
 * `wa.me` y no `api.whatsapp.com`: es la forma corta que documenta WhatsApp, y
 * la que abre la aplicación instalada en el teléfono en vez del cliente web.
 */
export function enlaceWhatsapp(contexto: ContextoWhatsapp): string {
  const texto = encodeURIComponent(mensajeWhatsapp(contexto));
  return `https://wa.me/${entornoPublico.whatsapp}?text=${texto}`;
}

/**
 * El número como lo lee una persona: `11 2233-4455`.
 *
 * **Sale de la misma variable que el enlace**, así que no hay un segundo lugar
 * donde escribirlo que pueda dejar de coincidir con el primero: el número que
 * se lee en `/contacto` es siempre el que abre el chat.
 *
 * Se sacan el 54 del país y el 9 que marca un celular, que adentro del país no
 * se escriben. Si la característica es la 11 —la de Buenos Aires— se agrupa
 * como se escribe en todos lados; si es otra, se deja en formato
 * internacional, porque el largo de las demás características varía y
 * adivinarlo sería partir mal el número.
 */
export function numeroVisible(
  numero: string = entornoPublico.whatsapp,
): string {
  const nacional = numero.replace(/^549?/, "");
  return /^11\d{8}$/.test(nacional)
    ? `11 ${nacional.slice(2, 6)}-${nacional.slice(6)}`
    : `+${numero}`;
}

/** Para `tel:` y para la ficha de negocio local: con `+` y el código del país. */
export function numeroInternacional(
  numero: string = entornoPublico.whatsapp,
): string {
  return `+${numero}`;
}
