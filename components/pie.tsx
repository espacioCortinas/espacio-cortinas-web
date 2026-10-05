import Link from "next/link";

import {
  EnlaceEmail,
  EnlaceRed,
  NumeroWhatsapp,
} from "@/components/medios-de-contacto";
import { Contenedor } from "@/components/ui/contenedor";
import { contacto } from "@/contenido/contacto";
import { DESCRIPCION_SITIO } from "@/lib/metadata";
import { ENLACES } from "@/lib/navegacion";

/**
 * Blancos y subrayados, que es la forma de un enlace sobre el teal oscuro, y
 * con 44 px de alto. El `gap` separa el símbolo del texto.
 */
const ENLACE_DIRECTO =
  "text-claro inline-flex min-h-11 items-center gap-2 underline decoration-1 underline-offset-4 hover:decoration-2";

/**
 * El pie del sitio.
 *
 * **La franja teal oscura del boceto de la empresa**, con el texto en blanco —
 * Fase 4.7—. El teal está apenas oscurecido respecto del boceto para que el
 * blanco encima llegue a 4,5:1 (`app/globals.css`, `--color-marca-oscuro`). Y
 * como sobre ese color el anillo de foco pizarra no se ve, el pie lo cambia a
 * blanco con `--foco`.
 *
 * **Solo dice lo que es cierto.** No hay dirección —la empresa trabaja a
 * domicilio y no dio una para publicar—. El número sale de
 * `NEXT_PUBLIC_WHATSAPP` y la casilla y las redes de `contenido/contacto.ts`,
 * que es de donde los leen también `/contacto` y la ficha de negocio local: los
 * tres dicen siempre lo mismo.
 *
 * **El nombre va escrito y no como logo**: el logo es gris carbón, y sobre el
 * teal oscuro no se leería. No hay versión clara del logo, y no se inventa una.
 *
 * **Ya no lleva el botón de WhatsApp al final.** Lo reemplaza el botón
 * flotante, que está a mano en cualquier punto de cualquier página; el número,
 * con su símbolo, sigue acá y también abre el chat.
 *
 * Sin año: el sitio se construye entero en cada despliegue, así que un «© 2026»
 * escrito acá quedaría congelado en la fecha del último build y envejecería en
 * silencio.
 */
export function Pie() {
  return (
    /*
     * Sin margen arriba: el aire que separa el pie del contenido lo pone el
     * `py` del `<main>` de cada página, que ya es el ritmo del sistema —64 en
     * teléfono, 112 en escritorio—.
     *
     * Abajo, en el teléfono, sobra lugar a propósito: es donde se apoya el
     * botón flotante de WhatsApp al llegar al final de la página, y sin ese
     * aire taparía el último enlace.
     */
    <footer className="bg-marca-oscuro text-claro [--foco:var(--color-claro)]">
      <Contenedor>
        <div className="grid gap-10 pt-12 pb-24 md:grid-cols-[1fr_auto] md:gap-20 md:py-16">
          <div>
            <p className="font-titulo text-titulo font-bold">
              Espacio Cortinas
            </p>
            <p className="max-w-lectura mt-3">{DESCRIPCION_SITIO}</p>
            <p className="mt-5">Buenos Aires</p>

            {/*
              Los medios directos, como enlaces de texto: se abre el chat, se
              escribe un mail o se abre la red con un toque, sin pasar por
              /contacto. Cada uno con su símbolo — decisión 65.
            */}
            <ul className="mt-4 flex flex-wrap gap-x-6">
              <li>
                <NumeroWhatsapp className={ENLACE_DIRECTO} />
              </li>
              <li className="min-w-0">
                <EnlaceEmail className={ENLACE_DIRECTO} />
              </li>
              {contacto.redes.map((red) => (
                <li key={red.url}>
                  <EnlaceRed red={red} className={ENLACE_DIRECTO} />
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Pie de página">
            <ul className="flex flex-col gap-1">
              {ENLACES.map(({ href, texto }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-claro inline-flex min-h-11 items-center text-menu uppercase underline-offset-8 hover:underline"
                  >
                    {texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Contenedor>
    </footer>
  );
}
