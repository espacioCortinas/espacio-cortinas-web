/**
 * Procesamiento de imágenes. **Todo esto corre en el NAVEGADOR.**
 *
 * No es una preferencia de rendimiento, son dos restricciones duras
 * (decisiones 5 y 25, docs/arquitectura.md):
 *
 *   1. En el servidor no se puede. `sharp` es un módulo nativo sobre libvips y
 *      el runtime de Workers no ejecuta binarios nativos. Además el plan
 *      gratuito da 10 ms de CPU por invocación, y redimensionar una foto de
 *      8 MB está órdenes de magnitud por encima.
 *   2. Al servir tampoco. Las Transformations de Cloudflare topan en 5.000
 *      transformaciones únicas por mes en el plan gratuito, y pasado el tope
 *      devuelven error en vez de degradarse. Con 300 fotos por cuatro cortes,
 *      ese techo se toca mostrando el sitio una vez.
 *
 * Entonces el trabajo se hace UNA vez, en el teléfono de quien sube, que
 * además está ocioso. Lo que sale de acá son los `.webp` definitivos.
 *
 * Y acá es donde se borra el EXIF, que es el riesgo más concreto del proyecto:
 * las fotos son de casas de clientes y las de celular traen coordenadas GPS.
 * Ver `aWebp()`.
 */

import {
  IMAGEN_CALIDAD_WEBP,
  IMAGEN_LADO_MAXIMO,
  IMAGEN_PESO_MAXIMO_MB,
  MEDIDAS_IMAGEN,
  PORTADA_RELACION,
  TIPOS_DE_IMAGEN_ACEPTADOS,
  TIPO_SUBIDO,
} from "@/lib/constantes";

/** Un archivo listo para subir: el ancho que le toca y el WebP ya generado. */
export type MedidaGenerada = {
  ancho: number;
  blob: Blob;
};

export type ImagenPreparada = {
  /** Los anchos que existen de verdad. Va tal cual a la columna `medidas`. */
  medidas: number[];
  /** Del archivo más grande generado, no del original. */
  ancho: number;
  alto: number;
  archivos: MedidaGenerada[];
  /** Para mostrar la miniatura mientras se sube, sin volver a decodificar. */
  vistaPrevia: string;
};

/**
 * Error con un mensaje pensado para la administradora, no para nosotros.
 *
 * «La foto pesa demasiado», no «413 Payload Too Large». Si el mensaje no se
 * entiende sin saber cómo está hecho el sitio, está mal escrito.
 */
export class ErrorDeImagen extends Error {}

const MB = 1024 * 1024;

/**
 * Comprobaciones baratas, antes de gastar memoria decodificando.
 *
 * Esto es COMODIDAD, no seguridad: corre en el navegador y se puede saltear.
 * La validación que cuenta está en la Server Action antes de firmar la subida,
 * y en el propio bucket — docs/seguridad.md.
 */
export function validarArchivo(archivo: File): void {
  const tipos: readonly string[] = TIPOS_DE_IMAGEN_ACEPTADOS;

  if (!tipos.includes(archivo.type)) {
    // El caso real de todos los días: un iPhone con el formato de cámara en
    // «Alta eficiencia» guarda HEIC, y la web no lo sabe leer. El mensaje dice
    // qué hacer, no qué pasó.
    if (/heic|heif/i.test(archivo.type) || /\.hei[cf]$/i.test(archivo.name)) {
      throw new ErrorDeImagen(
        "Esta foto está en formato HEIC y la página no puede abrirla. " +
          "En el iPhone: Ajustes → Cámara → Formatos → elegí «Más compatible», " +
          "y sacá la foto de nuevo. Las fotos que ya tenés se pueden mandar por " +
          "WhatsApp a vos misma, que las convierte.",
      );
    }
    throw new ErrorDeImagen(
      `«${archivo.name}» no es una foto que la página pueda usar. Tienen que ser JPG, PNG o WebP.`,
    );
  }

  if (archivo.size > IMAGEN_PESO_MAXIMO_MB * MB) {
    const pesa = (archivo.size / MB).toFixed(1).replace(".", ",");
    throw new ErrorDeImagen(
      `La foto pesa demasiado: ${pesa} MB, y el máximo son ${IMAGEN_PESO_MAXIMO_MB} MB. ` +
        "Suele pasar con fotos sacadas en la máxima calidad.",
    );
  }
}

/**
 * Decodifica el archivo **con la orientación ya aplicada**.
 *
 * Una foto sacada con el teléfono de costado no viene rotada: viene derecha
 * con una etiqueta EXIF que dice «esto va girado 90°». Si se dibuja en un
 * canvas sin aplicar esa etiqueta, sale acostada — y como el paso siguiente
 * borra el EXIF, sale acostada **para siempre**, sin forma de arreglarlo.
 * Por eso se normaliza antes y no después.
 *
 * `createImageBitmap` con `imageOrientation: "from-image"` es la forma
 * directa. El respaldo con `<img>` existe para navegadores que no aceptan el
 * segundo argumento: ahí la orientación la aplica el propio navegador al
 * decodificar, porque `image-orientation: from-image` es el valor por defecto
 * de CSS desde 2020.
 */
async function decodificar(
  archivo: File,
): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(archivo, { imageOrientation: "from-image" });
  } catch {
    // Puede fallar por no soportar las opciones o porque el formato no se
    // puede decodificar. El respaldo distingue los dos casos.
  }

  const url = URL.createObjectURL(archivo);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    // `decode()` no falla con una imagen de 0×0 en todos los navegadores.
    if (!img.naturalWidth || !img.naturalHeight) {
      throw new Error("sin dimensiones");
    }
    return img;
  } catch {
    throw new ErrorDeImagen(
      `No se pudo abrir «${archivo.name}». Puede estar dañada o en un formato que la página no entiende.`,
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

function medirFuente(fuente: ImageBitmap | HTMLImageElement) {
  return fuente instanceof HTMLImageElement
    ? { ancho: fuente.naturalWidth, alto: fuente.naturalHeight }
    : { ancho: fuente.width, alto: fuente.height };
}

/**
 * Qué anchos se generan para una foto de este ancho.
 *
 * La regla es **no agrandar nunca**: agrandar no agrega detalle, solo bytes, y
 * además mentiría en el `srcset` (el descriptor `w` tiene que ser el ancho
 * real del archivo). De ahí salen dos consecuencias:
 *
 *   - una foto de teléfono, que ronda los 3.000 px de ancho, da las cuatro
 *     medidas completas;
 *   - una foto vieja de 900 px da `{480, 900}` — las medidas fijas que le
 *     entran, más su propio ancho, para que igual exista una versión nítida
 *     en pantallas de mucha densidad.
 *
 * Por eso la columna `medidas` es un arreglo por fila y no una constante del
 * código: si el `srcset` se armara con la lista fija, el navegador pediría
 * `1600.webp` de una foto que no lo tiene y la imagen no cargaría.
 */
export function medidasPara(anchoOriginal: number): number[] {
  const tope = Math.min(anchoOriginal, IMAGEN_LADO_MAXIMO);
  const fijas = MEDIDAS_IMAGEN.filter((m) => m < tope);
  return [...fijas, tope];
}

/**
 * Dibuja `fuente` en un canvas del tamaño pedido y devuelve un WebP.
 *
 * **ACÁ SE BORRA EL EXIF, y no por un paso que haya que acordarse de dar.** Un
 * canvas es un búfer de píxeles: no tiene dónde guardar metadatos. Lo que
 * entra al canvas son colores y lo que sale de `toBlob` es una imagen
 * recomprimida desde esos colores. Las coordenadas GPS, el modelo del
 * teléfono, la fecha y la orientación no sobreviven porque no hay ningún
 * camino por el que puedan pasar.
 *
 * Que sea estructural y no un borrado explícito es lo que lo hace confiable,
 * pero **igual se verifica con una foto real** antes de dar la fase por
 * terminada: docs/seguridad.md lo pide y es el riesgo más concreto del
 * proyecto.
 */
async function aWebp(
  fuente: CanvasImageSource,
  recorte: { x: number; y: number; ancho: number; alto: number },
  destino: { ancho: number; alto: number },
): Promise<{ blob: Blob; lienzo: HTMLCanvasElement }> {
  const lienzo = document.createElement("canvas");
  lienzo.width = destino.ancho;
  lienzo.height = destino.alto;

  const pincel = lienzo.getContext("2d", { alpha: false });
  if (!pincel) {
    throw new ErrorDeImagen(
      "El navegador no pudo preparar la foto. Probá cerrando otras pestañas y recargando.",
    );
  }

  pincel.imageSmoothingEnabled = true;
  pincel.imageSmoothingQuality = "high";
  pincel.drawImage(
    fuente,
    recorte.x,
    recorte.y,
    recorte.ancho,
    recorte.alto,
    0,
    0,
    destino.ancho,
    destino.alto,
  );

  const blob = await new Promise<Blob | null>((resolver) =>
    lienzo.toBlob(resolver, TIPO_SUBIDO, IMAGEN_CALIDAD_WEBP),
  );

  if (!blob) {
    throw new ErrorDeImagen(
      "El navegador no pudo comprimir la foto. Probá con una foto más chica.",
    );
  }

  // Un navegador que no sabe escribir WebP no falla: devuelve un PNG con el
  // tipo cambiado, y entonces se subiría un archivo enorme llamado `.webp`.
  // Se comprueba en vez de confiar.
  if (blob.type !== TIPO_SUBIDO) {
    throw new ErrorDeImagen(
      "Este navegador no puede guardar las fotos en el formato que usa la página. " +
        "Probá desde Chrome, o actualizá el navegador.",
    );
  }

  return { blob, lienzo };
}

/**
 * Recorte centrado a vertical 4:5.
 *
 * El archivo histórico de la empresa es todo horizontal y las portadas tienen
 * que ser verticales, porque los listados usan siempre la portada y es lo que
 * hace que las grillas queden parejas (decisión 14). Recortar centrado no
 * siempre acierta —una cortina puede quedar fuera del recorte— pero es
 * reversible: la foto original está en el Drive de la empresa y se puede
 * volver a subir recortada a mano.
 */
function calcularRecorte(
  ancho: number,
  alto: number,
  recortarAVertical: boolean,
) {
  if (!recortarAVertical) return { x: 0, y: 0, ancho, alto };

  const relacionActual = ancho / alto;
  if (relacionActual <= PORTADA_RELACION) return { x: 0, y: 0, ancho, alto };

  const anchoRecortado = Math.round(alto * PORTADA_RELACION);
  return {
    x: Math.round((ancho - anchoRecortado) / 2),
    y: 0,
    ancho: anchoRecortado,
    alto,
  };
}

/**
 * De un archivo del carrete a los WebP listos para subir.
 *
 * Las medidas se generan **de la más grande a la más chica, encadenadas**: la
 * de 1600 sale de la de 2560, no del original. Bajar de 3.000 px a 480 de un
 * salto deja la imagen con escalones; hacerlo en pasos que nunca bajan de la
 * mitad es lo que produce un resultado nítido. De paso es más rápido, porque
 * cada paso trabaja sobre una imagen más chica que la anterior.
 */
export async function prepararImagen(
  archivo: File,
  opciones: { recortarAVertical?: boolean } = {},
): Promise<ImagenPreparada> {
  validarArchivo(archivo);

  const fuente = await decodificar(archivo);

  try {
    const original = medirFuente(fuente);
    const recorte = calcularRecorte(
      original.ancho,
      original.alto,
      opciones.recortarAVertical ?? false,
    );

    const medidas = medidasPara(recorte.ancho);
    const relacion = recorte.alto / recorte.ancho;

    const archivos: MedidaGenerada[] = [];
    let anterior: CanvasImageSource = fuente;
    let recorteActual = recorte;

    // De mayor a menor, encadenando. Lo que pasa al paso siguiente es el
    // LIENZO, no el WebP recién generado: reusar el WebP obligaría a
    // decodificar y volver a comprimir en cada paso, y los artefactos de una
    // compresión con pérdida se irían acumulando sobre los de la anterior.
    for (const ancho of [...medidas].reverse()) {
      const alto = Math.max(1, Math.round(ancho * relacion));
      const { blob, lienzo } = await aWebp(anterior, recorteActual, {
        ancho,
        alto,
      });
      archivos.push({ ancho, blob });

      anterior = lienzo;
      // El recorte ya quedó aplicado en el primer paso; de acá en adelante se
      // dibuja el lienzo entero.
      recorteActual = { x: 0, y: 0, ancho, alto };
    }

    archivos.reverse();
    const laMasGrande = archivos[archivos.length - 1];
    const laMasChica = archivos[0];

    return {
      medidas,
      ancho: laMasGrande.ancho,
      alto: Math.max(1, Math.round(laMasGrande.ancho * relacion)),
      archivos,
      vistaPrevia: URL.createObjectURL(laMasChica.blob),
    };
  } finally {
    if (typeof ImageBitmap !== "undefined" && fuente instanceof ImageBitmap) {
      fuente.close();
    }
  }
}

/** `true` si la imagen puede ser portada. Vertical de verdad, no cuadrada. */
export function puedeSerPortada(ancho: number, alto: number): boolean {
  return alto > ancho;
}
