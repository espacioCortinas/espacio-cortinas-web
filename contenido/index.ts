import { fotos } from "./fotos";
import { productos } from "./productos";
import { proyectos } from "./proyectos";
import type { ConFotos, Producto, Proyecto } from "./tipos";

/**
 * El contenido del sitio, con las fotos ya unidas.
 *
 * **Las páginas leen de acá y no de los archivos sueltos.** Lo escrito a mano
 * —`productos.ts`, `proyectos.ts`— y lo generado —`fotos.ts`— viven separados
 * para que regenerar las fotos no pise los textos, y se juntan en este punto.
 *
 * La unión es por slug: las fotos de `productos.ts` con el slug
 * `roller-blackout` están bajo la clave `productos/roller-blackout`.
 */

function unir<T extends { slug: string }>(
  entidad: "productos" | "proyectos",
  items: T[],
): ConFotos<T>[] {
  return items.map((item) => ({
    ...item,
    fotos: fotos[`${entidad}/${item.slug}`] ?? [],
  }));
}

/** Todo, incluido lo que no está publicado. */
export const todosLosProductos = (): ConFotos<Producto>[] =>
  unir("productos", productos);

export const todosLosProyectos = (): ConFotos<Proyecto>[] =>
  unir("proyectos", proyectos);

/**
 * Lo que se muestra en el sitio.
 *
 * `activo` manda: algo destacado pero sin publicar no aparece en ningún lado
 * — decisión 8.
 */
export const productosPublicados = (): ConFotos<Producto>[] =>
  todosLosProductos().filter((p) => p.activo);

export const proyectosPublicados = (): ConFotos<Proyecto>[] =>
  todosLosProyectos().filter((p) => p.activo);

/**
 * Los que pueden salir en Inicio, ya recortados al tope.
 *
 * El tope se aplica **al leer** y no al marcar: se pueden dejar más destacados
 * de los que entran, y solo aparecen los primeros. Así se cambia qué sale en la
 * portada moviendo un bloque de lugar, sin desmarcar nada —
 * docs/modelo-de-datos.md.
 */
export const productosDestacados = (tope: number): ConFotos<Producto>[] =>
  productosPublicados()
    .filter((p) => p.destacado)
    .slice(0, tope);

export const proyectosDestacados = (tope: number): ConFotos<Proyecto>[] =>
  proyectosPublicados()
    .filter((p) => p.destacado)
    .slice(0, tope);

/** Para `/productos/[slug]` y `/proyectos/[slug]`. */
export const productoPorSlug = (slug: string) =>
  productosPublicados().find((p) => p.slug === slug) ?? null;

export const proyectoPorSlug = (slug: string) =>
  proyectosPublicados().find((p) => p.slug === slug) ?? null;
