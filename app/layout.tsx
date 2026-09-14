import type { Metadata } from "next";

import { entornoPublico } from "@/lib/entorno";
import { DESCRIPCION_SITIO } from "@/lib/metadata";

import { variablesDeFuentes } from "./tipografias";

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
  /*
   * Las variables de las dos familias van en `<html>` y no en `<body>`: los
   * tokens `--font-titulo` y `--font-texto` de `globals.css` las resuelven
   * desde ahí, y así también las alcanza cualquier cosa que se renderice
   * fuera del flujo normal del documento.
   *
   * El color de papel y la familia de texto los pone `globals.css` en la capa
   * base, no este archivo: son del sistema, no del layout.
   */
  return (
    <html lang="es-AR" className={variablesDeFuentes}>
      <body>{children}</body>
    </html>
  );
}
