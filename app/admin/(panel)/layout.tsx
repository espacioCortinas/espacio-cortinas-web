import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { cerrarSesion } from "@/acciones/sesion";
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
 * Ver docs/seguridad.md.
 *
 * Las páginas del panel se construyen en la Fase 3. Esto es solo la cáscara.
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
    <div className="p-8">
      <header className="mb-8 flex items-baseline gap-4">
        <strong>Panel — Espacio Cortinas</strong>
        <span>{admin.email}</span>
        <form action={cerrarSesion}>
          <button type="submit" className="border p-2">
            Salir
          </button>
        </form>
      </header>
      {children}
    </div>
  );
}
