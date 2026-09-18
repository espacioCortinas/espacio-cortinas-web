import type { Foto } from "@/contenido/tipos";
import { medidaPredeterminada, rutaDeFoto, srcSetDe } from "@/lib/fotos";

/**
 * Una foto del sitio.
 *
 * Tres cosas que esta fase resolvió y después no se miran más:
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
 *
 * Y una que agregó la Fase 4.2: **el recorte**. Ver `enfoque`.
 */

/**
 * Las proporciones que usa el sitio.
 *
 * `4/5` es la de las portadas y la de los listados, sin excepción: es lo que
 * hace que las grillas queden parejas aunque la galería mezcle orientaciones
 * (decisión 14). `propia` es la de la galería, que respeta la proporción de
 * cada foto porque el archivo es mitad vertical y mitad horizontal, y una
 * galería que suponga una sola orientación se rompe la mitad de las veces.
 */
type Proporcion = "4/5" | "3/4" | "1/1" | "16/9" | "propia";

/**
 * **Dónde se recorta, cuando hay que recortar.**
 *
 * El predeterminado es `alto` y no `centro`, y no es una preferencia: en casi
 * todas las fotos del archivo **la ventana está en la mitad de arriba y el piso
 * en la de abajo, y el piso es la zona más oscura y más desordenada del cuadro**
 * (`docs/diseno.md`). Además hay cuatro fotos con mueble embalado o material de
 * obra a la vista —son casas entregadas y sin habitar, que es el momento en que
 * la empresa instala, así que va a volver a pasar—. El recorte alto es lo que
 * las salva.
 *
 * Un `object-position` centrado, que es lo que traen todos los componentes de
 * imagen por defecto, deja justamente esa franja adentro.
 */
type Enfoque = "alto" | "centro" | "bajo";

const POSICION: Record<Enfoque, string> = {
  // No es 0%: recortar contra el borde de arriba corta cielorrasos y barrales,
  // que es donde se ve cómo está colgada la cortina. 15% deja el riel adentro y
  // el piso afuera.
  alto: "50% 15%",
  centro: "50% 50%",
  bajo: "50% 85%",
};

export function FotoImg({
  foto,
  alt,
  sizes,
  proporcion = "propia",
  enfoque = "alto",
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
   * **`sizes` y el ancho real de la caja son el mismo dato escrito dos veces.**
   * Si se separan, el navegador elige mal el archivo: de más en teléfono o de
   * menos en escritorio. Cambian juntos, siempre.
   */
  sizes: string;
  /** Predeterminado `propia`: la proporción de la foto, sin recortar nada. */
  proporcion?: Proporcion;
  /** Predeterminado `alto`. Solo tiene efecto si hay recorte. */
  enfoque?: Enfoque;
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
  const imagen = (
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
      className={
        proporcion === "propia"
          ? className
          : `h-full w-full object-cover ${className ?? ""}`.trim()
      }
      style={
        proporcion === "propia"
          ? undefined
          : { objectPosition: POSICION[enfoque] }
      }
    />
  );

  if (proporcion === "propia") return imagen;

  /*
   * La caja de proporción fija. Va sin borde, sin sombra y sin radio: lo que
   * separa una foto del papel es el aire, no un marco (`docs/diseno.md`).
   *
   * El fondo de superficie es lo que se ve mientras la foto carga y en la
   * franja que el navegador todavía no pintó. Es un paso del papel, no un gris:
   * un recuadro gris sobre papel cálido se ve como un agujero.
   */
  return (
    <div
      className="bg-superficie overflow-hidden"
      style={{ aspectRatio: proporcion }}
    >
      {imagen}
    </div>
  );
}
