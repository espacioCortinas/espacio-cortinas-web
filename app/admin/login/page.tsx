import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { cerrarSesion } from "@/acciones/sesion";
import { estadoDeSesion } from "@/lib/auth";
import { RUTA_PANEL, rutaInternaDelPanel } from "@/lib/rutas";

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

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sesion = await estadoDeSesion();

  // El `?redirigir=` lo escribe el middleware, pero cualquiera puede
  // escribirlo a mano: se valida acá, que es donde se usa. Si no es una ruta
  // del panel, se descarta en silencio y se va al índice.
  const crudo = (await searchParams).redirigir;
  const destino =
    rutaInternaDelPanel(Array.isArray(crudo) ? crudo[0] : crudo) ?? RUTA_PANEL;

  // Ya está adentro: no tiene sentido volver a pedirle la contraseña.
  if (sesion.estado === "administradora") redirect(destino);

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
      <FormularioLogin destino={destino} />
    </main>
  );
}
