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
  const esBoton = variante !== "enlace";
  return (
    <BotonEnlace
      href={enlaceWhatsapp(contexto)}
      variante={variante}
      // `noopener` va implícito con `_blank` en los navegadores actuales, pero
      // se escribe igual: es una línea y cubre a los que no.
      target="_blank"
      rel="noopener noreferrer"
      // Lo busca el círculo flotante, que se esconde mientras alguno de estos
      // está en pantalla (`components/whatsapp-flotante.tsx`).
      data-boton-whatsapp={esBoton ? "" : undefined}
      className="group"
    >
      {/*
        El logo dice qué se abre al tocarlo, como en los medios de contacto
        (decisión 65), en el color del texto del botón y nunca en el verde de
        WhatsApp. Al pasar el mouse, al enfocarlo o al tocarlo, gira apenas:
        150 ms, la duración de los cambios de estado del sitio, y nada con
        movimiento reducido (decisión 67).
      */}
      {esBoton && (
        <LogoWhatsapp className="size-5 transition-transform duration-150 group-hover:-rotate-12 group-focus-visible:-rotate-12 group-active:-rotate-12 motion-reduce:transition-none" />
      )}
      {children}
    </BotonEnlace>
  );
}

export { WhatsappFlotante } from "@/components/whatsapp-flotante";
