"use server";

import { redirect } from "next/navigation";

import { crearClienteServidor } from "@/lib/supabase/servidor";

/**
 * Cerrar sesión.
 *
 * **Es la única Server Action del panel que no llama a `verificarAdmin()`, y
 * es a propósito.** La regla existe para las acciones que leen o modifican
 * contenido; esta no toca nada del negocio: destruye la sesión de quien la
 * invoca y nada más. Exigir ser la administradora para poder desloguearse
 * dejaría encerrada a una sesión no autorizada, que es justo la que conviene
 * que pueda irse.
 *
 * Cualquier acción que se agregue en la Fase 3 sí arranca con
 * `verificarAdmin()`.
 */
export async function cerrarSesion(): Promise<never> {
  const supabase = await crearClienteServidor();

  // Se invoca desde una Server Action, así que acá sí se pueden escribir
  // cookies: `signOut()` borra las de sesión a través del cliente.
  await supabase.auth.signOut();

  redirect("/admin/login");
}
