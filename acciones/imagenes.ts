"use server";

import {
  BUCKET,
  EXTENSIONES_VALIDAS,
  type FormatoDeImagen,
  IMAGEN_LADO_MAXIMO,
  TIPOS_SUBIBLES,
} from "@/lib/constantes";
import { verificarAdmin } from "@/lib/auth";
import { borrarCarpetas } from "@/lib/panel/almacenamiento";
import {
  archivoDe,
  carpetaDe,
  columnaPadre,
  prefijoDe,
  tablaDeImagenes,
} from "@/lib/panel/consultas";
import type { Entidad } from "@/lib/panel/tipos";
import { revalidarProductos, revalidarProyectos } from "@/lib/revalidacion";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { altAutomatico } from "@/lib/texto";

import {
  error,
  esMensajeDeNuestrasFunciones,
  listo,
  traducirFalloDePostgres,
  type Resultado,
} from "./resultado";

/**
 * Las acciones de la galería.
 *
 * **Todas arrancan con `verificarAdmin()`. Sin excepciones** — regla de
 * docs/seguridad.md. No es una formalidad: una Server Action es un endpoint
 * POST con una dirección adivinable, y el middleware no autoriza (ni siquiera
 * lee `ADMIN_USER_ID`). Si esta llamada faltara en una sola de estas
 * funciones, cualquiera podría borrar la galería entera.
 *
 * El reparto del trabajo con el navegador está en docs/arquitectura.md y no es
 * negociable: el navegador comprime y sube, el servidor autoriza y registra.
 * Lo que no puede pasar nunca es que el navegador decida DÓNDE se guarda algo.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MB = 1024 * 1024;
const PESO_MAXIMO_POR_ARCHIVO = 8 * MB;

function entidadValida(valor: string): valor is Entidad {
  return valor === "producto" || valor === "proyecto";
}

function revalidar(entidad: Entidad, slug: string | null) {
  if (entidad === "producto") revalidarProductos(slug);
  else revalidarProyectos(slug);
}

/** El slug del padre, para saber qué ruta pública revalidar. */
async function slugDelPadre(entidad: Entidad, padreId: string) {
  const supabase = crearClienteAdmin();
  const { data } = await supabase
    .from(entidad === "producto" ? "productos" : "proyectos")
    .select("slug")
    .eq("id", padreId)
    .maybeSingle();
  return data?.slug ?? null;
}

// ── 1. Firmar la subida ────────────────────────────────────────────────────

export type PedidoDeSubida = {
  entidad: string;
  padreId: string;
  /** Los anchos que el navegador generó. */
  medidas: number[];
  /** Peso en bytes de cada uno, en el mismo orden. */
  pesos: number[];
  /** El tipo MIME: `image/webp` o `image/jpeg`, según qué pudo generar. */
  tipo: string;
  /** La extensión que van a tener los archivos: `webp` o `jpg`. */
  formato: string;
};

export type SubidaFirmada = {
  /** La CARPETA, armada por el servidor. El navegador no la elige. */
  ruta: string;
  archivos: { ancho: number; path: string; token: string }[];
};

/**
 * Emite las URL firmadas para que el navegador suba directo a Storage.
 *
 * **La ruta la arma el servidor y no se recibe del cliente.** Es la diferencia
 * entre firmar «podés escribir en esta carpeta que yo elegí» y firmar «podés
 * escribir donde vos digas»: lo segundo permitiría pisar las fotos de otro
 * producto, o escribir fuera de la estructura y dejar archivos que ninguna
 * fila referencia.
 *
 * La validación de tipo y peso ocurre acá **antes** de firmar, con los datos
 * que declara el navegador. Un cliente modificado puede mentir, y por eso el
 * propio bucket repite las dos comprobaciones — es la capa que no se puede
 * saltear (`0002_bucket_imagenes.sql`).
 */
export async function pedirSubida(
  pedido: PedidoDeSubida,
): Promise<
  { ok: true; subida: SubidaFirmada } | { ok: false; mensaje: string }
> {
  await verificarAdmin();

  const { entidad, padreId, medidas, pesos, tipo, formato } = pedido;

  if (!entidadValida(entidad))
    return { ok: false, mensaje: "Entidad inválida." };
  if (!UUID.test(padreId))
    return { ok: false, mensaje: "Identificador inválido." };

  // El navegador usa el mejor formato que sepa generar de verdad, así que acá
  // se admiten los dos y se comprueba que el tipo y la extensión se
  // correspondan — decisión 35. El bucket vuelve a validar el tipo, que es la
  // capa que no se puede saltear.
  if (
    !TIPOS_SUBIBLES.includes(tipo) ||
    !EXTENSIONES_VALIDAS.includes(formato)
  ) {
    return {
      ok: false,
      mensaje: "Solo se pueden subir fotos ya convertidas por la página.",
    };
  }

  if (
    !Array.isArray(medidas) ||
    medidas.length === 0 ||
    medidas.length > 5 ||
    medidas.length !== pesos.length
  ) {
    return {
      ok: false,
      mensaje: "La foto no se preparó bien. Probá de nuevo.",
    };
  }

  for (const ancho of medidas) {
    if (!Number.isInteger(ancho) || ancho < 1 || ancho > IMAGEN_LADO_MAXIMO) {
      return {
        ok: false,
        mensaje: "La foto tiene un tamaño que no corresponde.",
      };
    }
  }

  for (const peso of pesos) {
    if (
      !Number.isInteger(peso) ||
      peso <= 0 ||
      peso > PESO_MAXIMO_POR_ARCHIVO
    ) {
      return {
        ok: false,
        mensaje: "La foto pesa demasiado después de comprimirla.",
      };
    }
  }

  if (new Set(medidas).size !== medidas.length) {
    return {
      ok: false,
      mensaje: "La foto no se preparó bien. Probá de nuevo.",
    };
  }

  const supabase = crearClienteAdmin();

  // Que el padre exista se comprueba acá y no se da por hecho: firmar una
  // subida contra un producto borrado dejaría archivos que nadie va a limpiar,
  // porque no habría fila desde la cual encontrarlos.
  const { data: padre } = await supabase
    .from(entidad === "producto" ? "productos" : "proyectos")
    .select("id")
    .eq("id", padreId)
    .maybeSingle();

  if (!padre) {
    return {
      ok: false,
      mensaje: "Este elemento ya no existe. Recargá la página.",
    };
  }

  const ruta = carpetaDe(entidad, padreId, crypto.randomUUID());

  const archivos: SubidaFirmada["archivos"] = [];
  for (const ancho of medidas) {
    const path = archivoDe(ruta, ancho, formato as FormatoDeImagen);
    const { data, error: fallo } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(path);

    if (fallo || !data) {
      console.error("[imagenes] no se pudo firmar la subida:", fallo);
      return {
        ok: false,
        mensaje: "No se pudo preparar la subida. Probá de nuevo en un momento.",
      };
    }
    archivos.push({ ancho, path: data.path, token: data.token });
  }

  return { ok: true, subida: { ruta, archivos } };
}

// ── 2. Registrar la fila ───────────────────────────────────────────────────

export type RegistroDeImagen = {
  entidad: string;
  padreId: string;
  ruta: string;
  medidas: number[];
  formato: string;
  ancho: number;
  alto: number;
};

/**
 * Guarda la fila, una vez que los archivos ya están arriba.
 *
 * `ruta` llega del navegador, así que **no se le cree**: se comprueba que sea
 * exactamente la forma que este servidor arma para esta entidad y este padre
 * —`productos/{padreId}/{uuid}/`— y nada más. Sin eso, el segundo paso
 * anularía el cuidado del primero: alcanzaría con llamar directo a esta acción
 * con la ruta de otro producto.
 *
 * Y se comprueba que los archivos existan de verdad antes de insertar. Una
 * fila que apunta a una carpeta vacía se ve como una imagen rota en el sitio
 * público y es molesta de rastrear; que la subida haya fallado a la mitad es
 * bastante más probable que eso, sobre todo desde un teléfono.
 */
export async function registrarImagen(
  registro: RegistroDeImagen,
): Promise<Resultado> {
  await verificarAdmin();

  const { entidad, padreId, ruta, medidas, formato, ancho, alto } = registro;

  if (!entidadValida(entidad)) return error("Entidad inválida.");
  if (!UUID.test(padreId)) return error("Identificador inválido.");
  if (
    !Number.isInteger(ancho) ||
    !Number.isInteger(alto) ||
    ancho < 1 ||
    alto < 1
  ) {
    return error("La foto no se preparó bien. Probá de nuevo.");
  }
  if (!Array.isArray(medidas) || medidas.length === 0 || medidas.length > 5) {
    return error("La foto no se preparó bien. Probá de nuevo.");
  }
  if (!EXTENSIONES_VALIDAS.includes(formato)) {
    return error("La foto no se preparó bien. Probá de nuevo.");
  }

  const prefijo = prefijoDe(entidad, padreId);
  const resto = ruta.startsWith(prefijo) ? ruta.slice(prefijo.length) : null;
  if (!resto || !resto.endsWith("/") || !UUID.test(resto.slice(0, -1))) {
    return error("La foto no se guardó donde corresponde. Probá de nuevo.");
  }

  const supabase = crearClienteAdmin();

  const { data: subidos, error: falloDeListado } = await supabase.storage
    .from(BUCKET)
    .list(ruta.slice(0, -1));

  if (falloDeListado) {
    console.error("[imagenes] no se pudo listar la carpeta:", falloDeListado);
    return error("No se pudo confirmar la subida. Probá de nuevo.");
  }

  const presentes = new Set((subidos ?? []).map((a) => a.name));
  const faltantes = medidas.filter((m) => !presentes.has(`${m}.${formato}`));
  if (faltantes.length > 0) {
    await borrarCarpetas([ruta]);
    return error("La foto se subió a medias. Probá de nuevo, con mejor señal.");
  }

  const tabla = tablaDeImagenes(entidad as Entidad);
  const columna = columnaPadre(entidad as Entidad);

  // Se leen el nombre del padre —para el texto alternativo— y el estado de la
  // galería en una sola pasada.
  const [{ data: padre }, { data: hermanas }] = await Promise.all([
    supabase
      .from(entidad === "producto" ? "productos" : "proyectos")
      .select(entidad === "producto" ? "slug, nombre" : "slug, titulo")
      .eq("id", padreId)
      .maybeSingle(),
    supabase.from(tabla).select("orden, es_portada").eq(columna, padreId),
  ]);

  if (!padre) return error("Este elemento ya no existe. Recargá la página.");

  const nombreDelPadre = String(
    (padre as Record<string, unknown>)[
      entidad === "producto" ? "nombre" : "titulo"
    ] ?? "Foto",
  );
  const existentes = hermanas ?? [];
  const orden =
    existentes.reduce((mayor, f) => Math.max(mayor, f.orden), 0) + 1;

  // La primera foto vertical que entra se marca portada sola. Es lo que evita
  // el estado más molesto del panel: una galería cargada y un listado público
  // sin ninguna imagen, sin nada que lo avise.
  const yaHayPortada = existentes.some((f) => f.es_portada);
  const esPortada = !yaHayPortada && alto > ancho;

  const { error: falloAlInsertar } = await supabase.from(tabla).insert({
    [columna]: padreId,
    ruta,
    medidas,
    formato,
    ancho,
    alto,
    alt: altAutomatico(nombreDelPadre, existentes.length + 1),
    orden,
    es_portada: esPortada,
  });

  if (falloAlInsertar) {
    // Sin la fila, los archivos no los encuentra nadie. Se limpian acá o
    // quedan ocupando el bucket para siempre.
    await borrarCarpetas([ruta]);
    const traducido = traducirFalloDePostgres(falloAlInsertar);
    if (traducido) return error(traducido);
    throw new Error(`No se pudo guardar la foto: ${falloAlInsertar.message}`);
  }

  revalidar(entidad, padre.slug);
  return listo;
}

// ── 3. Eliminar ────────────────────────────────────────────────────────────

export async function eliminarImagen(
  entidad: string,
  imagenId: string,
): Promise<Resultado> {
  await verificarAdmin();

  if (!entidadValida(entidad)) return error("Entidad inválida.");
  if (!UUID.test(imagenId)) return error("Identificador inválido.");

  const supabase = crearClienteAdmin();

  // El padre se lee ANTES de borrar: después de borrar la fila no hay forma de
  // saber qué ruta pública revalidar.
  const { data: fila } = await supabase
    .from(tablaDeImagenes(entidad))
    .select(`${columnaPadre(entidad)}`)
    .eq("id", imagenId)
    .maybeSingle();

  const padreId = fila
    ? String((fila as Record<string, unknown>)[columnaPadre(entidad)])
    : null;

  // La función de la base borra la fila y, si era la portada, promueve otra en
  // la misma transacción. Devuelve la ruta para poder limpiar Storage.
  const { data: ruta, error: fallo } = await supabase.rpc("eliminar_imagen", {
    p_entidad: entidad,
    p_imagen_id: imagenId,
  });

  if (fallo) {
    if (esMensajeDeNuestrasFunciones(fallo.message))
      return error(fallo.message);
    throw new Error(`No se pudo eliminar la foto: ${fallo.message}`);
  }

  const noBorrados = await borrarCarpetas([String(ruta)]);

  const slug = padreId ? await slugDelPadre(entidad, padreId) : null;
  revalidar(entidad, slug);

  if (noBorrados.length > 0) {
    // La fila ya no está, así que la foto desapareció del sitio. Lo que quedó
    // es un archivo que nadie referencia, y conviene que se sepa.
    return error(
      "La foto se quitó del sitio, pero el archivo no se pudo borrar del todo. " +
        "Avisale a quien mantiene la página.",
    );
  }

  return listo;
}

// ── 4. Portada ─────────────────────────────────────────────────────────────

export async function marcarPortada(
  entidad: string,
  imagenId: string,
): Promise<Resultado> {
  await verificarAdmin();

  if (!entidadValida(entidad)) return error("Entidad inválida.");
  if (!UUID.test(imagenId)) return error("Identificador inválido.");

  const supabase = crearClienteAdmin();

  const { error: fallo } = await supabase.rpc("marcar_portada", {
    p_entidad: entidad,
    p_imagen_id: imagenId,
  });

  if (fallo) {
    if (esMensajeDeNuestrasFunciones(fallo.message))
      return error(fallo.message);
    const traducido = traducirFalloDePostgres(fallo);
    if (traducido) return error(traducido);
    throw new Error(`No se pudo cambiar la portada: ${fallo.message}`);
  }

  const { data: fila } = await supabase
    .from(tablaDeImagenes(entidad))
    .select(`${columnaPadre(entidad)}`)
    .eq("id", imagenId)
    .maybeSingle();

  const padreId = fila
    ? String((fila as Record<string, unknown>)[columnaPadre(entidad)])
    : null;

  revalidar(entidad, padreId ? await slugDelPadre(entidad, padreId) : null);
  return listo;
}

// ── 5. Reordenar ───────────────────────────────────────────────────────────

export async function reordenarImagenes(
  entidad: string,
  padreId: string,
  ids: string[],
): Promise<Resultado> {
  await verificarAdmin();

  if (!entidadValida(entidad)) return error("Entidad inválida.");
  if (!UUID.test(padreId)) return error("Identificador inválido.");
  if (
    !Array.isArray(ids) ||
    ids.length === 0 ||
    ids.some((i) => !UUID.test(i))
  ) {
    return error("No se pudo guardar el orden. Recargá la página.");
  }

  const supabase = crearClienteAdmin();
  const { error: fallo } = await supabase.rpc("reordenar", {
    p_tabla: tablaDeImagenes(entidad),
    p_padre_id: padreId,
    p_ids: ids,
  });

  if (fallo) throw new Error(`No se pudo reordenar: ${fallo.message}`);

  revalidar(entidad, await slugDelPadre(entidad, padreId));
  return listo;
}

// ── 6. Texto alternativo ───────────────────────────────────────────────────

/**
 * El texto que lee un lector de pantalla, y lo que se muestra si la foto no
 * carga. Se genera solo al subir y casi nunca hace falta tocarlo; existe la
 * opción para las fotos donde vale la pena describir lo que se ve.
 */
export async function guardarAlt(
  entidad: string,
  imagenId: string,
  alt: string,
): Promise<Resultado> {
  await verificarAdmin();

  if (!entidadValida(entidad)) return error("Entidad inválida.");
  if (!UUID.test(imagenId)) return error("Identificador inválido.");

  const limpio = alt.trim().slice(0, 200);

  const supabase = crearClienteAdmin();
  const { data, error: fallo } = await supabase
    .from(tablaDeImagenes(entidad))
    .update({ alt: limpio })
    .eq("id", imagenId)
    .select(`${columnaPadre(entidad)}`)
    .maybeSingle();

  if (fallo) throw new Error(`No se pudo guardar el texto: ${fallo.message}`);

  const padreId = data
    ? String((data as Record<string, unknown>)[columnaPadre(entidad)])
    : null;

  revalidar(entidad, padreId ? await slugDelPadre(entidad, padreId) : null);
  return listo;
}
