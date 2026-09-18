import { logo } from "@/contenido/marca";

/**
 * El logo de la empresa, tal cual es: «espacio» en minúscula, «CORTINAS» en
 * versalita espaciada, y el círculo amarillo detrás de la «e».
 *
 * # El problema, que es el de toda la fase
 *
 * El logo vino como JPG **con fondo blanco**, y el sitio es papel de cal
 * `#F6F2EC`. El encabezado está en todas las páginas, así que lo que se resuelva
 * acá se ve siempre.
 *
 * ## Lo que se hizo: va sobre el papel, sin campo propio, y el papel no se mueve
 *
 * `scripts/preparar-marca.mjs` le saca el fondo blanco deshaciendo la mezcla
 * —el suavizado sobrevive como transparencia y no como color— y el logo se
 * apoya directo sobre el papel, al mismo margen que el texto.
 *
 * ## Por qué, con los números
 *
 * **Lo que tiene que ser legible es la palabra, y la palabra es negra.**
 * `#211F20` sobre el papel da **14,69:1**. Nada del logo depende de que el
 * amarillo se lea: el amarillo es el círculo, que es una forma.
 *
 * **Y el contraste WCAG es el instrumento equivocado para medir esa forma.**
 * Mide luminancia, y el amarillo `#FFF100` tiene casi exactamente la misma
 * luminancia que el papel: L\* 93,5 contra 95,6. De ahí sale 1,06:1, que
 * describiría un círculo invisible. No lo es: la separación es de croma, no de
 * claridad, y medida como diferencia perceptual da **ΔE2000 = 28,5**. El
 * círculo se ve, y se ve como amarillo.
 *
 * **Las tres salidas posibles se midieron, y ninguna compra lo que cuesta:**
 *
 * | Fondo del logo         | Amarillo vs. fondo |  ΔE2000 |
 * | ---------------------- | -----------------: | ------: |
 * | papel de cal `#F6F2EC` |             1,06:1 |    28,5 |
 * | recambio `#F8F6F2`     |             1,09:1 |    29,0 |
 * | campo blanco `#FFFFFF` |             1,18:1 |    30,3 |
 *
 * Mover el papel entero al valor de recambio de la decisión 43 mueve la
 * separación **0,5 unidades**, por debajo del umbral en que se nota un cambio
 * —que ronda 2— y a cambio de aflojar el papel de cal, que es lo que resuelve
 * el problema número uno del archivo fotográfico: la disparidad de calidad
 * entre las 23 fotos. Un campo blanco detrás del logo compra 1,8 unidades y
 * mete en el encabezado de todas las páginas un color que no está en la paleta,
 * con aspecto de calcomanía pegada sobre el papel. Y la versión en negro tira
 * el único color de la marca para arreglar un problema que mide 1,8.
 *
 * Así que el papel se queda en `#F6F2EC`, el logo va sin campo, y el amarillo
 * del círculo es **el único amarillo de la pantalla**: la regla de una vez por
 * pantalla la gasta entera el logo, y por eso no hay amarillo en ningún otro
 * lado del sitio (`docs/diseno.md`, «La marca»). Decisión 44.
 *
 * # Dos cosas que quedan abiertas, y no son de esta fase
 *
 * - **El archivo es un JPG de 524 px.** Alcanza justo para los 168 px de ancho
 *   máximo de acá en una pantalla de triple densidad. Para cualquier cosa más
 *   grande hace falta el vector, que `docs/diseno.md` le sigue pidiendo a la
 *   empresa.
 * - **El círculo viene cortado por el borde superior del archivo fuente**, así
 *   que arriba tiene una tangente plana. Se ve en el original y se arregla con
 *   el vector, no acá.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    /*
     * `<img>` y no `next/image`, por lo mismo que las fotos: el optimizador
     * rehace en cada visita un trabajo ya hecho y en Cloudflare consume la
     * cuota de Transformations (decisión 25). Acá además es un archivo solo, ya
     * del tamaño exacto.
     *
     * `width` y `alto` salen del manifiesto generado y no de una cuenta: con
     * ellos el navegador reserva el lugar del logo antes de descargarlo y el
     * encabezado no salta al cargar.
     */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo.ruta}
      width={logo.ancho}
      height={logo.alto}
      // El logo es lo primero que se pinta y está en todas las páginas: no se
      // difiere.
      fetchPriority="high"
      decoding="async"
      alt="Espacio Cortinas"
      className={`h-auto w-[8.75rem] md:w-[10.5rem] ${className}`.trim()}
    />
  );
}
