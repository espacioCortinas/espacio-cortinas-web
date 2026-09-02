import type { Foto } from "@/contenido/tipos";
import { medidaPredeterminada, rutaDeFoto, srcSetDe } from "@/lib/fotos";

/**
 * Una foto del sitio.
 *
 * ESTO NO ESTÁ DISEÑADO, Y ES A PROPÓSITO. No pone proporción, ni recorte, ni
 * `object-fit`, ni borde: eso se decide en la Fase 4.1 con las fotos reales
 * delante (docs/plan.md, docs/diseno.md). Lo que sí resuelve, y es lo que esta
 * fase tiene que dejar bien, son las tres cosas que después no se miran más:
 *
 * **1. El `srcset` se arma leyendo `medidas` de esta foto.** Nunca desde
 * `MEDIDAS_IMAGEN`, que dice qué anchos intenta generar el script y no cuáles
 * existen de una foto concreta. Una foto de 1206 px de ancho tiene tres
 * medidas —480, 960 y 1206— porque no se agranda ninguna: con la constante, el
 * navegador pediría `1600.webp` y `2560.webp` de una carpeta donde no están.
 * Falla en silencio, y por eso `medidas` es un arreglo por foto (decisión 32).
 *
 * **2. `width` y `height` no son decorativos.** Con ese par el navegador
 * reserva el espacio antes de descargar nada, y la página no salta mientras
 * carga. Salen del manifiesto, que a su vez sale del archivo que el script
 * escribió y no de una cuenta.
 *
 * **3. Es un `<img>` y no `next/image`.** Los tamaños ya están generados en el
 * build. Dejar el optimizador activo en Cloudflare gastaría cuota de
 * Transformations rehaciendo un trabajo hecho, y pasado el tope el sitio deja
 * de mostrar fotos — que es lo único que este sitio hace (decisión 25).
 */
export function FotoImg({
  foto,
  alt,
  sizes,
  prioridad = false,
  className,
}: {
  foto: Foto;
  /**
   * Se arma con `altAutomatico()` a partir del nombre y la posición. No hay
   * campo `alt` por foto: pedirlo en cada carga hace que se escriba cualquier
   * cosa, que para un lector de pantalla es peor que un texto generado
   * razonable (docs/modelo-de-datos.md).
   */
  alt: string;
  /**
   * Qué ancho va a ocupar la foto en pantalla. Sin esto el navegador supone
   * `100vw` y descarga de más en escritorio.
   *
   * Hoy los valores son los de la maquetación mínima de esta fase. Cambian en
   * la 4.1 junto con la composición: `sizes` y el ancho real de la caja son el
   * mismo dato escrito dos veces, y si se separan el navegador elige mal.
   */
  sizes: string;
  /**
   * La primera imagen visible de la página. Se descarga con prioridad y sin
   * diferir; todas las demás van diferidas (docs/diseno.md).
   */
  prioridad?: boolean;
  className?: string;
}) {
  /*
   * La regla `no-img-element` pide `next/image`, y acá está descartado a
   * propósito: su optimizador rehace en cada visita un trabajo que el build ya
   * hizo, y en Cloudflare eso consume la cuota de Transformations hasta que las
   * fotos dejan de cargar (decisión 25). El aviso de la regla —«peor LCP, más
   * ancho de banda»— no aplica: el `srcset` de abajo hace lo mismo que haría el
   * optimizador, con los archivos ya generados.
   */
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={rutaDeFoto(foto, medidaPredeterminada(foto))}
      srcSet={srcSetDe(foto)}
      sizes={sizes}
      width={foto.ancho}
      height={foto.alto}
      alt={alt}
      loading={prioridad ? "eager" : "lazy"}
      fetchPriority={prioridad ? "high" : undefined}
      decoding="async"
      className={className}
    />
  );
}
