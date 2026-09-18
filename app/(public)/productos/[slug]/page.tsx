import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FotoImg } from "@/components/foto";
import { EnlaceWhatsapp } from "@/components/whatsapp";
import { Chip } from "@/components/ui/chip";
import { CLASES_CONTENEDOR } from "@/components/ui/contenedor";
import { productoPorSlug, productosPublicados } from "@/contenido";
import { portadaDe } from "@/lib/fotos";
import { metadataDePagina } from "@/lib/metadata";
import { altAutomatico } from "@/lib/texto";

/**
 * Un producto del catálogo.
 *
 * ARMAZÓN, NO COMPOSICIÓN — ver la nota de `../page.tsx`. **La página de
 * producto se compone en la Fase 4.4**: la galería, cómo entran las variantes y
 * dónde van los dos videos son de ahí. Lo que hay acá son los componentes del
 * sistema aplicados a la estructura que ya existía.
 */

type Props = { params: Promise<{ slug: string }> };

/**
 * Las rutas salen del contenido, no de una lista escrita a mano: agregar un
 * producto a `contenido/productos.ts` crea su página, y despublicarlo la saca.
 */
export function generateStaticParams() {
  return productosPublicados().map((producto) => ({ slug: producto.slug }));
}

/**
 * Con esto, un slug que no está en la lista devuelve 404 servido como estático
 * en vez de intentar renderizarse en el Worker. No hay contenido que pueda
 * aparecer entre dos builds: todo está adentro del build.
 */
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const producto = productoPorSlug(slug);
  if (!producto) return {};

  return metadataDePagina({
    titulo: producto.nombre,
    descripcion: producto.descripcion,
    ruta: `/productos/${producto.slug}`,
    // La portada es lo que se ve al pegar el enlace en WhatsApp, que es por
    // donde se comparte este sitio.
    foto: portadaDe(producto.fotos),
    altFoto: altAutomatico(producto.nombre, 1),
  });
}

export default async function Producto({ params }: Props) {
  const { slug } = await params;
  const producto = productoPorSlug(slug);
  if (!producto) notFound();

  return (
    <main className={`${CLASES_CONTENEDOR} py-16 md:py-28`}>
      <article>
        <h1 className="text-display">{producto.nombre}</h1>
        <p className="max-w-lectura mt-6 text-subtitulo">
          {producto.descripcion}
        </p>

        {producto.variantes.length > 0 && (
          <section className="mt-12 md:mt-16">
            {/* Las variantes no son productos aparte: son opciones del mismo
                producto, sin página propia (decisión 11). La descripción es
                opcional y solo está donde la diferencia hay que explicarla. */}
            <h2 className="text-titulo">Variantes</h2>
            <ul className="mt-6 flex flex-col gap-5">
              {producto.variantes.map((variante) => (
                <li key={variante.nombre}>
                  <Chip>{variante.nombre}</Chip>
                  {variante.descripcion ? (
                    <p className="max-w-lectura text-texto-suave mt-2">
                      {variante.descripcion}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-12 md:mt-16">
          <h2 className="text-titulo">Fotos</h2>
          {producto.fotos.length === 0 ? (
            <p className="text-texto-suave mt-6">
              Todavía no hay fotos de este producto.
            </p>
          ) : (
            /* `propia`: la galería respeta la proporción de cada foto, porque
               el archivo es mitad vertical y mitad horizontal y una galería que
               suponga un formato se rompe la mitad de las veces. */
            <ul className="mt-6 flex flex-col gap-8">
              {producto.fotos.map((foto, i) => (
                <li key={foto.carpeta}>
                  <div className="max-w-2xl">
                    <FotoImg
                      foto={foto}
                      alt={altAutomatico(producto.nombre, i + 1)}
                      sizes="(max-width: 672px) 100vw, 672px"
                      prioridad={i === 0}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* El mensaje lleva el nombre de este producto: quien atiende sabe de
            qué le están hablando sin preguntarlo (docs/producto.md). */}
        <div className="empty:hidden mt-16 md:mt-20">
          <EnlaceWhatsapp
            contexto={{ tipo: "producto", nombre: producto.nombre }}
          />
        </div>
      </article>
    </main>
  );
}
