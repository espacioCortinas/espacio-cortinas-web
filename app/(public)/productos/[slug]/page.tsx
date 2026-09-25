import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FotoImg } from "@/components/foto";
import { Galeria } from "@/components/galeria";
import { VideoMudo } from "@/components/video-mudo";
import { EnlaceWhatsapp } from "@/components/whatsapp";
import { clasesDeBoton } from "@/components/ui/boton";
import { CLASES_CONTENEDOR } from "@/components/ui/contenedor";
import { productoPorSlug, productosPublicados } from "@/contenido";
import { portadaDe } from "@/lib/fotos";
import { metadataDePagina } from "@/lib/metadata";
import { altAutomatico } from "@/lib/texto";

/**
 * Un producto del catálogo.
 *
 * # Los sectores
 *
 *     1  APERTURA     el nombre, la descripción, una acción, la portada
 *     2  VARIANTES    cada opción con su descripción, sus fotos y su video
 *     3  MÁS FOTOS    el resto de la galería del producto
 *     4  CIERRE       una sola acción, sobre superficie
 *
 * **El texto primero y la foto después**, igual que Inicio y por las mismas dos
 * razones (decisión 47): lo que sostiene las páginas de este sitio es la
 * tipografía, y en un teléfono una foto 4:5 arriba de todo empuja el mensaje
 * abajo del pliegue.
 *
 * **La portada se muestra una sola vez.** Va en la apertura, y la galería
 * empieza en la foto 2. La misma foto dos veces en la misma página se lee como
 * un error.
 *
 * **Las variantes van antes que el resto de la galería**, y no es el orden
 * obvio. Es lo que decide la compra: «screen deja pasar luz y blackout no» es
 * la diferencia que alguien viene a buscar (decisión 40), y las fotos que la
 * muestran son las de la variante, no las del producto. El resto de la galería
 * es evidencia, y la evidencia va después del argumento.
 *
 * # El llamado a la acción
 *
 * **Hay dos y uno solo es el negro sólido.** El de la apertura es secundario y
 * está ahí para que WhatsApp sea alcanzable sin buscarlo en un teléfono
 * (`docs/diseno.md`, mobile-first); el principal, que va una vez por página,
 * está en el cierre. Los dos llevan el nombre de este producto en el mensaje,
 * así que quien atiende sabe de qué le hablan sin preguntarlo.
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
    // Su imagen de Open Graph: la portada dentro de la composición de la
    // marca, apaisada para que WhatsApp la muestre grande (decisión 59).
    clave: `productos/${producto.slug}`,
  });
}

/** El ritmo entre sectores: 64 en teléfono, 112 en escritorio. */
const SECTOR = "mt-16 md:mt-28";

export default async function Producto({ params }: Props) {
  const { slug } = await params;
  const producto = productoPorSlug(slug);
  if (!producto) notFound();

  const portada = portadaDe(producto.fotos);

  // La galería del producto empieza después de la portada, que ya se muestra
  // arriba. `desde={2}` hace que el texto alternativo diga «foto 2» y no «foto
  // 1»: es la misma numeración que ve el visitante.
  const galeria = producto.fotos.slice(1);

  const contexto = { tipo: "producto" as const, nombre: producto.nombre };

  return (
    <main className={`${CLASES_CONTENEDOR} py-16 md:py-28`}>
      <article>
        {/* 1 — APERTURA ---------------------------------------------- */}
        <h1 className="max-w-lectura text-display">{producto.nombre}</h1>
        <p className="max-w-lectura mt-6 text-subtitulo">
          {producto.descripcion}
        </p>

        <div className="mt-8">
          <EnlaceWhatsapp contexto={contexto} variante="secundario" />
        </div>

        {portada && (
          // Dentro de la columna y alineada al margen izquierdo, no centrada:
          // el aire que queda a la derecha es parte de la composición. Nunca a
          // sangre — además de ser la tesis de la dirección, ninguna portada
          // del archivo tiene píxeles para el ancho de un escritorio.
          <div className="mt-12 max-w-[34rem] md:mt-16">
            <FotoImg
              foto={portada}
              alt={altAutomatico(producto.nombre, 1)}
              // Los listados usan siempre la portada, y la portada siempre es
              // 4:5 (decisión 14). Se declara igual: si algún día entra una
              // portada con otra proporción, la página no se desarma.
              proporcion="4/5"
              sizes="(min-width: 768px) 544px, calc(100vw - 2.5rem)"
              prioridad
            />
          </div>
        )}

        {/* 2 — VARIANTES --------------------------------------------- */}
        {producto.variantes.length > 0 && (
          <section className={SECTOR}>
            <h2 className="text-titulo">Variantes</h2>
            <p className="max-w-lectura text-texto-suave mt-4">
              Son opciones del mismo producto, no productos distintos. Se eligen
              al presupuestar.
            </p>

            {/*
              Una lista con filetes de 1 px, que es el único recurso gráfico del
              sistema y el que rima con las lamas y los pliegues de las fotos.
              Sin tarjetas, sin sombras y sin fondo — `docs/diseno.md`.

              **Las variantes sin fotos ni descripción se dibujan igual**, con
              su nombre y nada más. Tres de las nueve del catálogo están así, y
              siguen siendo opciones que alguien tiene que poder leer antes de
              preguntar. Esconderlas sería esconder parte del producto.
            */}
            <ul className="border-linea mt-8 border-t">
              {producto.variantes.map((variante) => (
                <li
                  key={variante.nombre}
                  className="border-linea border-b py-8 md:py-10"
                >
                  <h3 className="text-subtitulo">{variante.nombre}</h3>

                  {variante.descripcion && (
                    <p className="max-w-lectura text-texto-suave mt-3">
                      {variante.descripcion}
                    </p>
                  )}

                  {variante.fotos.length > 0 && (
                    <div className="mt-8">
                      <Galeria
                        medios={variante.fotos}
                        nombre={`${producto.nombre} ${variante.nombre}`}
                      />
                    </div>
                  )}

                  {variante.video && (
                    <div className="mt-8">
                      <VideoMudo
                        video={variante.video}
                        etiqueta={`${producto.nombre} ${variante.nombre}: la cortina abriéndose y cerrándose sola`}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 3 — MÁS FOTOS --------------------------------------------- */}
        {galeria.length > 0 && (
          <section className={SECTOR}>
            <h2 className="text-titulo">Más fotos</h2>
            <p className="max-w-lectura text-texto-suave mt-4">
              Trabajos terminados, con la cortina ya colocada.
            </p>
            <div className="mt-8">
              <Galeria
                medios={galeria}
                nombre={producto.nombre}
                // La portada es la foto 1 y se muestra arriba: esta galería
                // empieza en la 2.
                desde={2}
              />
            </div>
          </section>
        )}

        {producto.fotos.length === 0 && (
          <p className="text-texto-suave mt-12">
            Todavía no hay fotos de este producto.
          </p>
        )}

        {/* 4 — CIERRE ------------------------------------------------ */}
        <section
          className={`${SECTOR} bg-superficie -mx-5 px-5 py-12 md:-mx-12 md:px-12 md:py-20`}
        >
          {/*
            El nombre va tal cual está escrito y no en minúsculas: «Venecianas
            de PVC» en minúsculas da «venecianas de pvc», y una sigla en
            minúsculas se lee como un error de tipeo. La frase está armada para
            que el nombre entre con su mayúscula sin sonar raro.
          */}
          <h2 className="text-titulo">Consultanos por {producto.nombre}</h2>
          <p className="max-w-lectura text-texto-suave mt-4">
            Escribinos con las medidas aproximadas de la ventana, o sin ellas y
            vamos a medir. Trabajamos en toda Buenos Aires, con colocación
            propia.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <EnlaceWhatsapp contexto={contexto} />
            <Link href="/contacto" className={clasesDeBoton("enlace")}>
              Otras formas de contacto
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
