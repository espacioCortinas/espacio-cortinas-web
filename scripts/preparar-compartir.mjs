#!/usr/bin/env node
/**
 * Arma la imagen que se ve al pegar el enlace de cada página en WhatsApp.
 *
 *     node scripts/preparar-compartir.mjs
 *
 *     contenido/compartir.ts   qué foto lleva cada página    (se edita a mano)
 *     contenido/fotos.ts       de qué archivo sale           (generado)
 *     public/marca/logo.png    el logo de la banda           (generado)
 *              │
 *              ▼
 *     public/compartir/<página>.<huella>.jpg           1200 × 630, uno por página
 *     contenido/imagenes-para-compartir.ts             el manifiesto
 *
 * Corre solo después de `npm run fotos` y de `npm run marca`, que lo
 * encadenan: si se reemplaza una foto elegida o el logo, la imagen cambia con
 * ellos sin un segundo comando que alguien tenga que recordar. Suelto es
 * `npm run compartir`, que es el que hace falta después de escribir el bloque
 * de un producto nuevo: hasta ahí, su página no existe y no hay a quién
 * armarle imagen.
 *
 * ## Qué hace, y qué no — decisiones 63 y 64
 *
 *     ┌────────────────────────────────────────┐
 *     │                                        │
 *     │   la foto, recortada: 1200 × 480       │
 *     │                                        │
 *     ├────────────────────────────────────────┤
 *     │           ● espacio  (papel)           │  la banda: 1200 × 150
 *     └────────────────────────────────────────┘
 *
 * **Una foto recortada y achicada, y abajo una banda de papel con el logo,
 * centrado.** Nada más: ni texto, ni nada sobre la foto. Lo que WhatsApp
 * cortaba mal en la decisión 59 eran elementos contra los bordes; WhatsApp
 * recorta desde el centro, así que lo que va centrado sobrevive, hasta en la
 * miniatura cuadrada. Y la banda tapa el piso, que es la peor parte de casi
 * todas las fotos. Es la única forma de poner algo sobre una foto que admite
 * `docs/diseno.md`: una banda opaca, del color del papel.
 *
 * **Parte del archivo más grande publicado de esa foto**, el que dice
 * `medidas` en el manifiesto, y **nunca agranda**: si el recorte mide menos de
 * 1200 × 480, esa foto no sirve y el script se niega. No lee
 * `fotos-originales/`, que no se versiona: así cualquiera que clone el
 * repositorio rehace los mismos bytes. El logo tampoco se agranda: el archivo
 * mide 504 px de ancho y en la banda va a 340.
 *
 * **JPEG, y no WebP**: el soporte de WebP en los que arman las vistas previas
 * es desparejo. Y JPEG **base, no progresivo**, por la misma razón.
 *
 * ## Por qué el nombre lleva la huella de los bytes
 *
 * WhatsApp y Facebook guardan cada vista previa por su dirección, durante
 * días, y no vuelven a pedir una que ya tienen. Con un nombre fijo, cambiar la
 * foto de una página no cambiaría nada para un enlace ya compartido: por eso la
 * decisión 62 tuvo que renombrar su imagen a mano. Con los primeros ocho
 * caracteres del SHA-256 en el nombre, **una imagen distinta es siempre una
 * dirección nueva, y una igual es siempre la misma.**
 *
 * ## Determinista
 *
 * Con la misma foto y los mismos parámetros, `sharp` da los mismos bytes —ya
 * estaba comprobado con las fotos—, así que la huella y el nombre también son
 * los mismos y `git status` no marca nada. Si alguien cambia un número de
 * abajo, cambian las doce imágenes y su peso se suma a la historia de git: es
 * la regla de lo publicado _append-only_ de `CLAUDE.md`, y los números están
 * congelados por eso.
 *
 * Lo que sale se revisa con `npm run fotos:revisar`: son fotos de casas de
 * clientes, aunque salgan de archivos que ya estaban limpios.
 */

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import prettier from "prettier";
import sharp from "sharp";

import { fotosParaCompartir } from "../contenido/compartir.ts";
import { fotos } from "../contenido/fotos.ts";
import { productos } from "../contenido/productos.ts";
import { proyectos } from "../contenido/proyectos.ts";
import { altAutomatico } from "../lib/texto.ts";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const FOTOS_PUBLICADAS = join(RAIZ, "public", "fotos");
const LOGO = join(RAIZ, "public", "marca", "logo.png");
const DESTINO = join(RAIZ, "public", "compartir");
const MANIFIESTO = join(RAIZ, "contenido", "imagenes-para-compartir.ts");

/*
 * ── Los parámetros, congelados ───────────────────────────────────────────
 */

/** 1,91:1: lo que WhatsApp, Facebook y X muestran como vista previa grande. */
const ANCHO = 1200;
const ALTO = 630;

/**
 * La banda del logo, abajo, y el ancho del logo adentro — decisión 64.
 *
 * Se eligieron mirando dos tamaños con las fotos reales. Con 340 px de logo
 * en 1200, en un teléfono el logo se ve de unos 90 px de ancho: se lee. La
 * banda de 150 le deja aire arriba y abajo y todavía entra en un recorte a 2:1
 * desde el centro. La foto se queda con el resto: 1200 × 480.
 */
const BANDA_ALTO = 150;
const LOGO_ANCHO = 340;
const FOTO_ALTO = ALTO - BANDA_ALTO;

/**
 * El papel de cal de `app/globals.css` (`--color-fondo`). Copiado a propósito,
 * por la misma razón que `SESGO`: lo publicado cambia solo cuando alguien lo
 * decide acá.
 */
const PAPEL = "#f6f2ec";

/**
 * Por dónde pasa el corte, como el `object-position` del sitio: la misma
 * escala que `POSICION` de `components/foto.tsx`.
 *
 * **Copiados y no importados, a propósito.** Si el sitio mañana cambia su
 * recorte, las fotos de las páginas cambian con el CSS y no pesan nada; estas
 * doce imágenes, en cambio, saldrían con otros bytes y se sumarían a la
 * historia de git. Lo publicado cambia solo cuando alguien lo decide acá.
 */
const SESGO = { alto: 0.15, centro: 0.5, bajo: 0.85 };

/**
 * La calidad más alta, hasta 85, con la que la imagen entra en 150 kB.
 *
 * Una sola calidad fija no alcanza: el peso depende de la foto, y las lamas
 * de una veneciana contra el pasto pesan más del doble que un screen liso. Así
 * las de menos textura salen a 85 —con 150 kB de techo no hay nada que
 * ahorrar— y las de mucha bajan lo justo, que es donde menos se nota porque la
 * textura misma lo esconde. La banda del logo es papel liso y casi no pesa.
 *
 * 150 kB es el techo que se buscó a propósito: es lo que se descarga en un
 * teléfono cada vez que la tarjeta aparece en un chat.
 */
const CALIDAD_MAXIMA = 85;
const CALIDAD_MINIMA = 70;
const PESO_MAXIMO = 150 * 1024;

/**
 * JPEG **base**: no progresivo, 4:2:0, sin perfil de color ni metadatos.
 *
 * Las opciones de trellis y la tabla 3 son las de `mozjpeg` y achican el
 * archivo cerca de un 20 % a igual calidad; siguen siendo un JPEG base
 * estándar, que lee cualquier decodificador. `mozjpeg: true` no se usa porque
 * además lo vuelve progresivo.
 */
const JPEG = {
  progressive: false,
  chromaSubsampling: "4:2:0",
  trellisQuantisation: true,
  overshootDeringing: true,
  quantisationTable: 3,
};

/*
 * ── Las páginas y sus fotos ──────────────────────────────────────────────
 */

/**
 * Las páginas del sitio que llevan imagen, en el orden del menú.
 *
 * `galeria` es lo que la regla puede elegir: las fotos de la página en el orden
 * en que se ven —las del producto y después las de cada variante—. Inicio, los
 * listados y Contacto no tienen galería propia, y por eso su línea en
 * `contenido/compartir.ts` es obligatoria.
 *
 * Van **todos** los productos y proyectos, también los que no están activos:
 * encenderlos es cambiar un booleano, sin volver a correr esto, y la página
 * tiene que salir con su imagen.
 */
function paginas() {
  const galeriaDe = (clave) => fotos[clave] ?? [];

  return [
    { ruta: "/", galeria: null },
    { ruta: "/productos", galeria: null },
    ...productos.map((producto) => ({
      ruta: `/productos/${producto.slug}`,
      prefijo: `productos/${producto.slug}/`,
      galeria: [
        ...galeriaDe(`productos/${producto.slug}`),
        ...producto.variantes.flatMap((variante) =>
          variante.clave
            ? galeriaDe(`productos/${producto.slug}/${variante.clave}`)
            : [],
        ),
      ],
    })),
    { ruta: "/proyectos", galeria: null },
    ...proyectos.map((proyecto) => ({
      ruta: `/proyectos/${proyecto.slug}`,
      prefijo: `proyectos/${proyecto.slug}/`,
      galeria: galeriaDe(`proyectos/${proyecto.slug}`),
    })),
    { ruta: "/contacto", galeria: null },
  ];
}

/**
 * Cada foto del manifiesto con el texto alternativo que tiene en el sitio.
 *
 * La clave de su galería dice de quién es —`productos/roller` es Roller,
 * `productos/roller/blackout` es Roller Blackout— y la posición es la de la
 * galería, igual que la numera `components/galeria.tsx`: la 1 es la portada.
 */
function indiceDeFotos() {
  const indice = new Map();

  for (const [clave, lista] of Object.entries(fotos)) {
    const [entidad, slug, claveVariante] = clave.split("/");
    let nombre = slug;

    if (entidad === "productos") {
      const producto = productos.find((p) => p.slug === slug);
      // Solo si la clave tiene tercer tramo: las variantes sin fotos no llevan
      // `clave`, y comparar `undefined` con `undefined` le pondría a la galería
      // del producto el nombre de una de ellas.
      const variante = claveVariante
        ? producto?.variantes.find((v) => v.clave === claveVariante)
        : undefined;
      if (producto) {
        nombre = variante
          ? `${producto.nombre} ${variante.nombre}`
          : producto.nombre;
      }
    } else if (entidad === "proyectos") {
      nombre = proyectos.find((p) => p.slug === slug)?.titulo ?? slug;
    }

    lista.forEach((foto, i) => {
      indice.set(foto.carpeta, { foto, alt: altAutomatico(nombre, i + 1) });
    });
  }

  return indice;
}

/**
 * La región de la foto que entra en su lugar de la tarjeta —1200 × 480, o sea
 * 2,5:1—, a su tamaño completo.
 *
 * Todas las fotos del archivo son menos apaisadas que eso, así que el corte
 * toma el ancho entero y elige la franja de alto con el sesgo. Si algún día
 * llega una más apaisada —una panorámica—, toma el alto entero y el centro.
 */
function region(foto, enfoque) {
  const proporcion = ANCHO / FOTO_ALTO;

  if (foto.ancho / foto.alto > proporcion) {
    const width = Math.round(foto.alto * proporcion);
    return {
      left: Math.round((foto.ancho - width) / 2),
      top: 0,
      width,
      height: foto.alto,
    };
  }

  const height = Math.round(foto.ancho / proporcion);
  return {
    left: 0,
    top: Math.round((foto.alto - height) * SESGO[enfoque]),
    width: foto.ancho,
    height,
  };
}

/** ¿Alcanzan los píxeles para el lugar de la foto sin agrandar? */
function alcanza(foto) {
  const { width, height } = region(foto, "alto");
  return width >= ANCHO && height >= FOTO_ALTO;
}

/**
 * La regla, para una página que todavía no tiene su línea en
 * `contenido/compartir.ts`: **la primera apaisada de su galería** que tenga
 * píxeles para su lugar sin agrandar, y si no hay ninguna, **la portada**.
 * Siempre con el recorte alto.
 *
 * Es la misma regla con la que se eligieron las de `compartir.ts`, pero sin
 * nadie mirando: por eso el que la llama lo avisa.
 */
function fotoPorLaRegla(galeria) {
  const apaisada = galeria.find((f) => f.ancho > f.alto && alcanza(f));
  return apaisada ?? galeria[0] ?? null;
}

/*
 * ── La imagen ────────────────────────────────────────────────────────────
 */

/**
 * Recorta, achica, arma la tarjeta y codifica. Devuelve el JPEG y la calidad
 * con la que salió.
 *
 * El recorte, la reducción y la composición se hacen una vez; lo que se repite
 * es solo la codificación, bajando de a un punto hasta que entra en el peso.
 * Entre un paso y otro la imagen viaja en PNG o cruda, sin pérdida: la única
 * compresión con pérdida es la del JPEG final.
 */
async function armar(foto, enfoque, logo) {
  const medida = Math.max(...foto.medidas);
  const origen = join(
    FOTOS_PUBLICADAS,
    foto.carpeta,
    `${medida}.${foto.formato}`,
  );

  // El manifiesto dice que la medida más grande mide `ancho × alto`. El recorte
  // se calcula con eso, así que se comprueba en vez de confiar.
  const meta = await sharp(origen).metadata();
  if (meta.width !== foto.ancho || meta.height !== foto.alto) {
    throw new Error(
      `${foto.carpeta}: el manifiesto dice ${foto.ancho}×${foto.alto} y ` +
        `${medida}.${foto.formato} mide ${meta.width}×${meta.height}. ` +
        `Corré npm run fotos.`,
    );
  }

  const corte = region(foto, enfoque);
  if (corte.width < ANCHO || corte.height < FOTO_ALTO) {
    throw new Error(
      `${foto.carpeta} mide ${foto.ancho}×${foto.alto}: el recorte a 2,5:1 ` +
        `queda en ${corte.width}×${corte.height}, menos que ${ANCHO}×${FOTO_ALTO}, ` +
        `y habría que agrandarla. Elegí otra foto en contenido/compartir.ts.`,
    );
  }

  const recortada = await sharp(origen)
    .extract(corte)
    // `fill` y no `cover`: la región ya tiene la proporción, salvo el redondeo
    // de un píxel, y así no se recorta nada más de lo que se eligió.
    .resize(ANCHO, FOTO_ALTO, { fit: "fill" })
    .removeAlpha()
    .png()
    .toBuffer();

  // La tarjeta: papel entero, la foto arriba y el logo centrado en la banda.
  const tarjeta = await sharp({
    create: { width: ANCHO, height: ALTO, channels: 3, background: PAPEL },
  })
    .composite([
      { input: recortada, left: 0, top: 0 },
      {
        input: logo.png,
        left: Math.round((ANCHO - logo.ancho) / 2),
        top: FOTO_ALTO + Math.round((BANDA_ALTO - logo.alto) / 2),
      },
    ])
    .png()
    .toBuffer();

  // El logo trae transparencia: se aplana contra el papel antes de codificar,
  // que un JPEG no tiene canal alfa.
  const { data, info } = await sharp(tarjeta)
    .flatten({ background: PAPEL })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const crudo = {
    raw: { width: info.width, height: info.height, channels: info.channels },
  };

  for (let calidad = CALIDAD_MAXIMA; ; calidad -= 1) {
    const jpeg = await sharp(data, crudo)
      .jpeg({ ...JPEG, quality: calidad })
      .toBuffer();
    if (jpeg.length <= PESO_MAXIMO || calidad === CALIDAD_MINIMA) {
      return { jpeg, calidad, medida, corte };
    }
  }
}

/** `/productos/roller` → `productos-roller`; la raíz es `inicio`. */
const nombreDeArchivo = (ruta) =>
  ruta === "/" ? "inicio" : ruta.slice(1).replaceAll("/", "-");

const kB = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

/*
 * ── La corrida ───────────────────────────────────────────────────────────
 */

async function main() {
  const avisos = [];
  const aviso = (texto) => {
    avisos.push(texto);
    console.warn(`  ! ${texto}`);
  };

  const lista = paginas();
  const indice = indiceDeFotos();

  // El logo, una sola vez para las doce. Es el mismo archivo del encabezado,
  // sin fondo; se achica y nunca se agranda: sin el vector que se le sigue
  // pidiendo a la empresa, 504 px es todo lo que hay (decisión 44).
  const metaLogo = await sharp(LOGO).metadata();
  if (metaLogo.width < LOGO_ANCHO) {
    throw new Error(
      `public/marca/logo.png mide ${metaLogo.width} px de ancho y la banda lo ` +
        `pide a ${LOGO_ANCHO}: habría que agrandarlo. Corré npm run marca.`,
    );
  }
  const { data: pngLogo, info: infoLogo } = await sharp(LOGO)
    .resize({ width: LOGO_ANCHO })
    .png()
    .toBuffer({ resolveWithObject: true });
  const logo = { png: pngLogo, ancho: infoLogo.width, alto: infoLogo.height };

  // Una línea de compartir.ts que no es de ninguna página es casi siempre un
  // slug mal escrito, y esa página se quedaría con la regla sin que nadie lo
  // note.
  const rutas = new Set(lista.map((p) => p.ruta));
  for (const ruta of Object.keys(fotosParaCompartir)) {
    if (!rutas.has(ruta)) {
      throw new Error(
        `contenido/compartir.ts tiene una línea para «${ruta}», que no es una ` +
          `página del sitio. ¿Está bien escrito el slug?`,
      );
    }
  }

  mkdirSync(DESTINO, { recursive: true });
  const escritos = new Set();
  const manifiesto = {};
  const fotoDePagina = new Map();

  for (const pagina of lista) {
    const eleccion = fotosParaCompartir[pagina.ruta];
    let carpeta;
    let enfoque = eleccion?.enfoque ?? "alto";

    if (eleccion) {
      carpeta = eleccion.foto;
      // La foto de un producto tiene que ser suya: la de otro sería un error
      // de tipeo que publica la cortina equivocada con el nombre de esta.
      if (pagina.prefijo && !carpeta.startsWith(pagina.prefijo)) {
        throw new Error(
          `${pagina.ruta} lleva ${carpeta}, que no es de su galería. ` +
            `Una página de producto o de proyecto lleva una foto suya.`,
        );
      }
    } else if (pagina.galeria) {
      const porRegla = fotoPorLaRegla(pagina.galeria);
      if (!porRegla) {
        aviso(
          `${pagina.ruta} no tiene fotos: va a salir con la imagen de Inicio.`,
        );
        continue;
      }
      carpeta = porRegla.carpeta;
      enfoque = "alto";
      aviso(
        `${pagina.ruta} no está en contenido/compartir.ts: se usó ${carpeta} ` +
          `por la regla. Mirala y anotala ahí.`,
      );
    } else {
      throw new Error(
        `Falta la línea de «${pagina.ruta}» en contenido/compartir.ts. ` +
          `Inicio, los listados y Contacto no tienen galería: la foto se elige a mano.`,
      );
    }

    const entrada = indice.get(carpeta);
    if (!entrada) {
      throw new Error(
        `${pagina.ruta} lleva ${carpeta}, que no está en contenido/fotos.ts.`,
      );
    }

    if (fotoDePagina.has(carpeta)) {
      aviso(
        `${pagina.ruta} y ${fotoDePagina.get(carpeta)} llevan la misma foto: ` +
          `al compartirlas dan la misma tarjeta.`,
      );
    }
    fotoDePagina.set(carpeta, pagina.ruta);

    const { jpeg, calidad, medida, corte } = await armar(
      entrada.foto,
      enfoque,
      logo,
    );
    const huella = createHash("sha256").update(jpeg).digest("hex").slice(0, 8);
    const archivo = `${nombreDeArchivo(pagina.ruta)}.${huella}.jpg`;
    const destino = join(DESTINO, archivo);

    // Mismo nombre es mismo contenido: no hace falta volver a escribirlo.
    if (!existsSync(destino)) writeFileSync(destino, jpeg);
    escritos.add(archivo);

    // Lo que se escribió es lo que dice el manifiesto: se lee del archivo.
    const meta = await sharp(destino).metadata();
    if (
      meta.format !== "jpeg" ||
      meta.width !== ANCHO ||
      meta.height !== ALTO ||
      meta.isProgressive ||
      meta.exif ||
      meta.icc
    ) {
      throw new Error(
        `${archivo} no salió como JPEG base de ${ANCHO}×${ALTO}.`,
      );
    }

    manifiesto[pagina.ruta] = {
      ruta: `/compartir/${archivo}`,
      ancho: meta.width,
      alto: meta.height,
      alt: entrada.alt,
      foto: carpeta,
    };

    const conserva = Math.round((corte.height / entrada.foto.alto) * 100);
    console.log(
      `  ${pagina.ruta.padEnd(30)} ${carpeta.padEnd(32)} ${enfoque.padEnd(6)} ` +
        `desde ${String(medida).padStart(4)} px, ${String(conserva).padStart(3)} % del alto  ` +
        `calidad ${calidad}  ${kB(jpeg.length).padStart(8)}  ${archivo}`,
    );
    if (jpeg.length > PESO_MAXIMO) {
      aviso(
        `${archivo} pesa ${kB(jpeg.length)} aun a calidad ${CALIDAD_MINIMA}: ` +
          `es una foto con mucha textura. Probá con otra.`,
      );
    }
  }

  // Lo que quedó de una corrida anterior —una foto que se cambió, una página
  // que se fue— se borra: en git queda igual, y publicado no le sirve a nadie.
  for (const archivo of readdirSync(DESTINO)) {
    if (!escritos.has(archivo)) {
      rmSync(join(DESTINO, archivo));
      console.log(`  borrado ${archivo}: ya no lo usa ninguna página`);
    }
  }

  /* --- El manifiesto -------------------------------------------------- */

  const fuente = `/**
 * ARCHIVO GENERADO por \`scripts/preparar-compartir.mjs\`. NO SE EDITA A MANO:
 * se pisa entero en cada corrida.
 *
 * La imagen que se ve al compartir cada página, por su ruta. Qué foto lleva
 * cada una se elige en \`contenido/compartir.ts\` — decisión 63.
 */

import type { ImagenParaCompartir } from "./tipos";

export const imagenesParaCompartir: Record<string, ImagenParaCompartir> = ${JSON.stringify(manifiesto, null, 2)};
`;

  const config = await prettier.resolveConfig(MANIFIESTO);
  writeFileSync(
    MANIFIESTO,
    await prettier.format(fuente, { ...config, filepath: MANIFIESTO }),
    "utf8",
  );

  const cuantas = Object.keys(manifiesto).length;
  console.log(
    `\n✓ ${cuantas} imágenes para compartir en public/compartir/, manifiesto en ` +
      `contenido/imagenes-para-compartir.ts` +
      (avisos.length > 0
        ? `\n  con ${avisos.length} aviso${avisos.length === 1 ? "" : "s"} más arriba`
        : "") +
      `\n\n  Mirá cada una antes de publicar, y verificá que ninguna conserve metadatos:\n` +
      `    npm run fotos:revisar\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
