import type { ReactNode } from "react";

/**
 * Un listado que no tiene nada.
 *
 * **Se dice, no se tapa.** `/proyectos` estuvo vacía hasta la Fase 4.3 —nunca
 * se llegó a cargar un proyecto antes de sacar el panel—, y vuelve a estarlo si
 * algún día todos quedan inactivos. Eso es información sobre el estado del
 * contenido, no un error que haya que esconder. Las dos salidas fáciles son
 * peores que decirlo: llenar la sección con trabajos inventados sería mentir
 * sobre lo que la empresa hizo, y esconder la sección del menú haría que un
 * enlace ya compartido caiga en una página muerta.
 *
 * **Tiene que verse deliberado, y eso es una decisión de composición**, no un
 * párrafo gris centrado en el medio de la nada. Por eso es un bloque de
 * superficie con el mismo ritmo vertical que una sección de verdad, alineado al
 * margen de la columna como todo lo demás, y con salidas: quien llega acá tiene
 * dónde seguir.
 *
 * Sin ícono al lado del título —`docs/diseno.md`, regla 4— y sin centrar: un
 * bloque centrado con un ícono arriba es exactamente el estado vacío de
 * plantilla que la regla 4 existe para evitar.
 *
 * El encabezamiento es un `<p>` y no un `<h2>` a propósito: esto es una
 * afirmación sobre el contenido, no una sección más de la página, y meter un
 * encabezado acá rompería la jerarquía de la página que lo usa.
 */
export function Vacio({
  etiqueta,
  titulo,
  children,
  acciones,
}: {
  /** La línea chica de arriba: «Sin proyectos publicados». */
  etiqueta: string;
  /** La frase principal, en la familia de títulos. */
  titulo: string;
  /** Por qué está vacío, en palabras de este negocio y sin inventar nada. */
  children: ReactNode;
  /** A dónde puede seguir quien llegó acá. */
  acciones?: ReactNode;
}) {
  return (
    /*
     * Los márgenes negativos no son un truco: son lo que hace que el texto de
     * adentro caiga **en la misma vertical** que el título de la página. El
     * bloque se estira hasta el borde de la columna y su relleno lo devuelve al
     * margen; sin eso, el texto quedaría 48 px adentro y la página dejaría de
     * leerse como una sola columna.
     *
     * Da por sentado que cuelga directo del contenedor de la página, que es de
     * donde toma el margen que compensa.
     */
    <div className="bg-superficie -mx-5 px-5 py-12 md:-mx-12 md:px-12 md:py-20">
      {/*
        La línea de arriba va como los lemas del boceto de la empresa —chica,
        en minúscula y gris— y no en mayúscula espaciada a 13 px, que es una de
        las marcas de sitio hecho con IA (Fase 4.7). El título, en el peso y la
        pizarra de los títulos aunque sea un `<p>`.
      */}
      <p className="text-texto-suave text-subtitulo">{etiqueta}</p>
      <p className="font-titulo text-acento max-w-lectura mt-2 text-titulo font-bold">
        {titulo}
      </p>
      <div className="max-w-lectura text-texto-suave mt-4">{children}</div>
      {acciones && (
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          {acciones}
        </div>
      )}
    </div>
  );
}
