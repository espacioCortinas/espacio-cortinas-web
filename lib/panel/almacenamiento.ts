import "server-only";

import { BUCKET } from "@/lib/constantes";
import { crearClienteAdmin } from "@/lib/supabase/admin";

/**
 * Borrado de archivos de Storage.
 *
 * **Vive acá y no en `acciones/`, y no es una cuestión de prolijidad.** En un
 * archivo con `"use server"` toda función exportada queda publicada como un
 * endpoint POST alcanzable desde afuera. Esta recibe rutas y borra lo que haya
 * adentro, así que exportarla desde ahí sería dejar «borrá esta carpeta del
 * bucket» abierto a cualquiera. Quien la llama ya verificó identidad.
 */

/**
 * Borra los archivos de una o varias carpetas del bucket.
 *
 * **La cascada de la base borra filas, nunca archivos.** Si esto no corre, las
 * fotos quedan ocupando el bucket sin que ninguna fila las referencie: no
 * molestan a nadie hasta que se agota el gigabyte del plan gratuito, y
 * entonces no hay forma de saber cuáles sobran.
 *
 * Se lista el prefijo en vez de armar los nombres a mano, y esa diferencia es
 * la que evita huérfanos: cada fila tiene sus propias medidas, así que
 * reconstruir los nombres desde una lista fija se comería justo el caso raro
 * —la foto chica con medidas distintas— que es el que nadie prueba.
 */
export async function borrarCarpetas(rutas: string[]): Promise<string[]> {
  if (rutas.length === 0) return [];

  const supabase = crearClienteAdmin();
  const noBorrados: string[] = [];

  for (const ruta of rutas) {
    const carpeta = ruta.endsWith("/") ? ruta.slice(0, -1) : ruta;

    const { data, error: falloDeListado } = await supabase.storage
      .from(BUCKET)
      .list(carpeta);

    if (falloDeListado) {
      console.error(`[imagenes] no se pudo listar ${carpeta}:`, falloDeListado);
      noBorrados.push(carpeta);
      continue;
    }

    const archivos = (data ?? []).map((a) => `${carpeta}/${a.name}`);
    if (archivos.length === 0) continue;

    const { error: falloAlBorrar } = await supabase.storage
      .from(BUCKET)
      .remove(archivos);

    if (falloAlBorrar) {
      console.error(`[imagenes] no se pudo borrar ${carpeta}:`, falloAlBorrar);
      noBorrados.push(carpeta);
    }
  }

  return noBorrados;
}
