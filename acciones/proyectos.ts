"use server";

import { redirect } from "next/navigation";

import { verificarAdmin } from "@/lib/auth";
import { borrarCarpetas } from "@/lib/panel/almacenamiento";
import {
  rutasDeImagenes,
  siguienteOrden,
  slugLibre,
  texto,
} from "@/lib/panel/escrituras";
import { revalidarProyectos } from "@/lib/revalidacion";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { aSlug } from "@/lib/texto";

import {
  error,
  listo,
  traducirFalloDePostgres,
  type Resultado,
} from "./resultado";

/**
 * Proyectos: alta, baja, modificación, y los dos interruptores.
 *
 * Misma forma que `productos.ts` salvo por dos diferencias del modelo: acá el
 * nombre se llama `titulo`, hay `ubicacion`, y **no hay variantes**. Un
 * proyecto tiene cuatro campos y no más, a propósito: cada campo agregado es
 * un campo que hay que completar en cada carga, y cuanto menos trabajo
 * administrativo, más probable es que el contenido se mantenga al día
 * (decisión 11).
 *
 * **Todas arrancan con `verificarAdmin()`. Sin excepciones** —
 * docs/seguridad.md.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── Crear ──────────────────────────────────────────────────────────────────

/**
 * Crea el proyecto y lleva derecho a su pantalla de edición.
 *
 * Solo el título, por lo mismo que en productos: las fotos necesitan que el
 * proyecto ya exista para tener una carpeta donde ir. Nace inactivo.
 */
export async function crearProyecto(
  _estadoPrevio: Resultado | null,
  datos: FormData,
): Promise<Resultado> {
  await verificarAdmin();

  const titulo = texto(datos.get("titulo"), 140);
  if (!titulo) return error("Poné un título para el proyecto.", "titulo");

  const supabase = crearClienteAdmin();

  const { data, error: fallo } = await supabase
    .from("proyectos")
    .insert({
      titulo,
      slug: await slugLibre("proyectos", aSlug(titulo)),
      orden: await siguienteOrden("proyectos"),
    })
    .select("id")
    .single();

  if (fallo) {
    const traducido = traducirFalloDePostgres(fallo);
    if (traducido) return error(traducido, "titulo");
    throw new Error(`No se pudo crear el proyecto: ${fallo.message}`);
  }

  revalidarProyectos();
  redirect(`/admin/proyectos/${data.id}`);
}

// ── Guardar ────────────────────────────────────────────────────────────────

export async function guardarProyecto(
  id: string,
  _estadoPrevio: Resultado | null,
  datos: FormData,
): Promise<Resultado> {
  await verificarAdmin();

  if (!UUID.test(id)) return error("Identificador inválido.");

  const titulo = texto(datos.get("titulo"), 140);
  if (!titulo) return error("Poné un título para el proyecto.", "titulo");

  const supabase = crearClienteAdmin();

  const { data: antes } = await supabase
    .from("proyectos")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  if (!antes) return error("Este proyecto ya no existe.");

  const pedido = texto(datos.get("slug"), 80);
  const slug = await slugLibre("proyectos", aSlug(pedido ?? titulo), id);

  const { error: fallo } = await supabase
    .from("proyectos")
    .update({
      titulo,
      slug,
      // Texto libre, no una tabla de localidades. Se muestra como chip al pie
      // del título — docs/producto.md.
      ubicacion: texto(datos.get("ubicacion"), 120),
      descripcion: texto(datos.get("descripcion")),
    })
    .eq("id", id);

  if (fallo) {
    const traducido = traducirFalloDePostgres(fallo);
    if (traducido) return error(traducido, "slug");
    throw new Error(`No se pudo guardar el proyecto: ${fallo.message}`);
  }

  revalidarProyectos(slug, antes.slug);

  // Igual que en productos: se vuelve al listado, que es la confirmación que
  // no hay que buscar en la pantalla.
  redirect(`/admin/proyectos?guardado=${encodeURIComponent(titulo)}`);
}

// ── Interruptores ──────────────────────────────────────────────────────────

export async function cambiarEstadoProyecto(
  id: string,
  campo: "activo" | "destacado",
  valor: boolean,
): Promise<Resultado> {
  await verificarAdmin();

  if (!UUID.test(id)) return error("Identificador inválido.");
  if (campo !== "activo" && campo !== "destacado") {
    return error("Campo inválido.");
  }

  const supabase = crearClienteAdmin();
  const { data, error: fallo } = await supabase
    .from("proyectos")
    .update({ [campo]: valor })
    .eq("id", id)
    .select("slug")
    .maybeSingle();

  if (fallo) throw new Error(`No se pudo cambiar el estado: ${fallo.message}`);
  if (!data) return error("Este proyecto ya no existe.");

  revalidarProyectos(data.slug);
  return listo;
}

// ── Orden ──────────────────────────────────────────────────────────────────

export async function reordenarProyectos(ids: string[]): Promise<Resultado> {
  await verificarAdmin();

  if (
    !Array.isArray(ids) ||
    ids.length === 0 ||
    ids.some((i) => !UUID.test(i))
  ) {
    return error("No se pudo guardar el orden. Recargá la página.");
  }

  const supabase = crearClienteAdmin();
  const { error: fallo } = await supabase.rpc("reordenar", {
    p_tabla: "proyectos",
    p_padre_id: null,
    p_ids: ids,
  });

  if (fallo) throw new Error(`No se pudo reordenar: ${fallo.message}`);

  revalidarProyectos();
  return listo;
}

// ── Eliminar ───────────────────────────────────────────────────────────────

/**
 * Elimina el proyecto y **sus archivos**. Las rutas se leen antes de borrar la
 * fila: después no queda desde dónde encontrarlas y los archivos quedarían
 * ocupando el bucket sin que nada los referencie.
 */
export async function eliminarProyecto(id: string): Promise<Resultado> {
  await verificarAdmin();

  if (!UUID.test(id)) return error("Identificador inválido.");

  const supabase = crearClienteAdmin();

  const { data: proyecto } = await supabase
    .from("proyectos")
    .select("slug, titulo")
    .eq("id", id)
    .maybeSingle();

  if (!proyecto) return error("Este proyecto ya no existe.");
  const titulo = proyecto.titulo;

  const rutas = await rutasDeImagenes("proyecto", id);

  const { error: fallo } = await supabase
    .from("proyectos")
    .delete()
    .eq("id", id);
  if (fallo)
    throw new Error(`No se pudo eliminar el proyecto: ${fallo.message}`);

  const noBorrados = await borrarCarpetas(rutas);

  revalidarProyectos(proyecto.slug);

  if (noBorrados.length > 0) {
    return error(
      `El proyecto se eliminó, pero quedaron ${noBorrados.length} carpetas de fotos sin borrar. ` +
        "Avisale a quien mantiene la página.",
    );
  }

  redirect(`/admin/proyectos?eliminado=${encodeURIComponent(titulo)}`);
}
