"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ENLACES } from "@/lib/navegacion";

/**
 * Los enlaces del sitio. Son cuatro y se ven los cuatro, siempre.
 *
 * **No hay menú hamburguesa, y es a propósito.** Cuatro etiquetas entran en
 * 320 px; esconderlas detrás de un botón agregaría un estado, JavaScript de
 * verdad y un toque de más para llegar a cualquier lado, a cambio de nada. En
 * teléfono los enlaces bajan a su propia fila debajo del logo, que es lo que
 * les da los 44 px de alto sin apretar el encabezado.
 *
 * **Es uno de los tres componentes de cliente del sitio público**, con el video
 * y el formulario de contacto. Existe por una sola
 * razón: marcar en qué página está el visitante, que necesita saber la ruta
 * actual. Se marca con `aria-current="page"`, subrayado y peso — tres señales,
 * ninguna de color, porque el amarillo no puede marcar un estado (1,06:1
 * contra el papel) y el negro ya es el color de todo el texto.
 */

/**
 * `/productos/roller` también marca «Productos»: lo que se señala es la sección
 * en la que uno está, no la URL exacta. Inicio es la excepción, porque si no
 * estaría activa en todas las páginas.
 */
function estaActivo(ruta: string, href: string) {
  return href === "/" ? ruta === "/" : ruta.startsWith(href);
}

export function Navegacion({ className = "" }: { className?: string }) {
  const ruta = usePathname();

  return (
    <nav aria-label="Principal" className={className}>
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-1 md:gap-x-8">
        {ENLACES.map(({ href, texto }) => {
          const activo = estaActivo(ruta, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={activo ? "page" : undefined}
                className={
                  "text-texto inline-flex min-h-11 items-center text-meta " +
                  "tracking-[0.1em] uppercase underline-offset-[6px] " +
                  (activo
                    ? "font-bold underline decoration-1"
                    : "font-medium hover:underline")
                }
              >
                {texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
