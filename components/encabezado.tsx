"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/logo";
import { Navegacion } from "@/components/navegacion";
import { Contenedor } from "@/components/ui/contenedor";

/**
 * El encabezado del sitio.
 *
 * La estructura —`<header>`, `<nav aria-label="Principal">`, la lista de
 * enlaces— es la misma que dejó la Fase 4.0. Lo que cambió en la 4.7 es cómo se
 * ve.
 *
 * **Una franja blanca, como la del boceto de la empresa**, sobre el gris del
 * fondo: lo que la separa del contenido es el cambio de color, sin filete ni
 * sombra. Adentro, el logo y los enlaces: en escritorio en una fila, el logo a
 * la izquierda y los enlaces a la derecha; en el teléfono los enlaces bajan a
 * su propia fila, debajo del logo (ver `components/navegacion.tsx`).
 *
 * # En Inicio no hay logo ni franja
 *
 * **Inicio abre con el logo grande**, en el bloque azul verdoso de la apertura,
 * que es la imagen central del boceto. Con el del encabezado arriba, el logo
 * salía dos veces en la primera pantalla del teléfono, una encima de la otra.
 * El boceto lo resuelve igual: su encabezado no lleva el logo, y el único es el
 * del bloque.
 *
 * Así que en Inicio el encabezado son solo los enlaces, sin la franja blanca:
 * una franja con un hueco donde iba el logo se leería como algo que falta. En
 * el resto de las páginas no hay logo grande, y el del encabezado es el que
 * dice de quién es el sitio.
 *
 * **Por eso es un componente de cliente**: necesita saber en qué página está.
 * Se dibuja igual en el servidor —`usePathname()` responde también ahí—, así
 * que Inicio llega sin el logo en el HTML y no aparece y desaparece al cargar.
 *
 * **No se pega arriba al hacer scroll.** Un encabezado fijo se come una franja
 * de una pantalla de teléfono en un sitio cuyo contenido son fotos. Lo que sí
 * queda siempre a mano es WhatsApp, en el botón flotante.
 *
 * El logo es también el enlace a Inicio. Su texto alternativo —«Espacio
 * Cortinas»— es el nombre accesible del enlace, así que no lleva `aria-label`
 * encima, que lo duplicaría.
 */
export function Encabezado() {
  const enInicio = usePathname() === "/";

  return (
    <header className={enInicio ? "" : "bg-superficie"}>
      <Contenedor>
        <div
          className={
            "flex flex-col gap-1 py-3 md:flex-row md:items-center md:gap-10 md:py-5 " +
            (enInicio ? "md:justify-end" : "md:justify-between")
          }
        >
          {!enInicio && (
            <Link href="/" className="inline-flex w-fit items-center py-2">
              <Logo />
            </Link>
          )}
          <Navegacion />
        </div>
      </Contenedor>
    </header>
  );
}
