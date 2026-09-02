import type { Metadata } from "next";

import { entornoPublico } from "@/lib/entorno";
import { DESCRIPCION_SITIO } from "@/lib/metadata";

import "./globals.css";

/**
 * `metadataBase` es lo que hace que las rutas relativas de cada página
 * —canónica, Open Graph, imágenes— se resuelvan a absolutas contra el dominio
 * real. Sale de `NEXT_PUBLIC_SITE_URL`, que en producción es el apex sin `www`
 * y sin barra final (decisión 22). Sin esto, Open Graph queda con rutas
 * relativas y los bots de WhatsApp no resuelven ninguna imagen.
 */
export const metadata: Metadata = {
  metadataBase: new URL(entornoPublico.urlSitio),
  // `%s` es el título de cada página; el nombre de la empresa lo pone la
  // plantilla, para que no haya que repetirlo en cada archivo ni se olvide.
  title: {
    default: "Espacio Cortinas",
    template: "%s · Espacio Cortinas",
  },
  description: DESCRIPCION_SITIO,
};

export default function LayoutRaiz({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
