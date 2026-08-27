import type { Metadata } from "next";
import Link from "next/link";

import { reordenarProyectos } from "@/acciones/proyectos";
import { Listado } from "@/components/panel/listado";
import { Aviso } from "@/components/ui/aviso";
import { listarProyectos } from "@/lib/panel/consultas";

export const metadata: Metadata = { title: "Proyectos — Panel" };

/** Ver el comentario de la pantalla de productos sobre `?guardado=`. */
export default async function PaginaProyectos({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [filas, parametros] = await Promise.all([
    listarProyectos(),
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
