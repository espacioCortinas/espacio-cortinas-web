import "server-only";

import type { Consulta } from "@/lib/consulta";
import { configuracionDelCorreo } from "@/lib/entorno-servidor";

/**
 * El correo que genera el formulario de contacto, y su envío por Resend.
 *
 * **Con `fetch`, sin el SDK de Resend.** Enviar es un solo pedido HTTP con un
 * JSON, y el SDK sería una dependencia entera para escribir esas diez líneas
 * (regla 7 de `CLAUDE.md`). Lo único que el SDK hace solo y acá hay que hacer a
 * mano es mandar `User-Agent`: sin esa cabecera, Resend rechaza el pedido con
 * un 403 antes de mirarlo.
 *
 * **Nada se guarda.** El mensaje va al correo y ahí queda (decisión 12): no hay
 * base, no hay archivo y no se registra su contenido. Los registros del Worker
 * dicen que se envió o por qué no, nunca qué decía ni quién lo escribió.
 */

/**
 * De dónde sale el correo. Es una dirección del subdominio que se verificó en
 * Resend, **no la casilla de la empresa**: nadie le responde, porque
 * «Responder» va directo a quien escribió (`reply_to`). El subdominio aísla la
 * reputación del formulario de la del correo de Google Workspace — decisión 54
 * y `docs/infraestructura.md`, «Resend».
 */
const REMITENTE = "Formulario web <formulario@sitio.espaciocortinas.com.ar>";

/** Si Resend no contesta en este tiempo, se da por fallido y se ofrece WhatsApp. */
const ESPERA_MAXIMA_MS = 10_000;

/** Lo que el envío recibe: la consulta ya validada, con el producto por nombre. */
export type ConsultaParaEnviar = Consulta & {
  /** El nombre del producto elegido —«Roller»—, o `null` si no eligió. */
  interesLegible: string | null;
};

/**
 * Escapa un texto para meterlo en HTML: nada de lo que escribió la persona se
 * interpreta como marcado. Un `<a href>` o un `<img>` en el mensaje llegan como
 * texto, que es lo que eran.
 */
export function escaparHtml(texto: string): string {
  return texto
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * El asunto: **dice de qué se trata sin abrirlo**. Qué busca, si lo eligió, y
 * quién escribe:
 *
 *     Consulta web: Roller · María Gómez
 *     Consulta web · María Gómez
 *
 * Los valores ya vienen sin saltos de línea (`lib/consulta.ts`), que es lo que
 * impide que un nombre armado a propósito agregue cabeceras al correo.
 */
export function asuntoDe(consulta: ConsultaParaEnviar): string {
  return consulta.interesLegible
    ? `Consulta web: ${consulta.interesLegible} · ${consulta.nombre}`
    : `Consulta web · ${consulta.nombre}`;
}

/** Las filas de datos, en el orden en que se leen. Las vacías no van. */
function filas(consulta: ConsultaParaEnviar): [string, string][] {
  const todas: [string, string][] = [
    ["Nombre", consulta.nombre],
    ["Email", consulta.email],
    ["Teléfono", consulta.telefono],
    ["Busca", consulta.interesLegible ?? ""],
  ];
  return todas.filter(([, valor]) => valor !== "");
}

/**
 * La versión en texto plano. Va siempre, y no por compatibilidad: es la que
 * leen las notificaciones del teléfono y la vista previa de la bandeja.
 */
export function textoDe(consulta: ConsultaParaEnviar): string {
  const ancho = Math.max(...filas(consulta).map(([n]) => n.length)) + 2;
  return [
    "Consulta desde el formulario de espaciocortinas.com.ar",
    "",
    ...filas(consulta).map(([n, v]) => `${`${n}:`.padEnd(ancho)} ${v}`),
    "",
    "Mensaje:",
    "",
    consulta.mensaje,
    "",
    "—",
    `Para contestar, usá «Responder»: la respuesta va directo a ${consulta.email}.`,
  ].join("\n");
}

/**
 * La versión HTML, sobria: lo que tiene que hacer es que se lea bien en la
 * bandeja del teléfono. Estilos en línea porque los clientes de correo no leen
 * hojas de estilo, y sin imágenes ni nada que se cargue de afuera.
 *
 * **Todo lo que escribió la persona pasa por `escaparHtml()`**, sin excepción.
 * Los colores son el negro y el gris del sitio escritos a mano: un correo no
 * tiene los tokens de `app/globals.css`.
 */
export function htmlDe(consulta: ConsultaParaEnviar): string {
  const e = escaparHtml;
  const celda = "padding:4px 16px 4px 0;vertical-align:top";
  return [
    '<!doctype html><html lang="es"><body style="margin:0;padding:24px;',
    "font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;",
    'color:#211f20">',
    '<p style="margin:0 0 16px;font-size:13px;letter-spacing:0.08em;',
    'text-transform:uppercase;color:#6b645c">Consulta desde el sitio web</p>',
    '<table role="presentation" style="border-collapse:collapse;margin:0 0 24px">',
    ...filas(consulta).map(
      ([n, v]) =>
        `<tr><td style="${celda};color:#6b645c">${e(n)}</td>` +
        `<td style="${celda};font-weight:bold">${e(v)}</td></tr>`,
    ),
    "</table>",
    '<p style="margin:0 0 8px;color:#6b645c">Mensaje</p>',
    // `pre-wrap` conserva los saltos de línea tal como los escribió, sin
    // convertirlos en `<br>` a mano.
    '<div style="margin:0;padding:4px 0 4px 12px;border-left:3px solid #211f20;',
    `white-space:pre-wrap">${e(consulta.mensaje)}</div>`,
    '<p style="margin:24px 0 0;font-size:13px;color:#6b645c">',
    `Para contestar, usá «Responder»: la respuesta va directo a ${e(consulta.email)}.`,
    "</p></body></html>",
  ].join("");
}

/**
 * Manda la consulta. Devuelve `true` si Resend la aceptó.
 *
 * **Nunca lanza.** Cualquier falla —falta la clave, Resend no contesta, contesta
 * un error— termina en `false` y en una línea en los registros del Worker, que
 * es la única forma de enterarse después (`wrangler tail`, o los registros del
 * panel). El formulario convierte ese `false` en el aviso con WhatsApp.
 *
 * Lo que va a los registros es el tipo de falla y el código, **nunca el
 * contenido de la consulta**: el nombre, el email y el mensaje son datos de
 * alguien que no pidió que se guarden en ningún lado.
 */
export async function enviarConsulta(
  consulta: ConsultaParaEnviar,
): Promise<boolean> {
  const configuracion = configuracionDelCorreo();
  if (!configuracion.lista) {
    console.error(
      `[contacto] no se puede enviar: falta ${configuracion.faltan.join(" y ")} ` +
        "en el Worker. RESEND_API_KEY va como Secret; EMAIL_CONTACTO, en `vars` " +
        "de wrangler.jsonc. Ver docs/infraestructura.md.",
    );
    return false;
  }

  let respuesta: Response;
  try {
    respuesta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${configuracion.clave}`,
        "Content-Type": "application/json",
        "User-Agent": "espacio-cortinas-web",
      },
      body: JSON.stringify({
        from: REMITENTE,
        to: [configuracion.destino],
        reply_to: consulta.email,
        subject: asuntoDe(consulta),
        text: textoDe(consulta),
        html: htmlDe(consulta),
        tags: [{ name: "origen", value: "formulario" }],
      }),
      signal: AbortSignal.timeout(ESPERA_MAXIMA_MS),
    });
  } catch (fallo) {
    const causa =
      fallo instanceof Error && fallo.name === "TimeoutError"
        ? `no contestó en ${ESPERA_MAXIMA_MS / 1000} s`
        : `no se pudo conectar (${fallo instanceof Error ? fallo.name : "error"})`;
    console.error(`[contacto] Resend ${causa}.`);
    return false;
  }

  if (!respuesta.ok) {
    // El cuerpo de error de Resend dice qué pasó —«el dominio no está
    // verificado», «se agotó la cuota del día»— y no trae datos de quien
    // escribió. Se registra el nombre del error y su mensaje, recortado.
    const detalle = await respuesta
      .json()
      .then((cuerpo: { name?: string; message?: string }) =>
        [cuerpo.name, cuerpo.message].filter(Boolean).join(": ").slice(0, 200),
      )
      .catch(() => "sin detalle");
    console.error(
      `[contacto] Resend respondió ${respuesta.status}: ${detalle || "sin detalle"}`,
    );
    return false;
  }

  const { id } = (await respuesta.json().catch(() => ({}))) as { id?: string };
  console.info(`[contacto] consulta enviada (Resend ${id ?? "sin id"}).`);
  return true;
}
