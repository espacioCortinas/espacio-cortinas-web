import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { entornoPublico } from "@/lib/entorno";

/**
 * Cliente de Supabase para el servidor: Server Components, Server Actions y
 * Route Handlers.
 *
 * Usa la clave anónima y las cookies de la petición, así que respeta RLS y
 * conoce la sesión del usuario. Es el cliente con el que se lee el contenido
 * público y con el que se pregunta quién está logueado.
 *
 * No autoriza nada por sí solo: la autorización del panel la hace
 * `verificarAdmin()` (Fase 2). Ver docs/seguridad.md.
 */
export async function crearClienteServidor() {
  const almacenDeCookies = await cookies();

  return createServerClient(
    entornoPublico.supabaseUrl,
    entornoPublico.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return almacenDeCookies.getAll();
        },
        setAll(cookiesAEscribir) {
          try {
            for (const { name, value, options } of cookiesAEscribir) {
              almacenDeCookies.set(name, value, options);
            }
          } catch {
            // Desde un Server Component no se pueden escribir cookies. Se
            // ignora a propósito: el middleware es el que refresca la sesión.
          }
        },
      },
    },
  );
}
