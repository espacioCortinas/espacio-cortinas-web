import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FotoImg } from "@/components/foto";
import { Galeria } from "@/components/galeria";
import { EnlaceWhatsapp } from "@/components/whatsapp";
import { clasesDeBoton } from "@/components/ui/boton";
import { Chip } from "@/components/ui/chip";
import { CLASES_CONTENEDOR } from "@/components/ui/contenedor";
import { proyectoPorSlug, proyectosPublicados } from "@/contenido";
import { entornoPublico } from "@/lib/entorno";
import { esVideo, portadaDe } from "@/lib/fotos";
import { metadataDePagina } from "@/lib/metadata";
import { altAutomatico } from "@/lib/texto";

/**
 * Un trabajo del portfolio.
 *
 * # Los sectores
 *
 *     1  APERTURA   el título, la ubicación como chip, la descripción, una
 *                   acción y la portada
 *     2  GALERÍA    el resto de las fotos y los videos, en el orden de la
 *                   carpeta, en la tira que se desliza de costado
 *     3  CIERRE     una sola acción, sobre superficie
 *
 * Es la misma estructura que la página de producto sin el sector de variantes
 * —los proyectos no tienen—, y por las mismas razones: **el texto primero y la
 * foto después** (decisión 47), y **la portada una sola vez**, arriba, con la
 * galería empezando en la foto 2.
 *
 * **La galería es `components/galeria.tsx` tal cual**, la misma de producto:
 * mezcla orientaciones, cada foto conserva la suya, y desde la decisión 51
 * lleva los videos intercalados en su lugar, en bucle y sin sonido como los
 * de producto.
 *
 * # El llamado a la acción
 *
 * Igual que en producto: uno secundario arriba, para que WhatsApp sea
 * alcanzable sin buscarlo en un teléfono, y el principal en el cierre. Los dos
 * llevan el título del proyecto en el mensaje —«vi en su página web el
 * proyecto Cowork en Nordelta»—, así que quien atiende sabe de qué le hablan.
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
    // La portada es lo que se ve al pegar el enlace en WhatsApp. Es siempre una
    // foto, nunca un video: sale de `fotos`, no de `galeria`.
    foto: portadaDe(proyecto.fotos),
    altFoto: altAutomatico(proyecto.titulo, 1),
  });
}

/** El ritmo entre sectores: 64 en teléfono, 112 en escritorio. */
const SECTOR = "mt-16 md:mt-28";

export default async function Proyecto({ params }: Props) {
  const { slug } = await params;
  const proyecto = proyectoPorSlug(slug);
  if (!proyecto) notFound();

  const hayWhatsapp = entornoPublico.whatsapp !== null;
  const portada = portadaDe(proyecto.fotos);

  // La galería empieza después de la portada, que ya se muestra arriba.
  // `galeria` es la secuencia de la carpeta con los videos en su lugar, y su
  // primer elemento es siempre la portada — `contenido/index.ts`.
  const galeria = portada ? proyecto.galeria.slice(1) : proyecto.galeria;
  const hayVideos = galeria.some(esVideo);

  const contexto = { tipo: "proyecto" as const, titulo: proyecto.titulo };

  return (
    <main className={`${CLASES_CONTENEDOR} py-16 md:py-28`}>
      <article>
        {/* 1 — APERTURA ---------------------------------------------- */}
        <h1 className="max-w-lectura text-display">{proyecto.titulo}</h1>
        {/* El título es el trabajo y la ubicación va como chip
            (docs/producto.md). */}
        <p className="mt-5">
          <Chip>{proyecto.ubicacion}</Chip>
        </p>
        <p className="max-w-lectura mt-6 text-subtitulo">
          {proyecto.descripcion}
        </p>

        {/* `empty:hidden`: sin `NEXT_PUBLIC_WHATSAPP` no se dibuja nada, y un
            bloque vacío con su margen deja un hueco (Fase 4.6). */}
        <div className="empty:hidden mt-8">
          <EnlaceWhatsapp contexto={contexto} variante="secundario" />
        </div>

        {portada && (
          // Dentro de la columna y alineada al margen, nunca a sangre: es la
          // tesis de la dirección y es aritmética —la portada del cowork tiene
          // 2560 px, que a doble densidad dan 1280 de CSS; 544 le sobran—.
          <div className="mt-12 max-w-[34rem] md:mt-16">
            <FotoImg
              foto={portada}
              alt={altAutomatico(proyecto.titulo, 1)}
              proporcion="4/5"
              sizes="(min-width: 768px) 544px, calc(100vw - 2.5rem)"
              prioridad
            />
          </div>
        )}

        {/* 2 — GALERÍA ----------------------------------------------- */}
        {galeria.length > 0 && (
          <section className={SECTOR}>
            <h2 className="text-titulo">
              {hayVideos ? "Fotos y videos del proyecto" : "Fotos del proyecto"}
            </h2>
            <p className="max-w-lectura text-texto-suave mt-4">
              Deslizá para recorrerlas.
            </p>
            <div className="mt-8">
              <Galeria
                medios={galeria}
                nombre={proyecto.titulo}
                // La portada es la foto 1 y se muestra arriba.
                desde={portada ? 2 : 1}
              />
            </div>
          </section>
        )}

        {proyecto.galeria.length === 0 && (
          <p className="text-texto-suave mt-12">
            Todavía no hay fotos de este proyecto.
          </p>
        )}

        {/* 3 — CIERRE ------------------------------------------------ */}
        <section
          className={`${SECTOR} bg-superficie -mx-5 px-5 py-12 md:-mx-12 md:px-12 md:py-20`}
        >
          <h2 className="text-titulo">¿Tenés un proyecto parecido?</h2>
          <p className="max-w-lectura text-texto-suave mt-4">
            Escribinos contando qué espacio hay que resolver. Vamos a medir, te
            asesoramos sobre qué sistema conviene y la colocación es nuestra.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            {hayWhatsapp ? (
              <>
                <EnlaceWhatsapp contexto={contexto} />
                <Link href="/proyectos" className={clasesDeBoton("enlace")}>
                  Ver todos los proyectos
                </Link>
              </>
            ) : (
              <>
                <Link href="/contacto" className={clasesDeBoton("principal")}>
                  Escribinos
                </Link>
                <Link href="/proyectos" className={clasesDeBoton("enlace")}>
                  Ver todos los proyectos
                </Link>
              </>
            )}
          </div>
        </section>
      </article>
    </main>
  );
}
