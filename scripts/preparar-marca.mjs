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
 *                                         ──→  app/favicon.ico              16, 32 y 48 px
 *                                         ──→  app/icon.png                         192 px
 *                                         ──→  app/apple-icon.png                   180 px
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
 * ## El ícono de la pestaña, desde el logo circular — decisión 45
 *
 * **Lo frenaba que no había un dibujo para eso**: el círculo amarillo del logo
 * anterior venía cortado y con la «e» encima, y cualquier otra cosa era un
 * dibujo nuevo. El logo circular de la empresa ya es redondo, así que va tal
 * cual. Lo decidió quien desarrolla, en la Fase 4.7.
 *
 * **Con un disco del color del fondo detrás.** El logo es calado: las letras y
 * el espacio entre el círculo y el aro son transparentes. Sobre la pestaña
 * clara de un navegador se ve bien, pero sobre una oscura —la de Chrome en modo
 * oscuro es casi el mismo gris carbón— desaparecería entero. Con el disco, las
 * letras quedan claras en cualquier pestaña, como en el sitio. Las esquinas
 * siguen transparentes.
 *
 * Next los toma de `app/` por el nombre del archivo y escribe solo las
 * etiquetas `<link>`:
 *
 * - `favicon.ico`, con 16, 32 y 48 px adentro: es el que pide cualquier
 *   navegador, aunque la página no lo diga;
 * - `icon.png`, de 192, para lo que pide uno más grande, como Android al
 *   agregar el sitio a la pantalla de inicio;
 * - `apple-icon.png`, de 180 y **sin transparencia**: iOS rellena lo
 *   transparente de negro, y el logo, que es calado, quedaría negro sobre gris
 *   carbón. Va sobre un cuadrado del color del fondo y con aire alrededor,
 *   porque iOS le redondea las esquinas.
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
const APP = join(RAIZ, "app");

/**
 * El fondo del sitio, `--color-fondo` de `app/globals.css`. Copiado a
 * propósito, como el `FONDO` de `preparar-compartir.mjs`: si el token cambia, los
 * íconos publicados no cambian solos, y está bien que no lo hagan.
 */
const FONDO_DEL_SITIO = "#edeff0";

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

/**
 * El logo circular sobre un disco del color del fondo, del mismo tamaño: lo
 * calado queda claro y las esquinas, transparentes. Ver «El ícono de la
 * pestaña» arriba.
 */
async function discoConLogo(rutaOriginal) {
  const { width: lado } = await sharp(rutaOriginal).metadata();
  const disco = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}">` +
      `<circle cx="${lado / 2}" cy="${lado / 2}" r="${lado / 2}" fill="${FONDO_DEL_SITIO}"/>` +
      `</svg>`,
  );
  return sharp(disco)
    .composite([{ input: rutaOriginal }])
    .png()
    .toBuffer();
}

/**
 * Un `.ico` con PNG adentro, que es lo que leen todos los navegadores de hoy:
 * una cabecera, una entrada de 16 bytes por medida y los PNG uno detrás del
 * otro. Escrito a mano porque `sharp` no escribe ICO, y no amerita una
 * dependencia (regla 7 de `CLAUDE.md`).
 */
function empaquetarIco(pngs) {
  const cabecera = Buffer.alloc(6);
  cabecera.writeUInt16LE(0, 0); // reservado
  cabecera.writeUInt16LE(1, 2); // 1 = ícono
  cabecera.writeUInt16LE(pngs.length, 4);

  let desplazamiento = cabecera.length + 16 * pngs.length;
  const entradas = pngs.map(({ lado, datos }) => {
    const entrada = Buffer.alloc(16);
    entrada.writeUInt8(lado, 0); // ancho
    entrada.writeUInt8(lado, 1); // alto
    entrada.writeUInt8(0, 2); // sin paleta
    entrada.writeUInt8(0, 3); // reservado
    entrada.writeUInt16LE(1, 4); // planos
    entrada.writeUInt16LE(32, 6); // bits por píxel
    entrada.writeUInt32LE(datos.length, 8);
    entrada.writeUInt32LE(desplazamiento, 12);
    desplazamiento += datos.length;
    return entrada;
  });

  return Buffer.concat([cabecera, ...entradas, ...pngs.map((p) => p.datos)]);
}

/** Los tres íconos de `app/`. Deterministas, como todo lo de este script. */
async function prepararIconos(rutaOriginal) {
  const disco = await discoConLogo(rutaOriginal);
  const enPng = (lado) =>
    sharp(disco).resize(lado).png({ compressionLevel: 9 }).toBuffer();

  const pngs = [];
  for (const lado of [16, 32, 48])
    pngs.push({ lado, datos: await enPng(lado) });
  const ico = empaquetarIco(pngs);
  writeFileSync(join(APP, "favicon.ico"), ico);
  console.log(
    `  ${"app/favicon.ico".padEnd(24)} 16, 32 y 48  ${kB(ico.length)}`,
  );

  const icono = await sharp(disco)
    .resize(192)
    .png({ compressionLevel: 9 })
    .toFile(join(APP, "icon.png"));
  console.log(
    `  ${"app/icon.png".padEnd(24)} ${icono.width}×${icono.height}  ${kB(icono.size)}`,
  );

  // El logo a 144 en un cuadrado de 180: 18 px de aire de cada lado, que es lo
  // que deja entero el aro cuando iOS redondea las esquinas.
  const LADO = 180;
  const LOGO = 144;
  const apple = await sharp({
    create: {
      width: LADO,
      height: LADO,
      channels: 3,
      background: FONDO_DEL_SITIO,
    },
  })
    .composite([
      {
        input: await sharp(rutaOriginal).resize(LOGO).png().toBuffer(),
        left: (LADO - LOGO) / 2,
        top: (LADO - LOGO) / 2,
      },
    ])
    .png({ compressionLevel: 9 })
    .toFile(join(APP, "apple-icon.png"));
  console.log(
    `  ${"app/apple-icon.png".padEnd(24)} ${apple.width}×${apple.height}  ${kB(apple.size)}`,
  );
}

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

  /* --- El ícono de la pestaña ---------------------------------------- */

  const rutaCirculo = join(ORIGINALES, "logo-circulo.avif");
  if (existsSync(rutaCirculo)) {
    await prepararIconos(rutaCirculo);
  } else {
    console.log(
      `  íconos de app/ sin logo-circulo.avif en fotos-originales/: se usan los publicados, sin tocarlos`,
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
