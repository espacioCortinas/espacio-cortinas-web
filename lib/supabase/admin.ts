import "server-only";

import { createClient } from "@supabase/supabase-js";

import { entornoPublico } from "@/lib/entorno";
import { entornoServidor } from "@/lib/entorno-servidor";

/**
 * Cliente de Supabase con `service_role`. **Saltea RLS por diseño.**
 *
 * `import "server-only"` en la primera línea: si alguien lo importa desde un
 * componente cliente, el build falla en vez de mandar la clave al navegador.
 *
 * Se usa únicamente para las escrituras del panel y para firmar subidas a
 * Storage, y siempre después de llamar a `verificarAdmin()` (Fase 2). RLS no
 * protege este camino: lo protege la verificación de identidad. Ver
 * docs/seguridad.md.
 */
export function crearClienteAdmin() {
  return createClient(
    entornoPublico.supabaseUrl,
    entornoServidor.supabaseServiceRoleKey,
    {
      auth: {
        // No hay sesión de usuario acá: es una clave de servicio.
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}
