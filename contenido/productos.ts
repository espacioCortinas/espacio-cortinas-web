import type { Producto } from "./tipos";

/**
 * El catálogo.
 *
 * **El orden de este arreglo es el orden del catálogo**, y también decide
 * cuáles de los destacados entran en Inicio: se toman los primeros hasta el
 * tope de `PRODUCTOS_DESTACADOS_HOME` (decisión 9). Para reordenar, se mueve
 * el bloque.
 *
 * Las descripciones son las que escribió la empresa. Se trasladaron textuales
 * desde la base al sacar el panel — decisión 36 — sin corregir la redacción ni
 * la ortografía, porque es su voz y no la nuestra.
 *
 * Las fotos las agrega `scripts/preparar-fotos.mjs`.
 */
export const productos: Producto[] = [
  {
    slug: "roller-blackout",
    nombre: "Roller Blackout",
    descripcion:
      "Es un tipo de cortina enrrollable, que puede ser manual (con cadena) o motorizada (a control remoto o tecla). Es una cortina funcional para bloquer la luz exterior y reducir la temperatura en el ambiente.",
    variantes: [],
    fotos: [],
    activo: false,
    destacado: false,
  },
  {
    slug: "roller-screen",
    nombre: "Roller Screen",
    descripcion:
      "Es un tipo de cortina enrrollable, que puede ser manual (con cadena) o motorizada( a control remoto o tecla). Esta cortina permita que ingrese luz pero tambien genera cierto grado de privacidad. Tambien ayudan a reducir la temperatura en el ambiente y proteger pisos, muebles, etc; gracias a su filtro UV.",
    variantes: [],
    fotos: [],
    activo: true,
    destacado: false,
  },
  {
    slug: "compacta-blackout",
    nombre: "Compacta Blackout",
    descripcion:
      "Es un tipo de cortina con tela blackout enrollable, que esta cubierta por un cajon y tiene unas guías laterales, que proporcionan un mayor porcentaje de oscuridad. Esta cortina puede ser manual o motorizada. Esta cortina tiene limitaciones en sus tamaños",
    variantes: [],
    fotos: [],
    activo: false,
    destacado: false,
  },
  {
    slug: "cortinas-de-tela",
    nombre: "Cortinas de tela",
    descripcion:
      "Este tipo de cortina puede ser colocado a un riel o un barral. El riel te permite hacer cortinados en ventales de gran tamaño sin limitaciones, en cambio, el barral puede ser mas estetico pero te limita el recorrido de la tela. Estas telas pueden ser en black out o translúcidas y mucha variedad de colores y modelos.",
    variantes: [],
    fotos: [],
    activo: true,
    destacado: false,
  },
  {
    slug: "venecianas-de-aluminio",
    nombre: "Venecianas de aluminio",
    descripcion:
      "Estas cortinas son funcionales y económicas, ideal para baños, lavaderos, etc. Con el movimiento de las lamas podes generar privacidad y tambien ingreso de luz.",
    variantes: [],
    fotos: [],
    activo: false,
    destacado: false,
  },
  {
    slug: "venecianas-madera-pvc",
    nombre: "Venecianas de madera o PVC",
    descripcion:
      "Esta es un tipo de cortina de decorativa y tambien con el movimiento de lamas se puede generar privacidad e ingreso de luz.",
    variantes: [],
    fotos: [],
    activo: true,
    destacado: false,
  },
  {
    slug: "toldos-de-brazos",
    nombre: "Toldos de brazos",
    descripcion:
      "Este es un sistema que se instala en el exterior, su principal funcion es la reduccion de luz y temperatura gracias al salto termico que tienen las telas. Los brazos permiten que el toldo se extienda para el uso y retraerse cuando no se necesita. Hay distintas variedad de telas que pueden ser opacas o translucidas.",
    variantes: [],
    fotos: [],
    activo: false,
    destacado: false,
  },
  {
    slug: "toldos-vertical",
    nombre: "Toldos vertical",
    descripcion:
      "Este es un sistema que se instala en el exterior, su principal funcion es la reduccion de luz y temperatura gracias al salto termico que tienen las telas. Este sistema es como una cortina roller pero preparada para el exterior . Hay distintas variedad de telas que pueden ser opacas o translucidas.",
    variantes: [],
    fotos: [],
    activo: false,
    destacado: false,
  },
];
