import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FotoImg } from "@/components/foto";
import { EnlaceWhatsapp } from "@/components/whatsapp";
import { productoPorSlug, productosPublicados } from "@/contenido";
import { portadaDe } from "@/lib/fotos";
import { metadataDePagina } from "@/lib/metadata";
import { altAutomatico } from "@/lib/texto";

/**
 * Un producto del catálogo.
 *
 * MAQUETACIÓN MÍNIMA A PROPÓSITO — ver la nota de `../page.tsx`.
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
    <main>
      <article>
        <h1>{producto.nombre}</h1>
        <p>{producto.descripcion}</p>

        {producto.variantes.length > 0 && (
          <section>
            {/* Las variantes no son productos aparte: son opciones del mismo
                producto, sin página ni foto propia (decisión 11). */}
            <h2>Variantes</h2>
            <ul>
              {producto.variantes.map((variante) => (
                <li key={variante}>{variante}</li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2>Fotos</h2>
          {producto.fotos.length === 0 ? (
            <p>Todavía no hay fotos de este producto.</p>
          ) : (
            <ul>
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
        <EnlaceWhatsapp
          contexto={{ tipo: "producto", nombre: producto.nombre }}
        />
      </article>
    </main>
  );
}
