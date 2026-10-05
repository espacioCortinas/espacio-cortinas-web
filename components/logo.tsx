import { logo, logoGrande } from "@/contenido/marca";

/**
 * El logo de la empresa, tal cual es: dos círculos de línea, «espacio» en
 * minúscula y «CORTINAS» en versalita espaciada, todo en un solo gris carbón.
 *
 * # Es el logo nuevo, el del boceto — Fase 4.7
 *
 * Hasta la Fase 4.7 el logo tenía un círculo amarillo relleno detrás de la
 * «e», y casi todo este componente explicaba cómo apoyar ese amarillo sobre un
 * papel crema con el que casi no contrastaba (decisión 44). **Ese problema se
 * fue con el dibujo**: el de ahora no tiene color propio. El azul verdoso de la
 * marca nueva es el del bloque sobre el que el boceto lo apoya, no una tinta
 * del logo, y acá va directo sobre el blanco del encabezado.
 *
 * El gris del dibujo, `#35363A`, da 12,07:1 sobre el blanco y 10,46:1 sobre
 * el fondo: se lee igual en los dos.
 *
 * # El tamaño: 160 px en el teléfono, 200 en escritorio
 *
 * **Los círculos son de línea fina, y eso pone el piso.** Se miraron a 140,
 * 168, 200 y 240 px en una pantalla de doble densidad: a 140 la línea todavía
 * se ve, pero ya casi es un pelo. El logo anterior iba a 140 y 168.
 *
 * El archivo publicado tiene 600 px, el triple de 200: alcanza para una
 * pantalla de triple densidad. La cuenta está del otro lado, en
 * `scripts/preparar-marca.mjs`.
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
     * encabezado no salta.
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
      className={`h-auto w-[10rem] md:w-[12.5rem] ${className}`.trim()}
    />
  );
}

/**
 * El logo grande, para el bloque azul verdoso de la apertura de Inicio: es la
 * imagen central del boceto de la empresa, el dibujo gris carbón apoyado sobre
 * el color de la marca. Sobre ese color da 4,58:1.
 *
 * **Ocupa todo el ancho de su bloque**, y el bloque decide cuánto es: el
 * tope de 26 rem lo pone quien lo usa. Por eso lleva las dos medidas en el
 * `srcset` —600 y 1.200 px— y un `sizes` que dice lo mismo que el bloque: en un
 * teléfono se muestra a menos de 300 px y baja el de 600; en escritorio, a 416,
 * y una pantalla de doble densidad pide el de 1.200.
 *
 * **Sin texto alternativo**, a diferencia del del encabezado: el nombre ya lo
 * anuncia el enlace del encabezado, que está en la misma pantalla, y repetirlo
 * acá haría que un lector de pantalla diga «Espacio Cortinas» dos veces antes
 * del título.
 *
 * Es lo primero grande que se ve en Inicio, así que no se difiere.
 */
export function LogoGrande({ sizes }: { sizes: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoGrande.ruta}
      srcSet={`${logo.ruta} ${logo.ancho}w, ${logoGrande.ruta} ${logoGrande.ancho}w`}
      sizes={sizes}
      width={logoGrande.ancho}
      height={logoGrande.alto}
      fetchPriority="high"
      decoding="async"
      alt=""
      className="h-auto w-full"
    />
  );
}
