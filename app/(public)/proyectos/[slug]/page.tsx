import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Damero } from "@/components/damero";
import { EnlaceWhatsapp } from "@/components/whatsapp";
import { clasesDeBoton } from "@/components/ui/boton";
import { Chip } from "@/components/ui/chip";
import { CLASES_CONTENEDOR } from "@/components/ui/contenedor";
import { proyectoPorSlug, proyectosPublicados } from "@/contenido";
import { filasDeProyecto } from "@/lib/damero";
import { esVideo } from "@/lib/fotos";
import { metadataDePagina } from "@/lib/metadata";

/**
 * Un trabajo del portfolio.
 *
 * # Los sectores
 *
 *     1  APERTURA   el título, la ubicación como chip, la descripción y una
 *                   acción, centrados
 *     2  DAMERO     las fotos y los videos, de a dos, de borde a borde
 *     3  CIERRE     una sola acción, en un bloque azul verdoso
 *
 * Es la misma página que la de producto —la del boceto de la empresa, Fase
 * 4.7— sin recuadro ni variantes, que los proyectos no tienen. El damero lleva
 * la galería entera en el orden de la carpeta, con los videos en su lugar
 * (decisión 51); la portada es su primera celda y se muestra una sola vez.
 *
 * # El llamado a la acción
 *
 * Igual que en producto: uno secundario arriba y el principal en el cierre, los
 * dos con el título del proyecto en el mensaje —«vi en su página web el
 * proyecto Cowork en Nordelta»—, así quien atiende sabe de qué le hablan.
 */

type Props = { params: Promise<{ slug: string }> };

/**
 * Las rutas salen del contenido: agregar un proyecto a
 * `contenido/proyectos.ts` crea su página, y despublicarlo la saca.
 */
export function generateStaticParams() {
  return proyectosPublicados().map((proyecto) => ({ slug: proyecto.slug }));
}

/** Un slug que no está en la lista es un 404 estático. Ver `/productos/[slug]`. */
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const proyecto = proyectoPorSlug(slug);
  if (!proyecto) return {};

  return metadataDePagina({
    titulo: proyecto.titulo,
    // La ubicación entra en la descripción compartida: en una previsualización
    // de WhatsApp, «Nordelta» dice tanto como el título.
    descripcion: `${proyecto.ubicacion}. ${proyecto.descripcion}`,
    ruta: `/proyectos/${proyecto.slug}`,
  });
}

export default async function Proyecto({ params }: Props) {
  const { slug } = await params;
  const proyecto = proyectoPorSlug(slug);
  if (!proyecto) notFound();

  const filas = filasDeProyecto(proyecto);
  const hayVideos = proyecto.galeria.some(esVideo);
  const contexto = { tipo: "proyecto" as const, titulo: proyecto.titulo };

  return (
    // Sin columna: el damero va de borde a borde, y la apertura y el cierre
    // ponen la suya.
    <main className="pt-12 pb-16 md:pt-20 md:pb-28">
      <article>
        {/* 1 — APERTURA ---------------------------------------------- */}
        <div className={`${CLASES_CONTENEDOR} text-center`}>
          <h1 className="text-display">{proyecto.titulo}</h1>
          {/* El título es el trabajo y la ubicación va como chip
              (docs/producto.md). */}
          <p className="mt-5">
            <Chip>{proyecto.ubicacion}</Chip>
          </p>
          <p className="max-w-lectura mx-auto mt-6 text-left text-subtitulo">
            {proyecto.descripcion}
          </p>

          <div className="mt-8">
            <EnlaceWhatsapp contexto={contexto} variante="secundario" />
          </div>
        </div>

        {/* 2 — DAMERO ------------------------------------------------ */}
        {filas.length > 0 ? (
          <section aria-labelledby="fotos" className="mt-12 md:mt-20">
            <h2 id="fotos" className="sr-only">
              {hayVideos ? "Fotos y videos del proyecto" : "Fotos del proyecto"}
            </h2>
            <Damero filas={filas} />
          </section>
        ) : (
          <p className={`${CLASES_CONTENEDOR} text-texto-suave mt-12`}>
            Todavía no hay fotos de este proyecto.
          </p>
        )}

        {/* 3 — CIERRE ------------------------------------------------ */}
        <div className={`${CLASES_CONTENEDOR} mt-16 md:mt-28`}>
          {/* El mismo bloque que el cierre de producto: ver allá. */}
          <section className="bg-marca text-texto -mx-5 px-5 py-12 md:-mx-12 md:px-12 md:py-20">
            <h2 className="text-texto text-titulo">
              ¿Tenés un proyecto parecido?
            </h2>
            <p className="max-w-lectura mt-4">
              Escribinos contando qué espacio hay que resolver. Vamos a medir,
              te asesoramos sobre qué sistema conviene y la colocación es
              nuestra.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
              <EnlaceWhatsapp contexto={contexto} />
              <Link href="/proyectos" className={clasesDeBoton("enlace")}>
                Ver todos los trabajos
              </Link>
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}
