"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ENLACES } from "@/lib/navegacion";

/**
 * Los enlaces del sitio, siempre a la vista: en escritorio a la derecha del
 * logo, en el teléfono en su propia fila debajo.
 *
 * # Sin botón «Menú», a pedido
 *
 * **No hay menú desplegable, y es una decisión de la empresa.** En la etapa 1
 * de la Fase 4.7 el teléfono pasó a un botón «Menú» que abría la lista; la
 * empresa prefirió volver a los enlaces a la vista, que es como estaba el sitio
 * antes. Es también lo que la Fase 4.2 había razonado: esconderlos agrega un
 * toque de más para llegar a cualquier lado, a cambio de nada.
 *
 * **En el teléfono van a 13 px, sin espaciado entre letras y con 16 px entre
 * enlaces; en escritorio, a 15, que es el tamaño del boceto.** Medido con
 * Raleway, las cuatro etiquetas ocupan 313 px así, y entran en una fila desde
 * los teléfonos de 360 de ancho, que son casi todos. Con las letras espaciadas
 * del sitio anterior no entraban: aun con la letra de entonces, más angosta,
 * «Contacto» quedaba solo en un segundo renglón.
 *
 * Por debajo de 360 —y cuando entre «Nosotros» en la etapa 4, que suma una
 * quinta etiqueta— pasan a dos renglones: `flex-wrap` lo resuelve solo, sin
 * que nada se salga del ancho.
 *
 * Cada enlace tiene 44 px de alto, que es la zona táctil mínima.
 *
 * # La página actual
 *
 * **Es de cliente por eso**, como el encabezado que lo contiene: marcar en qué
 * página está el visitante necesita saber la ruta actual. Se marca con
 * `aria-current="page"`, subrayado y peso — tres señales y ninguna de color,
 * porque el menú ya es del color del acento.
 */

/**
 * `/productos/roller` también marca «Productos»: lo que se señala es la sección
 * en la que uno está, no la URL exacta. Inicio es la excepción, porque si no
 * estaría activa en todas las páginas.
 */
function estaActivo(ruta: string, href: string) {
  return href === "/" ? ruta === "/" : ruta.startsWith(href);
}

export function Navegacion() {
  const ruta = usePathname();

  return (
    <nav aria-label="Principal">
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 md:justify-end md:gap-x-8">
        {ENLACES.map(({ href, texto }) => {
          const activo = estaActivo(ruta, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={activo ? "page" : undefined}
                className={
                  "text-acento inline-flex min-h-11 items-center text-meta " +
                  "uppercase underline-offset-[6px] " +
                  "md:text-menu md:underline-offset-8 " +
                  (activo
                    ? "font-bold underline decoration-2"
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
