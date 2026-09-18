import type { Metadata } from "next";

import { EnlaceWhatsapp } from "@/components/whatsapp";
import { Aviso } from "@/components/ui/aviso";
import { CLASES_CONTENEDOR } from "@/components/ui/contenedor";
import { entornoPublico } from "@/lib/entorno";
import { metadataDePagina } from "@/lib/metadata";

/**
 * Contacto.
 *
 * ARMAZÓN, NO COMPOSICIÓN. El formulario que envía a
 * `contacto@espaciocortinas.com.ar` con Resend es la Fase 4.6, junto con el
 * número de WhatsApp: son las tres variables de entorno que todavía no están
 * cargadas (docs/arquitectura.md).
 *
 * **WhatsApp es el canal principal, no el formulario** (docs/producto.md). El
 * objetivo comercial del sitio es que alguien termine escribiendo por ahí.
 */

export const metadata: Metadata = metadataDePagina({
  titulo: "Contacto",
  descripcion:
    "Escribinos por WhatsApp para consultar por cortinas, rollers, " +
    "venecianas o toldos a medida en Buenos Aires.",
  ruta: "/contacto",
});

export default function Contacto() {
  const hayWhatsapp = entornoPublico.whatsapp !== null;

  return (
    <main className={`${CLASES_CONTENEDOR} py-16 md:py-28`}>
      <h1 className="text-display">Contacto</h1>
      <p className="max-w-lectura text-texto-suave mt-6 text-subtitulo">
        Escribinos y te asesoramos. Trabajamos en toda Buenos Aires, con
        medición y colocación propias.
      </p>

      {/* Sin número cargado no hay botón de WhatsApp ni formulario, así que la
          página quedaría diciendo «escribinos» sin ofrecer por dónde. Mientras
          eso sea cierto, se dice; el aviso desaparece solo en la Fase 4.6. */}
      <div className="mt-10">
        {hayWhatsapp ? (
          <EnlaceWhatsapp contexto={{ tipo: "general" }} />
        ) : (
          <Aviso tono="nota">
            El formulario y el botón de WhatsApp se activan en cuanto esté
            cargado el número de contacto.
          </Aviso>
        )}
      </div>
    </main>
  );
}
