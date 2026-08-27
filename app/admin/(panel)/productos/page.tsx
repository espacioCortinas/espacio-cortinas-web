import type { Metadata } from "next";
import Link from "next/link";

import { reordenarProductos } from "@/acciones/productos";
import { Listado } from "@/components/panel/listado";
import { listarProductos } from "@/lib/panel/consultas";

export const metadata: Metadata = { title: "Productos — Panel" };

export default async function PaginaProductos() {
  const filas = await listarProductos();

  return (
    <div className="flex flex-col gap-5">
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
