import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  cambiarEstadoProducto,
  eliminarProducto,
  guardarProducto,
} from "@/acciones/productos";
import { FormularioProducto } from "@/components/panel/formulario-producto";
import { Galeria } from "@/components/panel/galeria";
import { Interruptores } from "@/components/panel/interruptores";
import { SubirFotos } from "@/components/panel/subir-fotos";
import { BotonConConfirmacion } from "@/components/ui/confirmar";
import { obtenerProducto } from "@/lib/panel/consultas";

export const metadata: Metadata = { title: "Editar producto — Panel" };

/**
 * La pantalla donde se pasa el tiempo: textos, visibilidad y fotos de un
 * producto.
 *
 * **El orden de las secciones es el orden en que se usan.** Primero se
 * publica o no —que es lo que se viene a cambiar la mayoría de las veces—,
 * después las fotos, que es lo que más trabajo lleva, y al final los textos.
 * Eliminar va último y separado, para que no quede al lado de nada que se
 * toque seguido.
 */
export default async function PaginaEditarProducto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const producto = await obtenerProducto(id).catch(() => null);

  if (!producto) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/productos"
          className="text-sm underline underline-offset-2"
        >
          ← Volver a productos
        </Link>
        <h1 className="text-2xl font-semibold">{producto.nombre}</h1>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Visibilidad</h2>
        <Interruptores
          activo={producto.activo}
          destacado={producto.destacado}
          cambiar={cambiarEstadoProducto.bind(null, producto.id)}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Fotos</h2>
        <SubirFotos entidad="producto" padreId={producto.id} />
        <Galeria
          entidad="producto"
          padreId={producto.id}
          imagenes={producto.imagenes}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Textos</h2>
        <FormularioProducto
          accion={guardarProducto.bind(null, producto.id)}
          producto={producto}
          variantes={producto.variantes}
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
          accion={eliminarProducto.bind(null, producto.id)}
          etiqueta="Eliminar producto"
          titulo={`¿Eliminar «${producto.nombre}»?`}
          descripcion={
            producto.imagenes.length > 0
              ? `Se borran también sus ${producto.imagenes.length} fotos y sus variantes. No se puede deshacer.`
              : "Se borran también sus variantes. No se puede deshacer."
          }
          confirmar="Sí, eliminar"
        />
      </section>
    </div>
  );
}
