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
 * Obligatorias hoy, en la Fase 2.
 *
 * Las demás variables de `.env.example` existen pero todavía no se usan, así
 * que exigirlas ahora sería pedir datos que no existen. Cada fase suma la
 * suya a esta lista:
 *
 *   Fase 1   → las cuatro de Supabase y del sitio
 *   Fase 2   → ADMIN_USER_ID
 *   Fase 4.6 → NEXT_PUBLIC_WHATSAPP, RESEND_API_KEY, EMAIL_CONTACTO
 */
const OBLIGATORIAS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",

  // Fase 2. Es el `user.id` del único administrador, creado a mano en la
  // consola de Supabase. Sin esto `verificarAdmin()` no puede comparar contra
  // nada, y "¿hay sesión?" no es autorización — ver docs/seguridad.md.
  "ADMIN_USER_ID",
] as const;

/** Nombres de las variables obligatorias que faltan o están vacías. */
export function faltantes(): string[] {
  return OBLIGATORIAS.filter((nombre) => !process.env[nombre]?.trim());
}

/**
 * Variables que además de existir tienen que tener la forma correcta.
 *
 * Existe por un caso real: `NEXT_PUBLIC_SUPABASE_URL` se cargó una vez con el
 * endpoint REST pegado —`https://xxx.supabase.co/rest/v1`— porque es uno de los
 * valores que el panel de Supabase muestra para copiar. El build pasó, el sitio
 * se publicó, y todo lo del servidor que hablaba con Supabase falló con un
 * error del gateway que no dice nada:
 *
 *     AuthApiError: Invalid path specified in request URL
 *
 * Estar presente no alcanza: tiene que ser el origen pelado, sin ruta.
 */
function malFormadas(): string[] {
  const problemas: string[] = [];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (url) {
    let analizada: URL | null = null;
    try {
      analizada = new URL(url);
    } catch {
      problemas.push(`NEXT_PUBLIC_SUPABASE_URL no es una URL válida: «${url}»`);
    }
    if (analizada) {
      // Se admite la barra final sola: `entornoPublico` la limpia.
      if (analizada.pathname !== "/" && analizada.pathname !== "") {
        problemas.push(
          `NEXT_PUBLIC_SUPABASE_URL tiene una ruta de más («${analizada.pathname}»). ` +
            `Va el origen pelado: ${analizada.origin} — sin /rest/v1, sin /auth/v1.`,
        );
      }
      if (analizada.protocol !== "https:") {
        problemas.push(
          `NEXT_PUBLIC_SUPABASE_URL tiene que ser https, y es «${analizada.protocol}».`,
        );
      }
    }
  }

  return problemas;
}

/**
 * Lanza un error con todo lo que está mal: lo que falta y lo que está mal
 * escrito. No imprime el valor de ninguna clave.
 */
export function validarEntorno(): void {
  const sinCargar = faltantes();
  const conFormatoMalo = malFormadas();
  if (sinCargar.length === 0 && conFormatoMalo.length === 0) return;

  throw new Error(
    [
      "",
      "───────────────────────────────────────────────────────────",
      "  PROBLEMAS CON LAS VARIABLES DE ENTORNO",
      "───────────────────────────────────────────────────────────",
      "",
      ...(sinCargar.length > 0
        ? [
            "  Faltan o están vacías:",
            ...sinCargar.map((n) => `    ✗ ${n}`),
            "",
          ]
        : []),
      ...(conFormatoMalo.length > 0
        ? ["  Mal escritas:", ...conFormatoMalo.map((p) => `    ✗ ${p}`), ""]
        : []),
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
