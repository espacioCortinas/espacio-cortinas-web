/**
 * La forma del contenido del sitio.
 *
 * Hasta la Fase 3 esto vivía en cinco tablas de Postgres y se cargaba desde un
 * panel. Desde la decisión 36 son archivos de este repositorio, que se editan a
 * mano y se publican con un `git push`.
 *
 * **Por qué TypeScript y no JSON.** Esto se edita a mano, así que conviene que
 * el editor autocomplete y que el build frene si falta un campo, si un booleano
 * está mal escrito o si una foto apunta a una carpeta que no existe. Con JSON
 * esos errores no aparecen hasta que alguien visita la página.
 *
 * **Lo escrito a mano y lo generado no se mezclan en el mismo archivo.**
 * `productos.ts` y `proyectos.ts` se editan; `fotos.ts` lo escribe
 * `scripts/preparar-fotos.mjs` y se pisa entero cada vez. Si estuvieran juntos,
 * regenerar las fotos borraría los textos.
 */

/**
 * Una foto, con las medidas que existen de verdad.
 *
 * **Esto no se carga a mano.** Anchos y alto son datos calculados, y escribirlos
 * a ojo es exactamente donde aparecen las imágenes rotas.
 */
export type Foto = {
  /**
   * La carpeta dentro de `public/fotos/`. Adentro hay un archivo por medida,
   * llamado por su ancho: `480.webp`, `960.webp`, y así.
   */
  carpeta: string;

  /**
   * Qué anchos existen, de menor a mayor. **Se lee de acá para armar el
   * `srcset`, nunca de una constante del código** — una foto chica no genera
   * las medidas grandes, porque agrandarla no agrega detalle y además mentiría
   * en el descriptor `w`, que por definición es el ancho real del archivo
   * (decisión 32).
   */
  medidas: number[];

  /** De la medida más grande. Con `alto` alcanza para reservar el espacio. */
  ancho: number;
  alto: number;
};

/**
 * Lo que comparten productos y proyectos.
 *
 * `activo` controla la existencia pública y `destacado` la aparición en Inicio.
 * Son independientes y **`activo` manda**: algo destacado pero inactivo no se
 * muestra en ningún lado — decisión 8.
 */
type Publicable = {
  /**
   * La parte final del enlace, y también la clave con la que se buscan las
   * fotos en `fotos.ts`.
   *
   * **No se cambia una vez publicado:** rompe los enlaces ya compartidos por
   * WhatsApp, que es por donde se comparte este sitio (decisión 10).
   */
  slug: string;
  descripcion: string;
  activo: boolean;
  destacado: boolean;
};

export type Producto = Publicable & {
  nombre: string;
  /**
   * Las opciones de este mismo producto: «Dos paños», «Motorizado». **No son
   * productos aparte** y no llevan foto ni descripción propia — decisión 11.
   */
  variantes: string[];
};

export type Proyecto = Publicable & {
  titulo: string;
  /** Texto libre, no una lista de localidades. Se muestra como chip. */
  ubicacion: string;
};

/**
 * Un producto o proyecto con sus fotos ya resueltas, que es como lo consumen
 * las páginas.
 *
 * La primera foto es la portada y **tiene que ser vertical**: los listados usan
 * siempre la portada, y es lo que hace que las grillas queden parejas aunque la
 * galería mezcle orientaciones (decisión 14). Lo comprueba el script al
 * preparar las fotos.
 *
 * No hay campo `alt`: se arma al renderizar, a partir del nombre y la posición
 * —«Casa en Nordelta — foto 3»—, con `altAutomatico()` de `lib/texto.ts`.
 * Pedirlo por foto haría que se cargue cualquier cosa, que para un lector de
 * pantalla es peor que un texto generado razonable.
 */
export type ConFotos<T> = T & { fotos: Foto[] };
