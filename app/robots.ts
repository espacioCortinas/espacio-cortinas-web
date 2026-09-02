import type { MetadataRoute } from "next";

import { urlAbsoluta } from "@/lib/metadata";

/**
 * `robots.txt`.
 *
 * Todo el sitio es público y se quiere indexar entero: no hay panel, no hay
 * área privada y no hay ninguna ruta que convenga esconder. Un `Disallow` de
 * más es una forma silenciosa de sacar páginas del buscador, así que la lista
 * queda vacía a propósito.
 *
 * `host` fija cuál es la dirección canónica. Es el apex, sin `www`
 * — decisión 22.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: urlAbsoluta("/sitemap.xml"),
    host: urlAbsoluta("/").replace(/\/$/, ""),
  };
}
