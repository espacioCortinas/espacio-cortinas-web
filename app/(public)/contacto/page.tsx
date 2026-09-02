import type { Metadata } from "next";

import { EnlaceWhatsapp } from "@/components/whatsapp";
import { metadataDePagina } from "@/lib/metadata";

/**
 * Contacto.
 *
 * MAQUETACIÓN MÍNIMA A PROPÓSITO. El formulario que envía a
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
  return (
    <main>
      <h1>Contacto</h1>
      <p>
        Escribinos y te asesoramos. Trabajamos en toda Buenos Aires, con
        medición y colocación propias.
      </p>

      <EnlaceWhatsapp contexto={{ tipo: "general" }} />
    </main>
  );
}
