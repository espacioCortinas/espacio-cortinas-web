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
import { Chip } from "@/components/ui/chip";
import { CLASES_CONTENEDOR } from "@/components/ui/contenedor";
import { Vacio } from "@/components/ui/vacio";
import { productosPublicados } from "@/contenido";
import type { ProductoConMedios } from "@/contenido/tipos";
import { portadaDe } from "@/lib/fotos";
import { metadataDePagina } from "@/lib/metadata";
import { altAutomatico } from "@/lib/texto";

/**
 * El catálogo.
 *
 * # Una fila por producto, en el damero
 *
 * **Sigue siendo una fila por producto, con el lado de la foto alternado** —
 * decisión 49—, y por las mismas razones: siete productos no se reparten parejo
 * en ninguna grilla, cada portada se ve grande, y las variantes se nombran en
 * el listado, que es donde se decide a cuál entrar (decisión 40).
 *
 * **Lo que cambió en la Fase 4.7 es el dibujo**: las filas son las del damero
 * del boceto de la empresa, con las líneas finas de borde a borde, la portada
 * en una celda y el texto centrado en la otra —las mismas piezas que la página
 * de cada producto (`components/damero.tsx`)—. Así el catálogo y lo que se abre
 * desde él se leen como lo mismo.
 *
 * # La descripción va entera
 *
 * Son las del boceto, más largas que las anteriores, y van enteras: al lado de
 * la foto hay ancho de lectura y no compiten con nada. **Las dos venecianas
 * tienen el mismo texto**, porque el boceto tiene una sola página para las dos,
 * y quedan en filas seguidas. Se publica así a propósito, como ya se había
 * hecho con el texto anterior — decisión 49.
 *
 * # Un solo enlace por fila
 *
 * El nombre va una vez, en el `<h2>`, y su enlace se estira sobre la fila
 * entera con `after:absolute after:inset-0` contra el `relative` del
 * `<article>`. Así la zona táctil es toda la fila —que es lo que hace falta en
 * un teléfono— sin envolver la foto en un segundo enlace: tabular las siete
 * filas anuncia siete nombres de producto y no catorce.
 */

export const metadata: Metadata = metadataDePagina({
  titulo: "Productos",
  descripcion:
    "Rollers blackout y screen, cortinas de confección, venecianas y toldos. " +
    "Todo a medida, con asesoramiento y colocación en Buenos Aires.",
  ruta: "/productos",
});

export default function Productos() {
  const productos = productosPublicados();

  return (
    // Sin columna: el damero va de borde a borde, y la apertura y el cierre
    // ponen la suya.
    <main className="pt-12 pb-16 md:pt-20 md:pb-28">
      {/*
        La apertura, como la de cada producto: una frase corta en minúscula
        arriba, el titular grande y centrado, y la bajada. El titular dice los
        productos en vez de repetir el nombre del menú (decisión 49); «a
        medida» es nuestra, como la bajada.
      */}
      <header className={`${CLASES_CONTENEDOR} text-center`}>
        <hgroup>
          <p className="text-texto-suave text-subtitulo">a medida</p>
          <h1 className="mt-2 text-display">
            Cortinas, rollers, venecianas y toldos
          </h1>
        </hgroup>

        <p className="max-w-lectura text-texto-suave mx-auto mt-6 text-left text-subtitulo">
          Todo se fabrica a medida para su ventana, y la medición y la
          colocación son nuestras. Entrá en cualquiera para ver las fotos de los
          trabajos terminados.
        </p>
      </header>

      {productos.length === 0 ? (
        // Un listado vacío se dice, no se tapa: es información sobre el estado
        // del contenido, no un problema a esconder. Hoy este camino no se
        // recorre —hay siete productos—.
        <div className={`${CLASES_CONTENEDOR} mt-12 md:mt-16`}>
          <Vacio
            etiqueta="todavía sin productos publicados"
            titulo="El catálogo se está cargando."
          >
            <p>
              En cuanto haya productos publicados aparecen acá, con sus fotos y
              sus variantes.
            </p>
          </Vacio>
        </div>
      ) : (
        <div className="mt-12 md:mt-20">
          <MarcoDelDamero>
            <ul>
              {productos.map((producto, i) => (
                <Fila key={producto.slug} producto={producto} posicion={i} />
              ))}
            </ul>
          </MarcoDelDamero>
        </div>
      )}

      {/*
        El cierre, el bloque azul verdoso de todas las páginas: una sola
        acción. Todo lo de adentro en el color del texto, que es lo que se lee
        sobre ese color (`app/globals.css`, `--color-marca`).
      */}
      <div className={`${CLASES_CONTENEDOR} mt-16 md:mt-28`}>
        <section className="bg-marca text-texto -mx-5 px-5 py-12 md:-mx-12 md:px-12 md:py-20">
          <h2 className="text-texto text-titulo">
            ¿No sabés cuál te conviene?
          </h2>
          <p className="max-w-lectura mt-4">
            Contanos qué ventana tenés que resolver —cuánta luz entra, cuánta
            privacidad hace falta— y te asesoramos sobre qué sistema va mejor.
          </p>

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

/**
 * Un producto del catálogo: la portada en una celda y el texto en la otra.
 *
 * **La alternancia es solo de escritorio**, la hace `FilaConLineas`: en el
 * teléfono todo se apila en el mismo orden —foto, después nombre— porque
 * invertir en una columna pondría el nombre arriba de su foto en la mitad de
 * las filas.
 */
function Fila({
  producto,
  posicion,
}: {
  producto: ProductoConMedios;
  /** Empieza en 0. Decide el lado de la foto y cuál se carga con prioridad. */
  posicion: number;
}) {
  const portada = portadaDe(producto.fotos);

  return (
    <li>
      <article className="group relative">
        <FilaConLineas
          invertida={posicion % 2 === 1}
          primera={
            portada ? (
              <FotoEnCelda
                foto={portada}
                alt={altAutomatico(producto.nombre, 1)}
                // Solo la primera foto de la página se carga sin diferir.
                prioridad={posicion === 0}
              />
            ) : (
              // Sin portada no se dibuja una caja vacía con un ícono de imagen
              // rota: queda el mismo bloque de superficie que ocupa una foto
              // mientras carga.
              <div className="md:p-10">
                <div className="bg-superficie" style={{ aspectRatio: "4/5" }} />
              </div>
            )
          }
          segunda={
            <CeldaDeTexto>
              <hgroup>
                <p className="text-texto-suave text-subtitulo">
                  {producto.lema}
                </p>
                <h2 className="mt-1 text-titulo">
                  <Link
                    href={`/productos/${producto.slug}`}
                    className="underline-offset-4 group-hover:underline after:absolute after:inset-0"
                  >
                    {producto.nombre}
                  </Link>
                </h2>
              </hgroup>

              <p className="mt-5 max-w-[42ch] text-left">
                {producto.descripcion}
              </p>

              <Variantes producto={producto} />

              {/*
                **Lo que dice que la fila se abre**, sin depender del `hover`,
                que en un teléfono no existe. **No es un enlace**: el del nombre
                ya está estirado por encima de toda la fila, y un segundo `<a>`
                duplicaría el nombre accesible de cada una.
              */}
              <p className="mt-6">
                <span className="underline decoration-1 underline-offset-4">
                  Ver más
                </span>
                {/* La flecha es del texto de la acción, no un ícono al lado de
                    un título: la regla 4 prohíbe lo segundo. */}
                <span aria-hidden> →</span>
              </p>
            </CeldaDeTexto>
          }
        />
      </article>
    </li>
  );
}

/**
 * Las variantes, como chips: son la diferencia que decide la compra —decisión
 * 40—, y así el catálogo las nombra sin tener que entrar a cada producto.
 *
 * **Van fuera del enlace**, aunque el enlace cubra la fila: lo que decide el
 * nombre accesible es el contenido del `<a>`, y sumarle las variantes lo
 * convertiría en una frase que un lector de pantalla lee entera cada vez.
 */
function Variantes({ producto }: { producto: ProductoConMedios }) {
  if (producto.variantes.length === 0) return null;

  return (
    <ul className="mt-5 flex flex-wrap justify-center gap-2">
      {producto.variantes.map((variante) => (
        <li key={variante.nombre}>
          <Chip>{variante.nombre}</Chip>
        </li>
      ))}
    </ul>
  );
}
