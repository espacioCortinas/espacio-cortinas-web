#!/usr/bin/env node
/**
 * Compara el esquema REAL de Supabase contra el que dice el repositorio.
 *
 * Las migraciones de este proyecto son archivos .sql que se pegan a mano en el
 * SQL Editor (decisión 28). Eso es simple y no agrega dependencias, pero no
 * garantiza nada: una migración que quedó sin aplicar, o un cambio hecho desde
 * el panel de Supabase, no dejan ninguna huella en el repositorio. Con una sola
 * tanda de migraciones no importaba. Con más, sí.
 *
 * Este script cierra ese hueco — decisión 31:
 *
 *     npm run esquema              compara y avisa
 *     npm run esquema:actualizar   guarda la foto nueva
 *
 * Lo que se compara es una FOTO del esquema, no una lista de comprobaciones.
 * La diferencia importa: una lista solo encuentra lo que alguien se acordó de
 * escribir; una foto encuentra también lo que nadie previó —la columna que
 * alguien agregó a mano, la política que quedó de una prueba, el `revoke` que
 * no se llegó a correr.
 *
 * La foto vive versionada en supabase/esquema.txt. Después de aplicar una
 * migración se corre con --actualizar y el diff del commit muestra exactamente
 * qué cambió en la base. Si el diff trae algo que la migración no pedía, eso es
 * justamente lo que este script existe para encontrar.
 *
 * Sin dependencias nuevas: lee .env.local a mano y habla con PostgREST por
 * `fetch`. La clave que usa es la `service_role`, así que **solo corre en la
 * máquina de desarrollo** y nunca en el navegador ni en el Worker.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const ARCHIVO_FOTO = join(RAIZ, "supabase", "esquema.txt");

const actualizar = process.argv.includes("--actualizar");

/**
 * Se corta con una excepción propia en vez de llamar a `process.exit()`: en
 * Windows, terminar el proceso con la salida estándar conectada a una tubería
 * revienta con un assert de libuv y el código que llega es 127, que no es el
 * que se quiso devolver.
 */
class Fallo extends Error {}

function morir(mensaje) {
  throw new Fallo(mensaje);
}

/** Lee un .env sin dependencias. Solo `CLAVE=valor`, que es lo que hay. */
function leerEnv(ruta) {
  if (!existsSync(ruta)) return {};
  const valores = {};
  for (const cruda of readFileSync(ruta, "utf8").split("\n")) {
    const linea = cruda.trim();
    if (!linea || linea.startsWith("#")) continue;
    const corte = linea.indexOf("=");
    if (corte === -1) continue;
    valores[linea.slice(0, corte).trim()] = linea.slice(corte + 1).trim();
  }
  return valores;
}

async function pedirLaFoto() {
  const env = { ...leerEnv(join(RAIZ, ".env.local")), ...process.env };
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  const clave = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !clave) {
    morir(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.\n" +
        "  Se leen de .env.local. Copiá .env.example y completalo.",
    );
  }

  let respuesta;
  try {
    respuesta = await fetch(`${url}/rest/v1/rpc/verificar_esquema`, {
      method: "POST",
      headers: {
        apikey: clave,
        Authorization: `Bearer ${clave}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    });
  } catch (fallo) {
    morir(
      `No se pudo hablar con Supabase (${new URL(url).host}): ${fallo.message}\n` +
        "  Si el host directamente no resuelve, lo más probable es que el\n" +
        "  proyecto esté PAUSADO por inactividad. Se despausa con un clic\n" +
        "  desde el panel de Supabase — decisión 18.",
    );
  }

  if (respuesta.status === 404) {
    morir(
      "La base no tiene la función verificar_esquema().\n" +
        "  Aplicá supabase/migraciones/0003_verificacion_de_esquema.sql en el\n" +
        "  SQL Editor de Supabase y volvé a correr esto.",
    );
  }

  if (!respuesta.ok) {
    morir(`Supabase respondió ${respuesta.status}: ${await respuesta.text()}`);
  }

  const filas = await respuesta.json();
  return filas.map((f) => f.linea).join("\n") + "\n";
}

async function main() {
  const actual = await pedirLaFoto();
  const cuantas = actual.split("\n").filter(Boolean).length;

  if (actualizar) {
    writeFileSync(ARCHIVO_FOTO, actual);
    console.log(
      `\n✓ Foto del esquema guardada en supabase/esquema.txt (${cuantas} líneas).\n` +
        "  Revisá el diff antes de commitear: tiene que contener SOLO lo que\n" +
        "  pedía la migración que acabás de aplicar.\n",
    );
    return;
  }

  if (!existsSync(ARCHIVO_FOTO)) {
    morir(
      "No existe supabase/esquema.txt.\n" +
        "  Es la primera vez: corré `npm run esquema:actualizar`, revisá el\n" +
        "  archivo y commiteálo.",
    );
  }

  const esperado = readFileSync(ARCHIVO_FOTO, "utf8");

  if (esperado === actual) {
    console.log(
      `\n✓ La base coincide con el repositorio (${cuantas} líneas verificadas).\n`,
    );
    return;
  }

  // Diff por conjuntos, no posicional: las dos listas vienen ordenadas por la
  // propia función SQL, así que la diferencia de conjuntos alcanza y se lee
  // mucho mejor que un diff línea a línea.
  const enEsperado = new Set(esperado.split("\n").filter(Boolean));
  const enActual = new Set(actual.split("\n").filter(Boolean));

  const sobran = [...enActual].filter((l) => !enEsperado.has(l));
  const faltan = [...enEsperado].filter((l) => !enActual.has(l));

  console.error("\n✗ La base NO coincide con el repositorio.\n");

  if (faltan.length > 0) {
    console.error("  En el repositorio pero NO en la base");
    console.error(
      "  (una migración sin aplicar, o algo que se borró a mano):\n",
    );
    for (const l of faltan) console.error(`    - ${l}`);
    console.error("");
  }

  if (sobran.length > 0) {
    console.error("  En la base pero NO en el repositorio");
    console.error("  (un cambio hecho fuera de una migración):\n");
    for (const l of sobran) console.error(`    + ${l}`);
    console.error("");
  }

  console.error(
    "  Si el cambio es legítimo y ya está escrito en una migración, corré\n" +
      "  `npm run esquema:actualizar` y commiteá el diff.\n" +
      "  Si no lo reconocés, alguien tocó la base desde el panel de Supabase.\n",
  );

  process.exitCode = 1;
}

try {
  await main();
} catch (fallo) {
  if (fallo instanceof Fallo) {
    console.error(`\n✗ ${fallo.message}\n`);
    process.exitCode = 1;
  } else {
    throw fallo;
  }
}
