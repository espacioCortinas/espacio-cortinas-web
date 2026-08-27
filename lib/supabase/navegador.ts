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
 *
 * Desde la Fase 3 tiene un segundo uso, y conviene ser preciso sobre por qué
 * no es una excepción a esa regla: **subir los archivos de una foto a
 * Storage**. No es una escritura a la base, no usa la clave anónima para
 * autorizarse, y no elige dónde escribe — sube contra una URL firmada que
 * emitió el servidor después de `verificarAdmin()`, con la ruta armada por el
 * servidor. Sin esa firma, la clave anónima no puede tocar nada del bucket:
 * `storage.objects` no tiene ninguna política (docs/seguridad.md).
 *
 * El motivo de que suba el navegador y no el servidor está en la decisión 5:
 * el archivo ya fue comprimido acá y hacerlo pasar por el Worker sería mover
 * megabytes por un runtime que da 10 ms de CPU por invocación.
 */
export function crearClienteNavegador() {
  return createBrowserClient(
    entornoPublico.supabaseUrl,
    entornoPublico.supabaseAnonKey,
  );
}
