import { Fraunces, Karla } from "next/font/google";

/**
 * Las dos familias del sitio. Dos, que es el máximo — `docs/diseno.md`.
 *
 * **Se cargan con `next/font` y no con un `<link>` a Google.** `next/font`
 * descarga los archivos en el build y los sirve desde el propio dominio: no hay
 * pedido a un tercero en tiempo de ejecución, no hay una conexión más que
 * abrir antes de pintar texto, y no hay salto al renderizar.
 *
 * Cada una expone su variable CSS, que es lo que consumen los tokens
 * `--font-titulo` y `--font-texto` de `app/globals.css`. Los componentes usan
 * el token, nunca la fuente directamente.
 */

/**
 * Títulos. Serif de contraste con eje óptico: a tamaño de display abre las
 * formas y a tamaño chico las cierra, así que un solo archivo sirve para la
 * escala entera.
 */
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--fuente-titulo",
  display: "swap",
});

/** Texto. Sans neutra, con buena altura de x para los 17 px del teléfono. */
export const karla = Karla({
  subsets: ["latin"],
  variable: "--fuente-texto",
  display: "swap",
});

/** Para colgar de `<html>`, que es desde donde las heredan los tokens. */
export const variablesDeFuentes = `${fraunces.variable} ${karla.variable}`;
