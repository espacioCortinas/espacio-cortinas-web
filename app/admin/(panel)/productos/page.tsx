import type { Metadata } from "next";
import Link from "next/link";

import { reordenarProductos } from "@/acciones/productos";
import { Listado } from "@/components/panel/listado";
import { Aviso } from "@/components/ui/aviso";
import { listarProductos } from "@/lib/panel/consultas";

export const metadata: Metadata = { title: "Productos — Panel" };

/**
 * `?guardado=` y `?eliminado=` los pone la Server Action al terminar bien.
 *
 * Van en la dirección y no en un estado del cliente para que el aviso
 * sobreviva a la navegación: guardar termina en esta pantalla, y el mensaje
 * tiene que estar cuando llega, no aparecer después.
 */
export default async function PaginaProductos({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [filas, parametros] = await Promise.all([
    listarProductos(),
    searchParams,
  ]);

  const uno = (v: string | string[] | undefined) =>
    (Array.isArray(v) ? v[0] : v)?.slice(0, 140);

  const guardado = uno(parametros.guardado);
  const eliminado = uno(parametros.eliminado);

  return (
    <div className="flex flex-col gap-5">
      {guardado && (
        <Aviso tono="exito">
          Se guardó «{guardado}». Ya se ve así en el sitio.
        </Aviso>
      )}
      {eliminado && <Aviso tono="exito">Se eliminó «{eliminado}».</Aviso>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex min-h-12 items-center justify-center rounded bg-neutral-900 px-4 text-base font-medium text-white hover:bg-neutral-700"
        >
          Agregar producto
        </Link>
      </div>

      <p className="text-sm text-neutral-600">
        El orden de esta lista es el orden del catálogo, y también decide cuáles
        de los destacados salen en la portada: entran los primeros.
      </p>

      <Listado
        filas={filas}
        base="/admin/productos"
        reordenar={reordenarProductos}
        vacio="Todavía no hay productos. Empezá agregando el primero."
      />
    </div>
  );
}
