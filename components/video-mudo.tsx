"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Boton } from "@/components/ui/boton";
import type { Video } from "@/contenido/tipos";
import { rutaDePosterDeVideo, rutaDeVideo, topeDeAncho } from "@/lib/fotos";

/**
 * Un video corto y sin sonido. Se llamaba `VideoVariante` y se generalizó en
 * la Fase 4.3, cuando llegaron los primeros videos de proyecto — decisión 51.
 *
 * # Siempre en bucle, los de variante y los de proyecto
 *
 * El de una variante documenta un gesto —la cortina que sube y baja sola—; el
 * de un proyecto es un recorrido por el lugar. **Los dos arrancan solos al
 * entrar en pantalla, mudos y en bucle, sin botón**, y es una decisión de quien
 * desarrolla después de probarlo: la Fase 4.3 los había hecho a pedido, con un
 * botón para iniciarlos, y se revirtió para que se comporten igual que en
 * productos — decisión 51.
 *
 * # Por qué es "use client"
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
 *   entrar en pantalla, y se pausa al salir. Dentro de la galería, «en
 *   pantalla» quiere decir en la diapositiva visible: uno que está más allá en
 *   la tira no se descarga hasta que alguien desliza hasta él.
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
 *     loop         el video se repite
 *     playsInline  sin esto, un iPhone se lo lleva a pantalla completa
 *     preload      "none": el archivo se pide cuando hace falta y no antes
 *     sin controls la barra nativa se dibuja ENCIMA del video, y en este sitio
 *                  no va nada sobre una imagen, nunca. Cuando hace falta un
 *                  control —movimiento reducido o reproducción bloqueada—
 *                  es un botón del sistema, debajo del video
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

export function VideoMudo({
  video,
  etiqueta,
  caja,
}: {
  video: Video;
  /**
   * El nombre accesible del video, entero: «Roller Motorizado: la cortina
   * abriéndose y cerrándose sola», «Cowork en Nordelta — video 1». Lo arma
   * quien lo usa porque es quien sabe qué muestra.
   */
  etiqueta: string;
  /**
   * La proporción de la caja donde tiene que entrar, en `ancho / alto`, cuando
   * el video vive dentro de una diapositiva de `components/galeria.tsx`.
   *
   * **Es lo que hace que el vertical no tenga barras.** El `<video>` se
   * dimensiona a SU proporción dentro de la caja —al alto si es más alto que
   * ella, al ancho si no— en vez de estirarse a la caja entera y dejar el
   * relleno adentro del elemento, que es donde aparecerían las franjas.
   *
   * Sin `caja`, el video ocupa el ancho disponible con el tope de píxeles, que
   * es como lo muestra la página de producto.
   */
  caja?: number;
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
   * pantalla, al terminar si no está en bucle, o cuando alguien enciende la
   * preferencia de menos movimiento— y un estado que cada llamada tiene que
   * acordarse de actualizar se desincroniza en el primer caso que nadie previó.
   */
  const [reproduciendo, setReproduciendo] = useState(false);

  // Hay que ofrecer un control cuando el video no va a arrancar solo: porque
  // se pidió menos movimiento o porque el navegador no deja. Sin un botón
  // nadie podría iniciarlo.
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
          if (!entrada.isIntersecting) {
            // Lo que no se ve no se reproduce. En la
            // galería eso incluye deslizar la tira hasta que el video sale.
            el.pause();
          } else {
            // Rechazado: el navegador no deja reproducir solo —modo de bajo
            // consumo en iOS, o una preferencia del usuario—. Se ofrece el
            // control en vez de dejar un cuadro fijo sin explicación.
            el.play().catch(() => setBloqueado(true));
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
   * tampoco puede ser el protagonista de la página — `docs/diseno.md`. Dentro
   * de una galería el tope lo pone la diapositiva, no esto.
   */
  const tope = topeDeAncho(video);

  // ¿Es más alto que la caja? Entonces manda el alto, y el ancho sale de su
  // proporción; si no, al revés. Las dos proporciones en alto / ancho.
  const masAltoQueLaCaja =
    caja !== undefined && video.alto / video.ancho > 1 / caja;

  const elemento = (
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
      aria-label={etiqueta}
      // `bg-superficie` es lo que se ve mientras el cartel carga: un paso del
      // papel, no un gris. Un recuadro gris sobre papel cálido es un agujero.
      // Como la caja del elemento mide exactamente lo que el video, esto no
      // aparece nunca como franja al costado.
      className={
        "bg-superficie " +
        (caja === undefined
          ? "h-auto w-full"
          : masAltoQueLaCaja
            ? "h-full w-auto max-w-full"
            : "h-auto max-h-full w-full")
      }
      style={
        caja === undefined
          ? undefined
          : { aspectRatio: `${video.ancho} / ${video.alto}` }
      }
    />
  );

  return (
    <figure
      className="m-0"
      style={caja === undefined ? { maxWidth: `${tope}px` } : undefined}
    >
      {caja === undefined ? (
        elemento
      ) : (
        <div
          className="flex items-center justify-center"
          style={{ aspectRatio: caja }}
        >
          {elemento}
        </div>
      )}

      <figcaption className="text-texto-suave mt-3 text-meta">
        {/*
          Un video sin controles no da ninguna forma de saber cuánto dura ni que
          no hay audio que encender. Se dice, y el número sale del manifiesto.
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
