#!/usr/bin/env node
/**
 * Prepara los dos archivos de marca que el sitio necesita y que no son fotos:
 * el logo del encabezado y la imagen de Open Graph de reserva.
 *
 *     node scripts/preparar-marca.mjs
 *
 *     fotos-originales/logo.jpg  ─┬─→  public/marca/logo.png   transparente
 *                                 └─→  public/marca/og.jpg     1200×630
 *     public/fotos/…/cortinas-tela/1/1600.webp  ─┘
 *
 *                                      contenido/marca.ts      el manifiesto
 *
 * Es hermano de `preparar-fotos.mjs` y sigue sus mismas dos reglas:
 *
 * - **los datos técnicos los calcula el script**, no una persona: el ancho y el
 *   alto de los dos archivos se escriben en `contenido/marca.ts` y de ahí los
 *   leen los componentes, igual que `contenido/fotos.ts` (CLAUDE.md, regla 4);
 * - **no se versiona el original.** `fotos-originales/logo.jpg` es el archivo
 *   que mandó la empresa; lo que se publica sale de acá.
 *
 * ## Por qué hay que recortar el fondo blanco
 *
 * El logo llegó como JPG con fondo blanco, y el sitio es papel de cal
 * `#F6F2EC`. Pegado tal cual, el encabezado de todas las páginas tendría un
 * recuadro blanco alrededor del logo. Así que se le saca el fondo — ver
 * `sacarElFondoBlanco()`, que explica por qué no alcanza con «hacer
 * transparente lo blanco».
 *
 * ## Lo que este script NO hace
 *
 * **No genera favicon.** Quedó pendiente a propósito: el círculo amarillo del
 * logo viene cortado por el borde superior del archivo fuente y la «e» lo pisa,
 * así que un recorte literal sale sucio, y cualquier otra cosa sería un lockup
 * nuevo que la empresa no autorizó. Decisión 45.
 *
 * **No dibuja texto.** La imagen de Open Graph lleva el logo y una foto real
 * del archivo, y nada más. Componer texto acá significaría resolver fuentes con
 * `fontconfig` desde `sharp`, que da un resultado distinto en cada máquina; y
 * el título y la descripción ya viajan en las etiquetas de Open Graph, que es
 * donde WhatsApp los lee.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import prettier from "prettier";
import sharp from "sharp";

import { IMAGEN_CALIDAD } from "../lib/constantes.ts";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOGO_ORIGINAL = join(RAIZ, "fotos-originales", "logo.jpg");
const DESTINO = join(RAIZ, "public", "marca");
const MANIFIESTO = join(RAIZ, "contenido", "marca.ts");

/**
 * La foto del archivo que va en la imagen de Open Graph.
 *
 * Es `cortinas-tela/1`, que `docs/diseno.md` describe como la mejor del
 * archivo —«luz, caída, sombras en el piso, ambiente vacío»— y es una de las
 * cuatro que el documento habilita a mostrar grandes. Se usa la medida de
 * 1600 px, que sobra para los 656 px de ancho que ocupa en la tarjeta.
 */
const FOTO_OG = join(
  RAIZ,
  "public",
  "fotos",
  "productos",
  "cortinas-tela",
  "1",
  "1600.webp",
);

/** El papel de cal de `app/globals.css`. Los dos valores son el mismo token. */
const PAPEL = "#f6f2ec";

/** Lo que piden WhatsApp, Facebook y Twitter: 1,91:1. */
const OG_ANCHO = 1200;
const OG_ALTO = 630;
/** Margen de la tarjeta. La foto tampoco llega al borde acá — `docs/diseno.md`. */
const OG_MARGEN = 48;

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

async function main() {
  mkdirSync(DESTINO, { recursive: true });

  /* --- El logo del encabezado ---------------------------------------- */

  const logo = await sacarElFondoBlanco(LOGO_ORIGINAL);
  const rutaLogo = join(DESTINO, "logo.png");
  const infoLogo = await logo
    .clone()
    .png({ compressionLevel: 9 })
    .toFile(rutaLogo);

  console.log(
    `  logo.png  ${infoLogo.width}×${infoLogo.height}  ${(infoLogo.size / 1024).toFixed(1)} kB`,
  );

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

  /* --- La imagen de Open Graph de reserva ----------------------------- */

  /*
   * La composición es la del sitio, no una tarjeta aparte: papel, la foto
   * dentro de su margen sin llegar a ningún borde, y el logo al lado. Sin texto
   * sobre la foto, que en esta dirección no se hace nunca (`docs/diseno.md`).
   */
  const anchoFoto = 656;
  const altoFoto = OG_ALTO - OG_MARGEN * 2;

  const foto = await sharp(FOTO_OG)
    .resize({
      width: anchoFoto,
      height: altoFoto,
      fit: "cover",
      // Recorte alto: el piso es la zona más oscura y más desordenada de casi
      // todas las fotos del archivo (`docs/diseno.md`).
      position: "top",
    })
    .toBuffer();

  // El ancho del logo dentro de la tarjeta sale de la columna que le queda
  // libre, no de un número suelto: así los dos márgenes laterales son el mismo.
  const columna = OG_ANCHO - anchoFoto - OG_MARGEN * 3;
  const anchoLogoOg = Math.round(columna * 0.86);
  const logoOg = await logo
    .clone()
    .resize({ width: anchoLogoOg })
    .png()
    .toBuffer();
  const altoLogoOg = Math.round(
    (anchoLogoOg * infoLogo.height) / infoLogo.width,
  );

  const rutaOg = join(DESTINO, "og.jpg");
  const infoOg = await sharp({
    create: {
      width: OG_ANCHO,
      height: OG_ALTO,
      channels: 4,
      background: PAPEL,
    },
  })
    .composite([
      {
        input: logoOg,
        left: OG_MARGEN + Math.round((columna - anchoLogoOg) / 2),
        top: Math.round((OG_ALTO - altoLogoOg) / 2),
      },
      {
        input: foto,
        left: OG_ANCHO - OG_MARGEN - anchoFoto,
        top: OG_MARGEN,
      },
    ])
    .flatten({ background: PAPEL })
    .jpeg({ quality: Math.round(IMAGEN_CALIDAD * 100) })
    .toFile(rutaOg);

  console.log(
    `  og.jpg    ${infoOg.width}×${infoOg.height}  ${(infoOg.size / 1024).toFixed(1)} kB`,
  );

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

/** El logo, sin fondo, para el encabezado. */
export const logo: ArchivoDeMarca = {
  ruta: "/marca/logo.png",
  ancho: ${infoLogo.width},
  alto: ${infoLogo.height},
};

/**
 * La imagen que se ve al pegar en WhatsApp un enlace que no tiene foto propia:
 * Inicio, los dos listados y Contacto.
 */
export const og: ArchivoDeMarca = {
  ruta: "/marca/og.jpg",
  ancho: ${infoOg.width},
  alto: ${infoOg.height},
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
