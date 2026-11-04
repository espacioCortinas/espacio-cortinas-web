import type { Metadata } from "next";
import Link from "next/link";

import {
  CeldaDeTexto,
  FilaConLineas,
  FotoEnCelda,
  MarcoDelDamero,
} from "@/components/damero";
import { EnlaceWhatsapp } from "@/components/whatsapp";
import { clasesDeBoton } from "@/components/ui/boton";
import { CLASES_CONTENEDOR } from "@/components/ui/contenedor";
import { fotoDe, productoPorSlug, proyectoPorSlug } from "@/contenido";
import { nosotros, type SeccionDeNosotros } from "@/contenido/nosotros";
import { metadataDePagina } from "@/lib/metadata";
import { altAutomatico } from "@/lib/texto";

/**
 * Nosotros — página nueva de la Fase 4.7, a pedido de la empresa.
 *
 * # Por qué existe ahora, si la decisión 47 la había dejado afuera
 *
 * La decisión 47 sacó «Empresa» de la apertura de Inicio porque no había con
 * qué sostenerla: ni foto de equipo, ni taller, ni años documentados. **Lo que
 * cambió es que ahora hay texto, y es de la empresa**: su boceto tenía dos
 * páginas sobre quiénes son, con su propósito, su visión y su servicio. La
 * foto de equipo sigue sin existir, y por eso cada texto va al lado de una
 * foto de su trabajo y no de su gente.
 *
 * # Los sectores
 *
 *     1  APERTURA   el título y la bajada, centrados
 *     2  DAMERO     propósito, visión y «Cuidamos los detalles», cada uno con
 *                   una foto, alternando el lado
 *     3  CIERRE     una sola acción, en un bloque azul verdoso
 *
 * El damero es el de las páginas de producto, armado a mano con sus mismas
 * piezas (`components/damero.tsx`). Los textos están en `contenido/nosotros.ts`.
 *
 * **No lleva el logo en círculo** que el boceto ponía al final: ya está arriba,
 * en el encabezado, en el lugar del enlace «Inicio» (`components/navegacion.tsx`).
 */

export const metadata: Metadata = metadataDePagina({
  titulo: nosotros.titulo,
  descripcion: nosotros.bajada,
  ruta: "/nosotros",
});

/**
 * El texto alternativo de la foto de una sección: el nombre del producto o el
 * título del proyecto, y la posición, como en el resto del sitio. Las fotos
 * propias de la página son trabajos de la empresa.
 */
function altDe({ entidad, slug, posicion }: SeccionDeNosotros["foto"]) {
  const nombre =
    entidad === "productos"
      ? productoPorSlug(slug)?.nombre
      : entidad === "proyectos"
        ? proyectoPorSlug(slug)?.titulo
        : "Un trabajo de Espacio Cortinas";
  return altAutomatico(nombre ?? "Espacio Cortinas", posicion);
}

export default function Nosotros() {
  return (
    // Sin columna: el damero va de borde a borde, y la apertura y el cierre
    // ponen la suya.
    <main className="pt-12 pb-16 md:pt-20 md:pb-28">
      <header className={`${CLASES_CONTENEDOR} text-center`}>
        <h1 className="text-display">{nosotros.titulo}</h1>
        {/* Una sola oración: centrada se lee bien. */}
        <p className="max-w-lectura mx-auto mt-6 text-subtitulo">
          {nosotros.bajada}
        </p>
      </header>

      <div className="mt-12 md:mt-20">
        <MarcoDelDamero>
          {nosotros.secciones.map((seccion, i) => {
            const foto = fotoDe(
              seccion.foto.entidad,
              seccion.foto.slug,
              seccion.foto.posicion,
            );
            const texto = (
              <CeldaDeTexto>
                <h2 className="text-titulo">{seccion.titulo}</h2>
                {/* Alineado a la izquierda: son tres o cinco renglones. */}
                <p className="mt-5 max-w-[40ch] text-left">{seccion.texto}</p>
              </CeldaDeTexto>
            );

            return (
              <section key={seccion.titulo}>
                {/* Si la foto se saca del archivo, la sección queda igual, sola
                    en su fila: el texto es lo que importa. */}
                <FilaConLineas
                  invertida={i % 2 === 1}
                  primera={
                    foto ? (
                      <FotoEnCelda
                        foto={foto}
                        alt={altDe(seccion.foto)}
                        prioridad={i === 0}
                      />
                    ) : (
                      texto
                    )
                  }
                  segunda={foto ? texto : undefined}
                />
              </section>
            );
          })}
        </MarcoDelDamero>
      </div>

      {/* El cierre, el bloque azul verdoso de todas las páginas. */}
      <div className={`${CLASES_CONTENEDOR} mt-16 md:mt-28`}>
        <section className="bg-marca text-texto -mx-5 px-5 py-12 md:-mx-12 md:px-12 md:py-20">
          <h2 className="text-texto text-titulo">{nosotros.cierre.titulo}</h2>
          <p className="max-w-lectura mt-4">{nosotros.cierre.texto}</p>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <EnlaceWhatsapp contexto={{ tipo: "general" }} />
            <Link href="/contacto" className={clasesDeBoton("enlace")}>
              Otras formas de contacto
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
