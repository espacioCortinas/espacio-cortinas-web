import "server-only";

/**
 * Variables de entorno del servidor.
 *
 * `import "server-only"` en la primera línea: si alguien importa este archivo
 * desde un componente cliente, el build falla en vez de filtrar la clave al
 * navegador. Ninguna de estas variables lleva el prefijo `NEXT_PUBLIC_`.
 *
 * Son las dos del correo, y las usa una sola cosa: el envío del formulario de
 * contacto. **No tienen la misma categoría**:
 *
 *     RESEND_API_KEY   secreta de verdad. Secret del Worker, nunca en un
 *                      archivo versionado
 *     EMAIL_CONTACTO   no es secreta: la casilla se publica en /contacto. Va
 *                      en el bloque `vars` de wrangler.jsonc, a la vista, para
 *                      que un error de tipeo se vea en un diff — decisión 55
 *
 * Ver docs/seguridad.md.
 */

/**
 * Lo que necesita el envío del formulario, o qué le falta.
 *
 * **No lanza.** El arranque del servidor no exige estas dos a propósito
 * (decisión 56): si faltan, el sitio se sirve igual y el que se entera es el
 * envío, que tiene que poder decirlo con calma —«no se pudo enviar, mandalo por
 * WhatsApp»— en vez de romper la página con una excepción.
 *
 * Se leen en cada llamada y no una vez al cargar el módulo: en el Worker, el
 * entorno lo completa el adaptador al atender cada pedido.
 */
export function configuracionDelCorreo():
  | { lista: true; clave: string; destino: string }
  | { lista: false; faltan: string[] } {
  const clave = process.env.RESEND_API_KEY?.trim();
  const destino = process.env.EMAIL_CONTACTO?.trim();

  if (clave && destino) return { lista: true, clave, destino };

  return {
    lista: false,
    faltan: [
      ...(clave ? [] : ["RESEND_API_KEY"]),
      ...(destino ? [] : ["EMAIL_CONTACTO"]),
    ],
  };
}
