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
import { revalidarProductos } from "@/lib/revalidacion";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { aSlug } from "@/lib/texto";

import {
  error,
  listo,
  traducirFalloDePostgres,
  type Resultado,
} from "./resultado";

/**
 * Productos: alta, baja, modificación, y los dos interruptores.
 *
 * **Todas arrancan con `verificarAdmin()`. Sin excepciones** —
 * docs/seguridad.md. Una Server Action es un endpoint POST alcanzable desde
 * afuera y el middleware no autoriza nada.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── Crear ──────────────────────────────────────────────────────────────────

/**
 * Crea el producto y lleva derecho a su pantalla de edición.
 *
 * Se pide **solo el nombre**. Lo demás —descripción, variantes, fotos— se
 * carga en la pantalla siguiente, que es donde están las fotos, y las fotos
 * necesitan que el producto ya exista para tener una carpeta donde ir. Un
 * formulario de alta que pidiera todo junto dejaría a la administradora
 * eligiendo fotos antes de que hubiera dónde guardarlas.
 *
 * Nace **inactivo** (es el valor por defecto de la tabla): así se puede cargar
 * con calma y publicar cuando esté listo, en vez de que aparezca a medias en
 * el sitio mientras se completa.
 */
export async function crearProducto(
  _estadoPrevio: Resultado | null,
  datos: FormData,
): Promise<Resultado> {
  await verificarAdmin();

  const nombre = texto(datos.get("nombre"), 120);
  if (!nombre) return error("Poné un nombre para el producto.", "nombre");

  const supabase = crearClienteAdmin();

  const { data, error: fallo } = await supabase
    .from("productos")
    .insert({
      nombre,
      slug: await slugLibre("productos", aSlug(nombre)),
      orden: await siguienteOrden("productos"),
    })
    .select("id")
    .single();

  if (fallo) {
    const traducido = traducirFalloDePostgres(fallo);
    if (traducido) return error(traducido, "nombre");
    throw new Error(`No se pudo crear el producto: ${fallo.message}`);
  }

  revalidarProductos();
  redirect(`/admin/productos/${data.id}`);
}

// ── Guardar ────────────────────────────────────────────────────────────────

/**
 * Guarda los textos y la lista de variantes.
 *
 * **El slug se edita a mano y no se regenera solo** — decisión 10. Corregir
 * una falta de ortografía en el nombre no puede romper los enlaces que ya se
 * compartieron por WhatsApp, que es por donde se comparte este sitio. El campo
 * está en el formulario con esa advertencia escrita.
 */
export async function guardarProducto(
  id: string,
  _estadoPrevio: Resultado | null,
  datos: FormData,
): Promise<Resultado> {
  await verificarAdmin();

  if (!UUID.test(id)) return error("Identificador inválido.");

  const nombre = texto(datos.get("nombre"), 120);
  if (!nombre) return error("Poné un nombre para el producto.", "nombre");

  const supabase = crearClienteAdmin();

  const { data: antes } = await supabase
    .from("productos")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  if (!antes) return error("Este producto ya no existe.");

  // Si dejó el campo vacío se recalcula del nombre; si escribió algo, se
  // respeta lo que escribió (normalizado) y se desambigua si ya estaba usado.
  const pedido = texto(datos.get("slug"), 80);
  const slug = await slugLibre("productos", aSlug(pedido ?? nombre), id);

  const { error: fallo } = await supabase
    .from("productos")
    .update({
      nombre,
      slug,
      descripcion: texto(datos.get("descripcion")),
    })
    .eq("id", id);

  if (fallo) {
    const traducido = traducirFalloDePostgres(fallo);
    if (traducido) return error(traducido, "slug");
    throw new Error(`No se pudo guardar el producto: ${fallo.message}`);
  }

  const problema = await guardarVariantes(id, datos.getAll("variante"));
  if (problema) return problema;

  revalidarProductos(slug, antes.slug);

  // Vuelve al listado en vez de quedarse en el formulario. Quedarse obliga a
  // mirar si apareció el cartelito de «Guardado» para saber si se guardó, y
  // desde un teléfono ese cartel queda fuera de la pantalla la mitad de las
  // veces. Cambiar de pantalla es una confirmación que no hay que buscar.
  redirect(`/admin/productos?guardado=${encodeURIComponent(nombre)}`);
}

/**
 * Reemplaza la lista de variantes por la que llega del formulario.
 *
 * **Primero inserta las nuevas y después borra las viejas**, y no al revés. Es
 * la única parte donde el orden cambia el peor caso: si el insert falla, con
 * este orden no se perdió nada y se puede volver a guardar; con el otro, la
 * lista de variantes quedaría vacía y habría que reescribirla de memoria.
 *
 * Se reemplaza entera en vez de calcular altas y bajas porque una variante es
 * solo un nombre: no tiene slug, ni foto, ni nada que la referencie, así que
 * conservar su identificador no le sirve a nadie.
 */
async function guardarVariantes(
  productoId: string,
  crudas: FormDataEntryValue[],
): Promise<Resultado | null> {
  const supabase = crearClienteAdmin();

  const nombres = crudas
    .map((v) => String(v).trim().slice(0, 80))
    .filter((v) => v.length > 0)
    .slice(0, 30);

  const { data: viejas } = await supabase
    .from("producto_variantes")
    .select("id")
    .eq("producto_id", productoId);

  if (nombres.length > 0) {
    const { error: fallo } = await supabase.from("producto_variantes").insert(
      nombres.map((nombre, i) => ({
        producto_id: productoId,
        nombre,
        orden: i + 1,
      })),
    );
    if (fallo) {
      return error(`No se pudieron guardar las variantes: ${fallo.message}`);
    }
  }

  const idsViejos = (viejas ?? []).map((v) => v.id);
  if (idsViejos.length > 0) {
    await supabase.from("producto_variantes").delete().in("id", idsViejos);
  }

  return null;
}

// ── Interruptores ──────────────────────────────────────────────────────────

/**
 * Activar/desactivar y destacar/quitar destacado.
 *
 * Son dos campos independientes y `activo` manda: un producto destacado pero
 * inactivo no se muestra en ningún lado — decisión 8. El panel lo dice al
 * lado del interruptor, porque es la combinación que más confunde.
 */
export async function cambiarEstadoProducto(
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
    .from("productos")
    .update({ [campo]: valor })
    .eq("id", id)
    .select("slug")
    .maybeSingle();

  if (fallo) throw new Error(`No se pudo cambiar el estado: ${fallo.message}`);
  if (!data) return error("Este producto ya no existe.");

  revalidarProductos(data.slug);
  return listo;
}

// ── Orden ──────────────────────────────────────────────────────────────────

/**
 * El orden del catálogo, y también cuáles entran en el Inicio.
 *
 * El tope de destacados del Inicio se aplica **al consultar**, ordenando por
 * `orden`: se pueden marcar más destacados de los que entran y solo aparecen
 * los primeros. Por eso mover un producto para arriba es lo que decide qué se
 * ve en la portada, sin tener que desmarcar nada — docs/modelo-de-datos.md.
 */
export async function reordenarProductos(ids: string[]): Promise<Resultado> {
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
    p_tabla: "productos",
    p_padre_id: null,
    p_ids: ids,
  });

  if (fallo) throw new Error(`No se pudo reordenar: ${fallo.message}`);

  revalidarProductos();
  return listo;
}

// ── Eliminar ───────────────────────────────────────────────────────────────

/**
 * Elimina el producto y **sus archivos**.
 *
 * La cascada de la base borra las variantes y las filas de imágenes. Lo que no
 * borra nadie son los archivos de Storage: eso es responsabilidad de esta
 * acción, y por eso las rutas se leen ANTES de borrar la fila. Después ya no
 * hay desde dónde encontrarlas, y quedarían ocupando el bucket sin que nada
 * las referencie — docs/modelo-de-datos.md.
 *
 * Si algún archivo no se pudo borrar, se avisa en vez de decir que salió todo
 * bien: un huérfano silencioso no molesta hasta que se agota el gigabyte del
 * plan gratuito, y para entonces no hay forma de saber cuáles sobran.
 */
export async function eliminarProducto(id: string): Promise<Resultado> {
  await verificarAdmin();

  if (!UUID.test(id)) return error("Identificador inválido.");

  const supabase = crearClienteAdmin();

  const { data: producto } = await supabase
    .from("productos")
    .select("slug, nombre")
    .eq("id", id)
    .maybeSingle();

  if (!producto) return error("Este producto ya no existe.");
  const nombre = producto.nombre;

  const rutas = await rutasDeImagenes("producto", id);

  const { error: fallo } = await supabase
    .from("productos")
    .delete()
    .eq("id", id);
  if (fallo)
    throw new Error(`No se pudo eliminar el producto: ${fallo.message}`);

  const noBorrados = await borrarCarpetas(rutas);

  revalidarProductos(producto.slug);

  if (noBorrados.length > 0) {
    return error(
      `El producto se eliminó, pero quedaron ${noBorrados.length} carpetas de fotos sin borrar. ` +
        "Avisale a quien mantiene la página.",
    );
  }

  redirect(`/admin/productos?eliminado=${encodeURIComponent(nombre)}`);
}
