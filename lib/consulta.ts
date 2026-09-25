/**
 * La consulta del formulario de contacto: qué campos tiene, qué se acepta en
 * cada uno y qué devuelve el envío.
 *
 * **Es el mismo código en el navegador y en el servidor**, y por eso está acá y
 * no adentro de la Server Action. El navegador lo usa para avisar enseguida
 * —sin ir al servidor— que falta el email; el servidor lo vuelve a correr
 * entero sobre lo que llegó, porque lo que manda un navegador no es de fiar:
 * cualquiera puede armar el pedido a mano y saltearse esta pantalla.
 * `docs/seguridad.md`, «Formulario de contacto».
 *
 * Sin `server-only` y sin importar nada del proyecto: tiene que poder entrar
 * al paquete del navegador, y no hay nada secreto acá.
 *
 * # Cinco campos y ni uno más
 *
 * Cada campo cuesta consultas. Nombre, email, teléfono, qué está buscando y el
 * mensaje: ni presupuesto, ni cómo nos conoció, ni metros. **Obligatorios son
 * tres** —nombre, email y mensaje— y el email lo es por una razón concreta: es
 * el `Reply-To` del correo, lo que permite responder con un toque en vez de
 * copiar una dirección. Decisión 57.
 */

export const CAMPOS = [
  "nombre",
  "email",
  "telefono",
  "interes",
  "mensaje",
] as const;

export type Campo = (typeof CAMPOS)[number];

/** Lo que escribió la persona, ya limpio. Los opcionales vacíos son `""`. */
export type Consulta = Record<Campo, string>;

export type ErroresDeConsulta = Partial<Record<Campo, string>>;

/**
 * El campo trampa.
 *
 * Un campo que una persona no ve ni alcanza con el teclado, y que un robot que
 * completa todo lo que encuentra llena sin pensar. Si llega con algo escrito,
 * el mensaje se descarta **y se contesta como si hubiera salido**: decirle al
 * robot que lo detectamos solo le enseña a esquivarlo.
 *
 * El nombre está elegido para que **ningún autocompletado lo llene**: un
 * navegador sabe completar nombre, email, teléfono, dirección y empresa, y un
 * campo que se llamara «empresa» o «sitio web» podría llenarlo Safari con la
 * tarjeta de contacto de alguien de verdad, que perdería su consulta sin
 * enterarse. Un comentario adicional no lo autocompleta nadie.
 */
export const CAMPO_TRAMPA = "comentario_adicional";

/**
 * «Otra cosa»: lo que alguien busca y no está en el catálogo. La opción por
 * defecto es la vacía, «todavía no lo sé», que es la respuesta honesta de mucha
 * gente antes de que la asesoren.
 */
export const INTERES_OTRO = "otro";

/** Los topes, en caracteres. Los dice el mensaje de error, así que son pocos. */
export const TOPES = {
  nombre: 80,
  email: 254,
  telefono: 30,
  mensaje: 3000,
} as const;

/** Lo que devuelve el envío al navegador. Nada más viaja de vuelta. */
export type ResultadoDeConsulta =
  | { tipo: "enviada" }
  | { tipo: "invalida"; errores: ErroresDeConsulta }
  | { tipo: "fallida" };

/**
 * Saca los caracteres de control, que no se ven y no tienen nada que hacer en
 * un nombre ni en un asunto: un salto de línea en el nombre terminaría partiendo
 * el asunto del correo. El mensaje conserva los saltos de línea y nada más.
 */
function limpiarLinea(texto: string): string {
  return texto
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function limpiarParrafo(texto: string): string {
  return (
    texto
      .replace(/\r\n?/g, "\n")
      // Todos los de control salvo el salto de línea y el tabulador.
      .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "")
      // Más de dos líneas en blanco seguidas no dicen nada.
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

/**
 * Una dirección con la forma `algo@dominio.algo`, sin espacios.
 *
 * No es la gramática completa de un email, a propósito: esa admite cosas que
 * nadie usa y un error de tipeo se parece más a una dirección válida rara que
 * a una inválida. Lo que importa es atajar lo obvio —la arroba que falta, el
 * dominio sin punto, un espacio en el medio— y la prueba de verdad es que la
 * respuesta llegue.
 */
const FORMA_DE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Números, espacios, `+`, guiones, puntos y paréntesis: como la gente escribe. */
const FORMA_DE_TELEFONO = /^[\d\s+\-().]+$/;

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor : "";
}

/**
 * Limpia y valida lo que llegó. Devuelve los valores limpios **siempre**,
 * haya errores o no: con errores, el formulario los vuelve a mostrar tal cual
 * para que nadie tenga que escribir dos veces.
 *
 * `intereses` son los valores válidos del selector —los slugs del catálogo—, y
 * entran como parámetro para que este archivo no dependa del contenido: el
 * navegador los recibe de la página y el servidor los lee de `contenido/`.
 */
export function validarConsulta(
  crudos: Partial<Record<Campo, unknown>>,
  intereses: readonly string[],
): { consulta: Consulta; errores: ErroresDeConsulta } {
  const consulta: Consulta = {
    nombre: limpiarLinea(texto(crudos.nombre)),
    // Un espacio en el medio es un error de tipeo y se avisa: sacarlo a
    // escondidas convertiría «maria perez@…» en una dirección que no es suya.
    email: limpiarLinea(texto(crudos.email)),
    telefono: limpiarLinea(texto(crudos.telefono)),
    interes: limpiarLinea(texto(crudos.interes)),
    mensaje: limpiarParrafo(texto(crudos.mensaje)),
  };

  const errores: ErroresDeConsulta = {};

  if (!consulta.nombre) {
    errores.nombre = "Falta tu nombre.";
  } else if (consulta.nombre.length > TOPES.nombre) {
    errores.nombre = `El nombre es demasiado largo: hasta ${TOPES.nombre} letras.`;
  }

  if (!consulta.email) {
    errores.email = "Falta tu email: es adonde te respondemos.";
  } else if (
    consulta.email.length > TOPES.email ||
    !FORMA_DE_EMAIL.test(consulta.email)
  ) {
    errores.email = "Revisá el email: tiene que ser como nombre@ejemplo.com.";
  }

  // Opcional. Si viene, tiene que parecer un teléfono: entre 6 y 15 cifras, que
  // van de un fijo sin característica a un celular con el código del país.
  if (consulta.telefono) {
    const cifras = consulta.telefono.replace(/\D/g, "").length;
    if (
      consulta.telefono.length > TOPES.telefono ||
      !FORMA_DE_TELEFONO.test(consulta.telefono) ||
      cifras < 6 ||
      cifras > 15
    ) {
      errores.telefono =
        "Revisá el teléfono: números, espacios y guiones, como 11 2345-6789.";
    }
  }

  // Opcional, y de una lista cerrada. Un valor que no está en la lista solo
  // llega armando el pedido a mano, así que no se explica demasiado.
  if (
    consulta.interes &&
    consulta.interes !== INTERES_OTRO &&
    !intereses.includes(consulta.interes)
  ) {
    errores.interes = "Elegí una opción de la lista.";
  }

  if (!consulta.mensaje) {
    errores.mensaje = "Contanos qué necesitás.";
  } else if (consulta.mensaje.length > TOPES.mensaje) {
    errores.mensaje =
      `El mensaje es demasiado largo: tiene ${consulta.mensaje.length.toLocaleString("es-AR")} ` +
      `caracteres y entran hasta ${TOPES.mensaje.toLocaleString("es-AR")}.`;
  }

  return { consulta, errores };
}

/** Lo que trae un `FormData` en cada campo, sin interpretar. */
export function camposDe(datos: FormData): Partial<Record<Campo, unknown>> {
  return Object.fromEntries(CAMPOS.map((campo) => [campo, datos.get(campo)]));
}
