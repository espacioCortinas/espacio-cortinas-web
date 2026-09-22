import { FotoImg } from "@/components/foto";
import { VideoMudo } from "@/components/video-mudo";
import type { Medio } from "@/contenido/tipos";
import { esVideo, sizesConTope, topeDeAncho } from "@/lib/fotos";
import { altAutomatico } from "@/lib/texto";

/**
 * Una galería que se recorre de costado, arrastrando.
 *
 * # Por qué no apila
 *
 * Porque `docs/diseno.md` pide, en la sección mobile-first, que **«la galería
 * se recorre con el pulgar, gestos naturales»**, y una pila vertical no se
 * recorre con el pulgar: se scrollea como el resto de la página y empuja todo
 * lo que viene abajo. Con cuatro fotos de un producto, la variante siguiente
 * queda a dos pantallas.
 *
 * # Cómo está hecho: sin JavaScript
 *
 * Es `overflow-x` con `scroll-snap` del navegador. En un teléfono eso **es** el
 * gesto nativo —el mismo que cualquier otra cosa que se desliza—, en un
 * trackpad es el deslizamiento de dos dedos, y con el contenedor enfocable las
 * flechas del teclado lo mueven. No hay estado, no hay `"use client"` y no hay
 * una librería de carrusel: son tres propiedades de CSS.
 *
 * Eso además resuelve solo el `prefers-reduced-motion`: no hay ninguna
 * animación que suprimir, porque el movimiento lo hace el dedo.
 *
 * # La caja de cada foto sale de las fotos
 *
 * Un carrusel de orientaciones mezcladas tiene que elegir: o recorta, o deforma,
 * o deja aire. **Deja aire**, que es lo único compatible con `docs/diseno.md`
 * —«Nunca deformar», «la proporción propia de cada foto»— y con la tesis de la
 * dirección: una foto rodeada de papel se lee como una lámina.
 *
 * Todas las diapositivas de una galería miden lo mismo, y esa medida sale de la
 * foto **más alta de esa galería**, con tope en 4:5 (ver `RELACION_MAXIMA`). O
 * sea que una galería de puras apaisadas queda en una tira baja y ancha, sin
 * nada de aire desperdiciado, y una mezclada queda en una caja vertical donde
 * las apaisadas flotan. Es la decisión 48 otra vez —el tamaño sale del
 * material, no de la posición— aplicada a la caja en vez de al módulo.
 *
 * **El tope de píxeles sigue valiendo**: ninguna foto se muestra más ancha que
 * `topeDeAncho()`, así que `cortinas-tela/barral/2` no pasa de 514 px aunque la
 * diapositiva dé más.
 *
 * # Fotos y videos, en el mismo orden
 *
 * Desde la Fase 4.3 un elemento puede ser un video: la galería de un proyecto
 * los trae intercalados en el orden de la carpeta — decisión 51. Ocupa una
 * diapositiva como cualquier foto, con la misma caja, y va en bucle y mudo
 * como los de variante. Arranca cuando su diapositiva queda a la vista, no
 * antes: los que están más allá en la tira no se descargan hasta que alguien
 * desliza hasta ellos. Ver `components/video-mudo.tsx`.
 *
 * Las galerías de producto no traen videos —los de una variante van debajo de
 * ella, en bucle— así que para ellas nada de esto cambia.
 */

/**
 * El ancho máximo de una diapositiva para que el medio que lleva adentro no se
 * muestre más ancho que sus píxeles.
 *
 * **Si el medio es más ancho que la caja, o igual, se muestra al ancho de la
 * diapositiva**, y el tope es el suyo tal cual. **Si es más alto**, se muestra
 * al alto de la caja y queda más angosto que la diapositiva, así que la
 * diapositiva puede ser proporcionalmente más ancha sin que el medio pase de su
 * tope. Sin esta cuenta, el video vertical del cowork —720 px de ancho, tope de
 * 360— achicaría su diapositiva a 360 y la tira quedaría con una caja más baja
 * que las demás, cuando adentro de una caja de 480 × 600 se muestra a 337 de
 * ancho y le sobra.
 *
 * Para las fotos de producto da lo mismo que antes: todas tienen el tope por
 * encima de los 480 px de la diapositiva.
 */
function topeDeDiapositiva(medio: Medio, altoSobreAnchoCaja: number): number {
  const altoSobreAncho = medio.alto / medio.ancho;
  return Math.floor(
    topeDeAncho(medio) * Math.max(1, altoSobreAncho / altoSobreAnchoCaja),
  );
}

/**
 * Lo más vertical que puede ponerse la caja: 4:5, la proporción de las portadas
 * y la única que este sitio declara como propia.
 *
 * Sin tope, una galería con una foto 3:4 daría una caja más alta todavía, y la
 * apaisada que estuviera al lado flotaría en el medio de mucho papel. Con el
 * tope, la 3:4 pierde un poco de ancho —queda contenida, no recortada— y la
 * apaisada respira menos.
 */
const RELACION_MAXIMA = 5 / 4;

/**
 * El ancho de una diapositiva, escrito una vez.
 *
 * **No llega al 100 %, y es a propósito:** lo que asoma de la foto siguiente es
 * lo que dice que hay más y que esto se desliza. Es la única señal que funciona
 * sin `hover` y sin texto, que es lo que pide la regla mobile-first.
 *
 * En escritorio el tope de 30rem hace que entren dos y pico en la columna, que
 * es lo que convierte la tira en algo que se lee como una tira.
 */
const ANCHO_DIAPOSITIVA = "w-[86%]";

/** El tope de la diapositiva en escritorio. Ver `ANCHO_DIAPOSITIVA`. */
const ANCHO_MAXIMO = "30rem";

/** El mismo dato que `ANCHO_DIAPOSITIVA`, del lado del navegador. */
const TRAMOS = [
  { desde: "768px", ancho: "30rem" },
  { ancho: "calc((100vw - 2.5rem) * 0.86)" },
];

export function Galeria({
  medios,
  nombre,
  desde = 1,
  prioridad = false,
}: {
  /**
   * Fotos, o fotos y videos intercalados. Un `Foto[]` entra tal cual: es lo
   * que mandan las páginas de producto.
   */
  medios: Medio[];
  /** Para el texto alternativo: «Roller — foto 3». */
  nombre: string;
  /**
   * La posición de la primera FOTO de este arreglo dentro de la galería
   * completa, empezando en 1.
   *
   * Existe porque las páginas de producto y de proyecto muestran la portada
   * arriba y mandan acá el resto: la primera de este arreglo es la foto 2, y
   * el texto alternativo tiene que decir «foto 2» y no «foto 1» — es la misma
   * numeración que ve el visitante.
   *
   * **Las fotos y los videos se cuentan por separado**: «foto 3», «video 1».
   * Un lector de pantalla que oye «foto 7» esperando la séptima foto y recibe
   * un video pierde la cuenta; y ningún video es portada, así que su cuenta
   * siempre empieza en 1.
   */
  desde?: number;
  /** La primera foto de la página, si esta galería es lo primero que se ve. */
  prioridad?: boolean;
}) {
  if (medios.length === 0) return null;

  // La caja, sacada del medio más alto de esta galería. `aspectRatio` se
  // escribe ancho/alto, así que va invertida.
  const masAlta = Math.max(...medios.map((m) => m.alto / m.ancho));
  const altoSobreAnchoCaja = Math.min(RELACION_MAXIMA, masAlta);
  const relacionCaja = 1 / altoSobreAnchoCaja;

  // La numeración de cada elemento, contando fotos y videos por separado.
  let fotos = desde - 1;
  let videos = 0;
  const numeros = medios.map((m) => (esVideo(m) ? ++videos : ++fotos));

  const etiquetaDeVideo = (n: number) => `${nombre.trim()} — video ${n}`;

  // Con un solo elemento no hay nada que recorrer: se dibuja solo, al ancho que
  // sus píxeles permitan. Un carrusel de un elemento es un carrusel roto.
  if (medios.length === 1) {
    const medio = medios[0];
    if (esVideo(medio)) {
      return <VideoMudo video={medio} etiqueta={etiquetaDeVideo(1)} />;
    }
    return (
      <div style={{ maxWidth: `${topeDeAncho(medio)}px` }}>
        <FotoImg
          foto={medio}
          alt={altAutomatico(nombre, desde)}
          sizes={sizesConTope(medio, TRAMOS)}
          prioridad={prioridad}
        />
      </div>
    );
  }

  return (
    /*
     * `tabIndex` y `role` no son adorno: un contenedor que scrollea tiene que
     * poder recibir foco para que se lo pueda recorrer con el teclado, y tiene
     * que anunciar qué es. Es lo que convierte esto en algo usable sin mouse.
     *
     * La barra va fina y del gris del sistema —`texto-suave`, 5,23:1, el mismo
     * que la decisión 46 fijó para el borde de un control— porque en escritorio
     * es la otra señal de que esto se mueve. Con `--color-linea` daría 1,29:1 y
     * no se vería.
     */
    <ul
      tabIndex={0}
      role="group"
      aria-label={`${videos > 0 ? "Fotos y videos" : "Fotos"} de ${nombre}, se recorren de costado`}
      className={
        "flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-3 " +
        "[scrollbar-color:var(--color-texto-suave)_transparent] [scrollbar-width:thin]"
      }
    >
      {medios.map((medio, i) => (
        <li
          key={esVideo(medio) ? medio.archivo : medio.carpeta}
          className={`${ANCHO_DIAPOSITIVA} shrink-0 snap-start`}
          /*
            **El tope de píxeles vive acá**, en la diapositiva, y no en un
            envoltorio de la foto: la foto nunca puede ser más ancha que su
            diapositiva, así que topear la diapositiva topea la foto sin
            inventar una caja intermedia. La cuenta, en `topeDeDiapositiva()`.

            Hoy no llega a morder en ninguna foto —la diapositiva no pasa de
            480 px y el tope más bajo es el de `cortinas-tela/barral/2`, que
            son 514— pero va igual: es la garantía que hace que ensanchar la
            tira mañana no devuelva una foto blanda.
          */
          style={{
            maxWidth: `min(${ANCHO_MAXIMO}, ${topeDeDiapositiva(medio, altoSobreAnchoCaja)}px)`,
          }}
        >
          {esVideo(medio) ? (
            // El video trae su propia caja, con la misma proporción que las de
            // las fotos: así queda a la misma altura que ellas y su leyenda y
            // su botón caen debajo, nunca encima.
            <VideoMudo
              video={medio}
              etiqueta={etiquetaDeVideo(numeros[i])}
              caja={relacionCaja}
            />
          ) : (
            /*
              La caja de la diapositiva. Todas iguales dentro de una galería, y
              **sin fondo propio**: lo que sobra queda en papel, no en un
              rectángulo de superficie. Una foto apaisada dentro de una caja
              vertical con el fondo un paso más oscuro se lee como una barra
              negra de televisor; sobre el papel se lee como una lámina, que es
              literalmente la tesis de la dirección.
            */
            <div
              className="flex items-center justify-center"
              style={{ aspectRatio: relacionCaja }}
            >
              {/*
                `max-w-full` y `max-h-full` son lo que hace el «contain»: la
                foto se achica hasta entrar por los dos lados y conserva su
                proporción —la altura la deja en `auto` el preflight de
                Tailwind—. Acá no se recorta nada, y lo que sobra de la caja
                queda en papel.
              */}
              <FotoImg
                foto={medio}
                alt={altAutomatico(nombre, numeros[i])}
                sizes={sizesConTope(medio, TRAMOS)}
                prioridad={prioridad && i === 0}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
