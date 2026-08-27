import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  cambiarEstadoProyecto,
  eliminarProyecto,
  guardarProyecto,
} from "@/acciones/proyectos";
import { FormularioProyecto } from "@/components/panel/formulario-proyecto";
import { Galeria } from "@/components/panel/galeria";
import { Interruptores } from "@/components/panel/interruptores";
import { SubirFotos } from "@/components/panel/subir-fotos";
import { BotonConConfirmacion } from "@/components/ui/confirmar";
import { obtenerProyecto } from "@/lib/panel/consultas";

export const metadata: Metadata = { title: "Editar proyecto — Panel" };

/**
 * Igual que la de productos, con dos diferencias del modelo: no hay variantes
 * y sí hay ubicación. Mismo orden de secciones — visibilidad, fotos, textos,
 * eliminar — para que no haya que reaprender nada al pasar de una a otra.
 */
export default async function PaginaEditarProyecto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proyecto = await obtenerProyecto(id).catch(() => null);

  if (!proyecto) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/proyectos"
          className="text-sm underline underline-offset-2"
        >
          ← Volver a proyectos
        </Link>
        <h1 className="text-2xl font-semibold">{proyecto.titulo}</h1>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Visibilidad</h2>
        <Interruptores
          activo={proyecto.activo}
          destacado={proyecto.destacado}
          cambiar={cambiarEstadoProyecto.bind(null, proyecto.id)}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Fotos</h2>
        <SubirFotos entidad="proyecto" padreId={proyecto.id} />
        <Galeria
          entidad="proyecto"
          padreId={proyecto.id}
          imagenes={proyecto.imagenes}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Textos</h2>
        <FormularioProyecto
          accion={guardarProyecto.bind(null, proyecto.id)}
          proyecto={proyecto}
        />
      </section>

      <section className="flex flex-col gap-3 border-t border-neutral-300 pt-6">
        <h2 className="text-lg font-medium">Eliminar</h2>
        <p className="text-sm text-neutral-600">
          Si solo querés que deje de verse en el sitio, no hace falta
          eliminarlo: apagá «Publicado en el sitio» y queda guardado acá.
        </p>
        <BotonConConfirmacion
          className="self-start"
          accion={eliminarProyecto.bind(null, proyecto.id)}
          etiqueta="Eliminar proyecto"
          titulo={`¿Eliminar «${proyecto.titulo}»?`}
          descripcion={
            proyecto.imagenes.length > 0
              ? `Se borran también sus ${proyecto.imagenes.length} fotos. No se puede deshacer.`
              : "No se puede deshacer."
          }
          confirmar="Sí, eliminar"
        />
      </section>
    </div>
  );
}
