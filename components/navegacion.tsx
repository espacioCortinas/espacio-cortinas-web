"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ENLACES } from "@/lib/navegacion";

/**
 * Los enlaces del sitio: a la vista en escritorio, detrás de un botón «Menú»
 * en el teléfono.
 *
 * # Por qué ahora hay botón en el teléfono
 *
 * Hasta la Fase 4.7 no lo había, y estaba razonado: cuatro etiquetas de 13 px
 * entraban en 320 px, y esconderlas agregaba un toque de más a cambio de nada.
 * **Las dos premisas se cayeron.** El menú pasa a 15 px, que es el tamaño del
 * boceto de la empresa —el de 13 en mayúscula espaciada era una de las marcas
 * de sitio hecho con IA—, y la etapa 4 suma «Nosotros» y cambia «Proyectos»
 * por «Nuestros trabajos»: cinco etiquetas, una de dos palabras, que en un
 * teléfono ocupan tres renglones de encabezado antes de la primera foto.
 *
 * **Es un `<details>` nativo, sin JavaScript propio**: el navegador lo abre y
 * lo cierra, lo anuncia como desplegado o plegado, y responde al teclado. Lo
 * único que se le agrega es cerrarse al cambiar de página —ver `key` abajo—,
 * porque el encabezado no se vuelve a dibujar al navegar y el menú quedaría
 * abierto en la página nueva.
 *
 * # La página actual
 *
 * **Es uno de los tres componentes de cliente del sitio público**, con el video
 * y el formulario de contacto, y existe por eso: marcar en qué página está el
 * visitante necesita saber la ruta actual. Se marca con `aria-current="page"`,
 * subrayado y peso — tres señales y ninguna de color, porque el menú ya es del
 * color del acento.
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
      {/*
        El teléfono. `key={ruta}` es lo que lo cierra al navegar: con otra ruta
        React lo descarta y dibuja uno nuevo, plegado.

        La lista se despliega debajo de la franja del encabezado y a todo su
        ancho —`absolute` contra el `<header>`, que es `relative`—, encima del
        contenido y no empujándolo: abrir el menú no mueve la página.
      */}
      <details key={ruta} className="group md:hidden">
        <summary className="text-acento flex min-h-11 cursor-pointer list-none items-center gap-2 text-menu font-semibold uppercase [&::-webkit-details-marker]:hidden">
          Menú
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="size-4 transition-transform duration-150 group-open:rotate-180"
          >
            <path
              d="M3 6l5 5 5-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </summary>

        <ul className="bg-superficie border-linea absolute inset-x-0 top-full z-30 border-t px-5 pb-3">
          {ENLACES.map(({ href, texto }) => {
            const activo = estaActivo(ruta, href);
            return (
              <li key={href} className="border-linea border-b last:border-b-0">
                <Link
                  href={href}
                  aria-current={activo ? "page" : undefined}
                  className={
                    "text-acento flex min-h-12 items-center text-cuerpo " +
                    "underline-offset-[6px] " +
                    (activo
                      ? "font-bold underline decoration-2"
                      : "font-medium")
                  }
                >
                  {texto}
                </Link>
              </li>
            );
          })}
        </ul>
      </details>

      {/* Escritorio: los enlaces a la vista, en una fila. */}
      <ul className="hidden md:flex md:flex-wrap md:items-center md:justify-end md:gap-x-8">
        {ENLACES.map(({ href, texto }) => {
          const activo = estaActivo(ruta, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={activo ? "page" : undefined}
                className={
                  "text-acento inline-flex min-h-11 items-center text-menu " +
                  "uppercase underline-offset-8 " +
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
