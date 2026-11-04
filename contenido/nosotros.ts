/**
 * Los textos de Nosotros — Fase 4.7.
 *
 * **Son los del boceto que armó la empresa en Wix**, que tenía dos páginas con
 * esto: «Nosotros» —la bajada, «Visión» y «Cuidamos los detalles»— y una
 * «Sobre nosotros» colgada por error del menú de productos, con «propósito».
 * Acá van juntas, en una sola página. Se corrigió la ortografía y la puntuación
 * —«brindandondo», «experiecia», «post venta», la coma de «la calidad de nuestra
 * materia prima, garantiza»— y nada más; el detalle está en `docs/plan.md`,
 * Fase 4.7, «Los textos».
 *
 * **Lo que afirman lo afirma la empresa**: la experiencia en el rubro, el
 * servicio de posventa y el asesoramiento a domicilio son suyos, escritos por
 * ella. Es la diferencia con los textos que escribimos nosotros, que no pueden
 * afirmar nada que no esté documentado (`contenido/inicio.ts`).
 *
 * Cada sección lleva una foto del archivo, por su carpeta en
 * `contenido/fotos.ts`: el boceto no tenía ninguna —solo el logo— y una página
 * de texto solo no se sostiene con el damero.
 */

export type SeccionDeNosotros = {
  titulo: string;
  texto: string;
  /** La foto que la acompaña: su carpeta en el manifiesto, y la posición. */
  foto: {
    entidad: "productos" | "proyectos" | "paginas";
    slug: string;
    posicion: number;
  };
};

export const nosotros = {
  /** DEL BOCETO. */
  titulo: "Nosotros",

  /** DEL BOCETO: lo que el boceto escribía en mayúscula debajo del título. */
  bajada:
    "Ofrecemos soluciones para cada exigencia, brindando protección y " +
    "regulación de la luz natural, con tecnología en cada detalle.",

  /**
   * DEL BOCETO, las tres. Las fotos son las tres que eligió la empresa para
   * esta página, en noviembre de 2026, sin un orden pedido: antes repetían
   * fotos de otras páginas (decisión 67).
   */
  secciones: [
    {
      titulo: "Propósito",
      texto:
        "Con vasta experiencia en el rubro, seguimos cada proyecto de " +
        "principio a fin. La calidad de nuestra materia prima garantiza los " +
        "resultados. Siempre a disposición del cliente, estudiamos cada " +
        "solución. Brindamos asesoramiento para particulares y " +
        "profesionales. Servicio de posventa.",
      foto: { entidad: "paginas", slug: "nosotros", posicion: 1 },
    },
    {
      titulo: "Visión",
      texto:
        "Preservando la calidad de nuestros productos, garantizamos como " +
        "resultado un producto confiable y duradero. Incorporamos tecnología " +
        "y confort en nuestros productos.",
      foto: { entidad: "paginas", slug: "nosotros", posicion: 2 },
    },
    {
      titulo: "Cuidamos los detalles",
      texto:
        "Contamos con un servicio de asesoramiento a domicilio, acompañando a " +
        "profesionales en sus proyectos y a clientes particulares.",
      foto: { entidad: "paginas", slug: "nosotros", posicion: 3 },
    },
  ] as SeccionDeNosotros[],

  /** NUESTRO, provisorio. El cierre: una sola acción. */
  cierre: {
    titulo: "¿Hablamos?",
    texto:
      "Contanos qué espacio hay que resolver —una casa, una obra o una " +
      "oficina— y te asesoramos. Vamos a medir y la colocación es nuestra.",
  },
} as const;
