import {
  logo,
  logoCirculo,
  logoCirculoGrande,
  logoGrande,
} from "@/contenido/marca";

/*
 * Los dos logos de la empresa, los dos del boceto — Fase 4.7.
 *
 * `<img>` y no `next/image`, por lo mismo que las fotos: el optimizador rehace
 * en cada visita un trabajo ya hecho y en Cloudflare consume la cuota de
 * Transformations (decisión 25). Acá además son archivos ya del tamaño que se
 * muestran.
 *
 * `width` y `height` salen del manifiesto generado y no de una cuenta: con
 * ellos el navegador reserva el lugar del logo antes de descargarlo y nada
 * salta. La cuenta de las medidas está del otro lado, en
 * `scripts/preparar-marca.mjs`.
 */

/**
 * El logo grande, para el bloque azul verdoso de la apertura de Inicio: es la
 * imagen central del boceto de la empresa. El dibujo —dos círculos de línea,
 * «espacio» en minúscula y «CORTINAS» en versalita espaciada— es todo de un
 * gris carbón, `#35363A`, apoyado sobre el color de la marca, donde da 4,58:1.
 *
 * Hasta la Fase 4.7 el logo tenía un círculo amarillo relleno detrás de la
 * «e», y había que resolver cómo apoyar ese amarillo sobre un papel crema con
 * el que casi no contrastaba (decisión 44). **Ese problema se fue con el
 * dibujo**: el de ahora no tiene color propio. El azul verdoso es el del
 * bloque sobre el que el boceto lo apoya, no una tinta del logo.
 *
 * **Ocupa todo el ancho de su bloque**, y el bloque decide cuánto es: el
 * tope de 26 rem lo pone quien lo usa. Por eso lleva las dos medidas en el
 * `srcset` —600 y 1.200 px— y un `sizes` que dice lo mismo que el bloque: en un
 * teléfono se muestra a menos de 300 px y baja el de 600; en escritorio, a 416,
 * y una pantalla de doble densidad pide el de 1.200.
 *
 * **En Inicio es el único logo de la página**: ahí el encabezado lleva el
 * enlace «Inicio» escrito, y el logo circular va solo en las demás páginas
 * (`components/navegacion.tsx`).
 *
 * Es lo primero que se ve en Inicio, así que no se difiere.
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
      alt="Espacio Cortinas"
      className="h-auto w-full"
    />
  );
}

/**
 * El logo circular, el que la empresa usa en el Nosotros de su boceto: un
 * círculo gris carbón con el logo calado adentro y un aro fino alrededor. Lo
 * calado es transparente, así que las letras toman el color de lo que haya
 * detrás: sobre el fondo del sitio quedan gris claro sobre el carbón.
 *
 * **Va en el encabezado de todas las páginas menos Inicio, en el lugar del
 * enlace «Inicio»**, y es ese enlace: por eso su texto alternativo dice las dos
 * cosas, de quién es el sitio y adónde lleva.
 *
 * El tamaño lo pone quien lo usa, con `className`; `sizes` dice ese mismo
 * ancho, y con él el navegador elige entre los dos archivos, de 96 y 144 px.
 * Está en el encabezado, que es lo primero que se pinta: no se difiere.
 */
export function LogoCirculo({
  sizes,
  className = "",
}: {
  sizes: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoCirculo.ruta}
      srcSet={`${logoCirculo.ruta} ${logoCirculo.ancho}w, ${logoCirculoGrande.ruta} ${logoCirculoGrande.ancho}w`}
      sizes={sizes}
      width={logoCirculo.ancho}
      height={logoCirculo.alto}
      fetchPriority="high"
      decoding="async"
      alt="Espacio Cortinas, inicio"
      className={`block ${className}`.trim()}
    />
  );
}
