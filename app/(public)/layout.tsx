import { DatosEstructurados } from "@/components/datos-estructurados";
import { Encabezado } from "@/components/encabezado";
import { Pie } from "@/components/pie";
import { WhatsappFlotante } from "@/components/whatsapp";

/**
 * Layout de las páginas públicas: el encabezado, el contenido y el pie.
 *
 * El `<header>`, el `<nav>` y el `<footer>` ya eran definitivos como estructura
 * desde la Fase 4.0; la 4.2 les dio forma y los movió a
 * `components/encabezado.tsx` y `components/pie.tsx`. **Están afuera de este
 * archivo a propósito**: `app/not-found.tsx` los necesita igual, y una página
 * que no existe dentro de este grupo de rutas no puede heredar este layout.
 *
 * El salto al contenido es lo primero que recibe el foco al tabular. Sin él,
 * quien navega con teclado tiene que pasar por los cuatro enlaces del menú en
 * cada página antes de llegar a leer nada.
 *
 * El botón flotante de WhatsApp va al final del documento, después del pie: es
 * lo último a lo que se llega tabulando, y no se interpone entre el salto y el
 * contenido. Se ve siempre igual porque es `fixed`.
 */
export default function LayoutPublico({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DatosEstructurados />
      <SaltoAlContenido />
      <Encabezado />
      {/*
        `tabIndex={-1}` es lo que hace que el salto funcione de verdad: sin él,
        el navegador mueve la vista pero deja el foco donde estaba, y el próximo
        tabulador vuelve al menú.
      */}
      <div id="contenido" tabIndex={-1}>
        {children}
      </div>
      <Pie />
      <WhatsappFlotante />
    </>
  );
}

/**
 * Invisible hasta que recibe el foco, y ahí aparece arriba de todo.
 *
 * No se oculta con `display:none` ni con `visibility:hidden`, que lo sacarían
 * del orden de tabulación y lo volverían inalcanzable: se lo manda fuera de la
 * pantalla y vuelve al enfocarlo.
 */
function SaltoAlContenido() {
  return (
    <a
      href="#contenido"
      className="bg-acento text-claro sr-only px-4 py-3 text-cuerpo focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-40"
    >
      Ir al contenido
    </a>
  );
}
