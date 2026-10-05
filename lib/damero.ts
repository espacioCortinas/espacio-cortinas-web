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
 * # La regla, con lo que hay en el catálogo
 *
 * El boceto tiene una página por producto con la misma forma: la portada al
 * lado del recuadro, y abajo dos fotos más. El catálogo no es tan parejo —hay
 * productos con variantes, con video, con cinco fotos—, así que la regla es:
 *
 * 1. **La portada, con el recuadro del producto**, si lo tiene. Es la primera
 *    fila del boceto.
 * 2. **Cada variante con texto propio** —lema o recuadro: Screen y Blackout de
 *    Roller, que en el boceto tenían página propia— **arma su propio 2×2**: su
 *    primera foto con su nombre, lema y descripción; su segunda foto con su
 *    recuadro.
 * 3. **Las demás variantes van todas juntas en una celda de texto**, con su
 *    nombre y su descripción, y sus fotos y videos quedan sueltos con el nombre
 *    de la variante arriba. Así no hay celdas grandes con una sola palabra
 *    adentro, y **ninguna variante se esconde**, aunque no tenga nada que
 *    mostrar (`contenido/tipos.ts`, `VarianteConMedios`).
 * 4. **Lo suelto va de a dos**: primero los medios de esas variantes, después
 *    el resto de las fotos del producto. La celda de variantes se queda con el
 *    primero, que es de una de ellas.
 *
 * **Las filas alternan el lado**: en la primera el medio va a la izquierda, en
 * la segunda a la derecha, y así. Es lo que hace que se lea como un damero y no
 * como una lista con fotos al costado. En el teléfono, con una sola columna, el
 * medio va siempre arriba de su texto.
 *
 * # Lo que da hoy
 *
 *     compacta-blackout, venecianas  portada | recuadro      2 | 3
 *     bandas-verticales              portada | recuadro      2 | 3      4 | 5
 *     toldos                         portada | recuadro      2 | variantes      3
 *     cortinas-tela                  portada | recuadro      riel 1 | variantes
 *                                    riel 2 | video          barral 1 | barral 2      2 | 3
 *     roller                         screen 1 | Screen       screen 2 | recuadro
 *                                    blackout 1 | Blackout   blackout 2 | recuadro
 *                                    video | variantes       1 | 2      3
 */

/** Una celda del damero. */
export type Celda =
  | {
      tipo: "medio";
      medio: Medio;
      /** El texto alternativo de una foto, o el nombre accesible de un video. */
      nombre: string;
      /** El nombre de la variante, cuando el medio es de una. */
      pie?: string;
    }
  | { tipo: "recuadro"; recuadro: Recuadro }
  | { tipo: "variante"; variante: VarianteConMedios }
  | { tipo: "variantes"; variantes: VarianteConMedios[] };

export type CeldaDeMedio = Extract<Celda, { tipo: "medio" }>;

/**
 * Una fila: un medio y su texto, dos medios, o una celda sola que ocupa todo el
 * ancho. **El medio va siempre primero**, que es como queda en el teléfono;
 * `invertida` lo pasa a la derecha en escritorio.
 */
export type Fila = {
  celdas: [Celda] | [CeldaDeMedio, Celda];
  invertida: boolean;
};

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

export function filasDeProducto(producto: ProductoConMedios): Fila[] {
  const filas: Fila["celdas"][] = [];

  const fotoDelProducto = (foto: Foto, posicion: number): CeldaDeMedio => ({
    tipo: "medio",
    medio: foto,
    nombre: altAutomatico(producto.nombre, posicion),
  });

  const [portada, ...resto] = producto.fotos;
  const fotosDelProducto = resto.map((foto, i) => fotoDelProducto(foto, i + 2));

  // 1 — La portada con el recuadro. Sin recuadro, la portada va con el resto.
  if (portada && producto.recuadro) {
    filas.push([
      fotoDelProducto(portada, 1),
      { tipo: "recuadro", recuadro: producto.recuadro },
    ]);
  } else if (portada) {
    fotosDelProducto.unshift(fotoDelProducto(portada, 1));
  }

  // 2 — Las variantes con texto propio y algo que mostrar: su propio 2×2.
  const conTextoPropio = (v: VarianteConMedios) =>
    Boolean(v.lema || v.recuadro);
  const propias = producto.variantes.filter(
    (v) => conTextoPropio(v) && (v.fotos.length > 0 || v.video),
  );
  const juntas = producto.variantes.filter((v) => !propias.includes(v));

  const sueltos: CeldaDeMedio[] = [];

  for (const variante of propias) {
    const [primero, segundo, ...demas] = mediosDeVariante(
      producto,
      variante,
      false,
    );
    filas.push([primero, { tipo: "variante", variante }]);
    if (variante.recuadro) {
      filas.push(
        segundo
          ? [segundo, { tipo: "recuadro", recuadro: variante.recuadro }]
          : [{ tipo: "recuadro", recuadro: variante.recuadro }],
      );
    } else if (segundo) {
      sueltos.push(segundo);
    }
    sueltos.push(...demas);
  }

  // 3 y 4 — Las demás variantes juntas, con el primer medio de ellas; después,
  // lo suelto de a dos.
  for (const variante of juntas) {
    sueltos.push(...mediosDeVariante(producto, variante, true));
  }
  sueltos.push(...fotosDelProducto);

  if (juntas.length > 0) {
    const primero = sueltos.shift();
    const celda: Celda = { tipo: "variantes", variantes: juntas };
    filas.push(primero ? [primero, celda] : [celda]);
  }
  filas.push(...deADos(sueltos));

  return alternar(filas);
}

/**
 * El damero de un proyecto: la galería entera de a dos, en el orden de la
 * carpeta, con los videos en su lugar (decisión 51). Los proyectos no tienen
 * variantes ni recuadro, y el texto va arriba, en la apertura.
 *
 * **Las fotos y los videos se cuentan por separado** —«foto 3», «video 1»—,
 * como en la galería: un lector de pantalla que oye «foto 7» esperando la
 * séptima foto y recibe un video pierde la cuenta.
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
