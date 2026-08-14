import "server-only";

import type { User } from "@supabase/supabase-js";

import { entornoServidor } from "@/lib/entorno-servidor";
import { crearClienteServidor } from "@/lib/supabase/servidor";

/**
 * Autorización del panel.
 *
 * Acá se autoriza de verdad. El middleware no autoriza: solo redirige al
 * login para que la experiencia sea razonable. Toda Server Action y todo
 * Route Handler del panel verifica por su cuenta, **sin asumir que el
 * middleware corrió**.
 *
 * Eso no es paranoia: en 2025 CVE-2025-29927 permitió saltear por completo el
 * middleware de Next con una cabecera HTTP. Cualquier autorización que
 * viviera únicamente ahí quedaba anulada. Ver docs/seguridad.md.
 *
 * La diferencia que importa es entre «estás logueada» y «sos vos»: hay un
 * solo administrador y se compara el `user.id` concreto contra
 * `ADMIN_USER_ID` (decisión 4). Preguntar «¿hay sesión?» no alcanza — si
 * alguna vez se reactivara el registro público en Supabase, cualquiera que se
 * diera de alta pasaría esa comprobación.
 */

/** Los tres estados posibles. `no-autorizado` es «hay sesión, pero no es ella». */
export type EstadoDeSesion =
  | { estado: "sin-sesion" }
  | { estado: "no-autorizado"; usuario: User }
  | { estado: "administradora"; usuario: User };

/**
 * Único lugar donde se resuelve quién está del otro lado. Todo lo demás en
 * este archivo se apoya acá.
 *
 * Usa `getUser()` y no `getSession()` a propósito: `getSession()` lee la
 * cookie y le cree, mientras que `getUser()` valida el token contra el
 * servidor de Supabase Auth. En el servidor solo vale la segunda.
 */
export async function estadoDeSesion(): Promise<EstadoDeSesion> {
  const supabase = await crearClienteServidor();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // `getUser()` no lanza: devuelve el error en el objeto. Sin esto, «no hay
  // sesión» y «no se pudo hablar con Supabase» son indistinguibles, y el panel
  // manda al login sin decir por qué. Falla cerrado igual —abajo se devuelve
  // `sin-sesion`—, pero queda registrado.
  //
  // `AuthSessionMissingError` es el caso normal de un visitante sin sesión y no
  // se registra: sería ruido en cada petición anónima.
  if (error && error.name !== "AuthSessionMissingError") {
    console.error(
      `[auth] getUser() falló: ${error.name}: ${error.message}. ` +
        `Se trata como «sin sesión». Si esto aparece en producción, el Worker ` +
        `no está pudiendo hablar con Supabase.`,
    );
  }

  if (!user) return { estado: "sin-sesion" };

  if (user.id !== entornoServidor.adminUserId) {
    return { estado: "no-autorizado", usuario: user };
  }

  return { estado: "administradora", usuario: user };
}

/**
 * Devuelve la administradora, o `null` si no hay sesión o si la sesión es de
 * otra persona.
 *
 * Es la versión que no lanza, para quien tiene que decidir qué hacer: el
 * layout del panel la usa para redirigir al login.
 */
export async function administradorActual(): Promise<User | null> {
  const sesion = await estadoDeSesion();
  return sesion.estado === "administradora" ? sesion.usuario : null;
}

/**
 * Igual, pero lanza en vez de devolver `null`.
 *
 * **Toda Server Action del panel arranca llamando a esto. Sin excepciones.**
 * La única que no lo hace es cerrar sesión, y está explicado ahí mismo por
 * qué — `acciones/sesion.ts`.
 *
 * Los dos mensajes son distintos a propósito, para diagnosticar. Ninguno
 * llega al navegador: en producción Next no expone el texto de un error de
 * Server Action.
 */
export async function verificarAdmin(): Promise<User> {
  const sesion = await estadoDeSesion();

  if (sesion.estado === "sin-sesion") throw new Error("No autenticado");
  if (sesion.estado === "no-autorizado") throw new Error("No autorizado");

  return sesion.usuario;
}
