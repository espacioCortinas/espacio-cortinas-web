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
 * sombra. Adentro, el logo a la izquierda y el menú a la derecha, en una sola
 * fila también en el teléfono, donde el menú es un botón (ver
 * `components/navegacion.tsx`).
 *
 * # En Inicio no hay logo ni franja
 *
 * **Inicio abre con el logo grande**, en el bloque azul verdoso de la apertura,
 * que es la imagen central del boceto. Con el del encabezado arriba, el logo
 * salía dos veces en la primera pantalla del teléfono, una encima de la otra.
 * El boceto lo resuelve igual: su encabezado no lleva el logo, y el único es el
 * del bloque.
 *
 * Así que en Inicio el encabezado es solo el menú, a la derecha y sin la franja
 * blanca: una franja con un hueco a la izquierda se leería como algo que
 * falta. En el resto de las páginas no hay logo grande, y el del encabezado es
 * el que dice de quién es el sitio.
 *
 * **Por eso es un componente de cliente**: necesita saber en qué página está.
 * Se dibuja igual en el servidor —`usePathname()` responde también ahí—, así
 * que Inicio llega sin el logo en el HTML y no aparece y desaparece al cargar.
 *
 * **No se pega arriba al hacer scroll.** Un encabezado fijo se come una franja
 * de una pantalla de teléfono en un sitio cuyo contenido son fotos. Lo que sí
 * queda siempre a mano es WhatsApp, en el botón flotante.
 *
 * `relative` porque el menú del teléfono se despliega debajo de esta franja, a
 * todo el ancho, y se posiciona contra ella.
 *
 * El logo es también el enlace a Inicio. Su texto alternativo —«Espacio
 * Cortinas»— es el nombre accesible del enlace, así que no lleva `aria-label`
 * encima, que lo duplicaría.
 */
export function Encabezado() {
  const enInicio = usePathname() === "/";

  return (
    <header className={`relative ${enInicio ? "" : "bg-superficie"}`}>
      <Contenedor>
        <div
          className={
            "flex items-center gap-6 py-3 md:gap-10 md:py-5 " +
            (enInicio ? "justify-end" : "justify-between")
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
