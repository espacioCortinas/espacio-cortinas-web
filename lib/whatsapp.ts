import { entornoPublico } from "@/lib/entorno";

/**
 * El enlace de WhatsApp, con el mensaje ya escrito según de dónde salió el clic.
 *
 * **Para qué sirve que el mensaje cambie:** el objetivo comercial del sitio es
 * uno solo —que alguien termine escribiendo por WhatsApp— y quien atiende
 * necesita saber que la consulta vino del sitio y sobre qué, sin preguntarlo.
 * Ver docs/producto.md.
 *
 *     Desde /productos/roller-blackout
 *     → «Hola, vi en su página web el Roller Blackout y quisiera consultar...»
 *
 *     Desde /proyectos/casa-en-nordelta
 *     → «Hola, vi en su página web el proyecto Casa en Nordelta y quisiera
 *        consultar...»
 */

export type ContextoWhatsapp =
  | { tipo: "producto"; nombre: string }
  | { tipo: "proyecto"; titulo: string }
  | { tipo: "general" };

/** El texto que aparece escrito en el chat antes de que la persona lo mande. */
export function mensajeWhatsapp(contexto: ContextoWhatsapp): string {
  const inicio = "Hola, vi en su página web";
  const cierre = "y quisiera consultar...";

  switch (contexto.tipo) {
    case "producto":
      return `${inicio} el ${contexto.nombre.trim()} ${cierre}`;
    case "proyecto":
      // «el proyecto X» y no «el X»: sin la palabra, el nombre de un trabajo
      // —«Casa en Nordelta»— se lee como si fuera un producto del catálogo, y
      // la distinción entre qué vendemos y qué hicimos es justo la que el sitio
      // tiene que dejar clara (docs/producto.md).
      return `${inicio} el proyecto ${contexto.titulo.trim()} ${cierre}`;
    case "general":
      return `${inicio} ${cierre}`;
  }
}

/**
 * El enlace, o `null` si todavía no hay número cargado.
 *
 * `NEXT_PUBLIC_WHATSAPP` se carga en la Fase 4.6 junto con el formulario de
 * contacto (docs/arquitectura.md). Hasta entonces esta función devuelve `null`
 * y el botón no se dibuja: es preferible a publicar un enlace a `wa.me/` sin
 * número, que abre WhatsApp y no lleva a ninguna conversación.
 *
 * `wa.me` y no `api.whatsapp.com`: es la forma corta que documenta WhatsApp, y
 * la que abre la aplicación instalada en el teléfono en vez del cliente web.
 */
export function enlaceWhatsapp(contexto: ContextoWhatsapp): string | null {
  const numero = entornoPublico.whatsapp;
  if (!numero) return null;

  // Solo dígitos: `wa.me` no admite `+`, espacios ni guiones, y una variable
  // cargada como «+54 9 11 …» produciría un enlace que abre y no encuentra a
  // nadie.
  const soloDigitos = numero.replace(/\D/g, "");
  if (!soloDigitos) return null;

  const texto = encodeURIComponent(mensajeWhatsapp(contexto));
  return `https://wa.me/${soloDigitos}?text=${texto}`;
}
