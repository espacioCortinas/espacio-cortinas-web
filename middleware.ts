import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { entornoPublico } from "@/lib/entorno";

/**
 * ESTO NO AUTORIZA.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * NO RENOMBRAR ESTE ARCHIVO A `proxy.ts`.
 *
 * Next 16 avisa en cada build que `middleware` está deprecado en favor de
 * `proxy`, y el aviso es tentador. Pero `proxy.ts` **siempre corre en el
 * runtime de Node** y Next rechaza cualquier intento de cambiárselo, mientras
 * que `@opennextjs/cloudflare` solo admite middleware de *edge*. Con
 * `proxy.ts` el build de Cloudflare corta con:
 *
 *   ERROR Node.js middleware is not currently supported.
 *
 * Se probó y se revirtió — decisión 26. `next build` pasa igual; el que lo
 * detecta es `npm run preview`.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Hace dos cosas, y ninguna es un control de acceso:
 *
 *   1. Refresca la sesión de Supabase, para que no se caiga sola mientras se
 *      usa el panel.
 *   2. Si no hay ninguna sesión, redirige a `/admin/login`. Es comodidad: sin
 *      esto, entrar a `/admin` sin sesión daría un error en vez de un
 *      formulario.
 *
 * **Ni siquiera mira `ADMIN_USER_ID`.** Quién es la persona se decide en
 * `verificarAdmin()` (lib/auth.ts), del lado del servidor, en el layout del
 * panel y en cada Server Action. La razón está en docs/seguridad.md:
 * CVE-2025-29927 permitió saltear el middleware de Next con una cabecera HTTP,
 * y toda autorización que viviera solo acá quedaba anulada.
 *
 * Dicho al revés, que es como conviene leerlo: si este archivo se borrara
 * entero, el panel seguiría siendo inaccesible para cualquiera que no sea la
 * administradora. Solo se perdería la redirección amable.
 */

/** El login queda afuera de la redirección, o sería un bucle contra sí mismo. */
const RUTA_LOGIN = "/admin/login";

/**
 * El panel no se cachea. Desde la mudanza a Cloudflare el proxy de Cloudflare
 * es obligatorio (un Custom Domain de Workers no admite el modo «solo DNS»),
 * así que hay una caché compartida delante de la aplicación: una respuesta
 * autenticada que quedara guardada ahí se le puede servir a otra persona.
 *
 * Las respuestas normales del panel reciben esta cabecera desde el `headers()`
 * de next.config.ts. Acá se repite solo para la redirección, que la genera
 * este archivo y por lo tanto no pasa por ahí.
 */
const SIN_CACHE = "private, no-store, max-age=0, must-revalidate";

export async function middleware(peticion: NextRequest) {
  // La respuesta se crea antes de consultar a Supabase porque el cliente
  // escribe en ella las cookies de sesión renovadas.
  let respuesta = NextResponse.next({ request: peticion });

  const supabase = createServerClient(
    entornoPublico.supabaseUrl,
    entornoPublico.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return peticion.cookies.getAll();
        },
        setAll(cookiesAEscribir) {
          for (const { name, value } of cookiesAEscribir) {
            peticion.cookies.set(name, value);
          }
          respuesta = NextResponse.next({ request: peticion });
          for (const { name, value, options } of cookiesAEscribir) {
            respuesta.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // `getUser()` y no `getSession()`: valida el token contra Supabase Auth en
  // vez de creerle a la cookie. Además es la llamada que dispara el refresco.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const estaEnElLogin = peticion.nextUrl.pathname === RUTA_LOGIN;

  if (!user && !estaEnElLogin) {
    const destino = peticion.nextUrl.clone();
    destino.pathname = RUTA_LOGIN;
    // Sin `?redirigir=`: la única página del panel hoy es la raíz, y un
    // parámetro con una URL adentro es una redirección abierta esperando a que
    // alguien se olvide de validarla. Se agrega en la Fase 3 si hace falta,
    // aceptando solo rutas internas.
    destino.search = "";

    const redireccion = NextResponse.redirect(destino);
    redireccion.headers.set("Cache-Control", SIN_CACHE);
    return redireccion;
  }

  return respuesta;
}

export const config = {
  // Solo el panel. El sitio público no pasa por acá a propósito: es estático,
  // se cachea en el borde, y meterle una consulta de sesión costaría eso a
  // cambio de nada.
  matcher: ["/admin/:path*"],
};
