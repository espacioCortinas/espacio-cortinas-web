import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FotoImg } from "@/components/foto";
import { EnlaceWhatsapp } from "@/components/whatsapp";
import { proyectoPorSlug, proyectosPublicados } from "@/contenido";
import { portadaDe } from "@/lib/fotos";
import { metadataDePagina } from "@/lib/metadata";
import { altAutomatico } from "@/lib/texto";

/**
 * Un trabajo del portfolio.
 *
 * MAQUETACIÓN MÍNIMA A PROPÓSITO — ver la nota de `../page.tsx`.
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
    <main>
      <article>
        <h1>{proyecto.titulo}</h1>
        <p>{proyecto.ubicacion}</p>
        <p>{proyecto.descripcion}</p>

        <section>
          <h2>Fotos</h2>
          {proyecto.fotos.length === 0 ? (
            <p>Todavía no hay fotos de este proyecto.</p>
          ) : (
            <ul>
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

        <EnlaceWhatsapp
          contexto={{ tipo: "proyecto", titulo: proyecto.titulo }}
        />
      </article>
    </main>
  );
}
