import { Raleway } from "next/font/google";

/**
 * La familia del sitio: Raleway, la del boceto de la empresa — Fase 4.7.
 *
 * **Una sola, en dos pesos**: 700 los títulos y 400 el texto. Reemplaza a
 * Fraunces y Karla, de la dirección que la empresa rechazó; Fraunces, además,
 * es hoy una de las letras que más se repiten en los sitios hechos con IA.
 *
 * El boceto usa también Tahoma en algunos títulos, y esa no: es una letra de
 * Windows, que en los teléfonos no está, y la mezcla de dos letras en los
 * títulos era de las cosas del boceto que no se copian (`docs/plan.md`).
 *
 * **Se carga con `next/font` y no con un `<link>` a Google.** `next/font`
 * descarga los archivos en el build y los sirve desde el propio dominio: no hay
 * pedido a un tercero en tiempo de ejecución, no hay una conexión más que
 * abrir antes de pintar texto, y no hay salto al renderizar. Es la versión
 * variable, así que los dos pesos salen del mismo archivo.
 *
 * Expone su variable CSS, que es lo que consumen los tokens `--font-titulo` y
 * `--font-texto` de `app/globals.css`. Los componentes usan el token, nunca la
 * fuente directamente.
 */
export const raleway = Raleway({
  subsets: ["latin"],
  variable: "--fuente-raleway",
  display: "swap",
});

/** Para colgar de `<html>`, que es desde donde la heredan los tokens. */
export const variablesDeFuentes = raleway.variable;
