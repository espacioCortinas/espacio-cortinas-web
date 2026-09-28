#!/usr/bin/env node
/**
 * Prepara el archivo de marca que el sitio necesita y que no es una foto: el
 * logo del encabezado.
 *
 *     node scripts/preparar-marca.mjs
 *
 *     fotos-originales/logo.jpg  ──→  public/marca/logo.png   transparente
 *
 *                                     contenido/marca.ts      el manifiesto
 *
 * Es hermano de `preparar-fotos.mjs` y sigue sus mismas reglas:
 *
 * - **los datos técnicos los calcula el script**, no una persona: el ancho y el
 *   alto del logo se escriben en `contenido/marca.ts` y de ahí los lee el
 *   componente, igual que `contenido/fotos.ts` (CLAUDE.md, regla 4);
 * - **no se versiona el original.** `fotos-originales/logo.jpg` es el archivo
 *   que mandó la empresa; lo que se publica sale de acá;
 * - **lo publicado no se reescribe con otros bytes.** `sharp` es determinista:
 *   con la misma entrada y los mismos parámetros da el mismo archivo, así que
 *   correr esto de nuevo no toca nada.
 *
 * ## Por qué hay que recortar el fondo blanco
 *
 * El logo llegó como JPG con fondo blanco, y el sitio es papel de cal
 * `#F6F2EC`. Pegado tal cual, el encabezado de todas las páginas tendría un
 * recuadro blanco alrededor del logo. Así que se le saca el fondo — ver
 * `sacarElFondoBlanco()`, que explica por qué no alcanza con «hacer
 * transparente lo blanco».
 *
 * ## La imagen para compartir ya no sale de acá — decisiones 63 y 64
 *
 * Salió de acá dos veces: el logo a la izquierda y una foto a la derecha
 * (decisión 59), que WhatsApp recortaba desde el centro, y después el logo
 * solo, centrado sobre el papel (decisión 62), igual para todas las páginas.
 * **Ahora es una foto por página, con este logo centrado en una banda de
 * papel abajo.** La arma `scripts/preparar-compartir.mjs`, que parte de las
 * fotos y usa el `logo.png` que escribe este script. Por eso `npm run marca`
 * la vuelve a armar al terminar: si el logo cambia, las doce cambian con él.
 *
 * ## Lo que este script NO hace
 *
 * **No genera favicon.** Quedó pendiente a propósito: el círculo amarillo del
 * logo viene cortado por el borde superior del archivo fuente y la «e» lo pisa,
 * así que un recorte literal sale sucio, y cualquier otra cosa sería un lockup
 * nuevo que la empresa no autorizó. Decisión 45.
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import prettier from "prettier";
import sharp from "sharp";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOGO_ORIGINAL = join(RAIZ, "fotos-originales", "logo.jpg");
const DESTINO = join(RAIZ, "public", "marca");
const MANIFIESTO = join(RAIZ, "contenido", "marca.ts");

/**
 * Le saca el fondo blanco al logo, dejando los bordes limpios sobre cualquier
 * color.
 *
 * **No alcanza con «lo que es blanco se vuelve transparente».** El JPG tiene
 * texto negro sobre blanco, así que entre la letra y el fondo hay una banda de
 * grises de suavizado. Si esos grises se dejan opacos, sobre el papel de cal se
 * ven como un halo gris alrededor de cada letra; si se vuelven transparentes de
 * golpe, las letras quedan dentadas.
 *
 * Lo que hace es deshacer la mezcla. Un píxel gris no es «gris»: es negro
 * tapado por blanco. Si el original se compuso sobre blanco,
 *
 *     visto = real × α + 255 × (1 − α)
 *
 * y como el negro y el amarillo del logo tienen los dos un canal en 0, el canal
 * más bajo del píxel dice cuánto blanco se mezcló:
 *
 *     α    = 1 − min(r, g, b) / 255
 *     real = (visto − 255 × (1 − α)) / α
 *
 * Así el suavizado sobrevive como transparencia y no como color, que es lo que
 * hace que el mismo archivo sirva sobre el papel, sobre blanco o sobre negro.
 *
 * El umbral de 248 es contra el ruido del JPEG: el fondo no es exactamente
 * `#FFFFFF` en todos lados —se midieron píxeles en 253— y sin el umbral esas
 * diferencias quedarían como una mugre apenas visible sobre el papel.
 */
async function sacarElFondoBlanco(ruta) {
  const { data, info } = await sharp(ruta)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const salida = Buffer.alloc(info.width * info.height * 4);

  for (let i = 0; i < info.width * info.height; i += 1) {
    const o = i * info.channels;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const minimo = Math.min(r, g, b);

    if (minimo >= 248) {
      // Fondo. Los cuatro canales quedan en 0: transparente y sin color
      // guardado debajo, que es lo que evita el halo al escalar.
      continue;
    }

    const alfa = 1 - minimo / 255;
    const blanco = 255 * (1 - alfa);
    const p = i * 4;
    salida[p] = Math.max(0, Math.min(255, Math.round((r - blanco) / alfa)));
    salida[p + 1] = Math.max(0, Math.min(255, Math.round((g - blanco) / alfa)));
    salida[p + 2] = Math.max(0, Math.min(255, Math.round((b - blanco) / alfa)));
    salida[p + 3] = Math.round(alfa * 255);
  }

  return (
    sharp(salida, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      // Recorta el aire que le sobra al archivo fuente. Lo que queda es el logo
      // exacto, así que el componente lo puede alinear con el texto sin tener que
      // compensar un margen que no se ve.
      .trim({ threshold: 0 })
  );
}

const kB = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

async function main() {
  mkdirSync(DESTINO, { recursive: true });

  /* --- El logo del encabezado ---------------------------------------- */

  /*
   * Sin el original —que vive en el Drive de la empresa y no se versiona— se
   * usa el logo ya publicado y no se lo reescribe: el script anda igual en una
   * máquina que no tenga el archivo de la empresa.
   */
  const rutaLogo = join(DESTINO, "logo.png");
  let logo;
  let infoLogo;

  if (existsSync(LOGO_ORIGINAL)) {
    logo = await sacarElFondoBlanco(LOGO_ORIGINAL);
    infoLogo = await logo.clone().png({ compressionLevel: 9 }).toFile(rutaLogo);
    console.log(
      `  logo.png     ${infoLogo.width}×${infoLogo.height}  ${kB(infoLogo.size)}`,
    );
  } else {
    logo = sharp(rutaLogo);
    const meta = await logo.metadata();
    infoLogo = { width: meta.width, height: meta.height };
    console.log(
      `  logo.png     sin el original en fotos-originales/: se usa el publicado, sin tocarlo`,
    );
  }

  // El logo del encabezado se muestra a 168 px de ancho como máximo. Con
  // pantallas de triple densidad eso pide 504 px de archivo, y el original
  // tiene 524: entra justo. Si algún día el logo se quiere ver más grande, hace
  // falta el vector que `docs/diseno.md` todavía le está pidiendo a la empresa.
  if (infoLogo.width < 504) {
    console.warn(
      `  ! el logo quedó en ${infoLogo.width} px de ancho. A 168 px de ancho en ` +
        `pantalla, una pantalla de triple densidad pide 504: se va a ver blando.`,
    );
  }

  /* --- El manifiesto -------------------------------------------------- */

  const fuente = `/**
 * ARCHIVO GENERADO por \`scripts/preparar-marca.mjs\`. NO SE EDITA A MANO:
 * se pisa entero en cada corrida.
 *
 * Las medidas se leen de acá y no se escriben en el código, por la misma razón
 * que las de las fotos: son un dato del archivo que se generó, no una cuenta
 * que alguien pueda hacer mal. Con \`ancho\` y \`alto\` el navegador reserva el
 * espacio del logo antes de descargarlo y el encabezado no salta.
 */

export type ArchivoDeMarca = {
  /** Ruta pública, para usar tal cual en \`src\`. */
  ruta: string;
  ancho: number;
  alto: number;
};

/**
 * El logo, sin fondo, para el encabezado.
 *
 * La imagen para compartir ya no está acá: es una foto por página, en
 * \`contenido/imagenes-para-compartir.ts\` — decisión 63.
 */
export const logo: ArchivoDeMarca = {
  ruta: "/marca/logo.png",
  ancho: ${infoLogo.width},
  alto: ${infoLogo.height},
};
`;

  const config = await prettier.resolveConfig(MANIFIESTO);
  writeFileSync(
    MANIFIESTO,
    await prettier.format(fuente, { ...config, filepath: MANIFIESTO }),
    "utf8",
  );

  console.log(`  contenido/marca.ts escrito`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
