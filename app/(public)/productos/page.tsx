import type { Metadata } from "next";
import Link from "next/link";

import { FotoImg } from "@/components/foto";
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
 * # Una fila por producto, con el lado de la foto alternado
 *
 * Es la propuesta «Alternada», elegida mirando las tres renderizadas con el
 * material real — decisión 49. Resuelve los tres problemas que tenía la grilla
 * de siete tarjetas iguales:
 *
 * **1. El huérfano.** Siete productos en tres columnas dan 3 + 3 + 1, y entre
 * 640 y 1023 dan 2 + 2 + 2 + 1: siete no se reparte parejo en ninguna grilla, y
 * siete es el número del catálogo. Siete filas son siete filas en cualquier
 * ancho.
 *
 * **2. El módulo único.** La decisión 48 estableció que el tamaño del módulo
 * sale del material y no de la posición, y se había aplicado solo a
 * `components/galeria.tsx`. Acá la caja de foto pasa de 325 a 416 px, que en un
 * archivo sacado con celular es la diferencia entre ver el cabezal y adivinarlo.
 *
 * **3. Las variantes invisibles.** Hay nueve en el catálogo —Roller tres,
 * Cortinas de tela cuatro, Toldos dos— y la grilla no nombraba ninguna, cuando
 * la decisión 40 dice que la variante es lo que decide la compra. Ahora van como
 * chips, debajo de la descripción.
 *
 * **Lo que cuesta, y está asumido:** la página es mucho más larga que con la
 * grilla. El andamio calculaba que pasaba de unos 1.300 px a unos 3.600 en
 * escritorio, pero sin las descripciones ni los chips: medida sobre la página
 * terminada ronda los 6.000, casi siete pantallas a 1440 × 900. Se
 * aceptó porque es un catálogo de siete elementos y no de setenta —
 * decisión 49.
 *
 * # La descripción vuelve al listado
 *
 * La grilla anterior la había sacado por tres razones. Dos se caen con esta
 * composición: al lado de la foto hay ancho de lectura de verdad, así que el
 * párrafo entra entero en vez de cortado, y ya no compite con nada por espacio.
 *
 * **La tercera sigue en pie y ahora se ve:** `venecianas-madera` y
 * `venecianas-pvc` tienen la misma descripción palabra por palabra, y en el
 * arreglo están una al lado de la otra, así que quedan en filas consecutivas
 * con el párrafo a la vista. **Se publica igual**, y es deliberado —
 * decisión 49. Recortar no arregla nada: los dos textos miden 120 caracteres, o
 * sea que `recortar()` los devolvería enteros e idénticos. Y esconder la
 * descripción de los siete para tapar un problema de dos le saca a cinco
 * productos su mejor texto. Lo corrige la empresa; mientras tanto el sitio lo
 * muestra, que es lo que hace que se corrija.
 *
 * # Por qué no usa `components/tarjeta-producto.tsx`
 *
 * Porque esto no es una tarjeta: no hay grilla, la foto y el texto van uno al
 * lado del otro, y el lado cambia. Ese componente se queda para Inicio, que
 * sigue siendo una grilla de anticipo.
 */

export const metadata: Metadata = metadataDePagina({
  titulo: "Productos",
  descripcion:
    "Rollers blackout y screen, cortinas de tela, venecianas y toldos. " +
    "Todo a medida, con asesoramiento y colocación en Buenos Aires.",
  ruta: "/productos",
});

/**
 * El ancho de la caja de foto, escrito una vez.
 *
 * **Es el mismo dato que `max-w-[26rem]` de abajo**, y los dos cambian juntos:
 * si se separan, el navegador descarga de más en el teléfono o de menos en el
 * escritorio.
 *
 * Los tres tramos son los tres anchos que la caja tiene de verdad:
 *
 *     ≥ 768   media columna —(100vw − 96 de margen − 48 de hueco) / 2— topeada
 *             en 26rem, que es donde queda a partir de unos 976 px de ancho
 *     < 768   el ancho de la columna, también topeado en 26rem: de 456 px de
 *             viewport para arriba la caja ya no crece
 *
 * El tope tiene que estar en los dos tramos. Sin él, una tablet de 700 px
 * pediría una foto de 660 para una caja de 416 y se bajaría `1600.webp` donde
 * alcanzaba `960.webp`.
 */
const SIZES_PORTADA =
  "(min-width: 768px) min(calc((100vw - 9rem) / 2), 26rem), " +
  "min(calc(100vw - 2.5rem), 26rem)";

export default function Productos() {
  const productos = productosPublicados();

  return (
    <main className={`${CLASES_CONTENEDOR} py-16 md:py-28`}>
      {/*
        La apertura.

        **Antes era la palabra «Productos» a 56 px y un párrafo gris debajo**, y
        se leía como una etiqueta pegada arriba de una lista, no como el
        principio de algo. Una sola palabra no sostiene el tamaño de display: no
        dice nada que no diga ya el menú, donde «Productos» está marcado como la
        página actual.

        Tres cosas la sostienen ahora, y ninguna agrega un recurso nuevo al
        sistema:

        **Un antetítulo con un dato**, en el mismo tratamiento que ya usan el
        estado vacío y la numeración de Inicio —13 px, versalita, con tracking—.
        Dice de qué son las siete filas de abajo y cuántas son, **contadas del
        arreglo**: si mañana entra un producto, el número lo sigue solo.

        **El titular dice los productos en vez de nombrarlos en abstracto.** Es
        lo mismo que ya decía la `description` de esta página y lo que alguien
        busca de verdad, y ahí sí hay una frase que aguanta el display. El nombre
        de la sección lo siguen diciendo el menú y el `<title>`.

        **La bajada orienta.** La última frase es la que le dice al visitante que
        cada fila se abre, que es lo que en un teléfono no se puede aprender de
        otra manera — ver `Fila`.
      */}
      <header>
        <p className="text-texto-suave text-meta tracking-[0.12em] uppercase">
          Catálogo
          {productos.length > 0 &&
            ` · ${productos.length} producto${productos.length === 1 ? "" : "s"}`}
        </p>

        <h1 className="mt-4 text-display">
          Cortinas, rollers, venecianas y toldos
        </h1>

        <p className="max-w-lectura text-texto-suave mt-6 text-subtitulo">
          Todo se fabrica a medida para su ventana, y la medición y la
          colocación son nuestras. Entrá en cualquiera para ver las fotos de los
          trabajos terminados.
        </p>
      </header>

      {productos.length === 0 ? (
        // Un listado vacío se dice, no se tapa: es información sobre el estado
        // del contenido, no un problema a esconder. Hoy este camino no se
        // recorre —hay siete productos— pero es el mismo componente que usa
        // `/proyectos` cuando no hay ninguno publicado.
        <div className="mt-12 md:mt-16">
          <Vacio
            etiqueta="Todavía sin productos publicados"
            titulo="El catálogo se está cargando."
          >
            <p>
              En cuanto haya productos publicados aparecen acá, con sus fotos y
              sus variantes.
            </p>
          </Vacio>
        </div>
      ) : (
        <ul className="border-linea mt-12 border-t md:mt-16">
          {productos.map((producto, i) => (
            <Fila key={producto.slug} producto={producto} posicion={i} />
          ))}
        </ul>
      )}

      {/*
        El cierre, con el mismo bloque de superficie que usa Inicio: un sector
        de verdad, con su ritmo vertical, y una sola acción.
      */}
      <section className="bg-superficie mt-16 -mx-5 px-5 py-12 md:mt-28 md:-mx-12 md:px-12 md:py-20">
        <h2 className="text-titulo">¿No sabés cuál te conviene?</h2>
        <p className="max-w-lectura text-texto-suave mt-4">
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
    </main>
  );
}

/**
 * Un producto del catálogo: la portada de un lado, el texto del otro.
 *
 * **Un solo encabezado y un solo elemento enfocable.** El nombre va una vez, en
 * el `<h2>`, y su enlace se estira sobre la fila entera con
 * `after:absolute after:inset-0` contra el `relative` del `<article>`. Así la
 * zona táctil es toda la fila —que es lo que hace falta en un teléfono— sin
 * envolver la foto en un segundo enlace ni repetir el nombre para mostrar uno
 * en cada punto de quiebre: tabular las siete filas anuncia siete nombres de
 * producto y no catorce.
 *
 * **La alternancia es solo de escritorio.** `md:order-2` invierte las impares
 * de 768 para arriba; en teléfono todo se apila en el mismo orden —foto,
 * después nombre— porque invertir en una columna no alterna nada: pondría el
 * nombre arriba de su foto en la mitad de las filas, que es justo lo que este
 * sitio no hace nunca.
 *
 * **La portada siempre 4:5** (decisión 14), y sin nada de texto encima.
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
  const invertida = posicion % 2 === 1;

  return (
    <li className="border-linea border-b py-10 md:py-16">
      <article className="group relative md:grid md:grid-cols-2 md:items-center md:gap-12">
        <div
          className={`max-w-[26rem] ${invertida ? "md:order-2" : ""}`.trim()}
        >
          {portada ? (
            <FotoImg
              foto={portada}
              alt={altAutomatico(producto.nombre, 1)}
              proporcion="4/5"
              sizes={SIZES_PORTADA}
              // Solo la primera foto de la página se carga sin diferir.
              prioridad={posicion === 0}
            />
          ) : (
            // Sin portada no se dibuja una caja vacía con un ícono de imagen
            // rota: queda el mismo bloque de superficie que ocupa una foto
            // mientras carga, así la fila no se descuadra.
            <div className="bg-superficie" style={{ aspectRatio: "4/5" }} />
          )}
        </div>

        <div className="mt-6 md:mt-0">
          <h2 className="text-titulo">
            <Link
              href={`/productos/${producto.slug}`}
              className="underline-offset-4 group-hover:underline after:absolute after:inset-0"
            >
              {producto.nombre}
            </Link>
          </h2>

          <p className="max-w-lectura text-texto-suave mt-4">
            {producto.descripcion}
          </p>

          <Variantes producto={producto} />

          {/*
            **Lo que dice que la fila se abre.**

            Sin esto, lo único que lo decía era el subrayado del nombre al pasar
            por encima, y `docs/diseno.md` es explícito: «nada depende de
            `hover` para funcionar o entenderse». En un teléfono no hay hover, o
            sea que en un teléfono no lo decía nada.

            **No es un enlace**, y es a propósito: el enlace de la fila es uno
            solo, el del nombre, y está estirado por encima de todo esto, así que
            tocar esta línea abre el producto igual. Un segundo `<a>` acá
            duplicaría el nombre accesible de cada fila y volvería a dejar
            catorce elementos enfocables donde tiene que haber siete.

            Va subrayado —en el color del texto, 11,61:1— porque es la forma
            que este sitio le da a un enlace (`docs/diseno.md`, «Color»).
          */}
          <p className="mt-6 text-meta">
            <span className="underline decoration-1 underline-offset-4">
              Ver más
            </span>
            {/* La flecha es del texto de la acción, no un ícono al lado de un
                título: la regla 4 prohíbe lo segundo. `aria-hidden` porque no
                agrega nada a lo que la frase ya dice. */}
            <span aria-hidden> →</span>
          </p>
        </div>
      </article>
    </li>
  );
}

/**
 * Las variantes, como chips.
 *
 * Son la diferencia que decide la compra —decisión 40— y hasta ahora el
 * catálogo no las nombraba: había que entrar a cada producto para enterarse de
 * que existían.
 *
 * `Chip` es filete de 1 px y sin relleno, que es el único recurso gráfico del
 * sistema y el que rima con las lamas y los pliegues de las fotos. Sin tono: un
 * dato al lado de un título no tiene ningún estado que marcar.
 *
 * **Van fuera del enlace**, y eso importa acá aunque el enlace cubra la fila:
 * lo que decide el nombre accesible es el contenido del `<a>`, y sumarle siete
 * palabras sueltas lo convertiría en una frase que un lector de pantalla lee
 * entera cada vez.
 */
function Variantes({ producto }: { producto: ProductoConMedios }) {
  if (producto.variantes.length === 0) return null;

  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {producto.variantes.map((variante) => (
        <li key={variante.nombre}>
          <Chip>{variante.nombre}</Chip>
        </li>
      ))}
    </ul>
  );
}
