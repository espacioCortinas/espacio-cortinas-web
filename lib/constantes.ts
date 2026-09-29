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
 * **De acá sale el tope de ancho de cada foto y de cada video**
 * (`topeDeAncho()` en `lib/fotos.ts`), que es lo que decide cuánto puede medir
 * cada diapositiva de la galería y cada medio que va suelto: nada se muestra
 * nunca más ancho que sus píxeles divididos por este número. Con 2, una foto de
 * 1600 px no pasa de una caja de 800 px de CSS.
 *
 * **Dos y no tres**, y es el mismo criterio con el que está escrito
 * `docs/diseno.md`: «1280 px a doble densidad es una caja de 640 px de CSS»,
 * «ninguna portada aguanta sangrado: 1440 con doble densidad pide 2880». Las
 * cajas grandes solo existen en escritorio, y ahí la doble densidad es el techo
 * real —una pantalla de triple densidad es un teléfono, donde todo ocupa el
 * ancho de la columna y cualquier foto del archivo sobra—.
 *
 * Subirlo a 3 achicaría en escritorio los videos y `cortinas-tela/barral/2` sin
 * que nadie los vea mejor; bajarlo a 1 desactiva el tope y devuelve las fotos
 * blandas que existe para evitar.
 */
export const DENSIDAD_DE_REFERENCIA = 2;

/**
 * El lado MAYOR al que se publica un video, en píxeles: el ancho si es
 * apaisado, el alto si es vertical. No se agranda nunca.
 *
 * **Se llamaba `VIDEO_ANCHO` y convertía todo a 1280 de ancho**, que con los
 * dos videos de la Fase 4.4 —apaisados— daba lo mismo. Con el primer video
 * vertical (`proyectos/cowork-nordelta/8`, 1080 × 1920) esa regla lo habría
 * AGRANDADO a 1280 × 2276: más bytes y ningún detalle — decisión 51. Para un
 * apaisado de 1280 o más, el resultado es idéntico al de antes.
 *
 * Con `DENSIDAD_DE_REFERENCIA`, 1280 de lado mayor es una caja de 640 px de
 * CSS: el video no puede ser grande y por eso no puede ser el protagonista de
 * una página — `docs/diseno.md`.
 */
export const VIDEO_LADO_MAYOR = 1280;

/**
 * El tope de peso de un archivo publicado: 25 MiB, el máximo que Workers
 * acepta por asset (`docs/infraestructura.md`, «Límites de los assets del
 * Worker»). `scripts/preparar-fotos.mjs` se niega a publicar un video que lo
 * pase, porque el que falla después es el despliegue, no el script.
 */
export const TOPE_BYTES_POR_ARCHIVO = 25 * 1024 * 1024;

/**
 * Calidad del H.264, en la escala CRF de x264: más bajo es mejor y más pesado.
 *
 * 28 es el punto donde once segundos de una cortina moviéndose contra una
 * ventana quedan alrededor del megabyte. Un video de catálogo que tarda en
 * empezar no se mira.
 */
export const VIDEO_CRF = 28;
