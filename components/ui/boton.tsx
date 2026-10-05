import type { ComponentProps } from "react";

/**
 * Los botones del sitio: **tres variantes y ninguna más** — `docs/diseno.md`.
 *
 *     principal    pizarra sólida, blanco encima       8,10:1
 *     secundario   filete pizarra de 1 px, sin relleno 7,02:1 sobre el fondo
 *     enlace       texto pizarra subrayado             7,02:1 sobre el fondo
 *
 * La pizarra es la de los títulos del boceto de la empresa — Fase 4.7. Hasta
 * ahí los tres eran negros, porque el amarillo del logo anterior no podía
 * llevar texto sobre fondo claro (decisión 43).
 *
 * **El principal no es azul verdoso, aunque sea el color de la marca.** El
 * blanco sobre ese color da 2,63:1: un botón así no se lee. Con el texto oscuro
 * sí se leería —5,08:1—, pero quedaría como un bloque más de los del boceto, y
 * el botón tiene que ser lo que más pesa de la pantalla.
 *
 * Se fue la variante `peligro`, que era del panel: en un sitio público no hay
 * ninguna acción que destruya nada.
 *
 * Lo que se conserva de la versión del panel, porque no era estética:
 *
 * - **`min-h-12`, o sea 48 px**, por encima de los 44 que pide la zona táctil
 *   mínima. En `enlace` son 44, que es el piso.
 * - **17 px de texto.** Por debajo de 16, iOS hace zoom solo al tocar un campo
 *   y descoloca la pantalla.
 * - **`disabled:` visible.** Un botón que no responde y no parece apagado se
 *   toca cinco veces.
 */

type Variante = "principal" | "secundario" | "enlace";

/*
 * El estado de hover cambia de fondo, no de color de texto, y nunca es lo único
 * que informa algo: nada de este sitio depende de `hover` para entenderse
 * (`docs/diseno.md`, mobile-first). En un teléfono no existe.
 *
 * El hover del principal va a la pizarra un paso más oscura del sistema:
 * blanco encima, 11,13:1.
 */
const ESTILOS: Record<Variante, string> = {
  principal:
    "min-h-12 px-6 bg-acento text-claro hover:bg-acento-hondo rounded-boton",
  secundario:
    "min-h-12 px-6 border border-acento text-acento hover:bg-acento hover:text-claro rounded-boton",
  enlace:
    "min-h-11 text-acento underline underline-offset-4 decoration-1 hover:decoration-2",
};

const BASE =
  "inline-flex items-center justify-center gap-2 text-cuerpo font-medium " +
  "transition-colors duration-150";

/**
 * Apagado de verdad: más tenue y con el cursor de «no».
 *
 * **Un botón que está enviando no se apaga así**, aunque tampoco se pueda
 * tocar. Al 50 % el texto del principal queda en 2,46:1 contra su propio fondo,
 * y en ese momento el texto es lo único que dice qué está pasando —«Enviando…»
 * con la rueda—. WCAG exime a los controles inactivos del contraste, pero este
 * no está inactivo: está trabajando, y tiene que leerse.
 */
const APAGADO = "disabled:cursor-not-allowed disabled:opacity-50";

/**
 * La rueda que gira mientras algo está en curso.
 *
 * **Queda una sola cosa que la usa**: el botón de enviar del formulario de
 * contacto, que habla con Resend y tarda. Un botón que se apaga y no hace nada
 * más se lee como una página tildada.
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

/** «Cargando…» con la rueda al lado, para lo que no es un botón. */
export function Cargando({ children }: { children: React.ReactNode }) {
  return (
    <span
      role="status"
      className="text-texto-suave flex items-center gap-2 text-meta"
    >
      <Rueda />
      {children}
    </span>
  );
}

/**
 * Las clases de una variante, sueltas.
 *
 * Es para `next/link`, que tiene que ser un `<Link>` de verdad en las
 * navegaciones internas —si no, cada botón del sitio recarga la página entera—
 * y no puede ser `BotonEnlace`, que renderiza un `<a>` pelado.
 */
export function clasesDeBoton(variante: Variante = "secundario") {
  return `${BASE} ${ESTILOS[variante]}`;
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
      // Un botón que está trabajando no se puede volver a tocar: dos envíos del
      // mismo formulario mandarían dos correos.
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={`${BASE} ${ESTILOS[variante]} ${cargando ? "cursor-progress" : APAGADO} ${className}`.trim()}
    >
      {cargando && <Rueda />}
      {children}
    </button>
  );
}

/**
 * Mismo aspecto, pero es un enlace.
 *
 * Es la forma que más se usa en el sitio público: el llamado a la acción lleva
 * a WhatsApp y a `/contacto`, que son navegaciones, no acciones. Un `<a>` que
 * parece botón se abre en una pestaña nueva, se copia y se comparte; un
 * `<button>` con `onClick` no hace ninguna de las tres.
 */
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
