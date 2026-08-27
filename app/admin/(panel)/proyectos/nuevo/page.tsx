import type { Metadata } from "next";
import Link from "next/link";

import { crearProyecto } from "@/acciones/proyectos";
import { FormularioNuevo } from "@/components/panel/formulario-nuevo";

export const metadata: Metadata = { title: "Nuevo proyecto — Panel" };

export default function PaginaNuevoProyecto() {
  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/admin/proyectos"
        className="text-sm underline underline-offset-2"
      >
        ← Volver a proyectos
      </Link>

      <h1 className="text-2xl font-semibold">Nuevo proyecto</h1>

      <FormularioNuevo
        accion={crearProyecto}
        campo="titulo"
        etiqueta="Título del proyecto"
        ayuda="El trabajo, no el lugar. Por ejemplo: Casa en Nordelta."
        boton="Crear proyecto"
      />
    </div>
  );
}
