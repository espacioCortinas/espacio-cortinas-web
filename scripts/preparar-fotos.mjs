#!/usr/bin/env node
/**
 * Prepara las fotos del sitio: recorta, redimensiona, borra los metadatos y
 * escribe el manifiesto.
 *
 *     node scripts/preparar-fotos.mjs [carpeta-de-originales]
 *
 * **Reemplaza al panel.** Hasta la decisión 36 esto lo hacía el navegador de
 * quien subía, porque el runtime de Workers no ejecuta módulos nativos y la
 * persona que cargaba el contenido no era técnica. Con el contenido en el
 * repositorio las dos razones desaparecen: acá corre `sharp`, que es más
 * rápido, más simple y no depende de qué navegador tenga nadie.
 *
 * CÓMO SE USA
 *
 * Los originales van en una carpeta fuera de `public/`, ordenados por entidad y
 * por slug. El orden alfabético de los archivos es el orden de la galería, y
 * **el primero es la portada**:
 *
 *     fotos-originales/
 *     ├── productos/
 *     │   └── roller-blackout/
 *     │       ├── 1.jpg      ← portada, tiene que ser vertical
 *     │       └── 2.jpg
 *     └── proyectos/
 *         └── casa-en-nordelta/
 *             └── 1.jpg
 *
 * Y el resultado:
 *
 *     public/fotos/productos/roller-blackout/1/480.webp
 *                                             /960.webp
 *                                             /…
 *     contenido/fotos.ts     ← el manifiesto, generado
 *
 * LOS ORIGINALES NO SE VERSIONAN. Viven en el Drive de la empresa, que es lo
 * que ya pedía la decisión 18: lo que se publica está recomprimido y sin
 * metadatos, y de ahí no se recupera el original.
 */

import {
  existsSync,
  readdirSync,
  mkdirSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

import prettier from "prettier";
import sharp from "sharp";

import {
  IMAGEN_CALIDAD,
  IMAGEN_LADO_MAXIMO,
  MEDIDAS_IMAGEN,
  PORTADA_RELACION,
} from "../lib/constantes.ts";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGINALES = process.argv[2] ?? join(RAIZ, "fotos-originales");
const DESTINO = join(RAIZ, "public", "fotos");
const MANIFIESTO = join(RAIZ, "contenido", "fotos.ts");

// HEIC incluido: es lo que sacan los iPhone por defecto, y `sharp` lo lee.
// Sin esto, una carpeta entera de fotos sin convertir se saltearía en silencio,
// que es la peor forma de fallar.
const EXTENSIONES = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".tif",
  ".tiff",
  ".heic",
  ".heif",
]);

/**
 * El formato de salida. Uno solo: la rama JPEG existía porque WebKit no sabe
 * codificar WebP y el panel se usaba desde un iPhone, y ya no comprime ningún
 * navegador (decisiones 35 y 36).
 *
 * **Aun así cada foto registra el suyo en el manifiesto** — decisión 37. El
 * sitio arma el nombre del archivo leyendo ese campo, no esta constante, que
 * es la misma regla que ya vale para `medidas`.
 */
const FORMATO = "webp";

let avisos = 0;
const aviso = (t) => {
  console.warn(`  ! ${t}`);
  avisos += 1;
};

/**
 * Qué anchos se generan para una foto de este ancho.
 *
 * **No se agranda nunca**: agrandar no agrega detalle, solo bytes, y además
 * mentiría en el `srcset`, donde el descriptor `w` es el ancho real del
 * archivo. De ahí que una foto de teléfono dé las cuatro medidas y una vieja de
 * 900 px dé `{480, 900}` — las fijas que le entran, más su propio ancho, para
 * que igual exista una versión nítida en pantallas de mucha densidad.
 *
 * Decisión 32.
 */
function medidasPara(anchoOriginal) {
  const tope = Math.min(anchoOriginal, IMAGEN_LADO_MAXIMO);
  return [...MEDIDAS_IMAGEN.filter((m) => m < tope), tope];
}

/**
 * Prepara una foto y devuelve su entrada del manifiesto.
 *
 * **ACÁ SE BORRA EL EXIF, y no por un paso que haya que acordarse de dar.**
 * `sharp` descarta todos los metadatos salvo que se le pidan explícitamente con
 * `.withMetadata()`, que este código no llama en ningún lado. Y `.rotate()` sin
 * argumentos aplica la orientación del EXIF **antes** de recomprimir, que es la
 * única oportunidad: después el EXIF ya no existe y una foto sacada con el
 * teléfono de costado quedaría acostada para siempre.
 *
 * Es el riesgo más concreto del proyecto —las fotos son de casas de clientes y
 * traen las coordenadas del domicilio— así que igual se verifica con
 * `npm run fotos:revisar`, no se da por sentado. Ver docs/seguridad.md.
 */
async function prepararFoto(rutaOriginal, carpetaDestino, esPortada) {
  const meta = await sharp(rutaOriginal).metadata();

  if (!meta.width || !meta.height) {
    throw new Error(`no se pudo leer el tamaño de ${rutaOriginal}`);
  }

  // `metadata()` informa el tamaño TAL COMO ESTÁ GUARDADO, sin aplicar la
  // orientación del EXIF — y `autoOrient` tampoco lo cambia. Una foto sacada
  // con el teléfono de costado se guarda vertical con una etiqueta que dice
  // «girar 90°», así que hay que intercambiar los lados a mano para las
  // orientaciones 5 a 8. Sin esto, el manifiesto describe una foto que no es
  // la que se escribió, y el navegador reserva el espacio equivocado.
  const acostada = meta.orientation !== undefined && meta.orientation >= 5;
  const width = acostada ? meta.height : meta.width;
  const height = acostada ? meta.width : meta.height;

  // La portada tiene que ser vertical: los listados la usan siempre, y es lo
  // que hace que las grillas queden parejas aunque la galería mezcle
  // orientaciones (decisión 14). Si es apaisada se recorta a 4:5 por el centro,
  // que es lo que el panel ofrecía como opción.
  const recortar = esPortada && width >= height;
  const anchoUtil = recortar ? Math.round(height * PORTADA_RELACION) : width;
  const altoUtil = height;

  if (recortar) {
    aviso(
      `${basename(rutaOriginal)} es la portada y está apaisada (${width}×${height}): ` +
        `se recorta a ${anchoUtil}×${altoUtil} por el centro. ` +
        `Si el recorte corta algo importante, poné otra foto primero.`,
    );
  }

  const medidas = medidasPara(anchoUtil);

  rmSync(carpetaDestino, { recursive: true, force: true });
  mkdirSync(carpetaDestino, { recursive: true });

  let escrito = null;

  for (const ancho of medidas) {
    // `.rotate()` sin argumentos aplica la orientación del EXIF ANTES de
    // recomprimir, que es la única oportunidad: después el EXIF ya no existe y
    // la foto quedaría acostada para siempre.
    let tuberia = sharp(rutaOriginal).rotate();
    if (recortar) {
      tuberia = tuberia.extract({
        left: Math.round((width - anchoUtil) / 2),
        top: 0,
        width: anchoUtil,
        height: altoUtil,
      });
    }
    const info = await tuberia
      .resize({ width: ancho, withoutEnlargement: true })
      // El perfil de color sí se conserva, y es lo único. Un iPhone saca en
      // Display P3; sin declarar el espacio de color, un navegador asume sRGB y
      // los colores de las telas salen apagados. No dice nada del lugar, del
      // equipo ni de la fecha.
      .withIccProfile("srgb")
      .webp({ quality: Math.round(IMAGEN_CALIDAD * 100) })
      .toFile(join(carpetaDestino, `${ancho}.${FORMATO}`));

    // El nombre del archivo ES su ancho, porque de ahí sale el descriptor `w`
    // del `srcset`. Si alguna vez no coincidieran, el navegador elegiría el
    // tamaño equivocado en silencio, así que se comprueba en vez de confiar.
    if (info.width !== ancho) {
      throw new Error(
        `${basename(rutaOriginal)}: se pidió ${ancho} px de ancho y salió ${info.width}. ` +
          `El nombre del archivo mentiría en el srcset.`,
      );
    }

    // Y lo mismo con la extensión: el manifiesto la registra, así que el
    // sitio va a pedir `${ancho}.${info.format}`. Si eso no coincide con el
    // archivo escrito, la foto no carga.
    if (info.format !== FORMATO) {
      throw new Error(
        `${basename(rutaOriginal)}: se pidió ${FORMATO} y salió ${info.format}.`,
      );
    }

    escrito = info;
  }

  // El manifiesto sale del archivo QUE SE ESCRIBIÓ, no de una cuenta. Es la
  // misma idea que `medidas`: registrar, no adivinar. El formato también sale
  // de ahí y no de la extensión que pusimos en el nombre: si algún día el
  // codificador devolviera otra cosa, el manifiesto lo diría en vez de que el
  // navegador pida un archivo que no existe (decisión 37).
  return {
    medidas,
    formato: escrito.format,
    ancho: escrito.width,
    alto: escrito.height,
  };
}

async function main() {
  if (!existsSync(ORIGINALES)) {
    console.error(
      `\n✗ No existe la carpeta de originales: ${ORIGINALES}\n\n` +
        `  Creala y poné adentro las fotos, ordenadas así:\n\n` +
        `    fotos-originales/productos/<slug>/1.jpg\n` +
        `    fotos-originales/proyectos/<slug>/1.jpg\n\n` +
        `  El orden alfabético es el de la galería, y la primera es la portada.\n`,
    );
    process.exitCode = 1;
    return;
  }

  const manifiesto = {};
  let cuantas = 0;

  for (const entidad of ["productos", "proyectos"]) {
    const raizEntidad = join(ORIGINALES, entidad);
    if (!existsSync(raizEntidad)) continue;

    for (const slug of readdirSync(raizEntidad, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort()) {
      const archivos = readdirSync(join(raizEntidad, slug))
        .filter((f) => EXTENSIONES.has(extname(f).toLowerCase()))
        .sort((a, b) => a.localeCompare(b, "es", { numeric: true }));

      if (archivos.length === 0) continue;

      console.log(`\n${entidad}/${slug}`);
      const fotos = [];

      for (const [i, archivo] of archivos.entries()) {
        const carpeta = `${entidad}/${slug}/${i + 1}`;
        // Una foto que falla no corta la corrida: se avisa y se sigue con las
        // demás. Cortar en la primera obligaría a descubrir los problemas de
        // a uno, y una tanda de treinta fotos son treinta corridas.
        try {
          const datos = await prepararFoto(
            join(raizEntidad, slug, archivo),
            join(DESTINO, entidad, slug, String(i + 1)),
            i === 0,
          );
          fotos.push({ carpeta, ...datos });
          cuantas += 1;
          console.log(
            `  ${i + 1}. ${archivo.padEnd(28)} ${datos.ancho}×${datos.alto}  ` +
              `medidas: ${datos.medidas.join(" · ")}`,
          );
        } catch (fallo) {
          aviso(
            `${archivo}: no se pudo preparar — ${fallo instanceof Error ? fallo.message : fallo}`,
          );
        }
      }

      if (fotos.length === 0) {
        aviso(`${slug} quedó sin ninguna foto utilizable.`);
        continue;
      }

      // Se avisa pero no se corta: puede ser que todavía no haya una vertical
      // y se quiera ver el resto igual.
      if (fotos[0].alto <= fotos[0].ancho) {
        aviso(
          `la portada de ${slug} quedó apaisada. Los listados la usan y no va a quedar pareja.`,
        );
      }

      manifiesto[`${entidad}/${slug}`] = fotos;
    }
  }

  const cuerpo = Object.entries(manifiesto)
    .map(
      ([clave, fotos]) =>
        `  ${JSON.stringify(clave)}: [\n` +
        fotos
          .map(
            (f) =>
              `    { carpeta: ${JSON.stringify(f.carpeta)}, medidas: [${f.medidas.join(", ")}], ` +
              `formato: ${JSON.stringify(f.formato)}, ancho: ${f.ancho}, alto: ${f.alto} },`,
          )
          .join("\n") +
        `\n  ],`,
    )
    .join("\n");

  const fuente =
    `import type { Foto } from "./tipos";\n` +
    `\n` +
    `/**\n` +
    ` * ARCHIVO GENERADO — no editar a mano.\n` +
    ` *\n` +
    ` * Lo escribe \`scripts/preparar-fotos.mjs\` y se pisa entero en cada corrida.\n` +
    ` * La clave es \`<entidad>/<slug>\`, y el orden del arreglo es el de la\n` +
    ` * galería: la primera foto es la portada.\n` +
    ` */\n` +
    `export const fotos: Record<string, Foto[]> = {\n` +
    (cuerpo ? `${cuerpo}\n` : "") +
    `};\n`;

  // Se formatea con prettier antes de escribirlo, y no es cosmética:
  // `npm run format:check` corre sobre TODO el repositorio, así que un archivo
  // generado con otro ancho de línea rompe la verificación. Hoy la rompe el
  // manifiesto vacío —prettier escribe `{}` en una línea y esto escribía dos—
  // y mañana la rompería la primera foto con el slug lo bastante largo.
  // Prettier ya es dependencia de desarrollo del proyecto: no entra nada nuevo.
  writeFileSync(
    MANIFIESTO,
    await prettier.format(fuente, {
      ...(await prettier.resolveConfig(MANIFIESTO)),
      filepath: MANIFIESTO,
    }),
  );

  console.log(
    `\n✓ ${cuantas} fotos preparadas en public/fotos/, manifiesto en contenido/fotos.ts` +
      (avisos > 0
        ? `\n  con ${avisos} aviso${avisos === 1 ? "" : "s"} más arriba`
        : "") +
      `\n\n  Verificá que ninguna conserve metadatos antes de publicar:\n` +
      `    npm run fotos:revisar\n`,
  );
}

await main();
