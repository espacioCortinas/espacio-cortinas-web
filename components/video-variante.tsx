"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Boton } from "@/components/ui/boton";
import type { Video } from "@/contenido/tipos";
import { rutaDePosterDeVideo, rutaDeVideo, topeDeAncho } from "@/lib/fotos";

/**
 * El video de una variante motorizada.
 *
 * # Por qué hay un video, y por qué se mueve solo
 *
 * Es lo único que muestra lo que una foto no puede: que la cortina se mueve
 * sola — decisión 40. **Acá el movimiento ES el contenido y no un adorno**, así
 * que es la única excepción razonable a «animaciones escasas y con función» de
 * `docs/diseno.md`, y está razonada ahí mismo: «se presentan como un ítem más
 * de la galería, en la posición de la variante motorizada que documentan, con
 * `muted`, `loop` y `playsinline`».
 *
 * # Por qué es el segundo "use client" del sitio público
 *
 * **No hay forma declarativa de no reproducir con `prefers-reduced-motion`.**
 * El CSS puede parar una animación pero no un `<video autoplay>`, y el atributo
 * no se puede poner condicionalmente desde el servidor porque el servidor no
 * sabe qué prefiere quien mira. `docs/diseno.md` pide que con esa preferencia
 * «queda el cuadro fijo y un control para iniciarlo», y eso solo se puede
 * decidir en el navegador.
 *
 * De paso resuelve dos cosas más que el HTML solo no resuelve:
 *
 * - **No gasta datos hasta que alguien llega.** `preload="none"` más un
 *   `IntersectionObserver`: el archivo no se pide hasta que el video está por
 *   entrar en pantalla, y se pausa al salir. Con `autoplay` a secas el
 *   navegador decide solo, y cada uno decide distinto.
 * - **Si la reproducción automática está bloqueada, aparece el control.** En
 *   iOS con el modo de bajo consumo, `play()` es rechazado aunque el video esté
 *   mudo y en línea. Sin esto quedaría un cuadro fijo sin ninguna forma de
 *   iniciarlo, y quien mira no tendría manera de saber que es un video.
 *
 * # Lo que el `<video>` lleva y por qué
 *
 *     muted        hace falta para que un navegador acepte reproducir solo.
 *                  Además los archivos NO TIENEN pista de audio: el script lo
 *                  comprueba y avisa si alguno la conserva
 *     loop         once segundos que se repiten
 *     playsInline  sin esto, un iPhone se lo lleva a pantalla completa
 *     preload      "none": el archivo se pide cuando hace falta y no antes
 *     sin controls una barra de controles sobre un bucle de once segundos sin
 *                  sonido es interfaz que no hace falta. Cuando SÍ hace falta
 *                  —movimiento reducido, o reproducción bloqueada— aparece un
 *                  botón del sistema, debajo del video y nunca encima
 */

const MENOS_MOVIMIENTO = "(prefers-reduced-motion: reduce)";

/**
 * Si quien mira pidió menos movimiento en su sistema.
 *
 * Es `useSyncExternalStore` y no un `useState` con un efecto, y son dos razones:
 * React se encarga de que el servidor y el cliente no discrepen al hidratar
 * —el servidor no puede saberlo, así que supone que no—, y **si alguien cambia
 * la preferencia con la página abierta, esto se entera**. Un efecto que lee la
 * consulta una sola vez no.
 */
function useMenosMovimiento(): boolean {
  return useSyncExternalStore(
    (avisar) => {
      const consulta = window.matchMedia(MENOS_MOVIMIENTO);
      consulta.addEventListener("change", avisar);
      return () => consulta.removeEventListener("change", avisar);
    },
    () => window.matchMedia(MENOS_MOVIMIENTO).matches,
    // En el servidor se supone que no, que es lo que deja el HTML sin el botón.
    // Si resulta que sí, React lo corrige al hidratar.
    () => false,
  );
}

export function VideoVariante({
  video,
  titulo,
}: {
  video: Video;
  /** El nombre de la variante: «Motorizado». Va al texto alternativo. */
  titulo: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const menosMovimiento = useMenosMovimiento();

  /** El navegador rechazó reproducir solo: modo de bajo consumo, o una preferencia. */
  const [bloqueado, setBloqueado] = useState(false);

  /**
   * Si está en marcha, para que el botón diga «Pausar» o «Reproducir».
   *
   * **Lo maneja el propio `<video>` con sus eventos `play` y `pause`**, y no
   * cada lugar del código que lo arranca o lo frena. Es la única forma de que
   * el botón no mienta: el elemento también se pausa solo —al salir de
   * pantalla, o cuando alguien enciende la preferencia de menos movimiento— y
   * un estado que cada llamada tiene que acordarse de actualizar se
   * desincroniza en el primer caso que alguien no previó.
   */
  const [reproduciendo, setReproduciendo] = useState(false);

  // Hay que ofrecer un control en los dos casos, y por el mismo motivo: el
  // video no va a arrancar solo y sin un botón nadie podría iniciarlo.
  const aMano = menosMovimiento || bloqueado;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Con movimiento reducido no se pide el archivo siquiera: queda el cuadro
    // de cartel, que es una imagen fija, y el botón para iniciarlo.
    //
    // **El `pause()` no sobra.** Si alguien enciende la preferencia con la
    // página abierta, el video ya está en marcha y hay que frenarlo: sin esta
    // línea seguiría en bucle justo después de que lo pidieran quieto.
    if (menosMovimiento) {
      el.pause();
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            // Rechazado: el navegador no deja reproducir solo —modo de bajo
            // consumo en iOS, o una preferencia del usuario—. Se ofrece el
            // control en vez de dejar un cuadro fijo sin explicación.
            el.play().catch(() => setBloqueado(true));
          } else {
            el.pause();
          }
        }
      },
      // Empieza a pedirlo un poco antes de que entre, para que ya esté
      // moviéndose cuando aparece.
      { rootMargin: "200px" },
    );

    observador.observe(el);
    return () => observador.disconnect();
  }, [menosMovimiento]);

  const alternar = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) void el.play().catch(() => {});
    else el.pause();
  };

  /*
   * El mismo tope que las fotos, y por la misma cuenta: 1280 px de archivo a
   * doble densidad son 640 px de CSS. **El video no puede ser grande**, así que
   * tampoco puede ser el protagonista de la página — `docs/diseno.md`.
   */
  const tope = topeDeAncho(video);

  return (
    <figure className="m-0" style={{ maxWidth: `${tope}px` }}>
      <video
        ref={ref}
        src={rutaDeVideo(video)}
        poster={rutaDePosterDeVideo(video)}
        width={video.ancho}
        height={video.alto}
        muted
        loop
        playsInline
        preload="none"
        onPlay={() => setReproduciendo(true)}
        onPause={() => setReproduciendo(false)}
        aria-label={`${titulo}: la cortina abriéndose y cerrándose sola`}
        // `bg-superficie` es lo que se ve mientras el cartel carga: un paso del
        // papel, no un gris. Un recuadro gris sobre papel cálido es un agujero.
        className="bg-superficie h-auto w-full"
      />

      <figcaption className="text-texto-suave mt-3 text-meta">
        {/*
          Un video que arranca solo, sin controles y sin sonido no da ninguna
          forma de saber cuánto dura ni que no hay audio que encender. Se dice,
          y el número sale del manifiesto y no de acá.
        */}
        Video de {video.duracion} segundos, en bucle y sin sonido.
      </figcaption>

      {aMano && (
        <p className="mt-4">
          <Boton variante="secundario" onClick={alternar}>
            {reproduciendo ? "Pausar el video" : "Reproducir el video"}
          </Boton>
        </p>
      )}
    </figure>
  );
}
