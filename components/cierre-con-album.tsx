"use client";

import {
  Children,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { Boton } from "@/components/ui/boton";

/**
 * El cierre de una página de producto con sus fotos apaisadas: un álbum chico
 * que pasa solo, y el bloque con el botón montado sobre su borde de abajo —
 * decisión 67.
 *
 * **Las fotos son las «wpp»** que la empresa eligió para el link de WhatsApp:
 * apaisadas, que en el carrusel de 4:5 quedarían chicas, y que acá cierran la
 * página al lado del botón que lleva a WhatsApp.
 *
 * **El bloque pisa la foto pero no lleva texto encima de ella**: es opaco, del
 * azul verdoso de los bloques, y se monta sobre el borde como el del logo en la
 * apertura de Inicio. Nada va escrito sobre la foto.
 *
 * # Pasa solo, y es la única excepción
 *
 * En el resto del sitio nada se mueve si alguien no lo mueve. Acá sí, cada 3
 * segundos, a pedido de quien desarrolla, y con las tres cosas que lo hacen
 * aceptable:
 *
 * - **se frena solo** cuando el álbum no está en pantalla o la pestaña no está
 *   a la vista: lo que nadie mira no se mueve;
 * - **con movimiento reducido no pasa**: queda la primera foto;
 * - **tiene un botón para pausarlo**, porque WCAG (2.2.2) pide poder frenar
 *   todo lo que se mueve solo más de cinco segundos.
 *
 * El cambio es un fundido corto, no un deslizamiento: el deslizamiento dice
 * «hay más, movelo», y esto no se mueve con el dedo.
 */

const CADA = 3000;
const MENOS_MOVIMIENTO = "(prefers-reduced-motion: reduce)";

function useMenosMovimiento(): boolean {
  return useSyncExternalStore(
    (avisar) => {
      const consulta = window.matchMedia(MENOS_MOVIMIENTO);
      consulta.addEventListener("change", avisar);
      return () => consulta.removeEventListener("change", avisar);
    },
    () => window.matchMedia(MENOS_MOVIMIENTO).matches,
    () => false,
  );
}

export function CierreConAlbum({
  etiqueta,
  proporcion,
  ancho,
  fotos,
  children,
}: {
  /** Para un lector de pantalla: «Fotos de Roller». */
  etiqueta: string;
  /** Ancho sobre alto de la caja: el de la primera foto. */
  proporcion: number;
  /** El tope del álbum en píxeles de CSS: el de la foto más chica. */
  ancho: number;
  /** Una foto por hijo, ya armada. */
  fotos: ReactNode;
  /** Lo que va en el bloque: el título, el texto y los botones. */
  children: ReactNode;
}) {
  const lista = Children.toArray(fotos);
  const total = lista.length;
  const album = useRef<HTMLDivElement>(null);
  const [actual, setActual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [aLaVista, setALaVista] = useState(false);
  const menosMovimiento = useMenosMovimiento();

  const pasa = total > 1 && !pausado && !menosMovimiento && aLaVista;

  useEffect(() => {
    const el = album.current;
    if (!el) return;
    const observador = new IntersectionObserver(([entrada]) =>
      setALaVista(entrada.isIntersecting && !document.hidden),
    );
    observador.observe(el);
    const alCambiarDePestana = () => {
      if (document.hidden) setALaVista(false);
    };
    document.addEventListener("visibilitychange", alCambiarDePestana);
    return () => {
      observador.disconnect();
      document.removeEventListener("visibilitychange", alCambiarDePestana);
    };
  }, []);

  useEffect(() => {
    if (!pasa) return;
    const reloj = window.setInterval(
      () => setActual((i) => (i + 1) % total),
      CADA,
    );
    return () => window.clearInterval(reloj);
  }, [pasa, total]);

  return (
    <section aria-labelledby="cierre">
      <div className="-mx-5 md:mx-0">
        <div
          ref={album}
          role="group"
          aria-roledescription="carrusel"
          aria-label={etiqueta}
          className="relative mx-auto w-full"
          style={{ aspectRatio: proporcion, maxWidth: `${ancho}px` }}
        >
          {lista.map((foto, i) => (
            <div
              key={i}
              aria-hidden={i !== actual}
              className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${
                i === actual ? "opacity-100" : "opacity-0"
              }`}
            >
              {foto}
            </div>
          ))}
        </div>
      </div>

      {/*
        El bloque se monta sobre el borde de abajo del álbum, corrido a la
        derecha, como el del logo sobre la foto en la apertura de Inicio. Es
        opaco y va arriba de la foto (`z-10`): tapa una franja, no la tiñe.
      */}
      <div className="bg-marca text-texto relative z-10 -mt-10 ml-8 -mr-5 px-5 py-10 md:-mt-20 md:mr-0 md:ml-24 md:px-12 md:py-16">
        {children}
        {total > 1 && !menosMovimiento && (
          <p className="mt-6">
            <Boton
              variante="enlace"
              onClick={() => setPausado((p) => !p)}
              aria-pressed={pausado}
            >
              {pausado ? "Seguir pasando las fotos" : "Pausar las fotos"}
            </Boton>
          </p>
        )}
      </div>
    </section>
  );
}
