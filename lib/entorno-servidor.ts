import "server-only";

/**
 * Variables de entorno secretas.
 *
 * `import "server-only"` en la primera línea: si alguien importa este archivo
 * desde un componente cliente, el build falla en vez de filtrar la clave al
 * navegador. Ninguna de estas variables lleva el prefijo `NEXT_PUBLIC_`.
 *
 * Ver docs/seguridad.md ("Claves").
 */

const CRUDAS: Record<string, string | undefined> = {
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  ADMIN_USER_ID: process.env.ADMIN_USER_ID,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_CONTACTO: process.env.EMAIL_CONTACTO,
};

// Cuáles son obligatorias desde qué fase está en `lib/entorno-validacion.ts`,
// que es lo que corre en el build y al arrancar.

function exigir(nombre: string): string {
  const valor = CRUDAS[nombre]?.trim();
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${nombre}. ` +
        `Completala en .env.local (local) o en Cloudflare → el Worker → ` +
        `Settings (producción). Las secretas se cargan como Secret, nunca ` +
        `como Text, y van en las dos listas.`,
    );
  }
  return valor;
}

export const entornoServidor = {
  /** Saltea RLS por diseño. Nunca sale del servidor. */
  get supabaseServiceRoleKey(): string {
    return exigir("SUPABASE_SERVICE_ROLE_KEY");
  },
  /** `user.id` del único administrador. Se carga en la Fase 2. */
  get adminUserId(): string {
    return exigir("ADMIN_USER_ID");
  },
  /** Se carga en la Fase 4.6. */
  get resendApiKey(): string {
    return exigir("RESEND_API_KEY");
  },
  /** Destino del formulario de contacto. Se carga en la Fase 4.6. */
  get emailContacto(): string {
    return exigir("EMAIL_CONTACTO");
  },
};
