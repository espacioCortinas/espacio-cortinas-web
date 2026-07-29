/**
 * Verificación de que estén todas las variables de entorno obligatorias.
 *
 * Corre en dos momentos, a propósito:
 *
 *   - `next.config.ts`      → falla el **build**. En Cloudflare eso significa
 *                             que un despliegue mal configurado no llega a
 *                             publicarse.
 *   - `instrumentation.ts`  → falla al **arrancar el servidor**, por si las
 *                             variables cambiaron después del build.
 *
 * Este archivo nunca entra al paquete del navegador: solo lo importan la
 * configuración y el arranque, los dos en Node. Por eso puede leer
 * `process.env` con acceso dinámico y nombrar variables secretas sin filtrar
 * ningún valor: acá solo se miran nombres, nunca se imprime el contenido.
 */

/**
 * Obligatorias hoy, en la Fase 1.
 *
 * Las demás variables de `.env.example` existen pero todavía no se usan, así
 * que exigirlas ahora sería pedir datos que no existen. Cada fase suma la
 * suya a esta lista:
 *
 *   Fase 2   → ADMIN_USER_ID
 *   Fase 4.6 → NEXT_PUBLIC_WHATSAPP, RESEND_API_KEY, EMAIL_CONTACTO
 */
const OBLIGATORIAS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

/** Nombres de las variables obligatorias que faltan o están vacías. */
export function faltantes(): string[] {
  return OBLIGATORIAS.filter((nombre) => !process.env[nombre]?.trim());
}

/** Lanza un error con la lista completa de faltantes. No imprime valores. */
export function validarEntorno(): void {
  const sinCargar = faltantes();
  if (sinCargar.length === 0) return;

  throw new Error(
    [
      "",
      "───────────────────────────────────────────────────────────",
      "  FALTAN VARIABLES DE ENTORNO OBLIGATORIAS",
      "───────────────────────────────────────────────────────────",
      "",
      ...sinCargar.map((nombre) => `  ✗ ${nombre}`),
      "",
      "  En local:      copiá .env.example a .env.local y completalo.",
      "  En producción: Cloudflare → el Worker → Settings.",
      "                 Las del build en «Build variables and secrets»,",
      "                 las del runtime en «Variables and Secrets».",
      "",
      "  La lista completa y para qué sirve cada una está en",
      "  docs/arquitectura.md, sección «Variables de entorno».",
      "───────────────────────────────────────────────────────────",
      "",
    ].join("\n"),
  );
}
