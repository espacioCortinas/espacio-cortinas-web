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
