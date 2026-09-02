import type { Metadata } from "next";

import { EnlaceWhatsapp } from "@/components/whatsapp";
import { DESCRIPCION_SITIO, metadataDePagina } from "@/lib/metadata";

/**
 * Inicio.
 *
 * SIGUE SIN COMPONERSE, Y ES A PROPÓSITO. El Inicio anticipa todo lo demás
 * —empresa, productos destacados, proyectos destacados, colocación, trabajo con
 * arquitectos y el llamado a la acción— así que se arma al final, en la Fase
 * 4.5, cuando ya existe todo lo que tiene que anticipar (docs/plan.md).
 *
 * Lo que sí tiene ya es su metadata, porque es la página que más se comparte:
 * es la URL que va en las tarjetas, en Instagram y en el Perfil de Empresa de
 * Google.
 */

export const metadata: Metadata = metadataDePagina({
  titulo: "Cortinas, rollers y toldos a medida en Buenos Aires",
  descripcion: DESCRIPCION_SITIO,
  ruta: "/",
});

export default function Inicio() {
  return (
    <main>
      <h1>Espacio Cortinas</h1>
      <p>{DESCRIPCION_SITIO}</p>
      <p>Esta página se compone en la Fase 4.5.</p>

      <EnlaceWhatsapp contexto={{ tipo: "general" }} />
    </main>
  );
}
