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
 * Nuestros trabajos: el portfolio.
 *
 * **Es la evidencia del sitio.** `docs/producto.md`: «Productos = qué vendemos.
 * Proyectos = qué hicimos», y los proyectos reales son la prueba de las cuatro
 * cosas que el sitio tiene que transmitir —estética, calidad, profesionalismo,
 * integralidad—. Es además el primer material corporativo del sitio, el que le
 * habla al público de oficinas.
 *
 * **«Nuestros trabajos» es el nombre que eligió la empresa** —Fase 4.7—; su
 * boceto decía «trabajos realizados». La dirección sigue siendo `/proyectos`,
 * que es la de los enlaces que ya circulan (decisión 10), y en el código y en
 * el contenido siguen siendo proyectos.
 *
 * # Los sectores
 *
 *     1  APERTURA    una frase corta, el titular y la bajada, centrados
 *     2  LISTADO     el primero en una fila del damero, de borde a borde, y
 *                    el resto en grilla — decisión 52
 *     3  CIERRE      una sola acción, en un bloque azul verdoso
 *
 * **El estado vacío sigue existiendo.** Si algún día todos los proyectos quedan
 * inactivos, el listado no desaparece del menú ni deja una página en blanco:
 * dice que está vacío, con `components/ui/vacio.tsx`. Un enlace a `/proyectos`
 * ya compartido nunca cae en el aire.
 */

export const metadata: Metadata = metadataDePagina({
  titulo: "Nuestros trabajos",
  descripcion:
    "Trabajos realizados por Espacio Cortinas en Buenos Aires: espacios " +
    "resueltos completos, con las fotos y los videos de cada uno.",
  ruta: "/proyectos",
});

export default function Proyectos() {
  const proyectos = proyectosPublicados();

  return (
    // Sin columna: la fila del listado va de borde a borde, y la apertura, la
    // grilla y el cierre ponen la suya.
    <main className="pt-12 pb-16 md:pt-20 md:pb-28">
      {/*
        La apertura, como la de cada producto: la frase corta en minúscula
        —«de principio a fin» es de la empresa, de su texto de Nosotros—, el
        titular y la bajada.
      */}
      <header className={`${CLASES_CONTENEDOR} text-center`}>
        <hgroup>
          <p className="text-texto-suave text-subtitulo">de principio a fin</p>
          <h1 className="mt-2 text-display">Nuestros trabajos</h1>
        </hgroup>

        <p className="max-w-lectura text-texto-suave mx-auto mt-6 text-left text-subtitulo">
          Espacios completos que resolvimos de principio a fin, con
          asesoramiento, medición y colocación propias. Entrá en cualquiera para
          ver todas las fotos y los videos.
        </p>
      </header>

      <div className="mt-12 md:mt-20">
        {proyectos.length === 0 ? (
          <div className={CLASES_CONTENEDOR}>
            <Vacio
              etiqueta="todavía sin trabajos publicados"
              titulo="El archivo de trabajos se está armando."
              acciones={
                <>
                  <Link
                    href="/productos"
                    className={clasesDeBoton("principal")}
                  >
                    Ver los productos
                  </Link>
                  <Link href="/contacto" className={clasesDeBoton("enlace")}>
                    Escribirnos
                  </Link>
                </>
              }
            >
              <p>
                Cada trabajo se publica con las fotos de la casa o la oficina
                donde se instaló, y preferimos no publicar ninguno antes que
                publicar algo que no sea un trabajo nuestro. Mientras tanto, el
                catálogo muestra los siete productos con fotos de instalaciones
                reales.
              </p>
            </Vacio>
          </div>
        ) : (
          <ListadoProyectos proyectos={proyectos} nivel={2} prioridad aSangre />
        )}
      </div>

      {/*
        El cierre, el bloque azul verdoso de todas las páginas. Sin proyectos no
        se dibuja: el estado vacío ya ofrece a dónde seguir, y dos bloques
        seguidos se leen como uno solo mal cortado.
      */}
      {proyectos.length > 0 && (
        <div className={`${CLASES_CONTENEDOR} mt-16 md:mt-28`}>
          <section className="bg-marca text-texto -mx-5 px-5 py-12 md:-mx-12 md:px-12 md:py-20">
            <h2 className="text-texto text-titulo">
              ¿Tenés un proyecto parecido?
            </h2>
            <p className="max-w-lectura mt-4">
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
        </div>
      )}
    </main>
  );
}
