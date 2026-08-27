import "server-only";

import { BUCKET, type FormatoDeImagen } from "@/lib/constantes";
import { crearClienteAdmin } from "@/lib/supabase/admin";

import type {
  Entidad,
  FilaDeListado,
  Imagen,
  ImagenConUrls,
  ProductoCompleto,
  ProyectoCompleto,
} from "./tipos";

/**
 * Las lecturas del panel.
 *
 * **Van con `service_role`, no con la clave anónima**, y la razón es concreta:
 * las políticas de RLS solo dejan ver contenido con `activo = true`. El panel
 * tiene que mostrar justamente lo contrario —lo que todavía no se publicó, lo
 * que se dio de baja— así que leer desde acá con la clave anónima devolvería
 * una lista vacía y parecería un problema de datos.
 *
 * Que salteen RLS no las deja sin protección: estas funciones solo se llaman
 * desde páginas dentro de `app/admin/(panel)/`, y ese layout verifica
 * identidad antes de renderizar nada. La autorización vive ahí y en cada
 * Server Action — docs/seguridad.md.
 */

/** Cuánto dura una URL firmada de lectura, en segundos. */
const VIGENCIA_FIRMA = 60 * 60;

type TablaImagenes = "producto_imagenes" | "proyecto_imagenes";

export function tablaDeImagenes(entidad: Entidad): TablaImagenes {
  return entidad === "producto" ? "producto_imagenes" : "proyecto_imagenes";
}

export function columnaPadre(entidad: Entidad): "producto_id" | "proyecto_id" {
  return entidad === "producto" ? "producto_id" : "proyecto_id";
}

/**
 * Todo lo que cuelga de una entidad dentro del bucket.
 *
 * Sirve para dos cosas: armar la carpeta de una imagen nueva, y comprobar que
 * una ruta que llega del navegador cae adentro de donde tiene que caer.
 */
export function prefijoDe(entidad: Entidad, padreId: string) {
  const raiz = entidad === "producto" ? "productos" : "proyectos";
  return `${raiz}/${padreId}/`;
}

/** La carpeta de una imagen dentro del bucket, siempre armada por el servidor. */
export function carpetaDe(entidad: Entidad, padreId: string, uuid: string) {
  return `${prefijoDe(entidad, padreId)}${uuid}/`;
}

/**
 * El archivo concreto de una medida dentro de esa carpeta.
 *
 * La extensión sale de la fila, no de una constante: dos fotos del mismo
 * proyecto pueden estar en formatos distintos según desde qué dispositivo se
 * cargaron, porque WebKit no sabe generar WebP — decisión 35.
 */
export function archivoDe(
  ruta: string,
  ancho: number,
  formato: FormatoDeImagen,
) {
  return `${ruta}${ancho}.${formato}`;
}

/**
 * Firma en lote las URL de lectura.
 *
 * El bucket es privado a propósito: si fuera público, cualquiera con la URL
 * descargaría la foto de la casa de un cliente sin pasar por ningún control.
 * Se firma en lote y no una por una porque una galería de doce fotos por
 * cuatro medidas son cuarenta y ocho firmas, y de a una serían cuarenta y ocho
 * viajes.
 */
async function firmar(rutas: string[]): Promise<Map<string, string>> {
  const firmadas = new Map<string, string>();
  if (rutas.length === 0) return firmadas;

  const supabase = crearClienteAdmin();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(rutas, VIGENCIA_FIRMA);

  if (error) {
    // No se lanza: una firma que falla tiene que dar una miniatura rota, no
    // una pantalla de error que deje a la administradora sin poder editar el
    // texto de un producto.
    console.error(
      `[panel] no se pudieron firmar ${rutas.length} rutas:`,
      error,
    );
    return firmadas;
  }

  for (const fila of data ?? []) {
    if (fila.signedUrl && fila.path) firmadas.set(fila.path, fila.signedUrl);
  }
  return firmadas;
}

/** Ordena y resuelve las URL de una galería completa. */
async function conUrls(imagenes: Imagen[]): Promise<ImagenConUrls[]> {
  const rutas = imagenes.flatMap((i) =>
    i.medidas.map((m) => archivoDe(i.ruta, m, i.formato)),
  );
  const firmadas = await firmar(rutas);

  return imagenes.map((imagen) => {
    const urls: Record<number, string> = {};
    for (const medida of imagen.medidas) {
      const url = firmadas.get(archivoDe(imagen.ruta, medida, imagen.formato));
      if (url) urls[medida] = url;
    }
    const medidaChica = [...imagen.medidas].sort((a, b) => a - b)[0];
    return { ...imagen, urls, urlMiniatura: urls[medidaChica] ?? null };
  });
}

const CAMPOS_IMAGEN =
  "id, ruta, medidas, formato, ancho, alto, alt, orden, es_portada, creado_en";

// ── Listados ───────────────────────────────────────────────────────────────

/**
 * Arma las filas del listado con **una** consulta y **una** tanda de firmas.
 *
 * Se traen todas las imágenes de cada fila, no solo la portada, porque hace
 * falta contarlas para mostrar «6 fotos» y para saber si falta la portada. Con
 * el volumen de este catálogo —unas decenas de filas— traerlas es más barato
 * que una consulta agregada aparte.
 */
async function listar(entidad: Entidad): Promise<FilaDeListado[]> {
  const supabase = crearClienteAdmin();
  const esProducto = entidad === "producto";

  const { data, error } = await supabase
    .from(esProducto ? "productos" : "proyectos")
    .select(
      `id, ${esProducto ? "nombre" : "titulo"}, slug, activo, destacado, orden,
       ${tablaDeImagenes(entidad)} (id, ruta, medidas, formato, ancho, alto, es_portada, orden)`,
    )
    .order("orden", { ascending: true })
    .order("creado_en", { ascending: true });

  if (error) throw new Error(`No se pudo leer el listado: ${error.message}`);

  type Cruda = Record<string, unknown> & {
    id: string;
    slug: string;
    activo: boolean;
    destacado: boolean;
    orden: number;
  };

  const filas = (data ?? []) as unknown as Cruda[];

  const portadas = filas.map((fila) => {
    const imagenes = (fila[tablaDeImagenes(entidad)] ?? []) as Imagen[];
    return imagenes.find((i) => i.es_portada) ?? null;
  });

  const rutas = portadas
    .filter((p): p is Imagen => p !== null)
    .map((p) => archivoDe(p.ruta, Math.min(...p.medidas), p.formato));
  const firmadas = await firmar(rutas);

  return filas.map((fila, i) => {
    const imagenes = (fila[tablaDeImagenes(entidad)] ?? []) as Imagen[];
    const portada = portadas[i];
    return {
      id: fila.id,
      titulo: String(fila[esProducto ? "nombre" : "titulo"] ?? ""),
      slug: fila.slug,
      activo: fila.activo,
      destacado: fila.destacado,
      orden: fila.orden,
      cantidadDeFotos: imagenes.length,
      tienePortada: portada !== null,
      urlPortada: portada
        ? (firmadas.get(
            archivoDe(
              portada.ruta,
              Math.min(...portada.medidas),
              portada.formato,
            ),
          ) ?? null)
        : null,
    };
  });
}

export const listarProductos = () => listar("producto");
export const listarProyectos = () => listar("proyecto");

// ── Una entidad completa, para la pantalla de edición ───────────────────────

export async function obtenerProducto(
  id: string,
): Promise<ProductoCompleto | null> {
  const supabase = crearClienteAdmin();

  const { data, error } = await supabase
    .from("productos")
    .select(
      `*,
       producto_variantes (id, producto_id, nombre, orden),
       producto_imagenes (${CAMPOS_IMAGEN})`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`No se pudo leer el producto: ${error.message}`);
  if (!data) return null;

  const { producto_variantes, producto_imagenes, ...producto } = data;

  return {
    ...producto,
    variantes: [...(producto_variantes ?? [])].sort(
      (a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, "es"),
    ),
    imagenes: await conUrls(ordenar(producto_imagenes ?? [])),
  } as ProductoCompleto;
}

export async function obtenerProyecto(
  id: string,
): Promise<ProyectoCompleto | null> {
  const supabase = crearClienteAdmin();

  const { data, error } = await supabase
    .from("proyectos")
    .select(`*, proyecto_imagenes (${CAMPOS_IMAGEN})`)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`No se pudo leer el proyecto: ${error.message}`);
  if (!data) return null;

  const { proyecto_imagenes, ...proyecto } = data;

  return {
    ...proyecto,
    imagenes: await conUrls(ordenar(proyecto_imagenes ?? [])),
  } as ProyectoCompleto;
}

/**
 * El orden de la galería. `creado_en` desempata: sin eso, dos fotos con el
 * mismo `orden` —que pasa apenas se suben varias juntas— cambian de lugar
 * entre una recarga y la siguiente, y parece que el panel perdiera los
 * cambios.
 */
function ordenar(imagenes: Imagen[]): Imagen[] {
  return [...imagenes].sort(
    (a, b) => a.orden - b.orden || a.creado_en.localeCompare(b.creado_en),
  );
}

/** Cuántos elementos hay, para el índice del panel. */
export async function contarTodo() {
  const supabase = crearClienteAdmin();

  const [productos, proyectos] = await Promise.all([
    supabase.from("productos").select("activo", { count: "exact" }),
    supabase.from("proyectos").select("activo", { count: "exact" }),
  ]);

  const activos = (r: { data: { activo: boolean }[] | null }) =>
    (r.data ?? []).filter((f) => f.activo).length;

  return {
    productos: { total: productos.count ?? 0, activos: activos(productos) },
    proyectos: { total: proyectos.count ?? 0, activos: activos(proyectos) },
  };
}
