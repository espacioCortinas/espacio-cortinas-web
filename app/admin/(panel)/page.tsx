import type { Metadata } from "next";
import Link from "next/link";

import { contarTodo } from "@/lib/panel/consultas";

export const metadata: Metadata = { title: "Panel — Espacio Cortinas" };

/**
 * `/admin` — el índice del panel.
 *
 * Dos secciones y ninguna más (docs/producto.md). Sin tablero de métricas, sin
 * configuración, sin bandeja de mensajes: los mensajes del formulario de
 * contacto van al correo, que ya es una bandeja mejor que cualquiera que
 * construyamos (decisión 12).
 *
 * Lo único que muestra además de los dos accesos es cuántos hay publicados,
 * porque es la pregunta que se hace al entrar: «¿está publicado lo que cargué
 * la semana pasada?».
 */
export default async function PanelInicio() {
  const conteo = await contarTodo();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Panel</h1>

      <p className="text-neutral-700">
        Desde acá se carga todo lo que se ve en el sitio.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Seccion
          href="/admin/productos"
          titulo="Productos"
          descripcion="Lo que vendemos: cortinas, rollers, venecianas, toldos."
          total={conteo.productos.total}
          activos={conteo.productos.activos}
        />
        <Seccion
          href="/admin/proyectos"
          titulo="Proyectos"
          descripcion="Los trabajos ya hechos, con sus fotos."
          total={conteo.proyectos.total}
          activos={conteo.proyectos.activos}
        />
      </div>

      <div className="rounded border border-neutral-300 p-4 text-sm text-neutral-700">
        <p className="mb-2 font-medium text-neutral-900">
          Antes de subir una foto
        </p>
        <p>
          No subas fotos donde se vean personas, papeles con direcciones, ni el
          frente de la casa con el número. Son casas de clientes.
        </p>
      </div>
    </div>
  );
}

function Seccion({
  href,
  titulo,
  descripcion,
  total,
  activos,
}: {
  href: string;
  titulo: string;
  descripcion: string;
  total: number;
  activos: number;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-2 rounded border border-neutral-300 p-4 hover:bg-neutral-50"
    >
      <span className="text-lg font-medium">{titulo}</span>
      <span className="text-sm text-neutral-600">{descripcion}</span>
      <span className="text-sm text-neutral-900">
        {total === 0
          ? "Todavía no hay ninguno"
          : `${activos} publicado${activos === 1 ? "" : "s"} de ${total}`}
      </span>
    </Link>
  );
}
