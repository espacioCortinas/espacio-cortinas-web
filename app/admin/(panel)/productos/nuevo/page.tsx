import type { Metadata } from "next";
import Link from "next/link";

import { crearProducto } from "@/acciones/productos";
import { FormularioNuevo } from "@/components/panel/formulario-nuevo";

export const metadata: Metadata = { title: "Nuevo producto — Panel" };

export default function PaginaNuevoProducto() {
  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/admin/productos"
        className="text-sm underline underline-offset-2"
      >
        ← Volver a productos
      </Link>

      <h1 className="text-2xl font-semibold">Nuevo producto</h1>

      <FormularioNuevo
        accion={crearProducto}
        campo="nombre"
        etiqueta="Nombre del producto"
        ayuda="Por ejemplo: Roller Blackout."
        boton="Crear producto"
      />
    </div>
  );
}
