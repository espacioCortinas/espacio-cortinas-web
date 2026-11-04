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
 * # Se esconde cuando hay un botón de WhatsApp a la vista
 *
 * Cuando un «Consultar por WhatsApp» entra en pantalla, el círculo **viaja
 * hacia ese botón mientras se achica y se desvanece**, en 300 ms: dice que es
 * lo mismo y que ahora está ahí. Cuando el botón sale de pantalla, el círculo
 * vuelve a aparecer en su lugar. Es una animación con función —regla 12—:
 * evita dos botones de WhatsApp en la misma pantalla y dice adónde fue.
 *
 * - **Con movimiento reducido, no viaja**: solo aparece y desaparece.
 * - **Escondido no se puede tocar ni enfocar** (`inert`): un lector de
 *   pantalla no oye un botón que no se ve, y el tabulador no se pierde en él.
 * - Los botones se buscan por `data-boton-whatsapp`, que pone `EnlaceWhatsapp`
 *   de `components/whatsapp.tsx`, y de nuevo en cada cambio de página: el
 *   círculo vive en el layout y no se desmonta al navegar.
 *
 * **Lleva el mensaje general.** El que nombra el producto o el proyecto sigue
 * siendo el botón de cada página, que es donde se decide escribir.
 *
 * Sin sombra, aunque flote: la regla 2 de `docs/diseno.md` las prohíbe. Lo
 * separa del contenido su color. `z-20` deja arriba al menú desplegado del
 * teléfono, que es `z-30`.
 */

const DURACION = 300;

export function WhatsappFlotante() {
  const ancla = useRef<HTMLDivElement>(null);
  const circulo = useRef<HTMLAnchorElement>(null);
  const [oculto, setOculto] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const visibles = new Set<Element>();
    const quieto = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const esconder = (destino: Element) => {
      const el = circulo.current;
      const base = ancla.current?.getBoundingClientRect();
      if (!el || !base) return;
      const meta = destino.getBoundingClientRect();
      const dx = meta.left + meta.width / 2 - (base.left + base.width / 2);
      const dy = meta.top + meta.height / 2 - (base.top + base.height / 2);
      el.style.transition = quieto()
        ? `opacity ${DURACION / 2}ms ease`
        : `transform ${DURACION}ms ease-in, opacity ${DURACION}ms ease-in`;
      el.style.transform = quieto()
        ? "none"
        : `translate(${dx}px, ${dy}px) scale(0.4)`;
      el.style.opacity = "0";
      setOculto(true);
    };

    const mostrar = () => {
      const el = circulo.current;
      if (!el) return;
      // Reaparece en su lugar, creciendo un poco: no vuelve desde el botón,
      // que a esta altura ya salió de la pantalla.
      el.style.transition = "none";
      el.style.transform = quieto() ? "none" : "scale(0.6)";
      void el.offsetWidth;
      el.style.transition = `transform ${DURACION}ms ease-out, opacity ${DURACION}ms ease-out`;
      el.style.transform = "none";
      el.style.opacity = "1";
      setOculto(false);
    };

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) visibles.add(entrada.target);
          else visibles.delete(entrada.target);
        }
        const [primero] = visibles;
        if (primero) esconder(primero);
        else mostrar();
      },
      // Se esconde cuando el botón ya se ve casi entero, no cuando asoma.
      { threshold: 0.6 },
    );

    const botones = document.querySelectorAll("[data-boton-whatsapp]");
    botones.forEach((boton) => observador.observe(boton));
    if (botones.length === 0) mostrar();

    return () => observador.disconnect();
  }, [pathname]);

  return (
    <div
      ref={ancla}
      className="pointer-events-none fixed right-4 bottom-4 z-20 size-14 md:right-6 md:bottom-6"
    >
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
  );
}
