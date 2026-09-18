import type { Metadata } from "next";
import Link from "next/link";

import { TarjetaProducto } from "@/components/tarjeta-producto";
import { EnlaceWhatsapp } from "@/components/whatsapp";
import { clasesDeBoton } from "@/components/ui/boton";
import { CLASES_CONTENEDOR } from "@/components/ui/contenedor";
import { Vacio } from "@/components/ui/vacio";
import { productosPublicados } from "@/contenido";
import { entornoPublico } from "@/lib/entorno";
import { metadataDePagina } from "@/lib/metadata";

/**
 * El catálogo.
 *
 * # Es una grilla de portadas con su nombre, y nada más
 *
 * **Reusa `components/tarjeta-producto.tsx`**, que es el elemento de grilla del
 * sitio y el que ya usa Inicio: no hay una segunda tarjeta. Lo único que se le
 * agregó en esta fase es `nivel`, porque acá la grilla cuelga del `<h1>` y en
 * Inicio de un `<h2>` — el aspecto no cambió, así que Inicio sigue igual.
 *
 * **No lleva la descripción de cada producto**, contra lo que hacía el armazón
 * de la 4.0, y son tres razones:
 *
 * - Las descripciones son un párrafo largo cada una, escritas por la empresa
 *   para explicar el producto, no para una tarjeta. Recortadas a 180
 *   caracteres se leen como prosa cortada al medio.
 * - **`venecianas-madera` y `venecianas-pvc` tienen la misma descripción
 *   palabra por palabra**, y en esta grilla quedan una al lado de la otra. La
 *   corrige la empresa, no el desarrollo; mientras tanto, mostrarla dos veces
 *   sería subrayar el problema.
 * - Lo único que los cuatro sitios de referencia comparten es una grilla de
 *   fotos con nombre — decisión 47. Ninguno se sostiene con texto.
 *
 * El texto completo está en la página de cada producto, que es donde se lee
 * entero y no cortado.
 *
 * # La grilla
 *
 * Una columna en teléfono, dos desde 640 y tres desde 1024. **En teléfono no
 * son dos**, a diferencia de Inicio: a 320 px de ancho, dos columnas dejan cada
 * portada en 130 px, que para una foto de interior es una estampilla. Inicio se
 * lo puede permitir porque muestra cuatro productos como anticipo; el catálogo
 * es el lugar donde se los mira.
 */

export const metadata: Metadata = metadataDePagina({
  titulo: "Productos",
  descripcion:
    "Rollers blackout y screen, cortinas de tela, venecianas y toldos. " +
    "Todo a medida, con asesoramiento y colocación en Buenos Aires.",
  ruta: "/productos",
});

export default function Productos() {
  const productos = productosPublicados();
  const hayWhatsapp = entornoPublico.whatsapp !== null;

  return (
    <main className={`${CLASES_CONTENEDOR} py-16 md:py-28`}>
      <h1 className="text-display">Productos</h1>
      <p className="max-w-lectura text-texto-suave mt-6 text-subtitulo">
        Cortinas y protección solar a medida, con asesoramiento y colocación.
        Todo se fabrica para su ventana y lo colocamos nosotros.
      </p>

      {productos.length === 0 ? (
        // Un listado vacío se dice, no se tapa: es información sobre el estado
        // del contenido, no un problema a esconder. Hoy este camino no se
        // recorre —hay siete productos— pero es el mismo componente que sí se
        // ve en `/proyectos`.
        <div className="mt-12 md:mt-16">
          <Vacio
            etiqueta="Todavía sin productos publicados"
            titulo="El catálogo se está cargando."
          >
            <p>
              En cuanto haya productos publicados aparecen acá, con sus fotos y
              sus variantes.
            </p>
          </Vacio>
        </div>
      ) : (
        <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {productos.map((producto, i) => (
            <li key={producto.slug}>
              <TarjetaProducto
                producto={producto}
                // La grilla cuelga del `<h1>` de esta página, así que el nombre
                // de cada producto es un `h2`.
                nivel={2}
                // El mismo dato que los anchos de la grilla de arriba, escrito
                // dos veces. Cambian juntos.
                sizes="(min-width: 1216px) 325px, (min-width: 1024px) calc((100vw - 9rem) / 3), (min-width: 768px) calc((100vw - 7.5rem) / 2), (min-width: 640px) calc((100vw - 4rem) / 2), calc(100vw - 2.5rem)"
                prioridad={i === 0}
              />
            </li>
          ))}
        </ul>
      )}

      {/*
        El cierre, con el mismo bloque de superficie que usa Inicio: un sector
        de verdad, con su ritmo vertical, y una sola acción.
      */}
      <section className="bg-superficie mt-16 -mx-5 px-5 py-12 md:mt-28 md:-mx-12 md:px-12 md:py-20">
        <h2 className="text-titulo">¿No sabés cuál te conviene?</h2>
        <p className="max-w-lectura text-texto-suave mt-4">
          Contanos qué ventana tenés que resolver —cuánta luz entra, cuánta
          privacidad hace falta— y te asesoramos sobre qué sistema va mejor.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
          {hayWhatsapp ? (
            <>
              <EnlaceWhatsapp contexto={{ tipo: "general" }} />
              <Link href="/contacto" className={clasesDeBoton("enlace")}>
                Otras formas de contacto
              </Link>
            </>
          ) : (
            // Sin número cargado el botón de WhatsApp no se dibuja (Fase 4.6),
            // y un cierre sin ninguna acción no cierra nada. Es el mismo camino
            // que toma Inicio.
            <Link href="/contacto" className={clasesDeBoton("principal")}>
              Escribinos
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
