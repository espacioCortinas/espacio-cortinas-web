import "server-only";

/**
 * Variables de entorno secretas.
 *
 * `import "server-only"` en la primera línea: si alguien importa este archivo
 * desde un componente cliente, el build falla en vez de filtrar la clave al
 * navegador. Ninguna de estas variables lleva el prefijo `NEXT_PUBLIC_`.
 *
 * Al sacar el panel quedaron solo las del correo (decisión 36): la
 * `service_role key` de Supabase y el `ADMIN_USER_ID` se fueron con la base y
 * con la autenticación.
 *
 * Ver docs/seguridad.md.
 */

const CRUDAS: Record<string, string | undefined> = {
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_CONTACTO: process.env.EMAIL_CONTACTO,
};

function exigir(nombre: string): string {
  const valor = CRUDAS[nombre]?.trim();
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${nombre}. ` +
        `Completala en .env.local (local) o cargala como Secret del Worker ` +
        `con \`npx wrangler secret put ${nombre}\` (producción). Las secretas ` +
        `NUNCA van a wrangler.jsonc.`,
    );
  }
  return valor;
}

export const entornoServidor = {
  /** Se carga en la Fase 4.6. */
  get resendApiKey(): string {
    return exigir("RESEND_API_KEY");
  },
  /** Destino del formulario de contacto. Se carga en la Fase 4.6. */
  get emailContacto(): string {
    return exigir("EMAIL_CONTACTO");
  },
};
