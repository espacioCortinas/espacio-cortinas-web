import type {
  Foto,
  Medio,
  ProductoConMedios,
  ProyectoConMedios,
  Recuadro,
  VarianteConMedios,
} from "@/contenido/tipos";
import { esVideo } from "@/lib/fotos";
import { altAutomatico } from "@/lib/texto";

/**
 * El damero de las páginas de producto y de proyecto — Fase 4.7.
 *
 * Es la grilla de 2×2 del boceto de la empresa: celdas de foto y de texto
 * alternadas, con líneas finas, de borde a borde. **Acá se decide qué va en
 * cada celda; `components/damero.tsx` solo lo dibuja.** Separado porque la
 * regla no es trivial y así se lee entera, sin JSX en el medio.
 *
 * # En producto, la celda de la foto es un carrusel — decisión 67
 *
 * Cada producto y cada variante con fotos es **una colección**, y la colección
 * va entera en un carrusel: una foto grande por vez, que se desliza. Así el
 * álbum no alarga la página —tres fotos o diez ocupan lo mismo— y en el
 * teléfono no quedan las fotos una debajo de la otra, que es lo que pasaba
 * cuando cada foto era una celda.
 *
 * **Cuando la colección tiene dos textos que la acompañen, el álbum se parte
 * en dos**: la primera mitad de las fotos al lado del primer texto, y el resto
 * —con los videos— al lado del segundo. Es el 2×2 del boceto, foto y texto y
 * después texto y foto, y evita la página «título, descripción y el álbum
 * entero de una».
 *
 * # La regla, con lo que hay en el catálogo
 *
 * 1. **El producto**: sus fotos, con la portada primera, y los videos de las
 *    variantes que no tienen texto propio —el Motorizado de Roller, el Riel
 *    motorizado—, con el nombre de la variante abajo. Lo acompañan el
 *    recuadro del producto y la celda de las variantes que no tienen nada que
 *    mostrar.
 * 2. **Cada variante con fotos, o con video y algo que decir**, arma su propio
 *    bloque: su nombre, lema y descripción, y su recuadro si lo tiene.
 * 3. **Las variantes que no tienen nada que mostrar** van juntas en una celda
 *    de texto, con su nombre y su descripción: **ninguna se esconde**
 *    (`contenido/tipos.ts`, `VarianteConMedios`).
 *
 * **Las filas alternan el lado**: en la primera el medio va a la izquierda, en
 * la segunda a la derecha, y así. En el teléfono, con una sola columna, el
 * medio va siempre arriba de su texto.
 *
 * # Lo que da hoy
 *
 *     compacta-blackout, venecianas  1–3 | recuadro
 *     bandas-verticales              1–5 | recuadro
 *     toldos                         1–2 | recuadro      3 | variantes
 *     cortinas-tela                  1–2 | recuadro      3 + video riel motorizado | variantes
 *                                    riel 1–2 | Riel      barral 1–2 | Barral
 *     roller                         1–3 + video motorizado (sola)
 *                                    screen 1–2 | Screen  screen 3 | recuadro
 *                                    blackout 1 | Blackout  blackout 2 | recuadro
 *
 * Los proyectos no cambian: su galería sigue de a dos, foto por foto
 * (decisión 51).
 */

/** Una foto o un video, con su nombre accesible y lo que va debajo. */
export type CeldaDeMedio = {
  tipo: "medio";
  medio: Medio;
  /** El texto alternativo de una foto, o el nombre accesible de un video. */
  nombre: string;
  /** El nombre de la variante, cuando el medio es de una que no tiene bloque. */
  pie?: string;
};

/** Una celda del damero. */
export type Celda =
  | CeldaDeMedio
  | {
      tipo: "coleccion";
      /** Para el carrusel: «Fotos de Roller Screen». */
      nombre: string;
      medios: CeldaDeMedio[];
    }
  | { tipo: "recuadro"; recuadro: Recuadro }
  | { tipo: "variante"; variante: VarianteConMedios }
  | { tipo: "variantes"; variantes: VarianteConMedios[] };

export type CeldaDeColeccion = Extract<Celda, { tipo: "coleccion" }>;
type CeldaVisual = CeldaDeMedio | CeldaDeColeccion;
type CeldaDeTexto = Exclude<Celda, CeldaVisual>;

/**
 * Una fila: lo visual y su texto, dos medios, o una celda sola que ocupa todo
 * el ancho. **Lo visual va siempre primero**, que es como queda en el
 * teléfono; `invertida` lo pasa a la derecha en escritorio.
 */
export type Fila = {
  celdas: [Celda] | [CeldaVisual, Celda];
  invertida: boolean;
};

/** Las filas, numeradas para alternar el lado. */
function alternar(filas: Fila["celdas"][]): Fila[] {
  return filas.map((celdas, i) => ({ celdas, invertida: i % 2 === 1 }));
}

/** Lo suelto, de a dos. El último, si queda solo, ocupa la fila entera. */
function deADos(sueltos: CeldaDeMedio[]): Fila["celdas"][] {
  const filas: Fila["celdas"][] = [];
  for (let i = 0; i < sueltos.length; i += 2) {
    const segundo = sueltos[i + 1];
    filas.push(segundo ? [sueltos[i], segundo] : [sueltos[i]]);
  }
  return filas;
}

/**
 * La colección en una o dos filas, según cuántos textos la acompañen.
 *
 * **El corte**: la primera mitad de las fotos —redondeando para arriba, así la
 * portada nunca queda sola si hay más— va con el primer texto; el resto de
 * las fotos y todos los videos, con el segundo. Los videos van al final porque
 * una foto se entiende de un vistazo y un video pide quedarse mirándolo.
 *
 * Si la colección no alcanza para dos pedazos —una sola foto, sin video—, los
 * dos textos van en una fila cada uno y la colección con el primero.
 */
function filasDeColeccion(
  nombre: string,
  medios: CeldaDeMedio[],
  textos: CeldaDeTexto[],
): Fila["celdas"][] {
  const coleccion = (parte: CeldaDeMedio[]): CeldaDeColeccion => ({
    tipo: "coleccion",
    nombre,
    medios: parte,
  });
  const [primero, segundo] = textos;

  if (medios.length === 0) return textos.map((t) => [t]);
  if (!primero) return [[coleccion(medios)]];
  if (!segundo) return [[coleccion(medios), primero]];

  const fotos = medios.filter((m) => !esVideo(m.medio));
  const videos = medios.filter((m) => esVideo(m.medio));
  const corte = Math.ceil(fotos.length / 2);
  const parte1 = fotos.slice(0, corte);
  const parte2 = [...fotos.slice(corte), ...videos];

  if (parte1.length === 0 || parte2.length === 0) {
    return [[coleccion(medios), primero], [segundo]];
  }
  return [
    [coleccion(parte1), primero],
    [coleccion(parte2), segundo],
  ];
}

/** Las celdas de los medios de una variante, en orden: fotos y después video. */
function mediosDeVariante(
  producto: ProductoConMedios,
  variante: VarianteConMedios,
  conPie: boolean,
): CeldaDeMedio[] {
  const nombre = `${producto.nombre} ${variante.nombre}`;
  const pie = conPie ? variante.nombre : undefined;
  const fotos: CeldaDeMedio[] = variante.fotos.map((foto, i) => ({
    tipo: "medio",
    medio: foto,
    nombre: altAutomatico(nombre, i + 1),
    pie,
  }));
  const video: CeldaDeMedio[] = variante.video
    ? [
        {
          tipo: "medio",
          medio: variante.video,
          // El video de una variante muestra siempre lo mismo: la cortina
          // moviéndose sola, que es lo que una foto no puede (decisión 40).
          nombre: `${nombre}: la cortina abriéndose y cerrándose sola`,
          pie,
        },
      ]
    : [];
  return [...fotos, ...video];
}

export function filasDeProducto(producto: ProductoConMedios): Fila[] {
  const tieneMedios = (v: VarianteConMedios) =>
    v.fotos.length > 0 || v.video !== null;
  const tieneTexto = (v: VarianteConMedios) =>
    Boolean(v.descripcion || v.lema || v.recuadro);

  // 2 — Con bloque propio: las que tienen fotos, y las de solo video que
  // tienen algo que decir. Una de solo video sin texto sería una celda con un
  // nombre solo al lado de su video —el Motorizado de Roller—, así que su
  // video va a la colección del producto, con el nombre abajo.
  const conBloque = producto.variantes.filter(
    (v) => v.fotos.length > 0 || (v.video !== null && tieneTexto(v)),
  );
  const sueltas = producto.variantes.filter(
    (v) => !conBloque.includes(v) && tieneMedios(v),
  );
  // 3 — Las que no tienen nada que mostrar, para que se puedan leer.
  const listadas = producto.variantes.filter((v) => !tieneMedios(v));

  // 1 — El producto.
  const mediosDelProducto: CeldaDeMedio[] = [
    ...producto.fotos.map((foto: Foto, i): CeldaDeMedio => ({
      tipo: "medio",
      medio: foto,
      nombre: altAutomatico(producto.nombre, i + 1),
    })),
    ...sueltas.flatMap((v) => mediosDeVariante(producto, v, true)),
  ];
  const textosDelProducto: CeldaDeTexto[] = [
    ...(producto.recuadro
      ? [{ tipo: "recuadro" as const, recuadro: producto.recuadro }]
      : []),
    ...(listadas.length > 0
      ? [{ tipo: "variantes" as const, variantes: listadas }]
      : []),
  ];

  const filas: Fila["celdas"][] = [
    ...filasDeColeccion(
      `Fotos de ${producto.nombre}`,
      mediosDelProducto,
      textosDelProducto,
    ),
  ];

  for (const variante of conBloque) {
    const textos: CeldaDeTexto[] = variante.recuadro
      ? [
          { tipo: "variante", variante },
          { tipo: "recuadro", recuadro: variante.recuadro },
        ]
      : [{ tipo: "variante", variante }];
    filas.push(
      ...filasDeColeccion(
        `Fotos de ${producto.nombre} ${variante.nombre}`,
        mediosDeVariante(producto, variante, false),
        textos,
      ),
    );
  }

  return alternar(filas);
}

/**
 * El damero de un proyecto: la galería entera de a dos, en el orden de la
 * carpeta, con los videos en su lugar (decisión 51). Los proyectos no tienen
 * variantes ni recuadro, y el texto va arriba, en la apertura.
 *
 * **Las fotos y los videos se cuentan por separado** —«foto 3», «video 1»—:
 * un lector de pantalla que oye «foto 7» esperando la séptima foto y recibe un
 * video pierde la cuenta.
 */
export function filasDeProyecto(proyecto: ProyectoConMedios): Fila[] {
  let fotos = 0;
  let videos = 0;
  const celdas: CeldaDeMedio[] = proyecto.galeria.map((medio: Medio) => ({
    tipo: "medio",
    medio,
    nombre: esVideo(medio)
      ? `${proyecto.titulo} — video ${++videos}`
      : altAutomatico(proyecto.titulo, ++fotos),
  }));
  return alternar(deADos(celdas));
}
