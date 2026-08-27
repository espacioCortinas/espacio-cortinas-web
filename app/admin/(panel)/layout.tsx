import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { cerrarSesion } from "@/acciones/sesion";
import { Boton } from "@/components/ui/boton";
import { administradorActual } from "@/lib/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Nunca se renderiza en build ni se cachea. Ya sería dinámico por leer
 * cookies; se declara igual porque es una propiedad de seguridad y no un
 * detalle de rendimiento — docs/arquitectura.md marca `/admin/*` como
 * «dinámico, siempre en servidor, sin caché».
 */
export const dynamic = "force-dynamic";

/**
 * Layout del panel. **Acá se autoriza de verdad.**
 *
 * Verifica por su cuenta, sin asumir que el middleware corrió: el middleware
 * solo redirige al login cuando no hay ninguna sesión, y se puede saltear
 * (CVE-2025-29927). Esta comprobación es la que decide, y compara el `user.id`
 * concreto contra `ADMIN_USER_ID` — no alcanza con que exista una sesión.
 *
 * Ojo: esto protege lo que se **muestra**. Lo que se **escribe** lo protege
 * cada Server Action por su cuenta, porque una Server Action es un endpoint
 * POST que se puede llamar sin pasar nunca por este layout. Ver
 * docs/seguridad.md.
 *
 * ESTO NO ESTÁ DISEÑADO. Solo Tailwind por defecto — la dirección visual se
 * decide en la Fase 4.1, con las fotos reales a la vista (docs/plan.md).
 */
export default async function LayoutPanel({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await administradorActual();

  // Cubre los dos casos con la misma respuesta: sin sesión, y con una sesión
  // que no es la de la administradora. La página de login distingue cuál es y
  // muestra lo que corresponde.
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-dvh bg-white text-neutral-900">
      <header className="border-b border-neutral-300">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link href="/admin" className="font-semibold">
            Espacio Cortinas
          </Link>

          <nav className="flex gap-4 text-sm">
            <Link
              href="/admin/productos"
              className="underline underline-offset-2"
            >
              Productos
            </Link>
            <Link
              href="/admin/proyectos"
              className="underline underline-offset-2"
            >
              Proyectos
            </Link>
          </nav>

          <form action={cerrarSesion} className="ml-auto">
            <Boton type="submit" className="min-h-10 px-3 text-sm">
              Salir
            </Boton>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>

      <footer className="mx-auto max-w-3xl px-4 pb-8 text-xs text-neutral-500">
        Sesión de {admin.email}
      </footer>
    </div>
  );
}
