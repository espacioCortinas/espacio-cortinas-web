import type { Metadata } from "next";
import Link from "next/link";

import { ListadoProyectos } from "@/components/listado-proyectos";
import { EnlaceWhatsapp } from "@/components/whatsapp";
import { clasesDeBoton } from "@/components/ui/boton";
import { CLASES_CONTENEDOR } from "@/components/ui/contenedor";
import { Vacio } from "@/components/ui/vacio";
import { proyectosPublicados } from "@/contenido";
import { metadataDePagina } from "@/lib/metadata";

/**
 * El portfolio.
 *
 * **Es la evidencia del sitio.** `docs/producto.md`: «Productos = qué vendemos.
 * Proyectos = qué hicimos», y los proyectos reales son la prueba de las cuatro
 * cosas que el sitio tiene que transmitir —estética, calidad, profesionalismo,
 * integralidad—. Es además el primer material corporativo del sitio, el que le
 * habla al público de oficinas.
 *
 * # Los sectores
 *
 *     1  APERTURA    antetítulo con el recuento, titular y bajada
 *     2  LISTADO     el primero en fila y el resto en grilla — decisión 52
 *     3  CIERRE      una sola acción, sobre superficie
 *
 * La apertura usa las mismas tres piezas que `/productos` (decisión 49): un
 * dato en el antetítulo, contado del arreglo, un titular que dice qué hay en
 * vez de repetir el nombre del menú, y una bajada que avisa que cada trabajo
 * se abre.
 *
 * **El estado vacío sigue existiendo.** Si algún día todos los proyectos quedan
 * inactivos, el listado no desaparece del menú ni deja una página en blanco:
 * dice que está vacío, con `components/ui/vacio.tsx`. Un enlace a `/proyectos`
 * ya compartido nunca cae en el aire.
 */

export const metadata: Metadata = metadataDePagina({
  titulo: "Proyectos",
  descripcion:
    "Proyectos realizados por Espacio Cortinas en Buenos Aires: espacios " +
    "resueltos completos, con las fotos y los videos de cada uno.",
  ruta: "/proyectos",
});

export default function Proyectos() {
  const proyectos = proyectosPublicados();

  return (
    <main className={`${CLASES_CONTENEDOR} py-16 md:py-28`}>
      <header>
        <p className="text-texto-suave text-meta tracking-[0.12em] uppercase">
          Portfolio
          {proyectos.length > 0 &&
            ` · ${proyectos.length} proyecto${proyectos.length === 1 ? "" : "s"}`}
        </p>

        <h1 className="mt-4 text-display">Proyectos Realizados</h1>

        <p className="max-w-lectura text-texto-suave mt-6 text-subtitulo">
          Espacios completos que resolvimos de principio a fin, con
          asesoramiento, medición y colocación propias. Entrá en cualquiera para
          ver todas las fotos y los videos.
        </p>
      </header>

      <div className="mt-12 md:mt-16">
        {proyectos.length === 0 ? (
          <Vacio
            etiqueta="Todavía sin proyectos publicados"
            titulo="El archivo de proyectos se está armando."
            acciones={
              <>
                <Link href="/productos" className={clasesDeBoton("principal")}>
                  Ver los productos
                </Link>
                <Link href="/contacto" className={clasesDeBoton("enlace")}>
                  Escribirnos
                </Link>
              </>
            }
          >
            <p>
              Cada proyecto se publica con las fotos de la casa o la oficina
              donde se instaló, y preferimos no publicar ninguno antes que
              publicar algo que no sea un trabajo nuestro. Mientras tanto, el
              catálogo muestra los siete productos con fotos de instalaciones
              reales.
            </p>
          </Vacio>
        ) : (
          <ListadoProyectos proyectos={proyectos} nivel={2} prioridad />
        )}
      </div>

      {/*
        El cierre, con el mismo bloque de superficie que Inicio y el catálogo.
        Sin proyectos no se dibuja: el estado vacío ya ofrece a dónde seguir, y
        dos bloques de superficie seguidos se leen como uno solo mal cortado.
      */}
      {proyectos.length > 0 && (
        <section className="bg-superficie mt-16 -mx-5 px-5 py-12 md:mt-28 md:-mx-12 md:px-12 md:py-20">
          <h2 className="text-titulo">¿Tenés un proyecto parecido?</h2>
          <p className="max-w-lectura text-texto-suave mt-4">
            Contanos qué espacio hay que resolver —una casa, una obra o una
            oficina— y te asesoramos sobre qué sistema conviene.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <EnlaceWhatsapp contexto={{ tipo: "general" }} />
            <Link href="/contacto" className={clasesDeBoton("enlace")}>
              Otras formas de contacto
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
