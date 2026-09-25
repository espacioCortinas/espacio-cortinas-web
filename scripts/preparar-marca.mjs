#!/usr/bin/env node
/**
 * Prepara los archivos de marca que el sitio necesita y que no son fotos de
 * galería: el logo del encabezado y las imágenes de Open Graph.
 *
 *     node scripts/preparar-marca.mjs
 *
 *     fotos-originales/logo.jpg  ─┬─→  public/marca/logo.png   transparente
 *                                 ├─→  public/marca/og.jpg     1200×630, la de reserva
 *     public/fotos/…/cortinas-tela/1/1600.webp  ─┘
 *
 *     la portada de cada producto  ─→  public/og/productos/<slug>.jpg   1200×630
 *     y de cada proyecto           ─→  public/og/proyectos/<slug>.jpg
 *
 *                                      contenido/marca.ts      el manifiesto
 *
 * **Corre solo después de `npm run fotos`**, que lo encadena: la imagen de Open
 * Graph de una página sale de su portada, así que cada vez que cambian las
 * fotos cambia con ellas, sin un segundo comando que alguien tenga que
 * acordarse de correr. También se puede correr suelto con `npm run marca`.
 *
 * Es hermano de `preparar-fotos.mjs` y sigue sus mismas reglas:
 *
 * - **los datos técnicos los calcula el script**, no una persona: el ancho y el
 *   alto de cada archivo se escriben en `contenido/marca.ts` y de ahí los leen
 *   los componentes, igual que `contenido/fotos.ts` (CLAUDE.md, regla 4);
 * - **no se versiona el original.** `fotos-originales/logo.jpg` es el archivo
 *   que mandó la empresa; lo que se publica sale de acá;
 * - **lo publicado no se reescribe con otros bytes.** `sharp` es determinista:
 *   con la misma entrada y los mismos parámetros da el mismo archivo, así que
 *   correr esto de nuevo no toca nada que no haya cambiado. Si alguien cambia
 *   un número de la composición, cambian todas las imágenes a la vez y su peso
 *   se suma a la historia de git — ver `docs/decisiones.md`, decisión 48.
 *
 * ## Por qué hay que recortar el fondo blanco
 *
 * El logo llegó como JPG con fondo blanco, y el sitio es papel de cal
 * `#F6F2EC`. Pegado tal cual, el encabezado de todas las páginas tendría un
 * recuadro blanco alrededor del logo. Así que se le saca el fondo — ver
 * `sacarElFondoBlanco()`, que explica por qué no alcanza con «hacer
 * transparente lo blanco».
 *
 * ## Por qué una imagen de Open Graph por página — decisión 59
 *
 * Hasta la Fase 4.6, un producto compartido por WhatsApp llevaba su portada:
 * un WebP vertical 4:5. Los generadores de previsualización muestran la imagen
 * grande solo cuando es apaisada, cerca de 1,91:1, así que una portada vertical
 * salía como miniatura chica al costado del texto — justo en el sitio que se
 * eligió Next para que sus enlaces se vean bien al compartirlos (decisión 1).
 *
 * Ahora cada producto y cada proyecto tiene la suya, **con la misma
 * composición que la de reserva**: papel, el logo a la izquierda y la portada a
 * la derecha, dentro del margen. Es la que ya se compartía bien, y con ella
 * cada enlace se reconoce como de la marca. La portada se recorta a 656 × 534
 * desde arriba y conserva el 65 % de su alto; a sangre, en 1,91:1, habría
 * conservado el 42 % y se perdía la caída de la cortina.
 *
 * Y en JPEG, no en WebP: es el único formato que lee cualquier bot de
 * previsualización, incluidos los viejos.
 *
 * ## Lo que este script NO hace
 *
 * **No genera favicon.** Quedó pendiente a propósito: el círculo amarillo del
 * logo viene cortado por el borde superior del archivo fuente y la «e» lo pisa,
 * así que un recorte literal sale sucio, y cualquier otra cosa sería un lockup
 * nuevo que la empresa no autorizó. Decisión 45.
 *
 * **No dibuja texto.** Las imágenes de Open Graph llevan el logo y una foto real
 * del archivo, y nada más. Componer texto acá significaría resolver fuentes con
 * `fontconfig` desde `sharp`, que da un resultado distinto en cada máquina; y
 * el título y la descripción ya viajan en las etiquetas de Open Graph, que es
 * donde WhatsApp los lee.
 */

import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import prettier from "prettier";
import sharp from "sharp";

import { fotos } from "../contenido/fotos.ts";
import { IMAGEN_CALIDAD } from "../lib/constantes.ts";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOGO_ORIGINAL = join(RAIZ, "fotos-originales", "logo.jpg");
const DESTINO = join(RAIZ, "public", "marca");
const DESTINO_OG = join(RAIZ, "public", "og");
const MANIFIESTO = join(RAIZ, "contenido", "marca.ts");

/**
 * La foto del archivo que va en la imagen de Open Graph de reserva.
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
/** El ancho de la foto dentro de la tarjeta. El alto es lo que dejan los márgenes. */
const OG_ANCHO_FOTO = 656;

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

/**
 * Compone una imagen de Open Graph: el papel, el logo en la columna izquierda y
 * la foto a la derecha, dentro de su margen.
 *
 * **Es la composición de la de reserva, sin cambiar un número**, y la usan las
 * dos cosas: la de reserva y la de cada página. Si esta función cambiara, la
 * de reserva saldría con otros bytes y habría que decidirlo a propósito.
 *
 * Sin texto sobre la foto, que en esta dirección no se hace nunca
 * (`docs/diseno.md`).
 */
async function componerOg(rutaFoto, destino, logoOg) {
  const altoFoto = OG_ALTO - OG_MARGEN * 2;

  const foto = await sharp(rutaFoto)
    .resize({
      width: OG_ANCHO_FOTO,
      height: altoFoto,
      fit: "cover",
      // Recorte alto: el piso es la zona más oscura y más desordenada de casi
      // todas las fotos del archivo (`docs/diseno.md`).
      position: "top",
    })
    .toBuffer();

  return sharp({
    create: {
      width: OG_ANCHO,
      height: OG_ALTO,
      channels: 4,
      background: PAPEL,
    },
  })
    .composite([
      {
        input: logoOg.buffer,
        left: OG_MARGEN + Math.round((logoOg.columna - logoOg.ancho) / 2),
        top: Math.round((OG_ALTO - logoOg.alto) / 2),
      },
      {
        input: foto,
        left: OG_ANCHO - OG_MARGEN - OG_ANCHO_FOTO,
        top: OG_MARGEN,
      },
    ])
    .flatten({ background: PAPEL })
    .jpeg({ quality: Math.round(IMAGEN_CALIDAD * 100) })
    .toFile(destino);
}

/**
 * La medida de la portada de la que se parte: la más grande que no pase de
 * 1600, que es la misma que usa la de reserva. Sobra para los 656 px de la
 * tarjeta, y usar la misma medida en todas hace que la imagen de Cortinas de
 * tela salga idéntica a la de reserva —misma foto, misma composición— y git la
 * guarde una sola vez.
 *
 * Se lee del manifiesto qué medidas existen, nunca se supone (decisión 32).
 */
function medidaDeOrigen(foto) {
  const hasta1600 = foto.medidas.filter((ancho) => ancho <= 1600);
  return hasta1600.length > 0
    ? Math.max(...hasta1600)
    : Math.min(...foto.medidas);
}

const kB = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

async function main() {
  mkdirSync(DESTINO, { recursive: true });

  /* --- El logo del encabezado ---------------------------------------- */

  /*
   * Sin el original —que vive en el Drive de la empresa y no se versiona— se
   * usa el logo ya publicado y no se lo reescribe. Así `npm run fotos`, que
   * encadena este script, anda igual en una máquina que tenga solo las fotos.
   */
  const rutaLogo = join(DESTINO, "logo.png");
  let logo;
  let infoLogo;

  if (existsSync(LOGO_ORIGINAL)) {
    logo = await sacarElFondoBlanco(LOGO_ORIGINAL);
    infoLogo = await logo.clone().png({ compressionLevel: 9 }).toFile(rutaLogo);
    console.log(
      `  logo.png  ${infoLogo.width}×${infoLogo.height}  ${kB(infoLogo.size)}`,
    );
  } else {
    logo = sharp(rutaLogo);
    const meta = await logo.metadata();
    infoLogo = { width: meta.width, height: meta.height };
    console.log(
      `  logo.png  sin el original en fotos-originales/: se usa el publicado, sin tocarlo`,
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

  /* --- El logo, a la medida de la tarjeta ------------------------------- */

  // El ancho del logo dentro de la tarjeta sale de la columna que le queda
  // libre, no de un número suelto: así los dos márgenes laterales son el mismo.
  const columna = OG_ANCHO - OG_ANCHO_FOTO - OG_MARGEN * 3;
  const anchoLogoOg = Math.round(columna * 0.86);
  const logoOg = {
    buffer: await logo.clone().resize({ width: anchoLogoOg }).png().toBuffer(),
    ancho: anchoLogoOg,
    alto: Math.round((anchoLogoOg * infoLogo.height) / infoLogo.width),
    columna,
  };

  /* --- La imagen de Open Graph de reserva ----------------------------- */

  const infoOg = await componerOg(FOTO_OG, join(DESTINO, "og.jpg"), logoOg);
  console.log(
    `  og.jpg    ${infoOg.width}×${infoOg.height}  ${kB(infoOg.size)}`,
  );

  /* --- La de cada producto y cada proyecto ----------------------------- */

  /*
   * Una por cada clave de `contenido/fotos.ts` que sea `<entidad>/<slug>`: las
   * de tres partes son variantes, que no tienen página propia. La carpeta se
   * vacía antes, así que un producto que se sacó no deja su imagen publicada.
   */
  rmSync(DESTINO_OG, { recursive: true, force: true });
  const porPagina = {};

  for (const [clave, fotosDeLaClave] of Object.entries(fotos)) {
    const partes = clave.split("/");
    const portada = fotosDeLaClave[0];
    if (partes.length !== 2 || !portada) continue;

    const [entidad, slug] = partes;
    const origen = join(
      RAIZ,
      "public",
      "fotos",
      portada.carpeta,
      `${medidaDeOrigen(portada)}.${portada.formato}`,
    );
    mkdirSync(join(DESTINO_OG, entidad), { recursive: true });
    const destino = join(DESTINO_OG, entidad, `${slug}.jpg`);

    const info = await componerOg(origen, destino, logoOg);
    porPagina[clave] = {
      ruta: `/og/${entidad}/${slug}.jpg`,
      ancho: info.width,
      alto: info.height,
    };
    console.log(
      `  og/${`${clave}.jpg`.padEnd(34)} ${info.width}×${info.height}  ${kB(info.size)}`,
    );
  }

  /* --- El manifiesto -------------------------------------------------- */

  const filas = Object.entries(porPagina)
    .map(
      ([clave, a]) =>
        `  ${JSON.stringify(clave)}: { ruta: ${JSON.stringify(a.ruta)}, ancho: ${a.ancho}, alto: ${a.alto} },`,
    )
    .join("\n");

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
 * La imagen que se ve al pegar en WhatsApp un enlace que no tiene imagen
 * propia: Inicio, los dos listados y Contacto.
 */
export const og: ArchivoDeMarca = {
  ruta: "/marca/og.jpg",
  ancho: ${infoOg.width},
  alto: ${infoOg.height},
};

/**
 * La imagen de Open Graph de cada producto y cada proyecto: la misma
 * composición que \`og\`, con su portada. La clave es la de \`fotos.ts\`,
 * \`<entidad>/<slug>\`. Una página que no está acá usa \`og\` — decisión 59.
 */
export const ogPorPagina: Record<string, ArchivoDeMarca> = {
${filas}
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
