import type { ReactNode } from "react";

/**
 * La columna de la página.
 *
 * Es el único ancho del sitio y el único margen lateral: 20 px en teléfono y
 * 48 en escritorio (`docs/diseno.md`). Todo entra acá —el texto, las fotos, el
 * encabezado y el pie— y por eso la página se lee como una sola columna
 * editorial en vez de como bloques apilados con anchos distintos.
 *
 * **Nada sangra hasta el borde, ni en el teléfono.** Además de ser la tesis de
 * la dirección, es lo único que el archivo fotográfico aguanta: ninguna portada
 * tiene píxeles para un sangrado en escritorio.
 */

/**
 * Las mismas clases, sueltas, para cuando el contenedor tiene que ser un
 * elemento concreto —`<main>`, `<footer>`— y no un `<div>` de más.
 */
export const CLASES_CONTENEDOR = "mx-auto w-full max-w-columna px-5 md:px-12";

export function Contenedor({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${CLASES_CONTENEDOR} ${className}`.trim()}>{children}</div>
  );
}
