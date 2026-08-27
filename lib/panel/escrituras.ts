import "server-only";

import { crearClienteAdmin } from "@/lib/supabase/admin";

import { columnaPadre, tablaDeImagenes } from "./consultas";
import type { Entidad } from "./tipos";

/**
 * Piezas compartidas por las escrituras de productos y de proyectos.
 *
 * Van acá y no en `acciones/` por la misma razón que `almacenamiento.ts`: en un
 * archivo con `"use server"` toda función exportada queda publicada como un
 * endpoint alcanzable desde afuera, y ninguna de estas verifica identidad.
 * Quien las llama ya lo hizo.
 */

type TablaPadre = "productos" | "proyectos";

/**
 * Un slug libre a partir de uno propuesto, agregando un sufijo numérico si
 * hace falta.
 *
 * `exceptoId` es para editar: al guardar un producto sin tocarle el slug, su
 * propio slug figura como usado, y sin esta excepción cada guardado le
 * agregaría un número más.
 *
 * Esto **no** vuelve innecesario el índice único de la base. Entre la consulta
 * y el `insert` hay una ventana; con una sola administradora no se va a dar,
 * pero si se diera, la que rechaza es la base y el mensaje ya está traducido.
 */
export async function slugLibre(
  tabla: TablaPadre,
  base: string,
  exceptoId?: string,
): Promise<string> {
  const propuesto = base || "sin-nombre";
  const supabase = crearClienteAdmin();

  const { data } = await supabase
    .from(tabla)
    .select("id, slug")
    .like("slug", `${propuesto}%`);

  const usados = new Set(
    (data ?? []).filter((f) => f.id !== exceptoId).map((f) => f.slug),
  );

  if (!usados.has(propuesto)) return propuesto;

  for (let n = 2; n < 200; n += 1) {
    const candidato = `${propuesto}-${n}`;
    if (!usados.has(candidato)) return candidato;
  }

  // Doscientos productos con el mismo nombre no va a pasar, pero devolver algo
  // roto es peor que devolver algo feo.
  return `${propuesto}-${Date.now()}`;
}

/** El siguiente `orden`, para que lo nuevo entre al final y no al principio. */
export async function siguienteOrden(tabla: TablaPadre): Promise<number> {
  const supabase = crearClienteAdmin();
  const { data } = await supabase
    .from(tabla)
    .select("orden")
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.orden ?? 0) + 1;
}

/**
 * Las carpetas de todas las fotos de una entidad, **leídas antes de borrarla**.
 *
 * El orden importa y es el error fácil: la clave foránea borra las filas en
 * cascada, pero los archivos de Storage no los borra nadie. Si se borra
 * primero el producto, las rutas dejan de existir y no queda forma de saber
 * qué archivos quedaron colgados — docs/modelo-de-datos.md.
 */
export async function rutasDeImagenes(
  entidad: Entidad,
  padreId: string,
): Promise<string[]> {
  const supabase = crearClienteAdmin();
  const { data } = await supabase
    .from(tablaDeImagenes(entidad))
    .select("ruta")
    .eq(columnaPadre(entidad), padreId);
  return (data ?? []).map((f) => f.ruta);
}

/** Texto de un formulario: recortado, y `null` si quedó vacío. */
export function texto(valor: FormDataEntryValue | null, largo = 2000) {
  const limpio = String(valor ?? "")
    .trim()
    .slice(0, largo);
  return limpio.length > 0 ? limpio : null;
}
