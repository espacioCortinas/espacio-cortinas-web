"use server";

import { productosPublicados } from "@/contenido";
import {
  CAMPO_TRAMPA,
  INTERES_OTRO,
  camposDe,
  validarConsulta,
  type ResultadoDeConsulta,
} from "@/lib/consulta";
import { enviarConsulta } from "@/lib/correo";

/**
 * La Server Action del formulario de contacto.
 *
 * **Es lo único del sitio que ejecuta código en respuesta a algo que manda un
 * desconocido**: todo lo demás se generó en el build. Por eso es corta y por
 * eso desconfía de todo lo que recibe (`docs/seguridad.md`):
 *
 *     1. el campo trampa      si viene lleno, se descarta sin avisar
 *     2. la validación        la misma del navegador, corrida de nuevo acá
 *     3. el envío             un pedido a Resend, y nada más
 *
 * **No calcula nada.** El plan gratuito de Workers da 10 ms de CPU por
 * pedido, y esperar la respuesta de Resend no cuenta: es espera de red, no
 * cómputo. Lo que sí cuesta CPU acá es leer el formulario y armar dos textos
 * de un par de kilobytes.
 *
 * **El límite de envíos no está acá**: sin base ni KV no hay un contador que
 * compartan las instancias del Worker, y uno en memoria lo reinicia cualquier
 * instancia nueva. Lo pone una regla de rate limiting en el borde de
 * Cloudflare, antes de que el pedido llegue a este código — decisión 58.
 */
export async function enviarFormularioDeContacto(
  datos: FormData,
): Promise<ResultadoDeConsulta> {
  // 1. El campo trampa. Una persona no lo ve ni lo alcanza con el teclado;
  // un robot que llena todo, sí. Se contesta «enviada» a propósito: avisarle
  // que lo detectamos es enseñarle a esquivarlo. La línea del registro es lo
  // que permite comprobar que el descarte funciona, y no dice nada de quién.
  const trampa = datos.get(CAMPO_TRAMPA);
  if (typeof trampa === "string" && trampa.trim() !== "") {
    console.warn("[contacto] descartada: el campo trampa llegó completo.");
    return { tipo: "enviada" };
  }

  // 2. La validación, sobre lo que llegó y no sobre lo que el navegador dijo
  // que validó.
  const productos = productosPublicados();
  const { consulta, errores } = validarConsulta(
    camposDe(datos),
    productos.map((producto) => producto.slug),
  );
  if (Object.keys(errores).length > 0) {
    return { tipo: "invalida", errores };
  }

  const interesLegible =
    consulta.interes === INTERES_OTRO
      ? "Otra cosa"
      : (productos.find((p) => p.slug === consulta.interes)?.nombre ?? null);

  // 3. El envío. Si falla, el navegador conserva lo escrito y ofrece WhatsApp.
  const enviada = await enviarConsulta({ ...consulta, interesLegible });
  return enviada ? { tipo: "enviada" } : { tipo: "fallida" };
}
