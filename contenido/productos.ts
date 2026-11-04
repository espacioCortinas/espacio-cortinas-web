import type { Producto } from "./tipos";

/**
 * El catálogo.
 *
 * **El orden de este arreglo es el orden del catálogo**, y también decide
 * cuáles de los destacados entran en Inicio: se toman los primeros hasta el
 * tope de `PRODUCTOS_DESTACADOS_HOME` (decisión 9). Para reordenar, se mueve
 * el bloque.
 *
 * **Los cuatro destacados son Roller, Cortinas de confección, Venecianas
 * y Toldos**, y el criterio no es fotográfico: son los que más se venden en el
 * día a día, según la empresa. Es el dato que el sitio no puede deducir solo y
 * la única razón válida para elegir cuáles anticipar en Inicio — decisión 47.
 *
 * Nota para cuando cambie: Inicio los muestra **en el orden de este arreglo**,
 * no en orden de importancia. Si hiciera falta que Inicio los ordene distinto,
 * hay que mover los bloques acá, y eso reordena también el catálogo.
 *
 * # De dónde sale cada texto
 *
 * **Desde la Fase 4.7, los lemas, las descripciones y los recuadros son los del
 * boceto que armó la empresa en Wix**, que tiene una página por producto. Se
 * corrigió la ortografía, las tildes y la puntuación —«untejido que puede
 * puede», «tranforman», «pemiten», «sienpre», la concordancia de «la variedad…
 * los convierte»—; ni una palabra más, ni el orden, ni el tono. Lo que dice
 * cada corrección está en `docs/plan.md`, Fase 4.7, «Los textos».
 *
 * Así se repartieron, porque el boceto no tiene los mismos siete productos:
 *
 * - **Roller**: el boceto tiene una página para Screen y otra para Blackout, y
 *   acá son variantes. Cada una se quedó con su lema, su descripción y su
 *   recuadro. El lema del producto, «filtrar u oscurecer», junta los dos; la
 *   descripción del producto es la que la empresa había escrito antes.
 * - **Venecianas**: el boceto tiene una sola página. Hasta noviembre de 2026
 *   eran dos productos —madera y PVC— con ese mismo texto; desde la decisión
 *   67 son uno, con las dos como variantes.
 * - **Cortinas de confección**: el boceto no habla de riel ni de barral, y la
 *   descripción anterior sí. Esa parte se repartió en las variantes, sin
 *   reescribirla, como cuando un producto absorbió a otro (decisión 40).
 * - **Compacta Blackout y Bandas verticales** no están en el boceto. Sus textos
 *   los escribimos con el estilo de los otros y con los datos de las
 *   descripciones que había; la empresa los puede reemplazar.
 *
 * Las fotos NO van acá: las escribe `scripts/preparar-fotos.mjs` en `fotos.ts`
 * y se unen por el slug. Lo generado y lo escrito a mano no comparten archivo,
 * para que regenerar las fotos no pueda pisar los textos.
 */
/**
 * La sección de los videos en cada página de producto — decisión 67.
 *
 * El boceto de la empresa ponía «manuales y automatizadas» como título del
 * recuadro de casi todos los productos. Desde noviembre de 2026 eso es una
 * sola sección por página, con todos los videos de cortinas motorizadas, y
 * dice «motorizado» y no «automatizado», a pedido de la empresa. El texto es
 * nuestro, con el agregado del celular que pidió quien desarrolla.
 */
export const manualOMotorizado = {
  titulo: "Manual o motorizado",
  texto:
    "Todas se pueden accionar a mano, con cadena o manija, o con motor: a control remoto, desde una tecla o desde el celular.",
} as const;

export const productos: Producto[] = [
  {
    slug: "roller",
    nombre: "Roller",
    lema: "filtrar u oscurecer",
    descripcion:
      "Es un tipo de cortina enrollable, que puede ser manual (con cadena) o motorizada (a control remoto o tecla).",
    variantes: [
      {
        nombre: "Screen",
        clave: "screen",
        lema: "filtrar la luz",
        descripcion:
          "Los tejidos microperforados permiten ver hacia el exterior, contribuyendo a mejorar el confort visual de quien vive o trabaja en ambientes interiores. Difunden la luz y garantizan la privacidad en los ambientes. El sistema más eficaz para filtrar la luz y reducir el calor. Disponible en distintos factores de apertura adaptables a cada necesidad.",
        recuadro: {
          texto:
            "Disfrutar los espacios de interior. Una luz para relajarse. Una luz para la creatividad.",
        },
      },
      {
        nombre: "Blackout",
        clave: "blackout",
        lema: "oscurecer",
        descripcion:
          "Las cortinas roller blackout permiten generar oscuridad en los ambientes. El blackout es un tejido que puede ser sintético o entelado, totalmente opaco a la luz, combinando practicidad y estética. Complementados con perfilería de aluminio, garantizan un sistema totalmente impermeable a la luz.",
        recuadro: {
          texto:
            "Modulando la luz con las cortinas, cada espacio adquiere un significado diferente. La luz define la relación entre el ambiente y los que lo habitan.",
        },
      },
      { nombre: "Motorizado", clave: "motorizado" },
    ],
    activo: true,
    destacado: true,
  },
  {
    slug: "compacta-blackout",
    nombre: "Compacta Blackout",
    // NUESTRO: no está en el boceto. Con los datos de la descripción anterior
    // de la empresa: el cajón, las guías, la oscuridad, manual o motorizada y
    // el límite de medidas.
    lema: "descansar",
    descripcion:
      "Las cortinas compactas blackout logran la oscuridad más completa en los ambientes. La tela se enrolla dentro de un cajón y corre por guías laterales que impiden el paso de la luz por los costados. Manuales o motorizadas, son la solución ideal para dormitorios y espacios de descanso, dentro de las medidas que permite el sistema.",
    recuadro: {
      texto:
        "Oscuridad completa, a cualquier hora del día. Un ambiente pensado para descansar.",
    },
    variantes: [],
    activo: true,
    destacado: false,
  },
  {
    slug: "cortinas-tela",
    // «Cortinas de confección» es el nombre del boceto de la empresa — Fase
    // 4.7. Hasta ahí era «Cortinas de tela». El slug no cambia: lo usan los
    // enlaces que ya circulan por WhatsApp (decisión 10).
    nombre: "Cortinas de confección",
    lema: "calidez",
    descripcion:
      "Combinar la calidez de las telas nos permite dar a cada ambiente un sello particular. Combinando distintas texturas, las cortinas de confección cubren grandes superficies cumpliendo todas las funciones: filtran la luz, dan intimidad y oscurecen. Amplían los ambientes y pueden combinar muy bien en cualquier espacio.",
    recuadro: {
      texto:
        "Los géneros brindan calidez a los ambientes. Generan buena acústica y amplitud.",
    },
    // Las descripciones de Riel, Barral y Blackout son la descripción anterior
    // de la empresa, repartida sin reescribirla: el boceto no las tiene.
    variantes: [
      {
        nombre: "Riel",
        clave: "riel",
        descripcion:
          "El riel te permite hacer cortinados en ventanales de gran tamaño sin limitaciones.",
      },
      { nombre: "Riel motorizado", clave: "riel-motorizado" },
      {
        nombre: "Barral",
        clave: "barral",
        descripcion:
          "El barral puede ser más estético, pero te limita el recorrido de la tela.",
      },
      {
        nombre: "Blackout",
        clave: "blackout",
        descripcion:
          "Las telas pueden ser en blackout o translúcidas, y hay mucha variedad de colores y modelos.",
      },
    ],
    activo: true,
    destacado: true,
  },
  {
    // Hasta noviembre de 2026 eran dos productos, `venecianas-madera` y
    // `venecianas-pvc`, con el mismo texto. La empresa pidió juntarlos en uno
    // con variantes (decisión 67). Las dos direcciones viejas redirigen acá
    // desde `next.config.ts`: los enlaces que ya circulan siguen andando
    // (decisión 10).
    slug: "venecianas",
    nombre: "Venecianas",
    lema: "estilo",
    descripcion:
      "Las cortinas venecianas modulan la luz. En sus varias versiones —aluminio, PVC y madera— se transforman en un objeto decorativo. Muy funcionales y prácticas, proporcionan la solución ideal para cada necesidad.",
    recuadro: {
      titulo:
        "venecianas:\n25 mm aluminio\n50 mm aluminio\n50 mm PVC\n50 mm madera",
      texto: "Funcionales y decorativas.",
    },
    // Aluminio todavía no tiene fotos: se nombra igual, en la celda de
    // variantes, y cuando lleguen las fotos se le pone la clave.
    variantes: [
      { nombre: "PVC", clave: "pvc" },
      { nombre: "Madera", clave: "madera" },
      { nombre: "Aluminio" },
    ],
    activo: true,
    destacado: true,
  },
  {
    slug: "toldos",
    nombre: "Toldos",
    lema: "vivir el aire libre",
    descripcion:
      "Los toldos son sistemas de protección solar de uso externo. De brazos extensibles, verticales o punto recto, estos sistemas permiten disfrutar de los espacios abiertos. La variedad de lonas, tejidos y mecanismos los convierte en el complemento ideal a la hora de proteger viviendas y comercios. La estética en sus formas acompaña siempre fachadas y contrafrentes.",
    recuadro: {
      texto:
        "Los toldos detienen el impacto directo del sol. Permiten que podamos disfrutar de los espacios abiertos.",
    },
    variantes: [
      {
        nombre: "De brazos",
        clave: "de-brazos",
        descripcion:
          "Los brazos permiten que el toldo se extienda para el uso y retraerse cuando no se necesita.",
      },
      {
        // NUESTRO, provisorio: la empresa pidió la variante con sus fotos y
        // todavía no mandó el texto. Con los datos de la descripción del
        // producto, que ya los nombra.
        nombre: "Verticales",
        clave: "verticales",
        descripcion:
          "Los toldos verticales bajan frente a ventanas, galerías y balcones. Protegen del sol directo y dan privacidad sin quitar la vista al exterior.",
      },
      { nombre: "Motorizado" },
    ],
    activo: true,
    destacado: true,
  },
  {
    slug: "bandas-verticales",
    nombre: "Bandas verticales",
    // NUESTRO: no está en el boceto. Con los datos de la descripción que había:
    // el giro, el recogido, los ventanales y oficinas, las telas.
    lema: "orientar la luz",
    descripcion:
      "Las bandas verticales permiten orientar la luz y regular la privacidad, girando sobre su propio eje. Se recogen hacia un costado y dejan la ventana despejada. En telas translúcidas o blackout, son la solución ideal para grandes ventanales, puertas corredizas y oficinas.",
    recuadro: {
      titulo: "translúcidas o blackout",
      texto:
        "La luz justa para cada momento del día. Orden y amplitud en los espacios de trabajo.",
    },
    variantes: [],
    activo: true,
    destacado: false,
  },
];
