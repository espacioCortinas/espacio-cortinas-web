"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { LogoWhatsapp } from "@/components/iconos-de-contacto";
import { enlaceWhatsapp } from "@/lib/whatsapp";

/**
 * WhatsApp siempre a mano: un círculo con el logo, abajo a la derecha, en todas
 * las páginas públicas — decisión 67.
 *
 * **Fue el «¡Chateá con nosotros!» del boceto de la empresa** (Fase 4.7), con
 * su texto. Desde noviembre de 2026 es solo el logo en un círculo, a pedido de
 * quien desarrolla: tapa menos foto, y el logo de WhatsApp se entiende solo.
 * Es la segunda excepción a «nada redondo» (regla 3 de `docs/diseno.md`),
 * después del logo circular. Va en el azul verdoso de los bloques con el logo
 * oscuro encima, 5,08:1; nunca en el verde de WhatsApp (decisión 65).
 *
 * # Se mete en el botón de WhatsApp cuando ese botón está a la vista
 *
 * Cuando un «Consultar por WhatsApp» entra en pantalla, **el círculo vuela
 * hasta el logo de ese botón y se posa encima**: viaja en una curva suave,
 * se achica hasta que su logo mide lo mismo que el del botón, y recién en el
 * último tramo se desvanece. Al llegar, el logo del botón hace un pulso chico,
 * como si lo recibiera. Se lee como que el WhatsApp de la esquina se metió en
 * el botón. Cuando el botón sale de pantalla, el círculo reaparece en su lugar
 * con un rebote corto.
 *
 * Es animación con función —regla 12—: evita dos WhatsApp en la misma
 * pantalla y dice adónde fue. Se probó primero en línea recta, hacia el centro
 * del botón y desvaneciéndose a mitad de camino: se veía arrastrado y no
 * llegaba a ningún lado.
 *
 * - **La curva sale de dos movimientos con aceleraciones distintas**: el
 *   horizontal en `movX` y el vertical en `movY`, uno adentro del otro. Es
 *   como cae algo que se tira, y no hace falta calcular ningún arco.
 * - **Solo vuela si alguien movió la página.** Si el botón ya está a la vista
 *   al abrirla, el círculo arranca escondido, sin volar: una animación que
 *   nadie provocó es ruido.
 * - **Con movimiento reducido, no viaja**: solo aparece y desaparece.
 * - **Escondido no se puede tocar ni enfocar** (`inert`): un lector de
 *   pantalla no oye un botón que no se ve, y el tabulador no se pierde en él.
 * - Los botones se buscan por `data-boton-whatsapp`, que pone `EnlaceWhatsapp`
 *   de `components/whatsapp.tsx`, y de nuevo en cada cambio de página: el
 *   círculo vive en el layout y no se desmonta al navegar.
 *
 * Usa la API de animaciones del navegador (`element.animate`), sin librerías:
 * cada animación se puede cancelar a mitad de camino si alguien sube y baja
 * rápido.
 *
 * **Lleva el mensaje general.** El que nombra el producto o el proyecto sigue
 * siendo el botón de cada página, que es donde se decide escribir.
 *
 * Sin sombra, aunque flote: la regla 2 de `docs/diseno.md` las prohíbe. Lo
 * separa del contenido su color. `z-20` deja arriba al menú desplegado del
 * teléfono, que es `z-30`.
 */

/** Lo que dura el viaje hasta el botón, y la vuelta a su lugar. */
const VIAJE = 450;
const VUELTA = 250;
/** El logo del círculo, en píxeles: la cuenta de cuánto achicarlo. */
const LOGO_DEL_CIRCULO = 28;

export function WhatsappFlotante() {
  const ancla = useRef<HTMLDivElement>(null);
  const movX = useRef<HTMLDivElement>(null);
  const movY = useRef<HTMLDivElement>(null);
  const circulo = useRef<HTMLAnchorElement>(null);
  const [oculto, setOculto] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const visibles = new Set<Element>();
    let escondido = false;
    // Solo se anima lo que provoca alguien bajando o subiendo: al abrir la
    // página, el navegador puede ubicar el botón un instante después de la
    // primera vez que avisa, y eso no es un movimiento de nadie.
    let movio = false;
    const alMoverse = () => {
      movio = true;
    };
    window.addEventListener("scroll", alMoverse, { passive: true, once: true });
    const quieto = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const elementos = () =>
      [movX.current, movY.current, circulo.current].filter(
        (el): el is HTMLDivElement | HTMLAnchorElement => el !== null,
      );
    const cancelar = () =>
      elementos().forEach((el) =>
        el.getAnimations().forEach((a) => a.cancel()),
      );

    const esconder = (boton: Element, sinAnimar: boolean) => {
      const [x, y, c] = [movX.current, movY.current, circulo.current];
      const base = ancla.current?.getBoundingClientRect();
      if (!x || !y || !c || !base) return;
      cancelar();
      escondido = true;
      setOculto(true);

      const final = { opacity: 0 };
      if (sinAnimar) {
        c.animate([final], { duration: 0, fill: "forwards" });
        return;
      }
      if (quieto()) {
        c.animate([{ opacity: 1 }, final], {
          duration: 150,
          fill: "forwards",
        });
        return;
      }

      // El destino es el logo del botón, no su centro: ahí se posa.
      const logo = boton.querySelector("svg") ?? boton;
      const meta = logo.getBoundingClientRect();
      const dx = meta.left + meta.width / 2 - (base.left + base.width / 2);
      const dy = meta.top + meta.height / 2 - (base.top + base.height / 2);
      const escala = meta.width / LOGO_DEL_CIRCULO;
      const opciones = { duration: VIAJE, fill: "forwards" as const };

      x.animate([{ transform: "none" }, { transform: `translateX(${dx}px)` }], {
        ...opciones,
        easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      });
      y.animate([{ transform: "none" }, { transform: `translateY(${dy}px)` }], {
        ...opciones,
        easing: "cubic-bezier(0.55, 0, 0.35, 1)",
      });
      const viaje = c.animate(
        [
          { transform: "none", opacity: 1 },
          { transform: `scale(${(1 + escala) / 2})`, opacity: 1, offset: 0.7 },
          { transform: `scale(${escala})`, opacity: 0 },
        ],
        { ...opciones, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
      );
      // Al llegar, el logo del botón lo recibe con un pulso.
      viaje.onfinish = () => {
        if (!escondido) return;
        logo.animate(
          [
            { transform: "scale(1)" },
            { transform: "scale(1.15)" },
            { transform: "scale(1)" },
          ],
          { duration: 260, easing: "ease-out" },
        );
      };
    };

    const mostrar = (sinAnimar: boolean) => {
      const c = circulo.current;
      if (!c) return;
      cancelar();
      escondido = false;
      setOculto(false);
      if (sinAnimar) return;
      // Reaparece en su lugar y no vuelve desde el botón, que a esta altura ya
      // salió de la pantalla. Con un rebote corto: crece un poco de más y se
      // asienta.
      c.animate(
        quieto()
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [
              { transform: "scale(0.6)", opacity: 0 },
              { transform: "scale(1)", opacity: 1 },
            ],
        {
          duration: quieto() ? 150 : VUELTA,
          easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        },
      );
    };

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) visibles.add(entrada.target);
          else visibles.delete(entrada.target);
        }
        const [primero] = visibles;
        if (primero && !escondido) esconder(primero, !movio);
        else if (!primero && escondido) mostrar(!movio);
      },
      // Se esconde cuando el botón ya se ve casi entero, no cuando asoma.
      { threshold: 0.6 },
    );

    const botones = document.querySelectorAll("[data-boton-whatsapp]");
    botones.forEach((boton) => observador.observe(boton));
    if (botones.length === 0) mostrar(true);

    return () => {
      observador.disconnect();
      window.removeEventListener("scroll", alMoverse);
      cancelar();
    };
  }, [pathname]);

  return (
    <div
      ref={ancla}
      // A su distancia del borde se suma lo que tapan las barras del
      // navegador (`env(safe-area-inset-*)`); en los demás navegadores esa
      // medida vale cero.
      //
      // **En el iPhone eso no alcanza.** Safari de iOS 26 desvanece hacia el
      // color de fondo una franja de unos 90 pt al pie de la pantalla, aunque
      // su barra esté escondida, y esa franja no la informa: el círculo
      // quedaba adentro y no se veía (captura del 05/11/2026, iOS 26.6.1,
      // pestañas arriba). `-webkit-touch-callout` solo existe en el WebKit de
      // iOS —Safari y también Chrome de iPhone—, así que la regla no toca
      // Android ni escritorio; y solo en anchos de teléfono, porque el iPad
      // no tiene barra abajo.
      className="pointer-events-none fixed right-[calc(1rem+env(safe-area-inset-right))] bottom-[calc(1rem+env(safe-area-inset-bottom))] z-20 size-14 max-md:supports-[-webkit-touch-callout:none]:bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:right-[calc(1.5rem+env(safe-area-inset-right))] md:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"
    >
      <div ref={movX}>
        <div ref={movY}>
          <a
            ref={circulo}
            href={enlaceWhatsapp({ tipo: "general" })}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escribinos por WhatsApp"
            aria-hidden={oculto || undefined}
            inert={oculto}
            className="bg-marca text-texto pointer-events-auto flex size-14 items-center justify-center rounded-full"
          >
            <LogoWhatsapp className="size-7" />
          </a>
        </div>
      </div>
    </div>
  );
}
