/**
 * Topes y límites del sistema.
 *
 * No hay pantalla de configuración en V1: agregar una tercera sección al panel
 * solo para cambiar un número es desproporcionado (decisión 9). Se cambian acá
 * y se despliega.
 */

/** Cuántos proyectos destacados muestra el Inicio. */
export const PROYECTOS_DESTACADOS_HOME = 6;

/** Cuántos productos destacados muestra el Inicio. */
export const PRODUCTOS_DESTACADOS_HOME = 4;

/** Lado mayor, en píxeles, al que se redimensiona una foto antes de subirla. */
export const IMAGEN_LADO_MAXIMO = 2560;

/** Peso máximo aceptado, en MB, antes de comprimir en el navegador. */
export const IMAGEN_PESO_MAXIMO_MB = 8;
