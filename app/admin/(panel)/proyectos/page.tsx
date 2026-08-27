import type { Metadata } from "next";
import Link from "next/link";

import { reordenarProyectos } from "@/acciones/proyectos";
import { Listado } from "@/components/panel/listado";
import { listarProyectos } from "@/lib/panel/consultas";

export const metadata: Metadata = { title: "Proyectos — Panel" };

export default async function PaginaProyectos() {
  const filas = await listarProyectos();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Proyectos</h1>
        <Link
          href="/admin/proyectos/nuevo"
          className="inline-flex min-h-12 items-center justify-center rounded bg-neutral-900 px-4 text-base font-medium text-white hover:bg-neutral-700"
        >
          Agregar proyecto
        </Link>
      </div>

      <p className="text-sm text-neutral-600">
        El orden de esta lista es el del portfolio, y también decide cuáles de
        los destacados salen en la portada: entran los primeros.
      </p>

      <Listado
        filas={filas}
        base="/admin/proyectos"
        reordenar={reordenarProyectos}
        vacio="Todavía no hay proyectos. Empezá agregando el primero."
      />
    </div>
  );
}
