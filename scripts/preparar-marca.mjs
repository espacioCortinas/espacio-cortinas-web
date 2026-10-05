#!/usr/bin/env node
/**
 * Prepara el archivo de marca que el sitio necesita y que no es una foto: el
 * logo del encabezado.
 *
 *     node scripts/preparar-marca.mjs
 *
 *     fotos-originales/logo-vacio.png  ──→  public/marca/logo.png   600 px
 *
 *                                           contenido/marca.ts      el manifiesto
 *
 * Es hermano de `preparar-fotos.mjs` y sigue sus mismas reglas:
 *
 * - **los datos técnicos los calcula el script**, no una persona: el ancho y el
 *   alto del logo se escriben en `contenido/marca.ts` y de ahí los lee el
 *   componente, igual que `contenido/fotos.ts` (CLAUDE.md, regla 4);
 * - **no se versiona el original.** `fotos-originales/logo-vacio.png` es el
 *   archivo que mandó la empresa; lo que se publica sale de acá;
 * - **lo publicado no se reescribe con otros bytes.** `sharp` es determinista
 *   —también con la paleta, se comprobó—: con la misma entrada y los mismos
 *   parámetros da el mismo archivo, así que correr esto de nuevo no toca nada.
 *
 * ## El logo es el del boceto de la empresa — Fase 4.7
 *
 * Hasta la Fase 4.7 el logo era un JPG con fondo blanco y el círculo amarillo
 * relleno, y este script le sacaba el fondo deshaciendo la mezcla con el
 * blanco (decisión 44). **El de ahora es otro dibujo**: dos círculos de línea
 * en lugar del círculo amarillo, todo en un solo gris carbón, y llegó como PNG
 * ya transparente. No hay fondo que sacar, así que esa parte se fue.
 *
 * El amarillo no se reemplazó por otro color dentro del logo: el azul verdoso
 * de la marca nueva es el del bloque sobre el que el boceto lo apoya, no una
 * tinta del dibujo.
 *
 * ## Por qué 600 px, y por qué con paleta
 *
 * **600 es el triple del ancho más grande al que se muestra**, 200 px en el
 * encabezado de escritorio: alcanza para una pantalla de triple densidad. El
 * original tiene 1.695 y publicarlo entero sería mandar casi diez veces los
 * píxeles que se ven, en todas las páginas.
 *
 * **La paleta lo deja en 19,6 kB contra 45 en color completo**, y no se nota:
 * el dibujo es un solo gris con su suavizado, que son niveles de transparencia,
 * y 256 entradas alcanzan para todos. Medido contra la versión en color
 * completo, compuesta sobre blanco, la diferencia media por canal es 0,08 sobre
 * 255, y la máxima 8,5 en un puñado de píxeles de borde.
 *
 * ## La imagen para compartir no sale de acá — decisiones 63 y 64
 *
 * **Es una foto por página, con este logo centrado en una banda abajo.** La
 * arma `scripts/preparar-compartir.mjs`, que parte de las fotos y usa el
 * `logo.png` que escribe este script. Por eso `npm run marca` la vuelve a armar
 * al terminar: si el logo cambia, las doce cambian con él.
 *
 * ## Lo que este script NO hace
 *
 * **No genera favicon** todavía. Con el círculo amarillo quedó pendiente a
 * propósito —decisión 45—; con los círculos de línea se hace en la etapa 5 de
 * la Fase 4.7 (`docs/plan.md`).
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import prettier from "prettier";
import sharp from "sharp";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOGO_ORIGINAL = join(RAIZ, "fotos-originales", "logo-vacio.png");
const DESTINO = join(RAIZ, "public", "marca");
const MANIFIESTO = join(RAIZ, "contenido", "marca.ts");

/**
 * El ancho del archivo publicado: el triple de los 200 px a los que se muestra
 * en el encabezado de escritorio. `components/logo.tsx` tiene el otro lado de
 * esta cuenta.
 */
const ANCHO_PUBLICADO = 600;

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
  let infoLogo;

  if (existsSync(LOGO_ORIGINAL)) {
    const original = await sharp(LOGO_ORIGINAL).metadata();
    if (original.width < ANCHO_PUBLICADO) {
      console.warn(
        `  ! el original mide ${original.width} px de ancho y se publica a ` +
          `${ANCHO_PUBLICADO}: se va a agrandar, y agrandar no agrega detalle.`,
      );
    }

    infoLogo = await sharp(LOGO_ORIGINAL)
      // Recorta el aire transparente que pudiera traer el archivo: lo que queda
      // es el logo exacto, y el componente lo alinea con el texto sin
      // compensar un margen que no se ve. El de la Fase 4.7 no traía, pero el
      // próximo puede traer.
      .trim({ threshold: 0 })
      .resize({ width: ANCHO_PUBLICADO })
      .png({
        compressionLevel: 9,
        palette: true,
        quality: 100,
        colors: 256,
        effort: 10,
      })
      .toFile(rutaLogo);

    console.log(
      `  logo.png     ${infoLogo.width}×${infoLogo.height}  ${kB(infoLogo.size)}`,
    );
  } else {
    const meta = await sharp(rutaLogo).metadata();
    infoLogo = { width: meta.width, height: meta.height };
    console.log(
      `  logo.png     sin el original en fotos-originales/: se usa el publicado, sin tocarlo`,
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
