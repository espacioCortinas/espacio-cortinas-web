import { enlaceWhatsapp, type ContextoWhatsapp } from "@/lib/whatsapp";

/**
 * El enlace a WhatsApp, con el mensaje ya escrito según la página.
 *
 * SIN DISEÑAR a propósito — es un enlace de texto. En la Fase 4.2 pasa a ser el
 * botón principal del sitio y en la 4.1 se decide cómo se ve.
 *
 * **No se dibuja nada mientras no haya número cargado.** `NEXT_PUBLIC_WHATSAPP`
 * entra en la Fase 4.6; hasta entonces, un enlace a `wa.me/` sin número abre
 * WhatsApp y no lleva a ninguna conversación, que es peor que no ofrecerlo.
 */
export function EnlaceWhatsapp({
  contexto,
  children = "Consultar por WhatsApp",
}: {
  contexto: ContextoWhatsapp;
  children?: React.ReactNode;
}) {
  const href = enlaceWhatsapp(contexto);
  if (!href) return null;

  return (
    <a
      href={href}
      // `noopener` va implícito con `_blank` en los navegadores actuales, pero
      // se escribe igual: es una línea y cubre a los que no.
      target="_blank"
      rel="noopener noreferrer"
      className="underline"
    >
      {children}
    </a>
  );
}
