/**
 * Los textos de Inicio.
 *
 * # Los que son de la empresa, y los que no
 *
 * **Desde la Fase 4.7 la mayoría son del boceto que armó la empresa en Wix**:
 * el lema, la frase que abre los productos y las tres que van entre ellos. Se
 * copiaron con el criterio de `contenido/productos.ts` —se corrigen la
 * ortografía, las tildes y la puntuación, no las palabras ni el tono— y el
 * detalle de cada corrección está en `docs/plan.md`, Fase 4.7, «Los textos». El
 * boceto escribe los párrafos en mayúscula; acá van en minúscula, con su
 * mayúscula inicial.
 *
 * **Donde el boceto no tiene texto, queda el nuestro**, provisorio hasta que la
 * empresa lo reemplace: la bajada de la apertura, «Cómo trabajamos»,
 * arquitectos y oficinas, y el cierre. Están marcados uno por uno.
 *
 * Para quien escriba la versión final de esos, dos cosas que conviene saber:
 *
 * - **`bajada` es la que dice qué se vende y dónde**, que el lema no dice. Es lo
 *   que le explica el sitio a alguien que llega sin saber de qué es. Entre 120
 *   y 200 caracteres.
 * - **Nada que escribamos nosotros puede afirmar algo que no sea cierto y
 *   verificable.** Los años de trayectoria, la cantidad de trabajos, las marcas
 *   y cualquier garantía no están documentados en ningún lado del proyecto, así
 *   que no se escriben hasta que la empresa los confirme. Lo que la empresa
 *   escribió en su boceto, en cambio, lo afirma ella.
 *
 * # Por qué es un archivo de contenido y no texto suelto en la página
 *
 * `CLAUDE.md`, regla 2: todo el contenido viene de `contenido/`. Vale también
 * para los textos de una página, y acá vale doble, porque este texto lo va a
 * cambiar alguien que no escribe código.
 */

export type PasoDelTrabajo = {
  titulo: string;
  descripcion: string;
};

export const inicio = {
  /**
   * DEL BOCETO. El lema, en dos partes con dos tratamientos, como lo compuso la
   * empresa: la entrada chica y en minúscula, el remate en mayúscula espaciada.
   * Juntas son el `<h1>`.
   *
   * La mayúscula del remate la pone la página, no el texto: escrito en
   * minúscula, un lector de pantalla lo lee como una frase y no letra por
   * letra, y la tilde de «compañía» no depende de que alguien la escriba en
   * mayúscula.
   */
  lema: {
    entrada: "hacé de tus espacios",
    remate: "tu mejor compañía",
  },

  /** NUESTRA, provisoria. Dice qué se vende y dónde, que el lema no dice. */
  bajada:
    "Rollers, venecianas, cortinas de confección y toldos para casas, " +
    "estudios de arquitectura y oficinas de Buenos Aires.",

  /** Los productos destacados, en zigzag. */
  productos: {
    /** DEL BOCETO: la frase con la que abre su sector de productos. */
    titulo: "Brindamos asesoramiento e instalación de nuestros productos.",

    /**
     * DEL BOCETO: las tres frases que intercala entre los productos. Van una
     * por producto, al lado de su fila, en este orden; un producto que no
     * tiene frase —el cuarto— va solo.
     */
    frases: [
      "Dar a cada espacio la luz natural que requiere es nuestra tarea. " +
        "Combinando estética y funcionalidad.",
      "La luz, el calor y el aire son elementos vitales para el planeta. El " +
        "control de estos elementos es un desafío para el hombre, " +
        "desarrollando cada vez más instrumentos y tecnología.",
      "Nuestros productos son la respuesta más inteligente a este desafío. " +
        "Controlar estos elementos sin perjudicarlos mejora nuestra calidad " +
        "de vida, creándonos un hábitat ideal.",
    ] as string[],

    enlace: "Ver el catálogo completo",
  },

  /**
   * NUESTRO, provisorio. El diferencial del negocio: la colocación es propia y
   * no está tercerizada — `docs/producto.md`, «La colocación no es un
   * producto».
   *
   * Son cuatro pasos y no cuatro íconos: la regla 5 de `docs/diseno.md`
   * prohíbe la grilla de tres columnas con ícono, título y párrafo, que es
   * exactamente lo que hace acá cualquier sitio del rubro.
   */
  trabajo: {
    titulo: "Cómo trabajamos",
    pasos: [
      {
        titulo: "Asesoramiento",
        descripcion:
          "Conversamos qué necesita cada ambiente: cuánta luz entra, cuánta " +
          "privacidad hace falta y qué sistema conviene.",
      },
      {
        titulo: "Medición",
        descripcion:
          "Vamos al lugar y tomamos las medidas nosotros. De ahí sale el " +
          "presupuesto.",
      },
      {
        titulo: "Fabricación a medida",
        descripcion:
          "Cada cortina se fabrica para su ventana. No hay medidas estándar " +
          "ni cortes en el lugar.",
      },
      {
        titulo: "Colocación",
        descripcion:
          "La colocamos nosotros. No es un servicio aparte ni está " +
          "tercerizado: es parte del trabajo.",
      },
    ] as PasoDelTrabajo[],
  },

  /**
   * El sector de proyectos. Entró en la Fase 4.3, con el primero cargado —
   * decisión 52—, y se compone con la misma regla que `/proyectos`: el primero
   * en fila y el resto en grilla, así que con uno no se ve como una grilla a la
   * que le faltan tarjetas.
   *
   * **«Nuestros trabajos» es el nombre que eligió la empresa** para esta
   * sección y para `/proyectos`, en la Fase 4.7; el boceto decía «trabajos
   * realizados». La bajada es NUESTRA, provisoria, y **no afirma cuántos
   * trabajos hay**: el número real es el del listado, y cualquier cifra escrita
   * acá quedaría vieja con el próximo que se cargue.
   */
  proyectos: {
    titulo: "Nuestros trabajos",
    bajada:
      "Espacios completos que resolvimos de principio a fin: asesoramiento, " +
      "medición y colocación propias.",
    enlace: "Ver todos los trabajos",
  },

  /**
   * NUESTRO, provisorio. Los otros dos públicos de `docs/producto.md`. El texto
   * dice lo que las fotos muestran y nada más: las cinco de bandas verticales
   * son oficinas reales, y cuatro fotos del archivo son casas entregadas y
   * todavía sin habitar, que es el momento en que la empresa instala dentro de
   * una obra.
   */
  profesionales: {
    titulo: "Arquitectos, estudios y oficinas",
    texto:
      "Trabajamos dentro de obra, con la casa entregada y todavía sin " +
      "habitar, y en instalaciones de oficina donde hay que resolver muchas " +
      "ventanas con el mismo criterio. Si estás proyectando, escribinos antes " +
      "de que estén los pisos: hay decisiones de carpintería que después no " +
      "se pueden cambiar.",
  },

  /** NUESTRO, provisorio. El cierre. Una sola acción. */
  cierre: {
    titulo: "¿Empezamos?",
    texto:
      "Contanos qué ventana tenés que resolver y te asesoramos. Trabajamos " +
      "en toda Buenos Aires, con medición y colocación propias.",
  },
} as const;
