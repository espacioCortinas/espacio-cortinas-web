import type { Producto } from "./tipos";

/**
 * El catálogo.
 *
 * **El orden de este arreglo es el orden del catálogo**, y también decide
 * cuáles de los destacados entran en Inicio: se toman los primeros hasta el
 * tope de `PRODUCTOS_DESTACADOS_HOME` (decisión 9). Para reordenar, se mueve
 * el bloque.
 *
 * **Los cuatro destacados son Roller, Cortinas de tela, Venecianas de PVC y
 * Toldos**, y el criterio no es fotográfico: son los que más se venden en el
 * día a día, según la empresa. Es el dato que el sitio no puede deducir solo y
 * la única razón válida para elegir cuáles anticipar en Inicio — decisión 47.
 *
 * Nota para cuando cambie: Inicio los muestra **en el orden de este arreglo**,
 * no en orden de importancia. Si hiciera falta que Inicio los ordene distinto,
 * hay que mover los bloques acá, y eso reordena también el catálogo.
 *
 * Las descripciones son las que escribió la empresa. Se corrigió únicamente la
 * ortografía —«enrrollable», «bloquer», «permita» por «permite»—; ni una
 * palabra, ni el orden, ni el tono. Es su voz y no la nuestra, pero una falta
 * de ortografía no es voz, y estos textos son los que se ven en la
 * previsualización de cada enlace compartido por WhatsApp.
 *
 * Cuando un producto absorbió a otro como variante, su texto se repartió sin
 * reescribirlo: la parte común quedó en el producto y la diferencia en la
 * variante. Ningún texto de esta lista está inventado, salvo el de
 * `bandas-verticales`, que la empresa todavía no había escrito.
 *
 * Las fotos NO van acá: las escribe `scripts/preparar-fotos.mjs` en `fotos.ts`
 * y se unen por el slug. Lo generado y lo escrito a mano no comparten archivo,
 * para que regenerar las fotos no pueda pisar los textos.
 */
export const productos: Producto[] = [
  {
    slug: "roller",
    nombre: "Roller",
    descripcion:
      "Es un tipo de cortina enrollable, que puede ser manual (con cadena) o motorizada (a control remoto o tecla).",
    variantes: [
      {
        nombre: "Screen",
        descripcion:
          "Permite que ingrese luz pero también genera cierto grado de privacidad. También ayuda a reducir la temperatura en el ambiente y proteger pisos, muebles, etc; gracias a su filtro UV.",
      },
      {
        nombre: "Blackout",
        descripcion:
          "Es una cortina funcional para bloquear la luz exterior y reducir la temperatura en el ambiente.",
      },
      { nombre: "Motorizado" },
    ],
    activo: true,
    destacado: true,
  },
  {
    slug: "compacta-blackout",
    nombre: "Compacta Blackout",
    descripcion:
      "Es un tipo de cortina con tela blackout enrollable, que está cubierta por un cajón y tiene unas guías laterales, que proporcionan un mayor porcentaje de oscuridad. Esta cortina puede ser manual o motorizada. Esta cortina tiene limitaciones en sus tamaños.",
    variantes: [],
    activo: true,
    destacado: false,
  },
  {
    slug: "cortinas-tela",
    nombre: "Cortinas de tela",
    descripcion:
      "Este tipo de cortina puede ser colocado a un riel o un barral. El riel te permite hacer cortinados en ventanales de gran tamaño sin limitaciones, en cambio, el barral puede ser más estético pero te limita el recorrido de la tela. Estas telas pueden ser en blackout o translúcidas y mucha variedad de colores y modelos.",
    variantes: [
      { nombre: "Riel" },
      { nombre: "Riel motorizado" },
      { nombre: "Barral" },
      { nombre: "Blackout" },
    ],
    activo: true,
    destacado: true,
  },
  {
    slug: "venecianas-madera",
    nombre: "Venecianas de madera",
    descripcion:
      "Este es un tipo de cortina decorativa y también con el movimiento de lamas se puede generar privacidad e ingreso de luz.",
    variantes: [],
    activo: true,
    destacado: false,
  },
  {
    slug: "venecianas-pvc",
    nombre: "Venecianas de PVC",
    descripcion:
      "Este es un tipo de cortina decorativa y también con el movimiento de lamas se puede generar privacidad e ingreso de luz.",
    variantes: [],
    activo: true,
    destacado: true,
  },
  {
    slug: "toldos",
    nombre: "Toldos",
    descripcion:
      "Este es un sistema que se instala en el exterior, su principal función es la reducción de luz y temperatura gracias al salto térmico que tienen las telas. Hay distintas variedad de telas que pueden ser opacas o translúcidas.",
    variantes: [
      {
        nombre: "De brazos",
        descripcion:
          "Los brazos permiten que el toldo se extienda para el uso y retraerse cuando no se necesita.",
      },
      { nombre: "Motorizado" },
    ],
    activo: true,
    destacado: true,
  },
  {
    slug: "bandas-verticales",
    nombre: "Bandas verticales",
    descripcion:
      "Son cortinas formadas por bandas de tela verticales que giran sobre su eje. Con ese giro se regula el ingreso de luz y la privacidad, y además las bandas se corren hacia un costado para dejar la ventana despejada. Es un sistema ideal para ventanales grandes y puertas corredizas, y muy usado en oficinas. Las telas pueden ser translúcidas o blackout, en distintos anchos de banda.",
    variantes: [],
    activo: true,
    destacado: false,
  },
];
