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

  /**
   * La extensión de los archivos de esta foto, sin el punto: `"webp"`.
   *
   * **Se registra, no se asume.** Hoy `scripts/preparar-fotos.mjs` genera WebP
   * para todas —la rama JPEG existía porque WebKit no sabe codificar WebP y el
   * panel se usaba desde un iPhone, y con el panel se fue (decisión 36)— así
   * que este campo dice `"webp"` en todas las filas. Existe igual por la misma
   * razón que `medidas`: armar el nombre del archivo desde una constante del
   * código funciona hasta la primera foto que no siga la regla, y ahí el
   * navegador pide un archivo que no existe. Decisión 37.
   */
  formato: string;

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

/**
 * Un video corto, mudo y en bucle.
 *
 * **Existe porque hay una cosa que una foto no puede mostrar**, que es que la
 * cortina se mueve sola — decisión 40. Por eso cuelga de una variante
 * motorizada y no de un producto: es la variante lo que documenta.
 *
 * **Esto tampoco se carga a mano**, y por la misma razón que `Foto`: lo escribe
 * `scripts/preparar-fotos.mjs` leyendo con `ffprobe` el archivo que se publica,
 * no el original ni una cuenta.
 */
export type Video = {
  /**
   * Dentro de `public/videos/`, sin extensión: `"roller/motorizado"`. El video
   * y su cuadro de cartel se llaman igual y solo cambian de extensión.
   *
   * **No lleva la entidad adelante**, a diferencia de `Foto.carpeta`: los
   * videos son de variantes y las variantes son solo de productos. Si algún día
   * un proyecto llevara video, esto gana un nivel.
   */
  archivo: string;

  /** La extensión del video, sin el punto: `"mp4"`. */
  formato: string;

  /**
   * La extensión del cuadro de cartel, sin el punto: `"webp"`.
   *
   * Se registra aparte y por la misma razón que `Foto.formato` (decisión 37):
   * el sitio arma la ruta del `poster` leyendo este campo, no una constante.
   */
  formatoPoster: string;

  /** Del archivo que se publica, no del original. Van al `<video>`. */
  ancho: number;
  alto: number;

  /**
   * Duración en segundos, redondeada. Se escribe al lado del video —«11
   * segundos, sin sonido»— porque un video que arranca solo y no tiene
   * controles no da ninguna otra forma de saber cuánto dura ni que no hay audio
   * que encender.
   */
  duracion: number;
};

/**
 * Una opción del mismo producto: «Screen», «Motorizado», «Barral».
 *
 * **No son productos aparte** — decisión 40. Un roller screen y un roller
 * blackout son el mismo producto con dos telas, no dos entradas del catálogo.
 *
 * La descripción es **opcional** y existe solo donde la diferencia hay que
 * explicarla: screen deja pasar luz y blackout no, y eso es justamente lo que
 * decide la compra. Una variante que se entiende sola no la necesita.
 */
export type Variante = {
  nombre: string;
  descripcion?: string;

  /**
   * La clave con la que esta variante encuentra sus fotos y su video.
   *
   * **Se escribe a mano y no se deriva del nombre** — decisión 48. Derivarla
   * con `aSlug(nombre)` funciona con los cuatro nombres de hoy y se rompe en
   * silencio el día que alguien corrija una mayúscula o agregue un paréntesis:
   * la clave cambiaría, las fotos dejarían de encontrarse y la página se
   * dibujaría igual, sin fotos y sin error. Es la misma regla que ya vale para
   * el slug de un producto, que tampoco se regenera al cambiar el nombre
   * (decisión 10).
   *
   * Es el nombre de la carpeta dentro de `fotos-originales/productos/<slug>/`
   * y también el del archivo de video, así que
   * `{ nombre: "Riel motorizado", clave: "riel-motorizado" }` busca en
   * `fotos-originales/productos/cortinas-tela/riel-motorizado/` y en
   * `fotos-originales/productos/cortinas-tela/riel-motorizado.mp4`.
   *
   * **Es opcional**: una variante que no tiene nada que mostrar no la lleva.
   * `scripts/preparar-fotos.mjs` avisa en los dos sentidos —una clave sin
   * carpeta, una carpeta sin clave— porque las dos fallan calladas.
   */
  clave?: string;
};

export type Producto = Publicable & {
  nombre: string;
  variantes: Variante[];
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

/**
 * Una variante con sus medios ya resueltos.
 *
 * Los dos campos pueden venir vacíos y eso es lo normal, no un caso de borde:
 * de las once variantes del catálogo, cuatro tienen fotos, dos tienen video y
 * cinco no tienen nada. Una variante sin medios sigue siendo una opción que el
 * visitante tiene que poder leer, así que se dibuja igual — con su nombre y,
 * si la tiene, su descripción.
 */
export type VarianteConMedios = Variante & {
  fotos: Foto[];
  video: Video | null;
};

/**
 * Un producto listo para la página de producto: con su galería y con sus
 * variantes ya unidas a las fotos y los videos de cada una.
 *
 * Es lo que devuelve `contenido/index.ts`, y es asignable a
 * `ConFotos<Producto>` — o sea que `components/tarjeta-producto.tsx`, que solo
 * necesita el nombre y la portada, no se entera de nada de esto.
 *
 * **El `Omit` no es un adorno.** Sin él esto sería una intersección con dos
 * `variantes` distintas —`Variante[] & VarianteConMedios[]`— y al llamar a
 * `.map()` TypeScript elige una de las dos firmas: la de `Variante[]`, donde
 * `fotos` y `video` no existen. Sacando el campo del lado izquierdo queda uno
 * solo y gana el que tiene los medios.
 */
export type ProductoConMedios = ConFotos<Omit<Producto, "variantes">> & {
  variantes: VarianteConMedios[];
};
