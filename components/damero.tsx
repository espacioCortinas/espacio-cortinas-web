import type { CSSProperties, ReactNode } from "react";

import { FotoImg } from "@/components/foto";
import { VideoMudo } from "@/components/video-mudo";
import type { Foto } from "@/contenido/tipos";
import type { Celda, CeldaDeMedio, Fila } from "@/lib/damero";
import { esVideo, sizesConTope, topeDeAncho } from "@/lib/fotos";

/**
 * El damero de las páginas de producto y de proyecto: la grilla de 2×2 con
 * líneas finas del boceto de la empresa — Fase 4.7. Qué va en cada celda lo
 * decide `lib/damero.ts`; esto lo dibuja.
 *
 * # De borde a borde, como en el boceto
 *
 * **Las líneas cruzan la pantalla entera**, y por eso las páginas lo ponen
 * fuera de la columna. Cada celda es media pantalla, y media pantalla es un
 * tamaño que casi todas las fotos del archivo aguantan: 720 px de CSS en un
 * monitor de 1440 son 1440 de archivo a doble densidad, y las portadas tienen
 * entre 2338 y 2560. La pantalla entera no la aguantaría ninguna (`docs/
 * diseno.md`, punto 2 del análisis), y no se usa: una celda sola centra su foto
 * con su tope.
 *
 * # Las fotos no se recortan
 *
 * **Cada foto va en su proporción**, la que tenga: el boceto recortaba las
 * suyas a la celda, pero las suyas eran de muestra y las de este archivo son
 * mitad verticales y mitad apaisadas. En escritorio cada foto entra en su celda
 * con 40 px de aire alrededor y un alto máximo de 44 rem —704 px, lo que entra
 * en una pantalla de 900— y la celda de texto que la acompaña toma su alto. Lo
 * que sobra al costado de una vertical queda en el gris del fondo, como una
 * lámina.
 *
 * **Y ninguna pasa de su tope**: nada se muestra más ancho que sus píxeles
 * sobre dos (`CLAUDE.md`, regla 4). Hoy solo muerde en `barral/2`, de 1028 px,
 * y en los videos, de 1280.
 *
 * En el teléfono hay una sola columna y la foto va a lo ancho de la pantalla,
 * con la línea arriba y abajo: es la forma de que se vea grande.
 *
 * # Las líneas
 *
 * Las arman el borde de arriba del damero y el de abajo de cada fila, más uno
 * vertical entre las dos celdas en escritorio, del lado que toque según la
 * fila esté invertida o no. En el teléfono, el de arriba de la segunda celda
 * separa las dos celdas apiladas. Son de la pizarra del sistema: 7,02:1 sobre el
 * fondo, una línea que se ve, como en el boceto.
 */

const LINEA = "border-acento";

export function Damero({ filas }: { filas: Fila[] }) {
  return (
    <MarcoDelDamero>
      {filas.map((fila, i) => (
        // La primera foto del damero está en la primera pantalla en casi todos
        // los anchos: va con prioridad, como iba antes la portada.
        <FilaDelDamero key={i} fila={fila} prioridad={i === 0} />
      ))}
    </MarcoDelDamero>
  );
}

/*
 * ────────────────────────────────────────────────────────────────────────────
 * Las piezas, sueltas
 *
 * El catálogo, el listado de trabajos y Nosotros arman su damero a mano, con
 * su propio contenido en cada celda, y usan estas mismas piezas para que las
 * líneas, el aire y las fotos sean idénticas en todas las páginas.
 * ────────────────────────────────────────────────────────────────────────────
 */

/** La línea de arriba del damero. Las filas ponen la de abajo de cada una. */
export function MarcoDelDamero({ children }: { children: ReactNode }) {
  return <div className={`${LINEA} border-t`}>{children}</div>;
}

/**
 * Una fila de dos celdas con sus líneas, o de una sola que ocupa todo el ancho.
 *
 * **La primera es la que va arriba en el teléfono**, y por eso es siempre la
 * del medio. `invertida` la pasa a la derecha en escritorio, con la línea del
 * medio del lado que corresponde: con `order` y no cambiando el orden del
 * documento, para que en el teléfono la foto siga yendo arriba de su texto.
 */
export function FilaConLineas({
  primera,
  segunda,
  invertida = false,
}: {
  primera: ReactNode;
  segunda?: ReactNode;
  invertida?: boolean;
}) {
  if (!segunda) {
    return <div className={`${LINEA} border-b`}>{primera}</div>;
  }

  return (
    <div className={`${LINEA} border-b md:grid md:grid-cols-2`}>
      <div
        className={
          invertida ? `md:order-2 md:border-l ${LINEA}` : `md:border-r ${LINEA}`
        }
      >
        {primera}
      </div>
      <div
        className={`${LINEA} border-t md:border-t-0 ${invertida ? "md:order-1" : ""}`}
      >
        {segunda}
      </div>
    </div>
  );
}

function FilaDelDamero({
  fila,
  prioridad,
}: {
  fila: Fila;
  prioridad: boolean;
}) {
  const [primera, segunda] = fila.celdas;

  // Dos medios en una fila no se invierten: no hay texto que alternar, y
  // cambiarlos de lado solo desordenaría la numeración de las fotos.
  const invertida =
    fila.invertida && segunda !== undefined && segunda.tipo !== "medio";

  return (
    <FilaConLineas
      primera={
        <CeldaDelDamero celda={primera} sola={!segunda} prioridad={prioridad} />
      }
      segunda={segunda && <CeldaDelDamero celda={segunda} />}
      invertida={invertida}
    />
  );
}

function CeldaDelDamero({
  celda,
  sola = false,
  prioridad = false,
}: {
  celda: Celda;
  sola?: boolean;
  prioridad?: boolean;
}) {
  switch (celda.tipo) {
    case "medio":
      return <CeldaConMedio celda={celda} sola={sola} prioridad={prioridad} />;

    case "recuadro":
      return (
        <CeldaDeTexto>
          {/* En minúscula y con sus saltos de renglón, como en el boceto: el
              de las venecianas es una lista de medidas, una por renglón. */}
          <h3 className="text-titulo whitespace-pre-line">
            {celda.recuadro.titulo}
          </h3>
          <p className="text-texto-suave mt-5 max-w-[32ch]">
            {celda.recuadro.texto}
          </p>
        </CeldaDeTexto>
      );

    case "variante":
      return (
        <CeldaDeTexto>
          <hgroup>
            {celda.variante.lema && (
              <p className="text-texto-suave text-subtitulo">
                {celda.variante.lema}
              </p>
            )}
            <h3 className="mt-1 text-titulo">{celda.variante.nombre}</h3>
          </hgroup>
          {celda.variante.descripcion && (
            // El párrafo va alineado a la izquierda aunque la celda esté
            // centrada: son tres o cuatro renglones, y centrados se leen peor.
            <p className="mt-6 max-w-[40ch] text-left">
              {celda.variante.descripcion}
            </p>
          )}
        </CeldaDeTexto>
      );

    case "variantes":
      return (
        <CeldaDeTexto>
          <h3 className="text-titulo">Variantes</h3>
          <p className="text-texto-suave mt-3 max-w-[32ch]">
            Son opciones del mismo producto, no productos distintos. Se eligen
            al presupuestar.
          </p>
          {/*
            Todas, también las que no tienen fotos, video ni descripción: siguen
            siendo opciones que alguien tiene que poder leer antes de preguntar.
          */}
          <ul className="mt-8 w-full max-w-[34ch] space-y-5 text-left">
            {celda.variantes.map((variante) => (
              <li key={variante.nombre}>
                <p className="text-acento font-semibold">{variante.nombre}</p>
                {variante.descripcion && (
                  <p className="text-texto-suave mt-1">
                    {variante.descripcion}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </CeldaDeTexto>
      );
  }
}

/** Texto centrado en su celda, con aire, y el alto que le dé la foto de al lado. */
export function CeldaDeTexto({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-5 py-12 text-center md:px-12 md:py-16 lg:px-16">
      {children}
    </div>
  );
}

function CeldaConMedio({
  celda,
  sola,
  prioridad,
}: {
  celda: CeldaDeMedio;
  sola: boolean;
  prioridad: boolean;
}) {
  const { medio, nombre, pie } = celda;

  // El nombre de la variante, arriba del medio: el medio puede caer lejos de
  // la celda que la nombra.
  const etiqueta = pie && (
    <p className="text-acento px-5 pt-8 pb-4 text-center font-semibold md:px-0 md:pt-0">
      {pie}
    </p>
  );

  if (esVideo(medio)) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-5 py-8 md:p-10">
        {etiqueta}
        {/*
          `VideoMudo` trae su tope y su pie con la duración. Su `<figure>` va
          a lo ancho de esta caja —hasta el tope— y centrada: como hijo de una
          caja flexible tomaría el ancho del video, que antes de cargar es el
          de cualquier video sin datos, 300 px, y la fila saltaría al cargar.
        */}
        <div className="w-full [&>figure]:mx-auto">
          <VideoMudo video={medio} etiqueta={nombre} />
        </div>
      </div>
    );
  }

  return (
    <FotoEnCelda
      foto={medio}
      alt={nombre}
      encima={etiqueta}
      sola={sola}
      prioridad={prioridad}
    />
  );
}

/**
 * Una foto en su celda: en su proporción, con su tope, centrada y con aire en
 * escritorio, y a lo ancho de la pantalla en el teléfono.
 *
 * **El ancho de la foto sale de una cuenta y no de `width: auto`**, y es lo
 * que evita que la página salte al cargar. Con `auto`, una foto diferida mide
 * 300 px hasta que llega —es lo que vale cualquier imagen sin datos— y después
 * crece a su tamaño: medido en Roller, la página pasaba de 4.814 a 6.503 px de
 * alto mientras cargaban las fotos.
 *
 * La cuenta: lo que quepa en la celda, o lo que dé el alto máximo de 44 rem por
 * la proporción de la foto, lo que sea menos. `--proporcion` es ancho sobre
 * alto, del manifiesto.
 */
export function FotoEnCelda({
  foto,
  alt,
  encima,
  sola = false,
  prioridad = false,
}: {
  foto: Foto;
  alt: string;
  /** Lo que va arriba de la foto, adentro de la celda: el nombre de una variante. */
  encima?: ReactNode;
  /** Si la celda ocupa toda la fila: cambia el `sizes`. */
  sola?: boolean;
  prioridad?: boolean;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center md:p-10">
      {encima}
      <div
        className="w-full"
        style={
          {
            maxWidth: `${topeDeAncho(foto)}px`,
            "--proporcion": foto.ancho / foto.alto,
          } as CSSProperties
        }
      >
        <FotoImg
          foto={foto}
          alt={alt}
          sizes={sizesConTope(foto, [
            {
              desde: "768px",
              ancho: sola ? "calc(100vw - 5rem)" : "calc(50vw - 5rem)",
            },
            { ancho: "100vw" },
          ])}
          prioridad={prioridad}
          className="block h-auto w-full md:mx-auto md:w-[min(100%,calc(44rem*var(--proporcion)))]"
        />
      </div>
    </div>
  );
}
