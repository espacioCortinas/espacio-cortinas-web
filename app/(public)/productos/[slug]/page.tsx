import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CierreConAlbum } from "@/components/cierre-con-album";
import { Damero } from "@/components/damero";
import { FotoImg } from "@/components/foto";
import { EnlaceWhatsapp } from "@/components/whatsapp";
import { clasesDeBoton } from "@/components/ui/boton";
import { CLASES_CONTENEDOR } from "@/components/ui/contenedor";
import { productoPorSlug, productosPublicados } from "@/contenido";
import { filasDeProducto, recuadroEnLaApertura } from "@/lib/damero";
import { sizesConTope, topeDeAncho } from "@/lib/fotos";
import { metadataDePagina, urlAbsoluta } from "@/lib/metadata";
import { altAutomatico } from "@/lib/texto";

/**
 * Un producto del catálogo.
 *
 * # Los sectores
 *
 *     1  APERTURA   el lema y el nombre, la portada, la descripción con el
 *                   recuadro del producto, y una acción
 *     2  DAMERO     un bloque por variante con fotos —su nombre arriba, su
 *                   álbum y su texto— y «Manual o motorizado» con los videos,
 *                   de borde a borde. El esquema está en `lib/damero.ts`
 *     3  CIERRE     una sola acción, en un bloque azul verdoso; con fotos
 *                   «wpp», montado sobre un álbum que pasa solo (decisión 67)
 *
 * **Es la página de producto del boceto de la empresa** — Fase 4.7: arriba una
 * frase corta en minúscula —«calidez», «vivir el aire libre»—, el nombre
 * grande y centrado y la descripción; abajo, la grilla de 2×2 con líneas
 * finas, de borde a borde, que mezcla fotos y texto. Qué va en cada celda lo
 * decide `lib/damero.ts`, que explica la regla.
 *
 * **La portada abre la página**, al lado del nombre y del botón, desde la
 * decisión 67: en la etapa 3 había pasado a ser la primera celda del damero,
 * y quedaba lejos de las dos cosas que la presentan. Sigue valiendo que **la
 * portada se muestra una sola vez**.
 *
 * # Lo que no se tomó del boceto
 *
 * Las fotos del boceto se recortaban a la celda; acá cada una va en su
 * proporción. Y su recuadro, en mayúscula, va en minúscula con su mayúscula
 * inicial. Ver `components/damero.tsx`.
 *
 * # El llamado a la acción
 *
 * **Hay dos y uno solo es la pizarra sólida.** El de la apertura es secundario
 * y lleva el nombre del producto en el mensaje; el principal, que va una vez
 * por página, está en el cierre. Además está el botón flotante, a mano en
 * cualquier punto, con el mensaje general.
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
  });
}

export default async function Producto({ params }: Props) {
  const { slug } = await params;
  const producto = productoPorSlug(slug);
  if (!producto) notFound();

  const filas = filasDeProducto(producto);
  const portada = producto.fotos[0] ?? null;
  // La dirección es la canónica de esta página, la misma que arma
  // `metadataDePagina` arriba: el mensaje de WhatsApp la lleva para que el
  // chat muestre la tarjeta con la foto (decisión 68).
  const contexto = {
    tipo: "producto" as const,
    nombre: producto.nombre,
    url: urlAbsoluta(`/productos/${producto.slug}`),
  };
  const fotosWpp = producto.fotosParaWhatsapp;

  const consulta = (
    <>
      {/*
        El nombre va tal cual está escrito y no en minúsculas: «Venecianas de
        PVC» en minúsculas da «venecianas de pvc», y una sigla en minúsculas
        se lee como un error de tipeo. La frase está armada para que el nombre
        entre con su mayúscula sin sonar raro.
      */}
      <h2 id="cierre" className="text-texto text-titulo">
        Consultanos por {producto.nombre}
      </h2>
      <p className="max-w-lectura mt-4">
        Escribinos con las medidas aproximadas de la ventana, o sin ellas y
        vamos a medir. Trabajamos en toda Buenos Aires, con colocación propia.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
        <EnlaceWhatsapp contexto={contexto} />
        <Link href="/contacto" className={clasesDeBoton("enlace")}>
          Otras formas de contacto
        </Link>
      </div>
    </>
  );

  return (
    // Sin columna: el damero va de borde a borde, y la apertura y el cierre
    // ponen la suya.
    <main className="pt-12 pb-16 md:pt-20 md:pb-28">
      <article>
        {/* 1 — APERTURA ---------------------------------------------- */}
        {/*
          El título, la portada, la descripción y el botón, en ese orden en el
          teléfono: la primera pantalla muestra el nombre y la foto juntos
          (decisión 67). En escritorio, la portada a la izquierda y el texto a
          la derecha, con la grilla: el orden del documento no cambia.
        */}
        <div
          className={`${CLASES_CONTENEDOR} md:grid md:grid-cols-2 md:grid-rows-[auto_1fr] md:gap-x-12 lg:gap-x-16`}
        >
          {/*
            `hgroup` porque el lema es la bajada del título y no un título
            aparte: un lector de pantalla los anuncia juntos.
          */}
          <hgroup className="text-center md:col-start-2 md:row-start-1 md:self-end md:text-left">
            <p className="text-texto-suave text-subtitulo">{producto.lema}</p>
            <h1 className="mt-2 text-display">{producto.nombre}</h1>
          </hgroup>

          {portada && (
            // En el teléfono, a lo ancho de la pantalla, como las fotos del
            // damero; en escritorio, en su columna y con su tope.
            <div className="-mx-5 mt-8 md:col-start-1 md:row-span-2 md:row-start-1 md:mx-0 md:mt-0">
              <div
                className="mx-auto"
                style={{ maxWidth: `${topeDeAncho(portada)}px` }}
              >
                <FotoImg
                  foto={portada}
                  alt={altAutomatico(producto.nombre, 1)}
                  sizes={sizesConTope(portada, [
                    // La columna: el contenedor de 70 rem con 3 de margen a
                    // cada lado, menos el hueco del medio, sobre dos.
                    { desde: "1120px", ancho: "30rem" },
                    { desde: "1024px", ancho: "calc(50vw - 5rem)" },
                    { desde: "768px", ancho: "calc(50vw - 4.5rem)" },
                    { ancho: "100vw" },
                  ])}
                  prioridad
                  className="block h-auto w-full"
                />
              </div>
            </div>
          )}

          <div className="mt-8 md:col-start-2 md:row-start-2 md:mt-6">
            {/*
              Alineada a la izquierda: son cuatro o cinco renglones, y
              centrados se leen peor.
            */}
            <p className="max-w-lectura text-subtitulo">
              {producto.descripcion}
            </p>
            {producto.recuadro && recuadroEnLaApertura(producto) && (
              <div className="mt-6">
                {/* En minúscula y con sus saltos de renglón, como en el boceto:
                    el de las venecianas es una lista de medidas. */}
                {producto.recuadro.titulo && (
                  <p className="text-acento font-semibold whitespace-pre-line">
                    {producto.recuadro.titulo}
                  </p>
                )}
                <p className="text-texto-suave mt-2 max-w-[40ch]">
                  {producto.recuadro.texto}
                </p>
              </div>
            )}
            <div className="mt-8">
              <EnlaceWhatsapp contexto={contexto} variante="secundario" />
            </div>
          </div>
        </div>

        {/* 2 — DAMERO ------------------------------------------------ */}
        {filas.length > 0 && (
          <section aria-labelledby="fotos" className="mt-12 md:mt-20">
            {/* Para quien recorre la página por sus títulos: el damero tiene
                los suyos —cada variante, «Manual o motorizado»—, que cuelgan
                de este. */}
            <h2 id="fotos" className="sr-only">
              Variantes y fotos
            </h2>
            <Damero filas={filas} prioridad={false} />
          </section>
        )}

        {/* 3 — CIERRE ------------------------------------------------ */}
        <div className={`${CLASES_CONTENEDOR} mt-16 md:mt-28`}>
          {/*
            Con fotos «wpp», el bloque se monta sobre un álbum que pasa solo
            (decisión 67); sin ellas, es el bloque solo, como antes.
          */}
          {fotosWpp.length > 0 ? (
            <CierreConAlbum
              etiqueta={`Fotos de ${producto.nombre}`}
              proporcion={fotosWpp[0].ancho / fotosWpp[0].alto}
              // El álbum mide lo que permite su foto más grande, y cada una se
              // frena en su propio tope, centrada: una «wpp» chica no achica
              // a las demás, y tampoco se estira (`CLAUDE.md`, regla 4).
              ancho={Math.max(...fotosWpp.map(topeDeAncho))}
              fotos={fotosWpp.map((foto, i) => (
                <div
                  key={foto.carpeta}
                  className="flex h-full items-center justify-center"
                >
                  <div
                    className="w-full"
                    style={{ maxWidth: `${topeDeAncho(foto)}px` }}
                  >
                    <FotoImg
                      foto={foto}
                      alt={altAutomatico(
                        `${producto.nombre}, vista apaisada`,
                        i + 1,
                      )}
                      sizes={sizesConTope(foto, [
                        { desde: "768px", ancho: "min(100vw - 6rem, 70rem)" },
                        { ancho: "100vw" },
                      ])}
                      className="block h-auto w-full"
                    />
                  </div>
                </div>
              ))}
            >
              {consulta}
            </CierreConAlbum>
          ) : (
            /*
              El azul verdoso de los bloques, con todo lo de adentro en el
              color del texto: sobre este color la pizarra de los títulos da
              3,08:1, y el texto, 5,08. El botón principal sigue siendo la
              pizarra sólida.
            */
            <section
              aria-labelledby="cierre"
              className="bg-marca text-texto -mx-5 px-5 py-12 md:-mx-12 md:px-12 md:py-20"
            >
              {consulta}
            </section>
          )}
        </div>
      </article>
    </main>
  );
}
