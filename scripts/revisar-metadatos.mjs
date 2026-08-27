#!/usr/bin/env node
/**
 * Mira qué metadatos tiene un archivo de imagen. Sobre todo: si tiene GPS.
 *
 *     node scripts/revisar-metadatos.mjs foto.jpg otra.webp
 *
 * **Por qué esto existe.** Las fotos del sitio son de casas particulares de
 * clientes, y las de celular traen las coordenadas del domicilio en el EXIF.
 * Publicarlas sin limpiar expone la dirección exacta de un cliente a
 * cualquiera que descargue la imagen. Es el riesgo más concreto del proyecto y
 * `docs/seguridad.md` pide que **se verifique, no que se dé por sentado**.
 *
 * El panel recomprime cada foto en un canvas antes de subirla, y un canvas es
 * un búfer de píxeles: no tiene dónde guardar metadatos, así que el EXIF no
 * puede sobrevivir. El razonamiento es sólido y aun así hay que comprobarlo —
 * es exactamente el tipo de cosa que se rompe en silencio el día que alguien
 * cambia el flujo de subida.
 *
 * Sin dependencias: lee los contenedores a mano. No es un lector de EXIF
 * completo y no pretende serlo; responde una sola pregunta —¿quedó algún
 * metadato, y en particular coordenadas?— que es la que importa acá.
 */

import { readFileSync } from "node:fs";
import { basename } from "node:path";

// ── JPEG ───────────────────────────────────────────────────────────────────

/**
 * Un JPEG es una serie de segmentos que empiezan con `FF`. Los metadatos viven
 * en los `APPn`: el EXIF en APP1 con la firma `Exif\0\0`, el XMP en otro APP1
 * con una firma de URL, el perfil de color en APP2.
 */
function leerJpeg(datos) {
  const hallazgos = [];
  let exif = null;
  let i = 2; // se saltea SOI (FFD8)

  while (i < datos.length - 1) {
    if (datos[i] !== 0xff) break;
    const marca = datos[i + 1];

    // SOS: acá empiezan los datos comprimidos y ya no hay más segmentos.
    if (marca === 0xda || marca === 0xd9) break;
    if (marca === 0x01 || (marca >= 0xd0 && marca <= 0xd7)) {
      i += 2;
      continue;
    }

    const largo = datos.readUInt16BE(i + 2);
    const cuerpo = datos.subarray(i + 4, i + 2 + largo);

    if (
      marca === 0xe1 &&
      cuerpo.subarray(0, 6).toString("latin1") === "Exif\0\0"
    ) {
      hallazgos.push(`EXIF (APP1, ${cuerpo.length} bytes)`);
      exif = cuerpo.subarray(6);
    } else if (marca === 0xe1) {
      hallazgos.push(`XMP (APP1, ${cuerpo.length} bytes)`);
    } else if (marca === 0xe2) {
      hallazgos.push(`Perfil de color ICC (APP2, ${cuerpo.length} bytes)`);
    } else if (marca === 0xed) {
      hallazgos.push(`IPTC (APP13, ${cuerpo.length} bytes)`);
    } else if (marca === 0xfe) {
      hallazgos.push(`Comentario (${cuerpo.length} bytes)`);
    }

    i += 2 + largo;
  }

  return { hallazgos, gps: exif ? leerGps(exif) : null };
}

/**
 * Saca las coordenadas del bloque TIFF del EXIF.
 *
 * El EXIF es un TIFF adentro del JPEG: una cabecera que dice el orden de bytes,
 * un puntero al primer directorio, y ahí una etiqueta 0x8825 que apunta al
 * directorio de GPS. Las coordenadas son tres racionales — grados, minutos y
 * segundos — más una letra que dice el hemisferio.
 */
function leerGps(tiff) {
  const bom = tiff.subarray(0, 2).toString("latin1");
  if (bom !== "II" && bom !== "MM") return null;
  const le = bom === "II";

  const u16 = (o) => (le ? tiff.readUInt16LE(o) : tiff.readUInt16BE(o));
  const u32 = (o) => (le ? tiff.readUInt32LE(o) : tiff.readUInt32BE(o));

  const buscarEnIfd = (inicio, etiqueta) => {
    if (inicio + 2 > tiff.length) return null;
    const cuantas = u16(inicio);
    for (let n = 0; n < cuantas; n += 1) {
      const e = inicio + 2 + n * 12;
      if (e + 12 > tiff.length) return null;
      if (u16(e) === etiqueta)
        return { tipo: u16(e + 2), cuenta: u32(e + 4), valor: e + 8 };
    }
    return null;
  };

  const ifd0 = u32(4);
  const puntero = buscarEnIfd(ifd0, 0x8825);
  if (!puntero) return null;

  const gpsIfd = u32(puntero.valor);

  const racionales = (etiqueta) => {
    const e = buscarEnIfd(gpsIfd, etiqueta);
    if (!e || e.tipo !== 5) return null;
    const base = u32(e.valor);
    const salida = [];
    for (let n = 0; n < e.cuenta; n += 1) {
      const num = u32(base + n * 8);
      const den = u32(base + n * 8 + 4);
      salida.push(den === 0 ? 0 : num / den);
    }
    return salida;
  };

  const letra = (etiqueta) => {
    const e = buscarEnIfd(gpsIfd, etiqueta);
    if (!e || e.tipo !== 2) return null;
    // Con uno o dos caracteres el valor entra en los 4 bytes del propio campo.
    return String.fromCharCode(tiff[e.cuenta <= 4 ? e.valor : u32(e.valor)]);
  };

  const aGrados = (partes) =>
    partes ? partes[0] + (partes[1] ?? 0) / 60 + (partes[2] ?? 0) / 3600 : null;

  const lat = aGrados(racionales(2));
  const lon = aGrados(racionales(4));
  if (lat === null || lon === null) return null;

  const refLat = letra(1) ?? "?";
  const refLon = letra(3) ?? "?";

  return {
    texto: `${lat.toFixed(6)}° ${refLat}, ${lon.toFixed(6)}° ${refLon}`,
    mapa: `https://www.google.com/maps?q=${refLat === "S" ? -lat : lat},${
      refLon === "W" ? -lon : lon
    }`,
  };
}

// ── WebP ───────────────────────────────────────────────────────────────────

/**
 * Un WebP es un RIFF: una lista de trozos con nombre. Los metadatos, si los
 * hubiera, estarían en trozos llamados `EXIF`, `XMP ` o `ICCP`. Un WebP salido
 * de un canvas no tiene ninguno, porque el canvas no tiene de dónde sacarlos.
 */
function leerWebp(datos) {
  const hallazgos = [];
  let ancho = null;
  let alto = null;
  let i = 12; // se saltea "RIFF" + tamaño + "WEBP"

  while (i + 8 <= datos.length) {
    const nombre = datos.subarray(i, i + 4).toString("latin1");
    const largo = datos.readUInt32LE(i + 4);
    const cuerpo = datos.subarray(i + 8, i + 8 + largo);

    if (nombre === "EXIF") hallazgos.push(`EXIF (${largo} bytes)`);
    else if (nombre === "XMP ") hallazgos.push(`XMP (${largo} bytes)`);
    else if (nombre === "ICCP")
      hallazgos.push(`Perfil de color ICC (${largo} bytes)`);
    else if (nombre === "VP8X") {
      ancho = 1 + (cuerpo[4] | (cuerpo[5] << 8) | (cuerpo[6] << 16));
      alto = 1 + (cuerpo[7] | (cuerpo[8] << 8) | (cuerpo[9] << 16));
    } else if (nombre === "VP8 " && ancho === null) {
      ancho = cuerpo.readUInt16LE(6) & 0x3fff;
      alto = cuerpo.readUInt16LE(8) & 0x3fff;
    } else if (nombre === "VP8L" && ancho === null) {
      const bits = cuerpo.readUInt32LE(1);
      ancho = (bits & 0x3fff) + 1;
      alto = ((bits >> 14) & 0x3fff) + 1;
    }

    i += 8 + largo + (largo % 2); // los trozos van alineados a par
  }

  return { hallazgos, ancho, alto, gps: null };
}

// ── PNG ────────────────────────────────────────────────────────────────────

function leerPng(datos) {
  const hallazgos = [];
  let i = 8;
  let ancho = null;
  let alto = null;

  while (i + 8 <= datos.length) {
    const largo = datos.readUInt32BE(i);
    const nombre = datos.subarray(i + 4, i + 8).toString("latin1");

    if (nombre === "IHDR") {
      ancho = datos.readUInt32BE(i + 8);
      alto = datos.readUInt32BE(i + 12);
    } else if (nombre === "eXIf") hallazgos.push(`EXIF (${largo} bytes)`);
    else if (nombre === "iCCP")
      hallazgos.push(`Perfil de color ICC (${largo} bytes)`);
    else if (nombre === "tEXt" || nombre === "iTXt" || nombre === "zTXt") {
      hallazgos.push(`Texto ${nombre} (${largo} bytes)`);
    }

    if (nombre === "IEND") break;
    i += 12 + largo;
  }

  return { hallazgos, ancho, alto, gps: null };
}

// ── Salida ─────────────────────────────────────────────────────────────────

function revisar(ruta) {
  const datos = readFileSync(ruta);
  let formato;
  let resultado;

  if (datos[0] === 0xff && datos[1] === 0xd8) {
    formato = "JPEG";
    resultado = leerJpeg(datos);
  } else if (datos.subarray(0, 4).toString("latin1") === "RIFF") {
    formato = "WebP";
    resultado = leerWebp(datos);
  } else if (
    datos[0] === 0x89 &&
    datos.subarray(1, 4).toString("latin1") === "PNG"
  ) {
    formato = "PNG";
    resultado = leerPng(datos);
  } else {
    console.log(`\n${basename(ruta)}\n  formato desconocido`);
    return true;
  }

  const kb = (datos.length / 1024).toFixed(1).replace(".", ",");
  const medida =
    resultado.ancho && resultado.alto
      ? `  ${resultado.ancho} × ${resultado.alto}`
      : "";

  console.log(`\n${basename(ruta)}`);
  console.log(`  ${formato}  ${kb} kB${medida}`);

  if (resultado.hallazgos.length === 0) {
    console.log("  ✓ sin metadatos");
    return true;
  }

  for (const h of resultado.hallazgos) console.log(`  · ${h}`);

  if (resultado.gps) {
    console.log(`  ✗ COORDENADAS GPS: ${resultado.gps.texto}`);
    console.log(`    ${resultado.gps.mapa}`);
    return false;
  }

  return true;
}

const rutas = process.argv.slice(2);

if (rutas.length === 0) {
  console.error(
    "\nUso: node scripts/revisar-metadatos.mjs <archivo> [archivo…]\n\n" +
      "  Dice qué metadatos tiene cada imagen, y si tiene coordenadas GPS.\n" +
      "  Devuelve 1 si alguna las tiene, para poder usarlo en una comprobación.\n",
  );
  process.exitCode = 1;
} else {
  let limpio = true;
  for (const ruta of rutas) {
    try {
      if (!revisar(ruta)) limpio = false;
    } catch (fallo) {
      console.log(`\n${basename(ruta)}\n  no se pudo leer: ${fallo.message}`);
      limpio = false;
    }
  }
  console.log("");
  if (!limpio) process.exitCode = 1;
}
