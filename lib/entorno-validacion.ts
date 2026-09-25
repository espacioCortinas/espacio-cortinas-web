/**
 * Verificación de que estén todas las variables de entorno obligatorias.
 *
 * Corre en dos momentos, a propósito, **y no exige lo mismo en los dos**:
 *
 *   - `next.config.ts`      → el **build**. Exige las cuatro. En Cloudflare eso
 *                             significa que un despliegue mal configurado no
 *                             llega a publicarse: el build corta y la versión
 *                             anterior sigue sirviendo.
 *   - `instrumentation.ts`  → el **arranque** del servidor. Exige solo lo que
 *                             hace falta para servir las páginas.
 *
 * Este archivo nunca entra al paquete del navegador: solo lo importan la
 * configuración y el arranque, los dos en el servidor. Por eso puede leer
 * `process.env` con acceso dinámico sin filtrar ningún valor: acá solo se miran
 * nombres y formas, nunca se imprime el contenido.
 *
 * # Por qué el arranque no exige las del correo — decisión 56
 *
 * Hasta la Fase 4.6 los dos momentos exigían la misma lista (decisión 21), y
 * tenía sentido: sin Supabase no había página que se pudiera servir, así que
 * un servidor que arrancaba sin sus claves solo servía errores 500. Es lo que
 * pasó el 29/07 (`docs/infraestructura.md`).
 *
 * `RESEND_API_KEY` y `EMAIL_CONTACTO` no son de esa clase. Las usa **una sola
 * cosa**, el envío del formulario, y el sitio entero se sirve sin ellas. Si el
 * arranque las exigiera, una clave del correo que faltara en el Worker tiraría
 * todas las páginas —Inicio, el catálogo, los proyectos, el botón de WhatsApp—
 * para proteger un formulario que ya tiene salida propia: si no puede enviar,
 * lo dice y ofrece WhatsApp con el texto ya escrito. Así que el arranque exige
 * lo que las páginas usan, y la Server Action comprueba lo suyo al enviar y lo
 * deja escrito en los registros del Worker.
 *
 * El build sí las exige a las cuatro: es el único momento en que faltar no
 * cuesta nada, porque corta antes de publicar.
 */

type Momento = "build" | "arranque";

/**
 * Obligatorias, por momento. Cada fase suma las suyas (decisión 21):
 *
 *   Fase 1   → NEXT_PUBLIC_SITE_URL
 *   Fase 4.6 → NEXT_PUBLIC_WHATSAPP, RESEND_API_KEY, EMAIL_CONTACTO
 *
 * Las cuatro de Supabase se fueron con el panel.
 *
 * `NEXT_PUBLIC_WHATSAPP` no hace falta al arrancar porque Next la incrusta en
 * el build: las páginas ya salen con el enlace escrito y el servidor no la lee.
 */
const OBLIGATORIAS: Record<Momento, readonly string[]> = {
  build: [
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_WHATSAPP",
    "RESEND_API_KEY",
    "EMAIL_CONTACTO",
  ],
  arranque: ["NEXT_PUBLIC_SITE_URL"],
};

/** Nombres de las variables obligatorias que faltan o están vacías. */
export function faltantes(momento: Momento = "build"): string[] {
  return OBLIGATORIAS[momento].filter((nombre) => !process.env[nombre]?.trim());
}

/**
 * Variables que además de existir tienen que tener la forma correcta.
 *
 * Existe por un caso real de la Fase 2: `NEXT_PUBLIC_SUPABASE_URL` se cargó con
 * el endpoint REST pegado, el build pasó, el sitio se publicó, y el login
 * quedó roto para todo el mundo con el sitio respondiendo 200. Esa variable ya
 * no existe, pero **la lección sí**: una variable con la forma equivocada no
 * falla de forma visible, falla en silencio en lo que la usa.
 *
 * Se comprueba lo que esté cargado, en cualquiera de los dos momentos.
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

  // El número va a `wa.me/<número>`, que solo acepta cifras: con un `+`, un
  // espacio o un guion el enlace abre WhatsApp y no encuentra a nadie. Y va con
  // el código del país adelante: un 11… a secas es un número de otro país.
  // El número es público —está en cada página—, así que se puede mostrar.
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP?.trim();
  if (whatsapp && !/^54\d{8,13}$/.test(whatsapp)) {
    problemas.push(
      `NEXT_PUBLIC_WHATSAPP tiene que ser el número internacional, solo con ` +
        `cifras y empezando por 54 (ej. 5491122334455), y es «${whatsapp}».`,
    );
  }

  // La casilla tampoco es secreta: se publica en /contacto (decisión 55).
  const casilla = process.env.EMAIL_CONTACTO?.trim();
  if (casilla && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(casilla)) {
    problemas.push(
      `EMAIL_CONTACTO no es una dirección de correo: «${casilla}».`,
    );
  }

  // La clave SÍ es secreta: se mira la forma y nunca se imprime. Las de Resend
  // empiezan con `re_`, y es la forma más barata de atajar que se pegó otra
  // cosa —el ID del dominio, el de la clave— en el lugar de la clave.
  const clave = process.env.RESEND_API_KEY?.trim();
  if (clave && !clave.startsWith("re_")) {
    problemas.push(
      "RESEND_API_KEY no tiene la forma de una clave de Resend (empiezan con «re_»). " +
        "El valor no se muestra.",
    );
  }

  return problemas;
}

/**
 * Lanza un error con todo lo que está mal: lo que falta y lo que está mal
 * escrito. No imprime el valor de ninguna clave.
 */
export function validarEntorno(momento: Momento = "build"): void {
  const sinCargar = faltantes(momento);
  const conFormatoMalo = malFormadas();
  if (sinCargar.length === 0 && conFormatoMalo.length === 0) return;

  throw new Error(
    [
      "",
      "───────────────────────────────────────────────────────────",
      `  PROBLEMAS CON LAS VARIABLES DE ENTORNO (${momento})`,
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
      "  En producción: las que no son secretas van en el bloque",
      "                 `vars` de wrangler.jsonc; RESEND_API_KEY,",
      "                 como Secret del Worker. Y las cuatro, además,",
      "                 en «Build variables and secrets». Decisión 30.",
      "",
      "  La lista completa y para qué sirve cada una está en",
      "  docs/arquitectura.md, sección «Variables de entorno».",
      "───────────────────────────────────────────────────────────",
      "",
    ].join("\n"),
  );
}
