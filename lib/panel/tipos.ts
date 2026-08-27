/**
 * Los tipos del dominio, escritos a mano.
 *
 * No se generan con la CLI de Supabase por la misma razón que las migraciones
 * no se aplican con ella (decisión 28): son cinco tablas y traer la CLI para
 * esto costaría dos credenciales más. Si el esquema y estos tipos se separaran,
 * lo que lo detecta es `npm run esquema` — decisión 31.
 */

import type { FormatoDeImagen } from "@/lib/constantes";

/** Las dos entidades del panel. Se pasa como parámetro para compartir código. */
export type Entidad = "producto" | "proyecto";

export type Producto = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  activo: boolean;
  destacado: boolean;
  orden: number;
  creado_en: string;
  actualizado_en: string;
};

export type Variante = {
  id: string;
  producto_id: string;
  nombre: string;
  orden: number;
};

export type Proyecto = {
  id: string;
  titulo: string;
  slug: string;
  ubicacion: string | null;
  descripcion: string | null;
  activo: boolean;
  destacado: boolean;
  orden: number;
  creado_en: string;
  actualizado_en: string;
};

/**
 * Una fila de `producto_imagenes` o `proyecto_imagenes`.
 *
 * `ruta` es la CARPETA dentro del bucket, no un archivo: adentro hay un archivo
 * por cada entrada de `medidas`, con la extensión que diga `formato`. Borrar la
 * imagen es borrar el prefijo, que es justamente lo que evita archivos
 * huérfanos cuando las medidas cambian entre filas — docs/modelo-de-datos.md.
 */
export type Imagen = {
  id: string;
  ruta: string;
  medidas: number[];
  /** La extensión de los archivos de esta fila: `webp` o `jpg` — decisión 35. */
  formato: FormatoDeImagen;
  ancho: number;
  alto: number;
  alt: string;
  orden: number;
  es_portada: boolean;
  creado_en: string;
};

/** Una imagen ya resuelta para mostrar: con las URL firmadas de cada medida. */
export type ImagenConUrls = Imagen & {
  /** Ancho → URL firmada. Puede venir incompleto si Storage falló. */
  urls: Record<number, string>;
  /** La medida más chica que exista, para la miniatura del panel. */
  urlMiniatura: string | null;
};

export type ProductoCompleto = Producto & {
  variantes: Variante[];
  imagenes: ImagenConUrls[];
};

export type ProyectoCompleto = Proyecto & {
  imagenes: ImagenConUrls[];
};

/** Lo que el listado del panel necesita de cada fila, y nada más. */
export type FilaDeListado = {
  id: string;
  titulo: string;
  slug: string;
  activo: boolean;
  destacado: boolean;
  orden: number;
  cantidadDeFotos: number;
  urlPortada: string | null;
  tienePortada: boolean;
};
