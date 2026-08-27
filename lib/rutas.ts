/**
 * Rutas internas del panel.
 *
 * Existe por una sola razón: validar el `?redirigir=` del login. Un parámetro
 * con una URL adentro es una redirección abierta esperando a que alguien se
 * olvide de validarla —el clásico `?redirigir=https://sitio-falso/`, que
 * convierte a nuestro dominio en el trampolín de un phishing—, así que el
 * valor nunca se usa tal como llega.
 *
 * No lleva `server-only`: lo importan el middleware (que corre en el runtime
 * de edge) y la página de login. No hay ningún secreto acá.
 */

/** A dónde se va cuando no hay un destino válido que respetar. */
export const RUTA_PANEL = "/admin";

/** La puerta. Queda afuera de la verificación de identidad — decisión de arquitectura. */
export const RUTA_LOGIN = "/admin/login";

/**
 * Devuelve la ruta si es un destino interno del panel; si no, `null`.
 *
 * Se aceptan **solo rutas del panel**, no cualquier ruta del sitio: el login
 * es la puerta del panel y no tiene por qué poder mandar a ningún otro lado.
 *
 * Los tres rechazos que importan:
 *
 *   - `https://otro-sitio/`  no empieza con `/`
 *   - `//otro-sitio/`        empieza con `/`, pero el navegador lo lee como
 *                            «protocolo relativo» y sale del dominio
 *   - `/\otro-sitio/`        lo mismo, con la barra invertida que algunos
 *                            navegadores normalizan a `//`
 */
export function rutaInternaDelPanel(
  valor: string | null | undefined,
): string | null {
  if (!valor) return null;
  if (!valor.startsWith("/")) return null;
  if (valor.startsWith("//") || valor.startsWith("/\\")) return null;
  if (valor !== RUTA_PANEL && !valor.startsWith(`${RUTA_PANEL}/`)) return null;
  // Volver al login después de loguearse sería un rulo. Se manda al panel.
  if (valor === RUTA_LOGIN || valor.startsWith(`${RUTA_LOGIN}?`)) return null;
  return valor;
}
