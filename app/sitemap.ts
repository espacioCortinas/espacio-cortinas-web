import type { MetadataRoute } from "next";

import { productosPublicados, proyectosPublicados } from "@/contenido";
import { urlAbsoluta } from "@/lib/metadata";

/**
 * El sitemap, generado desde el contenido.
 *
 * **Lista lo mismo que el sitio muestra**, porque sale de las mismas funciones:
 * `activo` manda, así que un producto despublicado desaparece de las dos cosas
 * a la vez. Escribir la lista a mano sería garantizar que algún día se
 * desincronicen y el buscador siga pidiendo una URL que devuelve 404.
 *
 * **No lleva `lastModified`.** El dato existiría —es la fecha del commit— pero
 * no está en el contenido, y ponerle la fecha del build a todo sería decirle al
 * buscador que el sitio entero cambió cada vez que se despliega, que es
 * exactamente el ruido que `lastModified` existe para evitar. Sin el campo,
 * Google usa lo que ya sabe. `changeFrequency` y `priority` tampoco van: hace
 * años que Google los ignora.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const fijas = ["/", "/productos", "/proyectos", "/contacto"];

  return [
    ...fijas.map((ruta) => ({ url: urlAbsoluta(ruta) })),
    ...productosPublicados().map((producto) => ({
      url: urlAbsoluta(`/productos/${producto.slug}`),
    })),
    ...proyectosPublicados().map((proyecto) => ({
      url: urlAbsoluta(`/proyectos/${proyecto.slug}`),
    })),
  ];
}
