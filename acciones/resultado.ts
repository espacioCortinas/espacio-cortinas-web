import "server-only";

/**
 * Lo que una Server Action del panel le devuelve al formulario.
 *
 * Un `throw` desde una Server Action llega al navegador como «An error
 * occurred in the Server Components render» y nada más: en producción Next no
 * expone el texto, a propósito. Para un fallo de programación eso está bien.
 * Para «ya existe un producto con ese nombre» es inservible, porque la
 * administradora no puede hacer nada con esa pantalla.
 *
 * Entonces se separan los dos casos: lo que ella puede corregir vuelve como
 * `Resultado`, con un mensaje escrito para ella; lo que no, se lanza y queda
 * en los registros del Worker.
 */
export type Resultado =
  { ok: true } | { ok: false; mensaje: string; campo?: string };

export function error(mensaje: string, campo?: string): Resultado {
  return { ok: false, mensaje, campo };
}

export const listo: Resultado = { ok: true };

/**
 * Traduce un fallo de Postgres a algo accionable, o devuelve `null` si no es
 * un caso previsto —y entonces conviene que se lance y quede registrado en vez
 * de inventarle una explicación.
 *
 * Los códigos son los de PostgreSQL: `23505` es violación de unicidad y en
 * este esquema solo puede venir del `slug` o del índice parcial de portada.
 */
export function traducirFalloDePostgres(
  fallo: { code?: string; message?: string } | null,
): string | null {
  if (!fallo?.code) return null;

  switch (fallo.code) {
    case "23505":
      if (fallo.message?.includes("slug")) {
        return "Ya existe otro con esa dirección web. Cambiá la dirección o el nombre.";
      }
      if (fallo.message?.includes("portada")) {
        return "Ya hay una foto de portada. Elegí primero otra portada y volvé a intentar.";
      }
      return "Ese valor ya está usado por otro.";
    case "23503":
      return "Se quiso guardar algo que ya no existe. Recargá la página y probá de nuevo.";
    case "23514":
      return "Falta completar algún campo obligatorio.";
    default:
      return null;
  }
}

/**
 * Los mensajes que las funciones de `0004_funciones_del_panel.sql` levantan
 * con `raise exception` ya están escritos en castellano y para ella, así que
 * se dejan pasar tal cual. Cualquier otra cosa se lanza.
 */
export function esMensajeDeNuestrasFunciones(mensaje: string): boolean {
  return (
    mensaje.startsWith("La portada tiene que ser") ||
    mensaje.startsWith("No existe la imagen")
  );
}
