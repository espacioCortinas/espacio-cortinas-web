import {
  Barlow,
  Chivo,
  DM_Mono,
  Fraunces,
  Karla,
  Spectral,
} from "next/font/google";

/**
 * Las seis familias de las tres direcciones en evaluación.
 *
 * **Esto incumple la regla 7 de `docs/diseno.md` —máximo dos familias— a
 * propósito y de forma acotada.** `/muestra` existe para comparar tres
 * propuestas tipográficas, y compararlas con las fuentes equivocadas no compara
 * nada. La regla vale para el sitio; esta página no es el sitio y se borra en la
 * Fase 4.5 junto con este archivo — decisión 41.
 *
 * Se cargan con `next/font` y no con un `<link>` a Google: `next/font` descarga
 * las fuentes en el build y las sirve desde el propio dominio, así que no hay
 * pedido a un tercero en tiempo de ejecución ni salto al renderizar. Es también
 * lo que va a usar el sitio real con la familia que gane.
 *
 * Cada familia expone su variable CSS y el panel de su dirección la consume.
 * Ninguna toca `:root`: fuera de `/muestra` no cambia nada.
 */

/** A · Cal — títulos. Serif de contraste con eje óptico. */
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--fuente-cal-titulo",
  display: "swap",
});

/** A · Cal — texto. */
export const karla = Karla({
  subsets: ["latin"],
  variable: "--fuente-cal-texto",
  display: "swap",
});

/** B · Contraluz — títulos. Serif dibujada para pantalla. */
export const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--fuente-contraluz-titulo",
  display: "swap",
});

/** B · Contraluz — texto. */
export const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--fuente-contraluz-texto",
  display: "swap",
});

/**
 * C · Regla — títulos y texto, una sola familia.
 *
 * Chivo es de Omnibus-Type, de Buenos Aires. No es un dato decorativo: es una
 * tipografía hecha acá para un negocio de acá.
 */
export const chivo = Chivo({
  subsets: ["latin"],
  variable: "--fuente-regla-texto",
  display: "swap",
});

/** C · Regla — numeración y metadatos. */
export const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--fuente-regla-mono",
  display: "swap",
});

/** Todas juntas, para colgarlas del contenedor de la página. */
export const clasesDeFuentes = [
  fraunces.variable,
  karla.variable,
  spectral.variable,
  barlow.variable,
  chivo.variable,
  dmMono.variable,
].join(" ");
