import { createBrowserClient } from "@supabase/ssr";

import { entornoPublico } from "@/lib/entorno";

/**
 * Cliente de Supabase para el navegador.
 *
 * Usa la clave anónima, así que solo alcanza lo que RLS deja ver: contenido
 * activo. Sirve para el login del panel y poco más.
 *
 * **El navegador nunca escribe en la base** (regla 3 de CLAUDE.md). Toda
 * mutación pasa por una Server Action que verifica identidad. Si aparece una
 * escritura usando este cliente, está mal planteada.
 */
export function crearClienteNavegador() {
  return createBrowserClient(
    entornoPublico.supabaseUrl,
    entornoPublico.supabaseAnonKey,
  );
}
