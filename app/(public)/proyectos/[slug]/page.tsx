import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FotoImg } from "@/components/foto";
import { EnlaceWhatsapp } from "@/components/whatsapp";
import { Chip } from "@/components/ui/chip";
import { CLASES_CONTENEDOR } from "@/components/ui/contenedor";
import { proyectoPorSlug, proyectosPublicados } from "@/contenido";
import { portadaDe } from "@/lib/fotos";
import { metadataDePagina } from "@/lib/metadata";
import { altAutomatico } from "@/lib/texto";

/**
 * Un trabajo del portfolio.
 *
 * ARMAZÓN, NO COMPOSICIÓN — ver la nota de `../page.tsx`. **La página de
 * proyecto se compone en la Fase 4.3**, con la galería. Lo que hay acá son los
 * componentes del sistema aplicados a la estructura que ya existía.
 *
 * Hoy no genera ninguna página: `contenido/proyectos.ts` está vacío. La ruta
 * existe igual para que cargar el primer proyecto sea agregar un bloque de
 * texto y sus fotos, sin escribir código.
 */

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return proyectosPublicados().map((proyecto) => ({ slug: proyecto.slug }));
}

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
    foto: portadaDe(proyecto.fotos),
    altFoto: altAutomatico(proyecto.titulo, 1),
  });
}

export default async function Proyecto({ params }: Props) {
  const { slug } = await params;
  const proyecto = proyectoPorSlug(slug);
  if (!proyecto) notFound();

  return (
    <main className={`${CLASES_CONTENEDOR} py-16 md:py-28`}>
      <article>
        <h1 className="text-display">{proyecto.titulo}</h1>
        {/* El título es el trabajo y la ubicación va como chip
            (docs/producto.md). */}
        <p className="mt-5">
          <Chip>{proyecto.ubicacion}</Chip>
        </p>
        <p className="max-w-lectura mt-6 text-subtitulo">
          {proyecto.descripcion}
        </p>

        <section className="mt-12 md:mt-16">
          <h2 className="text-titulo">Fotos</h2>
          {proyecto.fotos.length === 0 ? (
            <p className="text-texto-suave mt-6">
              Todavía no hay fotos de este proyecto.
            </p>
          ) : (
            <ul className="mt-6 flex flex-col gap-8">
              {proyecto.fotos.map((foto, i) => (
                <li key={foto.carpeta}>
                  <div className="max-w-2xl">
                    <FotoImg
                      foto={foto}
                      alt={altAutomatico(proyecto.titulo, i + 1)}
                      sizes="(max-width: 672px) 100vw, 672px"
                      prioridad={i === 0}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="empty:hidden mt-16 md:mt-20">
          <EnlaceWhatsapp
            contexto={{ tipo: "proyecto", titulo: proyecto.titulo }}
          />
        </div>
      </article>
    </main>
  );
}
