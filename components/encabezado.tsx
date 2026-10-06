import { Navegacion } from "@/components/navegacion";
import { Contenedor } from "@/components/ui/contenedor";

/**
 * El encabezado del sitio.
 *
 * La estructura —`<header>`, `<nav aria-label="Principal">`, la lista de
 * enlaces— es la misma que dejó la Fase 4.0. Lo que cambió en la 4.7 es cómo se
 * ve.
 *
 * **Es la barra de los enlaces, y se ve igual en todas las páginas**: sobre el
 * fondo, sin franja ni filete, a la derecha en escritorio y a lo ancho en el
 * teléfono. Lo único que cambia es el primer enlace: en Inicio dice «Inicio»,
 * y en las demás es el logo circular de la empresa
 * (`components/navegacion.tsx`).
 *
 * Hasta el ajuste del 06/10/2026 no era así: fuera de Inicio el encabezado era
 * una franja blanca con el logo de línea a la izquierda, y en Inicio quedaban
 * solo los enlaces, porque ahí el logo grande de la apertura no podía tener
 * otro encima. Quien desarrolla pidió la misma barra en todas, con el logo
 * circular en el lugar de «Inicio».
 *
 * **No se pega arriba al hacer scroll.** Un encabezado fijo se come una franja
 * de una pantalla de teléfono en un sitio cuyo contenido son fotos. Lo que sí
 * queda siempre a mano es WhatsApp, en el botón flotante.
 */
export function Encabezado() {
  return (
    <header>
      <Contenedor>
        <div className="py-3 md:flex md:justify-end md:py-5">
          <Navegacion />
        </div>
      </Contenedor>
    </header>
  );
}
