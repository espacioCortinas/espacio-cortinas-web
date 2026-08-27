import type { ComponentProps } from "react";

/**
 * ESTO NO ESTÁ DISEÑADO, Y ES A PROPÓSITO.
 *
 * Sin paleta, sin tipografía elegida, sin logo: solo grises de Tailwind y un
 * rojo para lo que borra. La dirección visual se define en la Fase 4.1, con
 * las fotos reales del negocio a la vista; si el panel llegara con estética
 * propia, la condicionaría sin haber mirado una sola foto (docs/plan.md).
 *
 * Lo que sí está resuelto es que se pueda usar, que es otra cosa:
 *
 * - **`min-h-12`, o sea 48 px.** Es lo que hace falta para que un pulgar
 *   acierte sin mirar. La administradora va a usar esto parada en la casa de
 *   un cliente, con el teléfono en una mano.
 * - **`text-base`, o sea 16 px.** Por debajo de eso, iOS hace zoom solo al
 *   tocar un campo y descoloca la pantalla entera.
 * - **`disabled:` visible.** Un botón que no responde y no parece apagado se
 *   toca cinco veces.
 */

type Variante = "primario" | "secundario" | "peligro";

const ESTILOS: Record<Variante, string> = {
  primario: "bg-neutral-900 text-white hover:bg-neutral-700",
  secundario:
    "bg-white text-neutral-900 border border-neutral-400 hover:bg-neutral-100",
  peligro: "bg-red-700 text-white hover:bg-red-800",
};

const BASE =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded px-4 text-base " +
  "font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900";

export function Boton({
  variante = "secundario",
  className = "",
  ...resto
}: ComponentProps<"button"> & { variante?: Variante }) {
  return (
    <button
      {...resto}
      className={`${BASE} ${ESTILOS[variante]} ${className}`.trim()}
    />
  );
}

/** Mismo aspecto, pero es un enlace. Para «Editar», «Volver» y demás. */
export function BotonEnlace({
  variante = "secundario",
  className = "",
  ...resto
}: ComponentProps<"a"> & { variante?: Variante }) {
  return (
    <a
      {...resto}
      className={`${BASE} ${ESTILOS[variante]} ${className}`.trim()}
    />
  );
}
