import type {
  Medio,
  ProductoConMedios,
  ProyectoConMedios,
  Recuadro,
  VarianteConMedios,
} from "@/contenido/tipos";
import { manualOMotorizado } from "@/contenido/productos";
import { esVideo } from "@/lib/fotos";
import { altAutomatico } from "@/lib/texto";

/**
 * El damero de las páginas de producto y de proyecto — Fase 4.7.
 *
 * Es la grilla del boceto de la empresa: celdas de foto y de texto
 * alternadas, con líneas finas, de borde a borde. **Acá se decide qué va en
 * cada celda; `components/damero.tsx` solo lo dibuja.** Separado porque la
 * regla no es trivial y así se lee entera, sin JSX en el medio.
 *
 * # En producto, el mismo esquema para todos — decisión 67
 *
 * La portada no va acá: abre la página, en la apertura, con el título, la
 * descripción y el botón. Debajo, siempre en este orden:
 *
 *     ── Screen ─────────────────────────────  el nombre, a todo el ancho
 *     [ álbum de Screen ] | descripción y frases   uno por variante con fotos
 *     ── Blackout ───────────────────────────
 *     descripción y frases | [ álbum de Blackout ]
 *     otras variantes: las que no tienen fotos, nombradas
 *     ── Manual o motorizado ────────────────
 *     [ todos los videos ] | cómo se accionan      solo si hay videos
 *
 * - **El nombre de la variante va arriba de su álbum**, en su propia franja:
 *   en el teléfono, con el texto al costado de la foto, no se sabía de qué
 *   variante era cada álbum. Y el contador lo repite: «Screen · 3 / 8».
 * - **Un álbum por variante, entero**, con sus fotos y nada más.
 * - **Los videos van todos juntos** en «Manual o motorizado»: todos muestran
 *   una cortina motorizada moviéndose sola, que es lo que una foto no puede
 *   (decisión 40). Las variantes que solo tenían video —el Motorizado de
 *   Roller, el Riel motorizado— quedan dichas ahí, con su nombre debajo de
 *   su video, y no se nombran de nuevo.
 * - **Un producto sin variantes con fotos** —Bandas verticales, Compacta
 *   Blackout— tiene un solo álbum, con el resto de sus fotos y sin franja: su
 *   nombre ya está arriba, en la apertura.
 *
 * **Las filas de álbum y texto alternan el lado** en escritorio; en el
 * teléfono, el álbum va siempre arriba de su texto.
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
  /** El nombre de la variante, debajo de un video en «Manual o motorizado». */
  pie?: string;
};

/** Una celda del damero. */
export type Celda =
  | CeldaDeMedio
  | {
      tipo: "coleccion";
      /** Para un lector de pantalla: «Fotos de Roller Screen». */
      nombre: string;
      /** Lo que acompaña al contador: «Screen · 3 / 8». */
      corto?: string;
      medios: CeldaDeMedio[];
    }
  | {
      /** La franja con el nombre, a todo el ancho, arriba de un álbum. */
      tipo: "encabezado";
      lema?: string;
      nombre: string;
    }
  | {
      /** La descripción de una variante y las frases de su recuadro. */
      tipo: "texto";
      descripcion?: string;
      recuadro?: Recuadro;
    }
  | { tipo: "variantes"; variantes: VarianteConMedios[]; otras: boolean };

export type CeldaDeColeccion = Extract<Celda, { tipo: "coleccion" }>;
type CeldaVisual = CeldaDeMedio | CeldaDeColeccion;

/**
 * Una fila: lo visual y su texto, dos medios, o una celda sola que ocupa todo
 * el ancho. **Lo visual va siempre primero**, que es como queda en el
 * teléfono; `invertida` lo pasa a la derecha en escritorio.
 */
export type Fila = {
  celdas: [Celda] | [CeldaVisual, Celda];
  invertida: boolean;
};

/**
 * Las filas, numeradas para alternar el lado. **Cuentan solo las de dos
 * celdas**: una franja de nombre o una celda sola no tiene lado, y si contara
 * todos los álbumes caerían del mismo.
 */
function alternar(filas: Fila["celdas"][]): Fila[] {
  let dobles = 0;
  return filas.map((celdas) => ({
    celdas,
    invertida: celdas.length === 2 && dobles++ % 2 === 1,
  }));
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

/** Un álbum y su texto, en una fila; sin texto, el álbum solo. */
function filaDeAlbum(
  album: CeldaDeColeccion,
  texto?: Extract<Celda, { tipo: "texto" }>,
): Fila["celdas"] {
  return texto ? [album, texto] : [album];
}

/**
 * Dónde va el recuadro del producto. **En la apertura**, debajo de la
 * descripción, cuando el producto tiene variantes con fotos: sus álbumes ya
 * llevan su propio texto. **Con el álbum** cuando no tiene —Bandas
 * verticales, Compacta Blackout—: son las páginas con menos texto, y así el
 * álbum no queda solo (decisión 67).
 */
export function recuadroEnLaApertura(producto: ProductoConMedios): boolean {
  const conFotos = producto.variantes.some((v) => v.fotos.length > 0);
  return conFotos || producto.fotos.length <= 1;
}

export function filasDeProducto(producto: ProductoConMedios): Fila[] {
  const filas: Fila["celdas"][] = [];

  const conFotos = producto.variantes.filter((v) => v.fotos.length > 0);
  // Las que no tienen nada que mostrar se nombran, para que se puedan leer.
  // Las que solo tienen video ya quedan dichas en «Manual o motorizado».
  const sinNada = producto.variantes.filter(
    (v) => v.fotos.length === 0 && v.videos.length === 0,
  );

  // El resto de las fotos del producto: la portada va en la apertura.
  const resto = producto.fotos.slice(1).map((foto, i): CeldaDeMedio => ({
    tipo: "medio",
    medio: foto,
    nombre: altAutomatico(producto.nombre, i + 2),
  }));
  if (resto.length > 0) {
    // Con variantes, estas fotos necesitan su franja para no confundirse con
    // las de la primera variante; sin variantes, el nombre está arriba.
    if (conFotos.length > 0) {
      filas.push([{ tipo: "encabezado", nombre: "Más fotos" }]);
    }
    filas.push(
      filaDeAlbum(
        {
          tipo: "coleccion",
          nombre: `Fotos de ${producto.nombre}`,
          medios: resto,
        },
        // El recuadro de un producto sin variantes acompaña a su álbum: son
        // las páginas con menos texto, y así el álbum no queda solo.
        producto.recuadro && !recuadroEnLaApertura(producto)
          ? { tipo: "texto", recuadro: producto.recuadro }
          : undefined,
      ),
    );
  }

  // Un bloque por variante con fotos.
  for (const variante of conFotos) {
    const nombre = `${producto.nombre} ${variante.nombre}`;
    filas.push([
      { tipo: "encabezado", lema: variante.lema, nombre: variante.nombre },
    ]);
    const tieneTexto = variante.descripcion || variante.recuadro;
    filas.push(
      filaDeAlbum(
        {
          tipo: "coleccion",
          nombre: `Fotos de ${nombre}`,
          corto: variante.nombre,
          medios: variante.fotos.map((foto, i) => ({
            tipo: "medio",
            medio: foto,
            nombre: altAutomatico(nombre, i + 1),
          })),
        },
        tieneTexto
          ? {
              tipo: "texto",
              descripcion: variante.descripcion,
              recuadro: variante.recuadro,
            }
          : undefined,
      ),
    );
  }

  if (sinNada.length > 0) {
    filas.push([
      { tipo: "variantes", variantes: sinNada, otras: conFotos.length > 0 },
    ]);
  }

  // Todos los videos, juntos, con el nombre de su variante debajo.
  const videos: CeldaDeMedio[] = producto.variantes.flatMap((variante) =>
    variante.videos.map((video, i) => ({
      tipo: "medio" as const,
      medio: video,
      nombre: `${producto.nombre} ${variante.nombre} — video ${i + 1}`,
      pie: variante.nombre,
    })),
  );
  if (videos.length > 0) {
    filas.push([{ tipo: "encabezado", nombre: manualOMotorizado.titulo }]);
    filas.push(
      filaDeAlbum(
        {
          tipo: "coleccion",
          nombre: `Videos de ${producto.nombre}`,
          corto: "Video",
          medios: videos,
        },
        { tipo: "texto", descripcion: manualOMotorizado.texto },
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
