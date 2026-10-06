"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ENLACES } from "@/lib/navegacion";

/**
 * Los enlaces del sitio, siempre a la vista y siempre en una fila: en
 * escritorio a la derecha del logo, en el teléfono en su propia fila debajo.
 *
 * # Sin botón «Menú», y en un solo renglón: los dos a pedido
 *
 * **No hay menú desplegable.** En la etapa 1 de la Fase 4.7 el teléfono pasó a
 * un botón «Menú»; la empresa prefirió volver a los enlaces a la vista, que es
 * como estaba el sitio antes. Y **tampoco dos renglones**: con «Nosotros» son
 * cinco enlaces, y tienen que entrar en una fila.
 *
 * # Las medidas, con la letra real
 *
 * Medido con Raleway a 13 px, en el peso más ancho de los dos que usa:
 *
 *     en mayúscula, con «Nuestros trabajos»        402 px de texto
 *     en mayúscula, con «Trabajos»                 329
 *     en minúscula, con «Trabajos»                 264   ← así quedó
 *
 * Un teléfono de 360 de ancho deja 320 para el menú, así que **solo entra en
 * minúscula y con «Trabajos»**, que es la opción que eligió la empresa: la
 * mayúscula ocupa un cuarto más. Con 8 px entre enlaces como mínimo, los cinco
 * ocupan 296 y sobran 24, que `justify-between` reparte.
 *
 * **Por debajo de 360 la letra baja sola**, hasta 12 px a 320 de ancho: 244 de
 * texto y 32 de huecos en los 280 que quedan. `flex-wrap` sigue puesto como red,
 * por si alguien agranda la letra del sistema: antes que salirse de la pantalla,
 * pasa un enlace al renglón de abajo.
 *
 * En escritorio van a 15 px, que es el tamaño del boceto, a la derecha.
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
      <ul className="flex flex-wrap items-center justify-between gap-x-2 md:justify-end md:gap-x-6 lg:gap-x-8">
        {ENLACES.map(({ href, texto }) => {
          const activo = estaActivo(ruta, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={activo ? "page" : undefined}
                className={
                  "text-acento inline-flex min-h-11 items-center " +
                  "text-[clamp(0.75rem,3.6vw,0.8125rem)] underline-offset-[6px] " +
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
