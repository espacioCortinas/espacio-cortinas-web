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
 *     │   └── roller/
 *     │       ├── 1.jpg          ← portada del producto, tiene que ser vertical
 *     │       ├── 2.jpg
 *     │       ├── screen/        ← una VARIANTE: su clave es el nombre de la carpeta
 *     │       │   ├── 1.jpg
 *     │       │   └── 2.jpg
 *     │       ├── blackout/
 *     │       │   └── …
 *     │       └── motorizado.mp4 ← el VIDEO de la variante «motorizado»
 *     └── proyectos/
 *         └── casa-en-nordelta/
 *             └── 1.jpg
 *
 * Y el resultado:
 *
 *     public/fotos/productos/roller/1/480.webp
 *                                    /960.webp
 *                                    /…
 *     public/fotos/productos/roller/screen/1/480.webp
 *     public/videos/roller/motorizado.mp4     ← el video publicado
 *     public/videos/roller/motorizado.webp    ← su cuadro de cartel
 *     contenido/fotos.ts     ← el manifiesto de fotos, generado
 *     contenido/videos.ts    ← el manifiesto de videos, generado
 *
 * LAS TRES REGLAS QUE ESTE ARCHIVO SOSTIENE
 *
 * 1. **Se borran los metadatos siempre.** Las fotos y los videos son de casas
 *    de clientes y traen las coordenadas del domicilio. Ver `prepararFoto()`.
 * 2. **El manifiesto describe el archivo que se escribió**, no una cuenta:
 *    anchos, alto, formato y duración salen de `sharp` y de `ffprobe`.
 * 3. **Lo ya publicado no se vuelve a escribir.** Las fotos y los videos viven
 *    en git, así que regenerar un archivo con otros bytes duplica su peso en la
 *    historia para siempre. Por eso los parámetros de salida están congelados y
 *    un video que ya está en `public/videos/` no se reconvierte.
 *
 * LOS ORIGINALES NO SE VERSIONAN. Viven en el Drive de la empresa, que es lo
 * que ya pedía la decisión 18: lo que se publica está recomprimido y sin
 * metadatos, y de ahí no se recupera el original.
 */

import { execFileSync } from "node:child_process";
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

import { productos } from "../contenido/productos.ts";
import {
  IMAGEN_CALIDAD,
  IMAGEN_LADO_MAXIMO,
  MEDIDAS_IMAGEN,
  PORTADA_RELACION,
  VIDEO_ANCHO,
  VIDEO_CRF,
} from "../lib/constantes.ts";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGINALES = process.argv[2] ?? join(RAIZ, "fotos-originales");
const DESTINO = join(RAIZ, "public", "fotos");
const DESTINO_VIDEOS = join(RAIZ, "public", "videos");
const MANIFIESTO = join(RAIZ, "contenido", "fotos.ts");
const MANIFIESTO_VIDEOS = join(RAIZ, "contenido", "videos.ts");

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

/**
 * El formato de video de salida, y el del cuadro de cartel.
 *
 * H.264 en MP4 porque es lo único que reproducen todos los navegadores en uso
 * sin una segunda fuente. El cartel es WebP, el mismo formato y la misma
 * calidad que las fotos: es una foto.
 */
const FORMATO_VIDEO = "mp4";
const FORMATO_CARTEL = "webp";

/** Lo que se reconoce como video en una carpeta de originales. */
const EXTENSIONES_VIDEO = new Set([".mp4", ".mov", ".m4v"]);

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

/* ────────────────────────────────────────────────────────────────────────────
 * Video
 * ──────────────────────────────────────────────────────────────────────────── */

/** `ffprobe`/`ffmpeg`, devolviendo lo que escribieron en la salida estándar. */
function correr(programa, argumentos, binario = false) {
  return execFileSync(programa, argumentos, {
    encoding: binario ? "buffer" : "utf8",
    // Un cuadro de 1280 px en PNG ronda el megabyte; 64 MB es holgado y evita
    // que el día que entre un video en 4K esto falle con un error del sistema
    // en vez de con uno que se entienda.
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

/**
 * Qué tiene adentro un video, leído del archivo y no supuesto.
 *
 * Es la misma regla que ya vale para `medidas` y para `formato` (decisiones 32
 * y 37): el ancho, el alto y la duración van al `<video>` y al texto que está
 * al lado, así que salen de `ffprobe` sobre el archivo que se publica.
 */
function datosDelVideo(ruta) {
  const salida = correr("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height",
    "-show_entries",
    "format=duration",
    "-of",
    "json",
    ruta,
  ]);

  const { streams, format } = JSON.parse(salida);
  const pista = streams?.[0];
  if (!pista?.width || !pista?.height) {
    throw new Error(`no se pudo leer el tamaño de ${basename(ruta)}`);
  }

  return {
    ancho: pista.width,
    alto: pista.height,
    duracion: Math.round(Number(format?.duration ?? 0)),
  };
}

/**
 * ¿Tiene pista de audio?
 *
 * Los videos se publican **sin pista**, no silenciados: un `muted` que alguien
 * pueda desactivar es una forma de que un video de catálogo empiece a sonar en
 * una oficina. Se comprueba en vez de confiar, porque lo que se publica puede
 * no haber pasado por la conversión de acá abajo.
 */
function tieneAudio(ruta) {
  const salida = correr("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "a",
    "-show_entries",
    "stream=index",
    "-of",
    "csv=p=0",
    ruta,
  ]);
  return salida.trim().length > 0;
}

/**
 * Convierte un original a lo que se publica.
 *
 * `-map_metadata -1` es la línea que importa: **un video de celular trae las
 * coordenadas del domicilio** en un átomo `©xyz`, igual que una foto las trae
 * en el EXIF, y es el mismo riesgo de `docs/seguridad.md`. `-an` saca la pista
 * de audio entera.
 *
 * `-movflags +faststart` mueve el índice al principio del archivo, que es lo
 * que permite que el navegador empiece a reproducir sin descargarlo todo.
 */
function convertirVideo(origen, destino) {
  mkdirSync(dirname(destino), { recursive: true });
  correr("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-i",
    origen,
    "-an",
    "-map_metadata",
    "-1",
    "-vf",
    // `-2` deja que el alto salga de la proporción y caiga en un número par,
    // que es lo que H.264 necesita.
    `scale=${VIDEO_ANCHO}:-2`,
    "-c:v",
    "libx264",
    "-crf",
    String(VIDEO_CRF),
    "-preset",
    "slow",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    destino,
  ]);
}

/**
 * El cuadro de cartel: **el primer cuadro del video**, no uno del medio.
 *
 * Es lo que se ve hasta que la reproducción empieza —y lo único que se ve si
 * nunca empieza, con `prefers-reduced-motion`—. Tomando el primero, el cambio
 * del cartel al video no se nota: es el mismo cuadro. Uno del medio produciría
 * un salto justo en el momento en que alguien mira.
 *
 * Sale del video **publicado** y no del original, así que el cartel y lo que se
 * reproduce son el mismo archivo. Y pasa por `sharp` en vez de por el
 * codificador de WebP de ffmpeg para que use la misma calidad que las fotos y
 * para que le valga el mismo borrado de metadatos.
 */
async function prepararCartel(rutaVideo, destino) {
  const cuadro = correr(
    "ffmpeg",
    [
      "-v",
      "error",
      "-i",
      rutaVideo,
      "-frames:v",
      "1",
      "-f",
      "image2",
      "-c:v",
      "png",
      "-",
    ],
    true,
  );

  const info = await sharp(cuadro)
    .withIccProfile("srgb")
    .webp({ quality: Math.round(IMAGEN_CALIDAD * 100) })
    .toFile(destino);

  if (info.format !== FORMATO_CARTEL) {
    throw new Error(
      `el cartel salió en ${info.format} y no en ${FORMATO_CARTEL}.`,
    );
  }

  return info;
}

/**
 * Publica el video de una variante y devuelve su entrada del manifiesto.
 *
 * **Si el video ya está publicado no se vuelve a convertir**, y eso es
 * deliberado: `public/videos/` está en git, así que reencodear el mismo video
 * con otros bytes suma su peso otra vez a la historia del repositorio, para
 * siempre. Los dos que hay se convirtieron a mano antes de que existiera esta
 * función y con parámetros que nadie anotó (decisión 48), así que se los deja
 * como están y solo se los mide. Lo que entre de ahora en adelante sí sale de
 * `convertirVideo()`.
 */
async function prepararVideo(origen, slug, clave) {
  const archivo = `${slug}/${clave}`;
  const destino = join(DESTINO_VIDEOS, slug, `${clave}.${FORMATO_VIDEO}`);
  const destinoCartel = join(
    DESTINO_VIDEOS,
    slug,
    `${clave}.${FORMATO_CARTEL}`,
  );

  if (existsSync(destino)) {
    console.log(
      `  ▸ ${clave}${FORMATO_VIDEO === "mp4" ? ".mp4" : ""} ya publicado — no se reconvierte`,
    );
  } else if (origen) {
    convertirVideo(origen, destino);
  } else {
    throw new Error(
      `no hay ni original ni archivo publicado para el video ${archivo}.`,
    );
  }

  if (tieneAudio(destino)) {
    aviso(
      `${archivo} conserva pista de audio. Los videos del sitio van sin pista, ` +
        `no silenciados. Convertilo de nuevo con -an.`,
    );
  }

  const datos = datosDelVideo(destino);
  await prepararCartel(destino, destinoCartel);

  return {
    archivo,
    formato: FORMATO_VIDEO,
    formatoPoster: FORMATO_CARTEL,
    ...datos,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Recorrido
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Las claves de variante que declara un producto, para cruzarlas con lo que hay
 * en el disco.
 *
 * **Las dos direcciones fallan en silencio** y por eso se avisan las dos: una
 * variante con `clave` y sin carpeta se dibuja sin fotos, y una carpeta sin
 * variante que la reclame se procesa, se commitea y no la mira nadie.
 */
function clavesDeclaradas(entidad, slug) {
  if (entidad !== "productos") return null;
  const producto = productos.find((p) => p.slug === slug);
  if (!producto) return null;
  return new Set(
    producto.variantes.map((v) => v.clave).filter((c) => c !== undefined),
  );
}

/** Las fotos de una galería, ya preparadas. */
async function prepararGaleria(carpetaOrigen, archivos, prefijo, conPortada) {
  const fotos = [];

  for (const [i, archivo] of archivos.entries()) {
    const carpeta = `${prefijo}/${i + 1}`;
    // Una foto que falla no corta la corrida: se avisa y se sigue con las
    // demás. Cortar en la primera obligaría a descubrir los problemas de
    // a uno, y una tanda de treinta fotos son treinta corridas.
    try {
      const datos = await prepararFoto(
        join(carpetaOrigen, archivo),
        join(DESTINO, carpeta),
        conPortada && i === 0,
      );
      fotos.push({ carpeta, ...datos });
      console.log(
        `  ${carpeta.padEnd(34)} ${datos.ancho}×${datos.alto}  ` +
          `medidas: ${datos.medidas.join(" · ")}`,
      );
    } catch (fallo) {
      aviso(
        `${archivo}: no se pudo preparar — ${fallo instanceof Error ? fallo.message : fallo}`,
      );
    }
  }

  return fotos;
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
  const manifiestoVideos = {};
  let cuantas = 0;
  let cuantosVideos = 0;

  for (const entidad of ["productos", "proyectos"]) {
    const raizEntidad = join(ORIGINALES, entidad);
    if (!existsSync(raizEntidad)) continue;

    for (const slug of readdirSync(raizEntidad, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort()) {
      const carpetaSlug = join(raizEntidad, slug);
      const entradas = readdirSync(carpetaSlug, { withFileTypes: true });

      const archivos = entradas
        .filter(
          (d) => d.isFile() && EXTENSIONES.has(extname(d.name).toLowerCase()),
        )
        .map((d) => d.name)
        .sort((a, b) => a.localeCompare(b, "es", { numeric: true }));

      // Un nivel más: cada subcarpeta es una VARIANTE, y su nombre es la clave
      // con la que `contenido/productos.ts` la reclama.
      const carpetasDeVariante = entradas
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort();

      // Y cada video suelto es el video de la variante que se llama igual.
      const videos = entradas
        .filter(
          (d) =>
            d.isFile() && EXTENSIONES_VIDEO.has(extname(d.name).toLowerCase()),
        )
        .map((d) => d.name)
        .sort();

      if (
        archivos.length === 0 &&
        carpetasDeVariante.length === 0 &&
        videos.length === 0
      ) {
        continue;
      }

      console.log(`\n${entidad}/${slug}`);

      const declaradas = clavesDeclaradas(entidad, slug);
      const vistas = new Set();

      /*
       * Las fotos del producto. La primera es la portada y se recorta a 4:5 si
       * hace falta, porque es la que usan los listados (decisión 14).
       */
      const fotos = await prepararGaleria(
        carpetaSlug,
        archivos,
        `${entidad}/${slug}`,
        true,
      );
      cuantas += fotos.length;

      if (fotos.length === 0) {
        aviso(`${slug} quedó sin ninguna foto propia.`);
      } else {
        // Se avisa pero no se corta: puede ser que todavía no haya una vertical
        // y se quiera ver el resto igual.
        if (fotos[0].alto <= fotos[0].ancho) {
          aviso(
            `la portada de ${slug} quedó apaisada. Los listados la usan y no va a quedar pareja.`,
          );
        }
        manifiesto[`${entidad}/${slug}`] = fotos;
      }

      /*
       * Las fotos de cada variante.
       *
       * **Ninguna es portada y por eso ninguna se recorta.** Los listados usan
       * siempre la portada del producto, así que una variante no necesita una
       * foto 4:5 para que nada quede desparejo — y recortarla a 4:5 «por las
       * dudas» le sacaría píxeles a una foto que después la galería muestra
       * apaisada. `cortinas-tela/barral/2` mide 1028 × 822 y es justo el caso:
       * recortada quedaría en 658 de ancho y no aguantaría ningún módulo.
       */
      for (const clave of carpetasDeVariante) {
        vistas.add(clave);

        // Una variante que se llamara «1» chocaría con la carpeta de la primera
        // foto del producto, que también se llama «1». No es un caso hipotético
        // de más: cuesta una línea y el choque sería silencioso.
        if (/^\d+$/.test(clave)) {
          aviso(
            `${slug}: la variante "${clave}" tiene un nombre de solo dígitos y ` +
              `chocaría con la carpeta de una foto del producto. Cambiale el nombre.`,
          );
          continue;
        }

        if (declaradas && !declaradas.has(clave)) {
          aviso(
            `${slug}: hay fotos en la carpeta "${clave}/" y ninguna variante de ` +
              `contenido/productos.ts la reclama con esa clave. No se van a ver.`,
          );
        }

        const archivosVariante = readdirSync(join(carpetaSlug, clave))
          .filter((f) => EXTENSIONES.has(extname(f).toLowerCase()))
          .sort((a, b) => a.localeCompare(b, "es", { numeric: true }));

        if (archivosVariante.length === 0) continue;

        const deLaVariante = await prepararGaleria(
          join(carpetaSlug, clave),
          archivosVariante,
          `${entidad}/${slug}/${clave}`,
          false,
        );
        cuantas += deLaVariante.length;

        if (deLaVariante.length > 0) {
          manifiesto[`${entidad}/${slug}/${clave}`] = deLaVariante;
        }
      }

      /*
       * Y el video de cada variante motorizada, que es lo único que muestra lo
       * que una foto no puede — decisión 40.
       */
      for (const archivoVideo of videos) {
        const clave = basename(archivoVideo, extname(archivoVideo));
        vistas.add(clave);

        if (entidad !== "productos") {
          aviso(
            `${entidad}/${slug}/${archivoVideo}: los videos son de variantes, y las ` +
              `variantes son solo de productos. Se saltea.`,
          );
          continue;
        }

        if (declaradas && !declaradas.has(clave)) {
          aviso(
            `${slug}: hay un video "${archivoVideo}" y ninguna variante de ` +
              `contenido/productos.ts lo reclama con la clave "${clave}". No se va a ver.`,
          );
        }

        try {
          const datos = await prepararVideo(
            join(carpetaSlug, archivoVideo),
            slug,
            clave,
          );
          manifiestoVideos[`${entidad}/${slug}/${clave}`] = datos;
          cuantosVideos += 1;
          console.log(
            `  ${`${entidad}/${slug}/${clave}`.padEnd(34)} ${datos.ancho}×${datos.alto}  ` +
              `${datos.duracion} s  + cartel`,
          );
        } catch (fallo) {
          aviso(
            `${archivoVideo}: no se pudo preparar — ${fallo instanceof Error ? fallo.message : fallo}`,
          );
        }
      }

      // El cruce en la otra dirección: una clave declarada que no encontró nada
      // en el disco. La página se dibujaría igual, con la variante sin fotos y
      // sin video, que es la forma más callada de perder contenido.
      for (const clave of declaradas ?? []) {
        if (!vistas.has(clave)) {
          aviso(
            `${slug}: la variante con clave "${clave}" no tiene ni carpeta de fotos ` +
              `ni video en ${entidad}/${slug}/. Va a quedar sin nada que mostrar.`,
          );
        }
      }
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

  const cuerpoVideos = Object.entries(manifiestoVideos)
    .map(
      ([clave, v]) =>
        `  ${JSON.stringify(clave)}: { archivo: ${JSON.stringify(v.archivo)}, ` +
        `formato: ${JSON.stringify(v.formato)}, formatoPoster: ${JSON.stringify(v.formatoPoster)}, ` +
        `ancho: ${v.ancho}, alto: ${v.alto}, duracion: ${v.duracion} },`,
    )
    .join("\n");

  const fuenteVideos =
    `import type { Video } from "./tipos";\n` +
    `\n` +
    `/**\n` +
    ` * ARCHIVO GENERADO — no editar a mano.\n` +
    ` *\n` +
    ` * Lo escribe \`scripts/preparar-fotos.mjs\` y se pisa entero en cada corrida.\n` +
    ` * La clave es \`<entidad>/<slug>/<clave de la variante>\`: un video documenta\n` +
    ` * una variante motorizada y no un producto — decisión 40.\n` +
    ` *\n` +
    ` * Va aparte de \`fotos.ts\` porque la forma es otra y porque quien busca un\n` +
    ` * video tiene que encontrarlo en un archivo que se llame así.\n` +
    ` */\n` +
    `export const videos: Record<string, Video> = {\n` +
    (cuerpoVideos ? `${cuerpoVideos}\n` : "") +
    `};\n`;

  // Se formatea con prettier antes de escribirlo, y no es cosmética:
  // `npm run format:check` corre sobre TODO el repositorio, así que un archivo
  // generado con otro ancho de línea rompe la verificación. Hoy la rompe el
  // manifiesto vacío —prettier escribe `{}` en una línea y esto escribía dos—
  // y mañana la rompería la primera foto con el slug lo bastante largo.
  // Prettier ya es dependencia de desarrollo del proyecto: no entra nada nuevo.
  for (const [ruta, texto] of [
    [MANIFIESTO, fuente],
    [MANIFIESTO_VIDEOS, fuenteVideos],
  ]) {
    writeFileSync(
      ruta,
      await prettier.format(texto, {
        ...(await prettier.resolveConfig(ruta)),
        filepath: ruta,
      }),
    );
  }

  console.log(
    `\n✓ ${cuantas} fotos preparadas en public/fotos/, manifiesto en contenido/fotos.ts` +
      (cuantosVideos > 0
        ? `\n✓ ${cuantosVideos} video${cuantosVideos === 1 ? "" : "s"} con su cuadro de cartel en public/videos/, manifiesto en contenido/videos.ts`
        : "") +
      (avisos > 0
        ? `\n  con ${avisos} aviso${avisos === 1 ? "" : "s"} más arriba`
        : "") +
      `\n\n  Verificá que ninguno conserve metadatos antes de publicar:\n` +
      `    npm run fotos:revisar\n`,
  );
}

await main();
