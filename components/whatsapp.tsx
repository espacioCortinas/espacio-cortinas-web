import { BotonEnlace } from "@/components/ui/boton";
import { enlaceWhatsapp, type ContextoWhatsapp } from "@/lib/whatsapp";

/**
 * El enlace a WhatsApp, con el mensaje ya escrito según la página.
 *
 * **Es el llamado a la acción del sitio**, así que usa los botones del sistema:
 * `principal` es el negro sólido, que es el que va una vez por página en el
 * lugar donde queremos que alguien escriba. No es amarillo, y está razonado en
 * `components/ui/boton.tsx` y en la decisión 43.
 *
 * Es un `<a>` y no un `<button>` porque es una navegación: así se puede abrir
 * en otra pestaña, copiar y compartir.
 *
 * **No se dibuja nada mientras no haya número cargado.** `NEXT_PUBLIC_WHATSAPP`
 * entra en la Fase 4.6; hasta entonces, un enlace a `wa.me/` sin número abre
 * WhatsApp y no lleva a ninguna conversación, que es peor que no ofrecerlo.
 * Todo lo que lo envuelva tiene que aguantar que no dibuje nada.
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
  const href = enlaceWhatsapp(contexto);
  if (!href) return null;

  return (
    <BotonEnlace
      href={href}
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
