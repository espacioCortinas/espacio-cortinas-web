/**
 * Next llama a `register()` una sola vez, cuando se levanta el servidor.
 *
 * La misma verificación corre en `next.config.ts` durante el build. Se repite
 * acá porque las variables pueden cambiar entre el build y el arranque, y
 * porque es mejor que el proceso no levante a que levante roto y conteste
 * error 500 en cada visita.
 */
export async function register() {
  const { validarEntorno } = await import("./lib/entorno-validacion");
  validarEntorno();
}
