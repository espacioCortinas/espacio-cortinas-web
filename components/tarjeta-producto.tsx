import Link from "next/link";

import { FotoImg } from "@/components/foto";
import type { ConFotos, Producto } from "@/contenido/tipos";
import { portadaDe } from "@/lib/fotos";
import { altAutomatico } from "@/lib/texto";

/**
 * Un producto dentro de una grilla: la portada, y el nombre debajo.
 *
 * **Es el único elemento visual que las cuatro referencias profesionales tienen
 * en común**, y el único que este archivo fotográfico puede sostener bien: las
 * siete portadas son 4:5, verticales y parejas, así que una grilla de portadas
 * queda alineada aunque las galerías mezclen orientaciones (decisión 14).
 *
 * **No es una tarjeta.** No tiene borde, ni sombra, ni fondo, ni radio: es la
 * foto y el nombre, y lo que los separa del resto es el aire. Una tarjeta
 * flotante con sombra difusa es una de las dos marcas más reconocibles de la
 * plantilla genérica — `docs/diseno.md`, reglas 2 y 3.
 *
 * **El nombre va DEBAJO de la foto, nunca encima.** En este archivo el texto
 * sobre foto no se hace nunca: la ventana es siempre la zona más clara del
 * cuadro y cambia de lugar en cada foto, así que no hay ningún sitio seguro.
 *
 * **Toda la tarjeta es el enlace**, no solo el título: en un teléfono la zona
 * táctil pasa a ser la foto entera en vez de dos palabras. El subrayado del
 * nombre aparece al pasar por encima, pero nada depende de eso para entenderse
 * — el nombre de un producto arriba de su foto ya se lee como un enlace, y en
 * un teléfono no hay `hover`.
 */
export function TarjetaProducto({
  producto,
  sizes,
  nivel = 3,
  prioridad = false,
}: {
  producto: ConFotos<Producto>;
  /**
   * El ancho que ocupa la tarjeta en pantalla. **Es el mismo dato que el ancho
   * de la columna de la grilla, escrito dos veces**, así que los dos cambian
   * juntos: si se separan, el navegador descarga de más en el teléfono o de
   * menos en el escritorio.
   */
  sizes: string;
  /**
   * Qué nivel de encabezado le toca al nombre, según de qué cuelgue la grilla.
   *
   * **No es cosmético: es la jerarquía de la página**, que `docs/diseno.md`
   * pide que sea consistente. En Inicio la grilla cuelga del `<h2>` del sector
   * «Qué hacemos», así que el nombre es un `h3` —el predeterminado, o sea que
   * Inicio no cambia—. En `/productos` la grilla cuelga directo del `<h1>`, y
   * ahí un `h3` se saltearía un nivel.
   *
   * El aspecto es el mismo en los dos casos: la escala tipográfica la pone la
   * clase, no la etiqueta.
   */
  nivel?: 2 | 3;
  prioridad?: boolean;
}) {
  const portada = portadaDe(producto.fotos);
  const Titulo = nivel === 2 ? "h2" : "h3";

  return (
    <article>
      <Link href={`/productos/${producto.slug}`} className="group block">
        {portada ? (
          <FotoImg
            foto={portada}
            alt={altAutomatico(producto.nombre, 1)}
            // Los listados usan siempre la portada, y la portada siempre es
            // 4:5. Se declara igual aunque ya lo sea: si algún día entra una
            // portada con otra proporción, la grilla no se desarma.
            proporcion="4/5"
            sizes={sizes}
            prioridad={prioridad}
          />
        ) : (
          // Sin portada no se dibuja una caja vacía con un ícono de imagen
          // rota: se deja el mismo bloque de superficie que ocupa una foto
          // mientras carga, así la grilla no se descuadra.
          <div className="bg-superficie" style={{ aspectRatio: "4/5" }} />
        )}
        <Titulo className="mt-3 text-subtitulo underline-offset-4 group-hover:underline">
          {producto.nombre}
        </Titulo>
      </Link>
    </article>
  );
}
