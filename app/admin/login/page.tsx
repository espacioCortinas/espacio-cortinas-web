import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { cerrarSesion } from "@/acciones/sesion";
import { estadoDeSesion } from "@/lib/auth";

import { FormularioLogin } from "./formulario-login";

export const metadata: Metadata = {
  title: "Entrar — Espacio Cortinas",
  // El panel no se indexa. La cabecera `X-Robots-Tag` de next.config.ts dice
  // lo mismo; esto lo repite en el HTML por si alguna vez se sirve sin ella.
  robots: { index: false, follow: false },
};

/**
 * El login vive FUERA del grupo `(panel)`, que es el que verifica identidad.
 * Si estuviera adentro, el layout redirigiría al login desde el propio login y
 * sería un bucle. Por eso el grupo: `(panel)` no agrega segmento a la URL, así
 * que `/admin` sigue siendo `/admin` y `/admin/login` queda sin proteger, que
 * es lo correcto — es la puerta.
 *
 * Es dinámica porque lee cookies para decidir qué mostrar.
 */
export const dynamic = "force-dynamic";

export default async function PaginaLogin() {
  const sesion = await estadoDeSesion();

  // Ya está adentro: no tiene sentido volver a pedirle la contraseña.
  if (sesion.estado === "administradora") redirect("/admin");

  // Hay sesión válida, pero de otra persona. Este es el caso que el criterio
  // de terminado pide probar con un segundo usuario. Se le dice que no tiene
  // acceso y se le deja la única salida útil: cerrar la sesión. Mostrarle el
  // formulario otra vez sería mentirle — volver a entrar con la misma cuenta
  // daría exactamente lo mismo.
  if (sesion.estado === "no-autorizado") {
    return (
      <main className="flex max-w-sm flex-col items-start gap-4 p-8">
        <h1>Sin acceso</h1>
        <p>
          La cuenta <strong>{sesion.usuario.email}</strong> no tiene acceso al
          panel.
        </p>
        <form action={cerrarSesion}>
          <button type="submit" className="border p-2">
            Cerrar sesión
          </button>
        </form>
      </main>
    );
  }

  return (
    <main>
      <FormularioLogin />
    </main>
  );
}
