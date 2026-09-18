/**
 * Topes y límites del sistema.
 *
 * No hay pantalla de configuración: se cambian acá y se despliega (decisión 9).
 * Desde que el contenido vive en archivos del repositorio, cambiar uno de estos
 * números es del mismo orden de trabajo que cambiar un texto.
 */

/** Cuántos proyectos destacados muestra el Inicio. */
export const PROYECTOS_DESTACADOS_HOME = 6;

/** Cuántos productos destacados muestra el Inicio. */
export const PRODUCTOS_DESTACADOS_HOME = 4;

/**
 * Los anchos que `scripts/preparar-fotos.mjs` genera de cada foto.
 *
 * **Son anchos, no «lado mayor»** — decisión 32. El descriptor `w` de un
 * `srcset` es el ancho real del archivo, así que si `1600.webp` no midiera 1600
 * de ancho el navegador elegiría mal el tamaño en cada pantalla.
 *
 * Una foto más angosta que un corte no lo genera: agrandarla no agrega detalle
 * y además mentiría en el `srcset`. Por eso cada foto registra en `medidas`
 * cuáles existen de verdad, y el `srcset` se arma leyendo esa lista y nunca
 * esta constante.
 */
export const MEDIDAS_IMAGEN = [480, 960, 1600, 2560] as const;

/** Ancho máximo, en píxeles, al que se redimensiona una foto. */
export const IMAGEN_LADO_MAXIMO = 2560;

/**
 * Calidad del WebP. 0,82 es el punto donde una foto de interiores deja de
 * mejorar de forma perceptible y sigue engordando el archivo.
 *
 * Vuelve a haber un solo formato: la rama JPEG existía porque WebKit no sabe
 * codificar WebP y el panel se usaba desde un iPhone. Ya no comprime ningún
 * navegador — decisiones 35 y 36.
 */
export const IMAGEN_CALIDAD = 0.82;

/** Relación de aspecto de las portadas: vertical 4:5 — decisión 14. */
export const PORTADA_RELACION = 4 / 5;

/**
 * La densidad de pantalla contra la que se mide si una foto tiene píxeles para
 * una caja.
 *
 * **De acá sale el tope de ancho de cada foto** (`topeDeAncho()` en
 * `lib/fotos.ts`), que es lo que decide el tamaño del módulo de la galería:
 * una foto no se muestra nunca más ancha que sus píxeles divididos por este
 * número. Con 2, una foto de 1600 px no pasa de una caja de 800 px de CSS.
 *
 * **Dos y no tres**, y es el mismo criterio con el que está escrito
 * `docs/diseno.md`: «1280 px a doble densidad es una caja de 640 px de CSS»,
 * «ninguna portada aguanta sangrado: 1440 con doble densidad pide 2880». El
 * módulo grande solo existe en escritorio, y ahí la doble densidad es el techo
 * real —una pantalla de triple densidad es un teléfono, donde todo ocupa el
 * ancho de la columna y cualquier foto del archivo sobra—.
 *
 * Subirlo a 3 dejaría a la mitad del archivo fuera del módulo grande sin que
 * nadie lo vea mejor; bajarlo a 1 desactiva el tope y devuelve las fotos
 * blandas que existe para evitar.
 */
export const DENSIDAD_DE_REFERENCIA = 2;

/**
 * Ancho al que se publica un video, en píxeles.
 *
 * Los dos que hay ya estaban convertidos a 1280 cuando se escribió esto
 * (decisión 48), así que este número describe lo que hay y fija lo que va a
 * salir del script la próxima vez. Con `DENSIDAD_DE_REFERENCIA`, 1280 es una
 * caja de 640 px de CSS: el video no puede ser grande y por eso no puede ser
 * el protagonista de una página — `docs/diseno.md`.
 */
export const VIDEO_ANCHO = 1280;

/**
 * Calidad del H.264, en la escala CRF de x264: más bajo es mejor y más pesado.
 *
 * 28 es el punto donde once segundos de una cortina moviéndose contra una
 * ventana quedan alrededor del megabyte. Un video de catálogo que tarda en
 * empezar no se mira.
 */
export const VIDEO_CRF = 28;
