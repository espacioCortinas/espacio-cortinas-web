import type { Proyecto } from "./tipos";

/**
 * El portfolio.
 *
 * Cuatro campos y no más — decisión 11. Sin categoría, sin fecha, sin cliente,
 * sin superficie: cada campo agregado es un campo que hay que completar en cada
 * carga, y de eso depende que el portfolio se mantenga al día.
 *
 * El orden de este arreglo es el del portfolio, y **el primero abre el
 * listado**: es el único que se muestra en fila, con la portada al costado, y
 * el resto va en grilla debajo — decisión 52. Para cambiar cuál abre, se mueve
 * el bloque.
 *
 * El `slug` es el nombre de la carpeta en `fotos-originales/proyectos/`, y no
 * se cambia una vez publicado (decisión 10).
 *
 * # LAS DESCRIPCIONES MARCADAS «PROVISORIO» SE REEMPLAZAN
 *
 * **Las redacta la empresa, no el desarrollo**, igual que las de producto y
 * los textos de `contenido/inicio.ts`. Lo provisorio dice lo que las fotos
 * muestran y nada más. **No se escribe nada que no conste**: metros, cantidad
 * de ventanas, nombre del cliente, plazos, marca de la tela. Ninguno de esos
 * datos está documentado en el proyecto, y un número inventado en un
 * portfolio es exactamente lo que un arquitecto va a querer verificar.
 */
export const proyectos: Proyecto[] = [
  {
    slug: "cowork-nordelta",
    titulo: "Cowork en Nordelta",
    ubicacion: "Nordelta, Buenos Aires",
    /**
     * PROVISORIO — lo reemplaza el texto de la empresa. Pedido en la Fase 4.3
     * y todavía sin respuesta.
     *
     * Dice solo lo que se ve en las fotos y los dos videos: un piso de oficinas
     * con fachada vidriada curva, rollers en todas las ventanas, puestos de
     * trabajo abiertos.
     */
    descripcion:
      "Rollers en la fachada vidriada de un piso de oficinas, que sigue " +
      "la curva del edificio. Las fotos y los dos recorridos en video son " +
      "de la instalación ya colocada.",
    activo: true,
    destacado: true,
  },
];
