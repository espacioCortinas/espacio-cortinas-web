import Link from "next/link";

import { DatosEstructurados } from "@/components/datos-estructurados";

/**
 * Layout de las páginas públicas.
 *
 * LA NAVEGACIÓN Y EL PIE NO ESTÁN DISEÑADOS. Son una lista de enlaces sin
 * estilo, y están acá porque sin ellos las páginas de esta fase no se pueden
 * recorrer. La versión real se construye en la Fase 4.2, después de fijar la
 * dirección visual (docs/plan.md).
 *
 * El `<header>`, el `<nav>` y el `<footer>` sí son definitivos como estructura:
 * lo que cambia en la 4.2 es cómo se ven, no qué elementos son.
 */
export default function LayoutPublico({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DatosEstructurados />
      <header>
        <nav aria-label="Principal">
          <ul>
            <li>
              <Link href="/">Inicio</Link>
            </li>
            <li>
              <Link href="/productos">Productos</Link>
            </li>
            <li>
              <Link href="/proyectos">Proyectos</Link>
            </li>
            <li>
              <Link href="/contacto">Contacto</Link>
            </li>
          </ul>
        </nav>
      </header>
      {children}
      <footer>
        <p>Espacio Cortinas — Buenos Aires</p>
      </footer>
    </>
  );
}
