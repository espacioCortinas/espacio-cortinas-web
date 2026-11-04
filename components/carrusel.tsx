"use client";

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { Boton } from "@/components/ui/boton";

/**
 * Una colección de fotos y videos que se recorre de a una, deslizando —
 * decisión 67.
 *
 * # El deslizamiento lo hace el navegador
 *
 * `overflow-x` con `scroll-snap`, como la tira de la decisión 50: en un
 * teléfono es el gesto nativo, en un trackpad el de dos dedos, y con el foco en
 * la tira las flechas del teclado la mueven. **Sin JavaScript se sigue
 * deslizando**; lo que agrega este componente es lo que el CSS solo no sabe:
 *
 * - **«2 / 8»**, que dice cuántas hay y dónde se está. Va debajo de la foto y
 *   no encima: en este sitio no va nada sobre una foto, nunca.
 * - **Dos botones, ‹ y ›**, para quien usa mouse: sin ellos, en una
 *   computadora sin trackpad no hay forma de pasar de foto. Están siempre a la
 *   vista —nada depende de `hover`— y el del extremo se apaga.
 *
 * **No pasa solo y no anima nada**: se mueve cuando alguien lo mueve. Con
 * movimiento reducido, los botones saltan de foto sin deslizar.
 *
 * Es un `"use client"` más en el sitio público, junto con la barra de enlaces,
 * el video y el formulario. El contador no se puede hacer con CSS en todos los navegadores
 * de hoy: `::scroll-marker` existe en Chrome y no en Safari.
 */
export function Carrusel({
  etiqueta,
  corto,
  children,
}: {
  /** El nombre del grupo para un lector de pantalla: «Fotos de Roller Screen». */
  etiqueta: string;
  /**
   * Lo que va delante del contador: «Screen · 3 / 8». Dice de qué variante es
   * el álbum también cuando su nombre quedó arriba, fuera de la pantalla.
   */
  corto?: string;
  /** Una diapositiva por hijo, ya armada. */
  children: ReactNode;
}) {
  const diapositivas = Children.toArray(children);
  const total = diapositivas.length;
  const tira = useRef<HTMLDivElement>(null);
  const [actual, setActual] = useState(0);

  // La diapositiva visible sale de cuánto se deslizó la tira: cada una mide
  // exactamente el ancho de la tira, así que es una división.
  const medir = useCallback(() => {
    const el = tira.current;
    if (!el || el.clientWidth === 0) return;
    setActual(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  useEffect(() => {
    const el = tira.current;
    if (!el) return;
    el.addEventListener("scroll", medir, { passive: true });
    return () => el.removeEventListener("scroll", medir);
  }, [medir]);

  const ir = (indice: number) => {
    const el = tira.current;
    if (!el) return;
    const quieto = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollTo({
      left: indice * el.clientWidth,
      behavior: quieto ? "auto" : "smooth",
    });
  };

  if (total === 1) return <>{diapositivas[0]}</>;

  return (
    <div
      role="group"
      aria-roledescription="carrusel"
      aria-label={etiqueta}
      className="w-full"
    >
      <div
        ref={tira}
        // Enfocable para que las flechas del teclado la muevan.
        tabIndex={0}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] focus-visible:outline-offset-4 [&::-webkit-scrollbar]:hidden"
      >
        {diapositivas.map((diapositiva, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${total}`}
            className="w-full flex-none snap-start"
          >
            {diapositiva}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-5 px-5">
        <Boton
          variante="secundario"
          className="w-12 px-0!"
          onClick={() => ir(actual - 1)}
          disabled={actual === 0}
          aria-label="Anterior"
        >
          <Flecha hacia="izquierda" />
        </Boton>
        {/* Las cifras de línea del sistema hacen que «10 / 12» no baile al
            pasar de una a otra. */}
        <p className="text-texto-suave min-w-[4.5rem] text-center whitespace-nowrap tabular-nums">
          {corto && (
            <span className="text-acento font-semibold">{corto} · </span>
          )}
          {actual + 1} / {total}
        </p>
        <Boton
          variante="secundario"
          className="w-12 px-0!"
          onClick={() => ir(actual + 1)}
          disabled={actual === total - 1}
          aria-label="Siguiente"
        >
          <Flecha hacia="derecha" />
        </Boton>
      </div>
    </div>
  );
}

/** La flecha de los botones: un trazo del grosor de la letra, no un carácter. */
function Flecha({ hacia }: { hacia: "izquierda" | "derecha" }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0">
      <path
        d={hacia === "izquierda" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
