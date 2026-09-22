/**
 * Los textos de Inicio.
 *
 * # ESTE TEXTO ES PROVISORIO Y SE REEMPLAZA
 *
 * **Lo redacta la empresa, no el desarrollo.** Lo que hay acá abajo es texto
 * genérico para que la página exista y se pueda mirar; cuando llegue el texto
 * de la empresa se reemplaza, y **reemplazarlo es editar este archivo y nada
 * más**: ninguna cadena de Inicio vive dentro de un componente.
 *
 * Para quien escriba la versión final, tres cosas que conviene saber:
 *
 * - **`titular` es lo primero que se lee y lo que viaja en cada enlace
 *   compartido por WhatsApp.** Dos líneas como mucho.
 * - **`bajada` se lee debajo del titular**, y es la que dice a quién le habla
 *   el sitio. Entre 120 y 200 caracteres.
 * - **Nada acá puede afirmar algo que no sea cierto y verificable.** Los años
 *   de trayectoria, la cantidad de trabajos, las marcas con las que trabaja y
 *   cualquier garantía **no están documentados en ningún lado del proyecto**,
 *   así que no se escriben hasta que la empresa los confirme. Es la misma
 *   regla que sigue `components/datos-estructurados.tsx` con la dirección y el
 *   horario.
 *
 * # Por qué es un archivo de contenido y no texto suelto en la página
 *
 * `CLAUDE.md`, regla 2: todo el contenido viene de `contenido/`. Vale también
 * para los textos de una página, y acá vale doble, porque este texto **se sabe
 * de antemano que va a cambiar** y lo va a cambiar alguien que no escribe
 * código.
 */

export type PasoDelTrabajo = {
  /** Se numera solo al renderizar: el número es la posición en el arreglo. */
  titulo: string;
  descripcion: string;
};

export const inicio = {
  /** PROVISORIO — lo reemplaza el texto de la empresa. */
  titular: "Cortinas a medida, medidas y colocadas por nosotros",

  /** PROVISORIO — lo reemplaza el texto de la empresa. */
  bajada:
    "Rollers, venecianas, cortinas de tela y toldos para casas, estudios de " +
    "arquitectura y oficinas de Buenos Aires.",

  /** El encabezado de la grilla de productos destacados. */
  productos: {
    titulo: "Qué hacemos",
    bajada:
      "Cortinas y protección solar a medida. Estos son los que más salen; " +
      "el catálogo completo tiene siete.",
    enlace: "Ver el catálogo completo",
  },

  /**
   * El diferencial del negocio: la colocación es propia y no está
   * tercerizada — `docs/producto.md`, «La colocación no es un producto».
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
   * PROVISORIO — lo reemplaza el texto de la empresa. **No afirma cuántos
   * trabajos hay**: el número real es el del listado, y cualquier cifra escrita
   * acá quedaría vieja con el próximo que se cargue.
   */
  proyectos: {
    /**
     * No «Trabajos terminados»: sugería que los proyectos son los únicos
     * trabajos terminados, cuando las fotos del catálogo también lo son. Esta
     * sección muestra los proyectos grandes, y «integral» es el cuarto valor
     * de `docs/producto.md` —asesoran y colocan—: un espacio resuelto entero,
     * no una ventana.
     */
    titulo: "Proyectos integrales",
    bajada:
      "Espacios completos que resolvimos de principio a fin: asesoramiento, " +
      "medición y colocación propias.",
    enlace: "Ver todos los proyectos",
  },

  /**
   * Los otros dos públicos de `docs/producto.md`. El texto dice lo que las
   * fotos muestran y nada más: las cinco de bandas verticales son oficinas
   * reales, y cuatro fotos del archivo son casas entregadas y todavía sin
   * habitar, que es el momento en que la empresa instala dentro de una obra.
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

  /** El cierre. Una sola acción. */
  cierre: {
    titulo: "¿Empezamos?",
    texto:
      "Contanos qué ventana tenés que resolver y te asesoramos. Trabajamos " +
      "en toda Buenos Aires, con medición y colocación propias.",
  },
} as const;
