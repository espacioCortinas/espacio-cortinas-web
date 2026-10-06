/**
 * Los enlaces del sitio, en un solo lugar.
 *
 * Los usan el menú del encabezado —que además marca en cuál estás y, fuera de
 * Inicio, dibuja «Inicio» como el logo circular: por eso es componente de
 * cliente— y el pie, que es de servidor. Con la lista acá no hay dos versiones
 * del menú que se puedan desincronizar, y agregar una sección es una línea.
 *
 * **El orden es el del boceto de la empresa** — Fase 4.7: Inicio, Productos,
 * Nuestros trabajos, Nosotros y Contacto.
 *
 * **«Trabajos» y no «Nuestros trabajos»**, que es el nombre de la página: con
 * el nombre entero, los cinco enlaces no entran en una fila en un teléfono, y
 * la empresa prefirió el enlace corto antes que dos renglones de menú
 * (`components/navegacion.tsx`, con las medidas). La dirección sigue siendo
 * `/proyectos`, que es la de los enlaces que ya circulan (decisión 10).
 */
export const ENLACES = [
  { href: "/", texto: "Inicio" },
  { href: "/productos", texto: "Productos" },
  { href: "/proyectos", texto: "Trabajos" },
  { href: "/nosotros", texto: "Nosotros" },
  { href: "/contacto", texto: "Contacto" },
] as const;
