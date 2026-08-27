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

/**
 * La rueda que gira mientras algo está en curso.
 *
 * **Por qué hace falta:** varias acciones del panel tardan de verdad —subir una
 * foto son cuatro archivos, guardar revalida el sitio— y un botón que se apaga
 * y no hace nada más se lee como una página tildada. El texto también cambia
 * («Guardando…»), pero el texto hay que leerlo; el movimiento se ve de reojo.
 *
 * `aria-hidden` porque no aporta nada a un lector de pantalla: para eso están
 * el texto del botón y `aria-busy`, que sí se anuncian.
 *
 * `motion-reduce:animate-none` respeta a quien pidió menos movimiento en el
 * sistema. Ahí la rueda queda quieta y el que informa es el texto, que es
 * justamente por qué el texto cambia y no alcanza con la animación sola.
 */
export function Rueda() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-4 shrink-0 animate-spin motion-reduce:animate-none"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * «Guardando…» con la rueda al lado, para lo que no es un botón.
 *
 * Los interruptores de publicado y destacado se guardan al tocarlos, sin botón
 * que se pueda apagar, así que sin esto no hay ninguna señal entre el toque y
 * el cartel de «Guardado».
 */
export function Cargando({ children }: { children: React.ReactNode }) {
  return (
    <span
      role="status"
      className="flex items-center gap-2 text-sm text-neutral-600"
    >
      <Rueda />
      {children}
    </span>
  );
}

export function Boton({
  variante = "secundario",
  cargando = false,
  disabled,
  className = "",
  children,
  ...resto
}: ComponentProps<"button"> & { variante?: Variante; cargando?: boolean }) {
  return (
    <button
      {...resto}
      // Un botón que está trabajando no se puede volver a tocar: dos envíos
      // del mismo formulario crearían dos productos.
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={`${BASE} ${ESTILOS[variante]} ${className}`.trim()}
    >
      {cargando && <Rueda />}
      {children}
    </button>
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
