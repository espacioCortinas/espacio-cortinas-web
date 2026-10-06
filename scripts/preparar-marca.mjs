#!/usr/bin/env node
/**
 * Prepara los archivos de marca que el sitio necesita y que no son fotos: el
 * logo y el logo circular.
 *
 *     node scripts/preparar-marca.mjs
 *
 *     fotos-originales/logo-vacio.png     ──→  public/marca/logo.png                 600 px
 *                                         ──→  public/marca/logo-grande.png        1.200 px
 *     fotos-originales/logo-circulo.avif  ──→  public/marca/logo-circulo.png          96 px
 *                                         ──→  public/marca/logo-circulo-grande.png  144 px
 *
 *                                              contenido/marca.ts      el manifiesto
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
 * ## Por qué 600 y 1.200 px, y por qué con paleta
 *
 * **600 era el triple del ancho más grande al que se mostraba en el
 * encabezado**, 200 px en escritorio: alcanzaba para una pantalla de triple
 * densidad. El original tiene 1.695 y publicarlo entero sería mandar casi diez
 * veces los píxeles que se ven. Desde que el encabezado lleva el logo circular
 * —abajo—, el de 600 queda para la banda de las imágenes para compartir, la
 * ficha de negocio local y el `srcset` de la apertura de Inicio.
 *
 * **1.200 es para el bloque de la apertura de Inicio**, donde el logo va grande
 * —hasta 26 rem, 416 px— sobre el azul verdoso, como en el boceto. Ahí 600 se
 * queda corto en una pantalla de doble densidad. Las dos medidas van en el
 * `srcset` de `LogoGrande`, así que un teléfono, que lo muestra a menos de 300
 * px, sigue bajando el de 600.
 *
 * Entró en la etapa 2 de la Fase 4.7, **como un archivo aparte y no agrandando
 * el que ya estaba**: lo publicado no se reescribe con otros bytes.
 *
 * ## El logo circular
 *
 * **Es el que la empresa usa en el Nosotros de su boceto**: un círculo gris
 * carbón con el logo calado adentro —la «e», «espacio» y «CORTINAS» son
 * transparentes y dejan ver el fondo— y un aro fino alrededor. No lo mandó: lo
 * bajó quien desarrolla del boceto, en AVIF de 704 px y sin metadatos. Va en el
 * encabezado de todas las páginas menos Inicio, en el lugar del enlace
 * «Inicio» (`components/navegacion.tsx`).
 *
 * **96 y 144 px** porque se muestra chico: de 32 a 40 px en el teléfono y 44
 * en escritorio. El de 96 alcanza para doble densidad y el de 144 para triple;
 * los dos van en el `srcset`.
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
const ORIGINALES = join(RAIZ, "fotos-originales");
const DESTINO = join(RAIZ, "public", "marca");
const MANIFIESTO = join(RAIZ, "contenido", "marca.ts");

/**
 * Las medidas publicadas, cada una con su original: el logo de las imágenes
 * para compartir y de la apertura de Inicio, y el logo circular del
 * encabezado. `components/logo.tsx` tiene el otro lado de esta cuenta.
 */
const MEDIDAS = [
  { original: "logo-vacio.png", archivo: "logo.png", ancho: 600 },
  { original: "logo-vacio.png", archivo: "logo-grande.png", ancho: 1200 },
  { original: "logo-circulo.avif", archivo: "logo-circulo.png", ancho: 96 },
  {
    original: "logo-circulo.avif",
    archivo: "logo-circulo-grande.png",
    ancho: 144,
  },
];

/** La misma receta para todas: ver «Por qué 600 y 1.200 px» arriba. */
async function publicar(original, archivo, ancho) {
  return (
    sharp(join(ORIGINALES, original))
      // Recorta el aire transparente que pudiera traer el archivo: lo que queda
      // es el logo exacto, y el componente lo alinea con el texto sin compensar
      // un margen que no se ve. El de la Fase 4.7 no traía, pero el próximo
      // puede traer.
      .trim({ threshold: 0 })
      .resize({ width: ancho })
      .png({
        compressionLevel: 9,
        palette: true,
        quality: 100,
        colors: 256,
        effort: 10,
      })
      .toFile(join(DESTINO, archivo))
  );
}

const kB = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

async function main() {
  mkdirSync(DESTINO, { recursive: true });

  /* --- Los archivos de los logos ---------------------------------- */

  /*
   * Sin el original —que vive en el Drive de la empresa y no se versiona— se
   * usan los ya publicados y no se los reescribe: el script anda igual en una
   * máquina que no tenga los archivos de la empresa.
   */
  const infos = {};

  for (const { original, archivo, ancho } of MEDIDAS) {
    const rutaOriginal = join(ORIGINALES, original);

    if (!existsSync(rutaOriginal)) {
      const meta = await sharp(join(DESTINO, archivo)).metadata();
      infos[archivo] = { width: meta.width, height: meta.height };
      console.log(
        `  ${archivo.padEnd(24)} sin ${original} en fotos-originales/: se usa el publicado, sin tocarlo`,
      );
      continue;
    }

    const meta = await sharp(rutaOriginal).metadata();
    if (meta.width < ancho) {
      console.warn(
        `  ! ${original} mide ${meta.width} px de ancho y ${archivo} se ` +
          `publica a ${ancho}: se va a agrandar, y agrandar no agrega detalle.`,
      );
    }
    const info = await publicar(original, archivo, ancho);
    infos[archivo] = info;
    console.log(
      `  ${archivo.padEnd(24)} ${info.width}×${info.height}  ${kB(info.size)}`,
    );
  }

  const infoLogo = infos["logo.png"];
  const infoGrande = infos["logo-grande.png"];
  const infoCirculo = infos["logo-circulo.png"];
  const infoCirculoGrande = infos["logo-circulo-grande.png"];

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
 * El logo, sin fondo: el de la banda de las imágenes para compartir, el de la
 * ficha de negocio local y el chico del \`srcset\` de la apertura de Inicio.
 *
 * Las imágenes para compartir no están acá: son una foto por página, en
 * \`contenido/imagenes-para-compartir.ts\` — decisión 63.
 */
export const logo: ArchivoDeMarca = {
  ruta: "/marca/logo.png",
  ancho: ${infoLogo.width},
  alto: ${infoLogo.height},
};

/**
 * El mismo logo, al doble, para el bloque de la apertura de Inicio: ahí se ve
 * de hasta 416 px de ancho.
 */
export const logoGrande: ArchivoDeMarca = {
  ruta: "/marca/logo-grande.png",
  ancho: ${infoGrande.width},
  alto: ${infoGrande.height},
};

/**
 * El logo circular, para el encabezado de todas las páginas menos Inicio, en
 * el lugar del enlace «Inicio».
 */
export const logoCirculo: ArchivoDeMarca = {
  ruta: "/marca/logo-circulo.png",
  ancho: ${infoCirculo.width},
  alto: ${infoCirculo.height},
};

/** El mismo, para las pantallas de triple densidad. */
export const logoCirculoGrande: ArchivoDeMarca = {
  ruta: "/marca/logo-circulo-grande.png",
  ancho: ${infoCirculoGrande.width},
  alto: ${infoCirculoGrande.height},
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
