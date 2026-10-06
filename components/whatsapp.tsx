import { LogoWhatsapp } from "@/components/iconos-de-contacto";
import { BotonEnlace } from "@/components/ui/boton";
import { enlaceWhatsapp, type ContextoWhatsapp } from "@/lib/whatsapp";

/**
 * El enlace a WhatsApp, con el mensaje ya escrito según la página.
 *
 * **Es el llamado a la acción del sitio**, así que usa los botones del sistema:
 * `principal` es la pizarra sólida, que es la que va una vez por página en el
 * lugar donde queremos que alguien escriba. Está razonado en
 * `components/ui/boton.tsx`.
 *
 * Es un `<a>` y no un `<button>` porque es una navegación: así se puede abrir
 * en otra pestaña, copiar y compartir.
 *
 * Hasta la Fase 4.6 no dibujaba nada, porque no había número cargado. Desde
 * entonces el número es obligatorio y el enlace está siempre.
 */
export function EnlaceWhatsapp({
  contexto,
  variante = "principal",
  children = "Consultar por WhatsApp",
}: {
  contexto: ContextoWhatsapp;
  variante?: "principal" | "secundario" | "enlace";
  children?: React.ReactNode;
}) {
  return (
    <BotonEnlace
      href={enlaceWhatsapp(contexto)}
      variante={variante}
      // `noopener` va implícito con `_blank` en los navegadores actuales, pero
      // se escribe igual: es una línea y cubre a los que no.
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </BotonEnlace>
  );
}

/**
 * WhatsApp siempre a mano: abajo a la derecha, en todas las páginas públicas.
 *
 * **Es el «¡Chateá con nosotros!» del boceto de la empresa** — Fase 4.7 —, con
 * su color y su texto: el azul verdoso de la marca con el texto oscuro encima,
 * 5,08:1. El boceto lo traía de la plantilla de Wix como «Chatea», de tú; acá
 * va de vos, como el resto del sitio.
 *
 * **Resuelve lo que la decisión 49 dejó pendiente.** En el catálogo, desde un
 * teléfono, el WhatsApp del cierre quedaba al final de una página de más de
 * 7.000 px. Ahora está a un toque desde cualquier punto de cualquier página, y
 * en el teléfono queda donde llega el pulgar.
 *
 * **Lleva el mensaje general.** Es el mismo en todas las páginas y es un
 * componente de servidor: el que nombra el producto o el proyecto sigue siendo
 * el botón principal de cada página, que es donde se decide escribir.
 *
 * Sin sombra, aunque flote: la regla 2 de `docs/diseno.md` las prohíbe, y el
 * boceto tampoco la tiene. Lo separa del contenido su color.
 *
 * `z-20` deja arriba al menú desplegado del teléfono, que es `z-30`.
 */
export function WhatsappFlotante() {
  return (
    <a
      href={enlaceWhatsapp({ tipo: "general" })}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-marca text-texto fixed right-4 bottom-4 z-20 inline-flex min-h-12 items-center gap-2 rounded-boton px-4 text-menu font-semibold md:right-6 md:bottom-6"
    >
      <LogoWhatsapp />
      <span>
        Chateá con nosotros<span className="sr-only"> por WhatsApp</span>
      </span>
    </a>
  );
}
