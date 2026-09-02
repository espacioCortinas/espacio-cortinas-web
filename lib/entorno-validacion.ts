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
 * `process.env` con acceso dinámico sin filtrar ningún valor: acá solo se miran
 * nombres, nunca se imprime el contenido.
 *
 * **Quedó con una sola variable** al sacar el panel (decisión 36). Se mantiene
 * igual porque la razón por la que existe no cambió, y está probada: en la
 * Fase 2 se comprobó que dejar la verificación solo en `instrumentation.ts` no
 * alcanza —el build pasaba limpio sin ninguna variable cargada— y que una
 * variable con la forma equivocada rompe el sitio con el build en verde.
 */

/**
 * Obligatorias hoy.
 *
 * Las demás variables de `.env.example` existen pero todavía no se usan, así
 * que exigirlas ahora sería pedir datos que no existen. Cada fase suma la suya
 * a esta lista (decisión 21):
 *
 *   Fase 1   → NEXT_PUBLIC_SITE_URL
 *   Fase 4.6 → NEXT_PUBLIC_WHATSAPP, RESEND_API_KEY, EMAIL_CONTACTO
 *
 * Las cuatro de Supabase se fueron con el panel.
 */
const OBLIGATORIAS = ["NEXT_PUBLIC_SITE_URL"] as const;

/** Nombres de las variables obligatorias que faltan o están vacías. */
export function faltantes(): string[] {
  return OBLIGATORIAS.filter((nombre) => !process.env[nombre]?.trim());
}

/**
 * Variables que además de existir tienen que tener la forma correcta.
 *
 * Existe por un caso real de la Fase 2: `NEXT_PUBLIC_SUPABASE_URL` se cargó con
 * el endpoint REST pegado, el build pasó, el sitio se publicó, y el login
 * quedó roto para todo el mundo con el sitio respondiendo 200. Esa variable ya
 * no existe, pero **la lección sí**, y `NEXT_PUBLIC_SITE_URL` es susceptible de
 * lo mismo: de ahí salen las URLs canónicas, el sitemap y el Open Graph, así
 * que una barra final de más o un `http` se propagan a todo el sitio sin que
 * nada falle de forma visible.
 */
function malFormadas(): string[] {
  const problemas: string[] = [];

  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (url) {
    let analizada: URL | null = null;
    try {
      analizada = new URL(url);
    } catch {
      problemas.push(`NEXT_PUBLIC_SITE_URL no es una URL válida: «${url}»`);
    }
    if (analizada) {
      // Se admite la barra final sola: `entornoPublico` la limpia.
      if (analizada.pathname !== "/" && analizada.pathname !== "") {
        problemas.push(
          `NEXT_PUBLIC_SITE_URL tiene una ruta de más («${analizada.pathname}»). ` +
            `Va el origen pelado: ${analizada.origin}`,
        );
      }
      // En local es http://localhost, y eso está bien.
      if (
        analizada.protocol !== "https:" &&
        analizada.hostname !== "localhost"
      ) {
        problemas.push(
          `NEXT_PUBLIC_SITE_URL tiene que ser https, y es «${analizada.protocol}».`,
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
      "  En producción: las públicas van en el bloque `vars` de",
      "                 wrangler.jsonc; las secretas, como Secret del",
      "                 Worker. Decisión 30.",
      "",
      "  La lista completa y para qué sirve cada una está en",
      "  docs/arquitectura.md, sección «Variables de entorno».",
      "───────────────────────────────────────────────────────────",
      "",
    ].join("\n"),
  );
}
