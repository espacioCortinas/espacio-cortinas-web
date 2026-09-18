import type { ReactNode } from "react";

/**
 * Una etiqueta chica de metadato: la ubicación de un proyecto, el nombre de una
 * variante.
 *
 *     Casa en Nordelta
 *     [ Nordelta · Buenos Aires ]
 *
 * **Uno solo, sin tonos.** El chip del panel tenía tres —neutro, atención,
 * apagado— porque ahí marcaba estados: «Publicado», «Sin portada». En el sitio
 * público no hay estados que marcar: lo que no está publicado no existe. Lo que
 * queda es un dato al lado de un título, y un dato no tiene tono.
 *
 * Es filete de 1 px y no relleno, que es el recurso que la dirección «Regla»
 * aportó y el único que rima con las lamas y los pliegues de las 16 fotos que
 * ya son una trama de líneas finas.
 *
 * Contraste medido: texto suave `#6B645C` sobre el papel, **5,23:1**. El filete
 * es decorativo y no informa nada por su cuenta — lo que dice el chip lo dicen
 * sus palabras.
 */
export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="border-linea text-texto-suave inline-flex items-center rounded-chico border px-2.5 py-1 text-meta whitespace-nowrap">
      {children}
    </span>
  );
}
