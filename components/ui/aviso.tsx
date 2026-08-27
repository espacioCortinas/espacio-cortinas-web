import type { ReactNode } from "react";

/**
 * Un mensaje al pie de una acción: salió bien, salió mal, o hay algo pendiente.
 *
 * `role="alert"` solo en los errores: es lo que interrumpe al lector de
 * pantalla para leerlo enseguida, y usarlo en todo hace que deje de
 * distinguirse. Un «Guardado» va con `role="status"`, que se anuncia cuando
 * termina la frase en curso.
 */

type Tono = "error" | "exito" | "atencion";

/**
 * Rojo, verde y ámbar en un panel que por lo demás es todo gris.
 *
 * No contradice «el panel no se diseña»: estos tres colores no son una
 * propuesta visual, son parte del mensaje. «Se guardó» y «no se pudo» tienen
 * que distinguirse antes de leerlos, y en un panel sin color un aviso gris
 * sobre fondo gris directamente no se ve — que es lo que pasaba con el de
 * guardado. La paleta de la marca se elige en la Fase 4.1 y no tiene por qué
 * salir de acá.
 *
 * El color nunca va solo: cada aviso dice con palabras qué pasó, porque una
 * de cada doce personas no distingue rojo de verde.
 */
const ESTILOS: Record<Tono, string> = {
  error: "border-red-700 bg-red-50 text-red-900",
  exito: "border-green-700 bg-green-50 text-green-900",
  atencion: "border-amber-600 bg-amber-50 text-amber-900",
};

export function Aviso({
  tono = "error",
  children,
}: {
  tono?: Tono;
  children: ReactNode;
}) {
  if (!children) return null;

  return (
    <p
      role={tono === "error" ? "alert" : "status"}
      className={`rounded border px-3 py-2 text-sm ${ESTILOS[tono]}`}
    >
      {children}
    </p>
  );
}

/** Etiqueta chica de estado: «Publicado», «6 fotos», «Sin portada». */
export function Chip({
  children,
  tono = "neutro",
}: {
  children: ReactNode;
  tono?: "neutro" | "atencion" | "apagado";
}) {
  const estilos = {
    neutro: "border-neutral-400 bg-neutral-100 text-neutral-800",
    atencion: "border-amber-600 bg-amber-50 text-amber-900",
    apagado: "border-neutral-300 bg-white text-neutral-500",
  }[tono];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs whitespace-nowrap ${estilos}`}
    >
      {children}
    </span>
  );
}
