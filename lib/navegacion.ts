/**
 * Los enlaces del sitio, en un solo lugar.
 *
 * Los usan el encabezado —que además marca en cuál estás, y para eso necesita
 * ser componente de cliente— y el pie, que es de servidor. Con la lista acá no
 * hay dos versiones del menú que se puedan desincronizar, y agregar una sección
 * es una línea.
 *
 * El orden es el del recorrido comercial de `docs/producto.md`: Inicio,
 * Proyectos y Contacto son el recorrido; Productos es el catálogo, que se
 * explora aparte pero entra en el mismo menú porque esconderlo lo volvería
 * inencontrable.
 */
export const ENLACES = [
  { href: "/", texto: "Inicio" },
  { href: "/productos", texto: "Productos" },
  { href: "/proyectos", texto: "Proyectos" },
  { href: "/contacto", texto: "Contacto" },
] as const;
