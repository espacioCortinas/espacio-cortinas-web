import Link from "next/link";

import { FotoImg } from "@/components/foto";
import type { ConFotos, Producto } from "@/contenido/tipos";
import { portadaDe } from "@/lib/fotos";
import { altAutomatico } from "@/lib/texto";

/**
 * Un producto destacado de Inicio: la portada, y montado sobre su borde de
 * abajo, un bloque azul verdoso con el nombre.
 *
 * **Lo usa Inicio, y solo Inicio.** `/productos` es una fila por producto
 * (decisión 49), que no es esto.
 *
 * # El bloque es el del boceto de la empresa — Fase 4.7
 *
 * El boceto arma sus productos como bloques de azul verdoso con el nombre en
 * grande, en zigzag, **sin fotos**: es un boceto, y las que tenía eran de
 * muestra de la plantilla. Acá se juntan las dos cosas: el bloque del boceto y
 * la portada nuestra, con el bloque pisando el borde de la foto, que es el
 * mismo gesto de la apertura de Inicio.
 *
 * **El bloque tapa el borde de abajo de la foto, y eso es a favor.** En casi
 * todas las fotos del archivo el piso es la zona más oscura y más desordenada
 * del cuadro (`docs/diseno.md`), y el recorte de la portada ya es alto.
 *
 * **El nombre no va sobre la foto: va sobre el bloque**, que es opaco. Encima
 * de la foto no se escribe nunca — la ventana es la zona más clara del cuadro
 * y cambia de lugar en cada una. Va en el color del texto, que sobre el azul
 * verdoso da 5,08:1; el blanco del boceto daba 2,63.
 *
 * # El lado
 *
 * `izquierda`: la foto a la izquierda y el bloque saliendo hacia la derecha.
 * `derecha`: al revés. Inicio los alterna fila por fila, que es el zigzag del
 * boceto. La foto ocupa el 72 % del ancho en el teléfono y el 80 % en
 * escritorio, y el bloque el 64 %: se pisan en el medio y el bloque sobresale
 * del otro lado de la foto.
 *
 * **Toda la tarjeta es el enlace**: en un teléfono la zona táctil es la foto
 * entera y el bloque, no dos palabras.
 */
export function TarjetaProducto({
  producto,
  lado,
  sizes,
  prioridad = false,
}: {
  producto: ConFotos<Producto>;
  lado: "izquierda" | "derecha";
  /**
   * El ancho que ocupa la foto en pantalla. **Es el mismo dato que el ancho de
   * la columna de la fila por el porcentaje de la foto, escrito dos veces**, así
   * que los dos cambian juntos: si se separan, el navegador descarga de más en
   * el teléfono o de menos en el escritorio.
   */
  sizes: string;
  prioridad?: boolean;
}) {
  const portada = portadaDe(producto.fotos);
  const derecha = lado === "derecha";

  return (
    <article>
      <Link href={`/productos/${producto.slug}`} className="group block">
        <div className={`w-[72%] md:w-[80%] ${derecha ? "ml-auto" : ""}`}>
          {portada ? (
            <FotoImg
              foto={portada}
              alt={altAutomatico(producto.nombre, 1)}
              // Los listados usan siempre la portada, y la portada siempre es
              // 4:5. Se declara igual aunque ya lo sea: si algún día entra una
              // portada con otra proporción, la fila no se desarma.
              proporcion="4/5"
              sizes={sizes}
              prioridad={prioridad}
            />
          ) : (
            // Sin portada no se dibuja una caja vacía con un ícono de imagen
            // rota: queda el mismo bloque de superficie que ocupa una foto
            // mientras carga.
            <div className="bg-superficie" style={{ aspectRatio: "4/5" }} />
          )}
        </div>

        {/*
          `relative` para que el bloque quede encima de la foto que pisa: sin
          él, la foto —que viene antes— lo taparía al subir con el margen
          negativo.

          `h3` fijo: cuelga del `<h2>` del sector de productos de Inicio, que
          es su único lugar.

          `min-w-min`: el bloque es el 64 % de la tarjeta, pero nunca más
          angosto que su palabra más larga y la flecha. Sin eso, a 320 y a 768
          «CONFECCIÓN» no entraba y la flecha quedaba afuera del bloque.
        */}
        <div
          className={
            "bg-marca relative -mt-10 flex w-[64%] min-w-min items-end justify-between " +
            "gap-3 px-5 py-4 md:-mt-12 md:px-6 md:py-5 " +
            (derecha ? "" : "ml-auto")
          }
        >
          <h3 className="text-texto text-subtitulo tracking-[0.04em] uppercase underline-offset-4 group-hover:underline">
            {producto.nombre}
          </h3>
          {/* Dice que es un enlace sin depender del hover, que en un teléfono
              no existe. Es del texto de la acción, no un ícono de título. */}
          <span aria-hidden className="text-texto text-subtitulo">
            →
          </span>
        </div>
      </Link>
    </article>
  );
}
