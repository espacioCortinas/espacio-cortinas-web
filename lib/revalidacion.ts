import "server-only";

import { revalidatePath } from "next/cache";

/**
 * Qué rutas públicas se rehacen cuando algo cambia en el panel.
 *
 * Es la mitad de la promesa «guardo y lo veo enseguida». La otra mitad es el
 * caché compartido de `open-next.config.ts`: sin él, esto invalidaría la copia
 * de una sola instancia del Worker y las demás seguirían sirviendo lo viejo
 * (decisión 29).
 *
 * **Se revalida de más a propósito.** Un producto aparece en su propia página,
 * en el listado y —si está destacado— en el Inicio, y `destacado` puede haber
 * cambiado en este mismo guardado. Calcular el conjunto mínimo daría un caso
 * en el que algo no se actualiza y nadie entiende por qué; rehacer tres
 * páginas de un sitio que cambia unas veces por mes no cuesta nada.
 *
 * Las páginas públicas se construyen en la Fase 4. Revalidar una ruta que
 * todavía no existe no falla ni tiene efecto, así que esto ya queda bien
 * puesto desde ahora.
 */

/**
 * @param slugs el slug actual y, si cambió, también el anterior: la página
 *   vieja tiene que dejar de servirse desde la caché.
 */
export function revalidarProductos(...slugs: (string | null | undefined)[]) {
  revalidatePath("/");
  revalidatePath("/productos");
  for (const slug of new Set(slugs.filter(Boolean))) {
    revalidatePath(`/productos/${slug}`);
  }
}

export function revalidarProyectos(...slugs: (string | null | undefined)[]) {
  revalidatePath("/");
  revalidatePath("/proyectos");
  for (const slug of new Set(slugs.filter(Boolean))) {
    revalidatePath(`/proyectos/${slug}`);
  }
}
