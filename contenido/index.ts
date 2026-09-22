import { fotos } from "./fotos";
import { productos } from "./productos";
import { proyectos } from "./proyectos";
import { videos } from "./videos";
import type {
  ConFotos,
  Medio,
  Producto,
  ProductoConMedios,
  ProyectoConMedios,
} from "./tipos";

/**
 * El contenido del sitio, con las fotos ya unidas.
 *
 * **Las páginas leen de acá y no de los archivos sueltos.** Lo escrito a mano
 * —`productos.ts`, `proyectos.ts`— y lo generado —`fotos.ts`— viven separados
 * para que regenerar las fotos no pise los textos, y se juntan en este punto.
 *
 * La unión es por slug: las fotos de `productos.ts` con el slug
 * `roller-blackout` están bajo la clave `productos/roller-blackout`.
 */

function unir<T extends { slug: string }>(
  entidad: "productos" | "proyectos",
  items: T[],
): ConFotos<T>[] {
  return items.map((item) => ({
    ...item,
    fotos: fotos[`${entidad}/${item.slug}`] ?? [],
  }));
}

/**
 * Las variantes de un producto, con sus fotos y su video ya resueltos.
 *
 * La clave de una variante cuelga de la del producto —`productos/roller/screen`
 * en los dos manifiestos— así que la unión es la misma que la de arriba con un
 * nivel más. La escribe a mano `contenido/productos.ts` y no se deriva del
 * nombre: ver `Variante.clave` en `tipos.ts`.
 *
 * **Una variante sin clave, o con una clave que no encontró nada, se devuelve
 * igual, vacía.** Tres de las nueve variantes del catálogo no tienen nada que
 * mostrar y siguen siendo opciones que el visitante tiene que poder leer. Lo
 * que avisa cuando una clave se quedó sin carpeta es
 * `scripts/preparar-fotos.mjs`, que es el único que puede mirar el disco.
 */
function unirVariantes(producto: Producto): ProductoConMedios["variantes"] {
  return producto.variantes.map((variante) => {
    const clave = variante.clave
      ? `productos/${producto.slug}/${variante.clave}`
      : null;

    return {
      ...variante,
      fotos: (clave && fotos[clave]) || [],
      video: (clave && videos[clave]) || null,
    };
  });
}

/** Todo, incluido lo que no está publicado. */
export const todosLosProductos = (): ProductoConMedios[] =>
  unir("productos", productos).map((producto) => ({
    ...producto,
    variantes: unirVariantes(producto),
  }));

/**
 * La galería de un proyecto: sus fotos, con los videos intercalados en el lugar
 * que ocupaban en la carpeta de originales — decisión 51.
 *
 * Las fotos vienen en el orden de `fotos.ts` y cada video trae su `posicion`,
 * contada sobre fotos y videos juntos. Se insertan de menor a mayor, así que
 * cuando un video entra en su lugar todo lo anterior ya está en el suyo.
 *
 * **La portada queda primera aunque la carpeta empiece con un video**: una
 * portada es una foto 4:5 por definición (decisión 14), y es la que abre la
 * página y viaja en la miniatura de WhatsApp. El script avisa de ese caso; acá
 * solo se garantiza que no rompa nada, poniendo el video en el lugar 2.
 */
function galeriaDeProyecto(slug: string, fotosDelProyecto: Medio[]): Medio[] {
  const prefijo = `proyectos/${slug}/`;
  const suyos = Object.entries(videos)
    .filter(([clave]) => clave.startsWith(prefijo))
    .map(([, video]) => video)
    .sort((a, b) => (a.posicion ?? Infinity) - (b.posicion ?? Infinity));

  const galeria = [...fotosDelProyecto];
  for (const video of suyos) {
    const lugar = Math.max(1, (video.posicion ?? Infinity) - 1);
    galeria.splice(Math.min(lugar, galeria.length), 0, video);
  }
  return galeria;
}

export const todosLosProyectos = (): ProyectoConMedios[] =>
  unir("proyectos", proyectos).map((proyecto) => ({
    ...proyecto,
    galeria: galeriaDeProyecto(proyecto.slug, proyecto.fotos),
  }));

/**
 * Lo que se muestra en el sitio.
 *
 * `activo` manda: algo destacado pero sin publicar no aparece en ningún lado
 * — decisión 8.
 */
export const productosPublicados = (): ProductoConMedios[] =>
  todosLosProductos().filter((p) => p.activo);

export const proyectosPublicados = (): ProyectoConMedios[] =>
  todosLosProyectos().filter((p) => p.activo);

/**
 * Los que pueden salir en Inicio, ya recortados al tope.
 *
 * El tope se aplica **al leer** y no al marcar: se pueden dejar más destacados
 * de los que entran, y solo aparecen los primeros. Así se cambia qué sale en la
 * portada moviendo un bloque de lugar, sin desmarcar nada —
 * docs/modelo-de-datos.md.
 */
export const productosDestacados = (tope: number): ProductoConMedios[] =>
  productosPublicados()
    .filter((p) => p.destacado)
    .slice(0, tope);

export const proyectosDestacados = (tope: number): ProyectoConMedios[] =>
  proyectosPublicados()
    .filter((p) => p.destacado)
    .slice(0, tope);

/**
 * Una foto suelta del manifiesto, para cuando una página necesita **una foto
 * concreta** y no la galería de una entidad: la que abre Inicio, la que
 * acompaña al bloque de arquitectos y oficinas.
 *
 * `posicion` empieza en 1 y es la misma numeración que ve el visitante y que
 * usa `altAutomatico()`: la 1 es la portada.
 *
 * **Devuelve `null` en vez de romper.** Las fotos las regenera un script, así
 * que el día que alguien saque una foto del archivo esta llamada se queda sin
 * respuesta. Que la página se dibuje sin esa foto es mejor que un build roto o,
 * peor, un hueco con una imagen que no carga.
 */
export const fotoDe = (
  entidad: "productos" | "proyectos",
  slug: string,
  posicion: number,
) => fotos[`${entidad}/${slug}`]?.[posicion - 1] ?? null;

/** Para `/productos/[slug]` y `/proyectos/[slug]`. */
export const productoPorSlug = (slug: string) =>
  productosPublicados().find((p) => p.slug === slug) ?? null;

export const proyectoPorSlug = (slug: string) =>
  proyectosPublicados().find((p) => p.slug === slug) ?? null;
