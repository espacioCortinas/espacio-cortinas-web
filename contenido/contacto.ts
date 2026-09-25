/**
 * Los datos de contacto de la empresa, en un solo lugar.
 *
 * Los leen tres cosas: `/contacto`, el pie de todas las páginas y la ficha de
 * negocio local (`components/datos-estructurados.tsx`), que es lo que leen
 * Google y los asistentes de IA cuando alguien pregunta a quién comprarle
 * cortinas en tal zona. **Que estén en un solo archivo es lo que evita que el
 * pie diga un teléfono y la ficha otro.** Es la regla 2 de `CLAUDE.md`: el
 * contenido vive en `contenido/`, no en los componentes.
 *
 * **El número de WhatsApp no está acá**: es `NEXT_PUBLIC_WHATSAPP`, una variable
 * de entorno (`docs/arquitectura.md`), y de ahí lo toman el enlace, la página y
 * la ficha.
 *
 * # Solo lo que la empresa confirmó
 *
 * Es la misma regla que ya seguían la ficha y `contenido/inicio.ts`: **nada
 * inventado para completar un formato.** Un dato falso sobre la empresa —una
 * dirección, un horario, una zona que no atiende— es peor que no publicarlo.
 * Lo que falta, falta, y cada campo dice qué pasa mientras falta.
 */

export type Red = {
  /** Como se lee en la página: «Instagram». */
  nombre: string;
  /** Lo que se muestra como texto del enlace: «@espaciocortinas». */
  usuario: string;
  url: string;
};

export const contacto: {
  /**
   * La casilla que se publica. Es la misma a la que llega el formulario
   * (`EMAIL_CONTACTO`), y se publica igual: esconderla no protege nada que el
   * formulario no exponga ya, y hay quien prefiere escribir desde su correo.
   */
  email: string;

  /**
   * Un teléfono para llamar, **solo si es otro número que el de WhatsApp**.
   * `null` quiere decir que se llama al mismo: la página lo dice así, «teléfono
   * y WhatsApp», con un solo número.
   */
  telefono: { visible: string; internacional: string } | null;

  /** Van al pie, a `/contacto` y al `sameAs` de la ficha, en este orden. */
  redes: Red[];

  /**
   * El Perfil de Empresa de Google. Todavía no se dio de alta
   * (`docs/infraestructura.md`, «Pendiente de dar de alta»); cuando exista, su
   * URL va acá y entra sola al `sameAs` de la ficha.
   */
  perfilDeGoogle: string | null;

  /**
   * Dónde trabaja la empresa, **con nombres concretos**.
   *
   * Es el dato más importante de la ficha: la pregunta que alguien le hace a un
   * buscador o a un asistente siempre trae un lugar —«cortinas en zona norte»,
   * «rollers en Nordelta»—, y una ficha que dice solo «Buenos Aires» no
   * responde ninguna. Se muestra en `/contacto` y va al `areaServed`.
   */
  zonas: string[];
} = {
  // Un alias de `ventas@conceptoespacio.com`, la casilla que ya se lee
  // (docs/infraestructura.md, «Titularidad»). Es también `EMAIL_CONTACTO`.
  email: "ventas@espaciocortinas.com.ar",

  // Se llama al mismo número de WhatsApp.
  telefono: null,

  // No hay Facebook: la empresa dio solo Instagram.
  redes: [
    {
      nombre: "Instagram",
      usuario: "@espaciocortinasarg",
      url: "https://www.instagram.com/espaciocortinasarg/",
    },
  ],

  perfilDeGoogle: null,

  // La empresa dijo «todo Buenos Aires y alrededores, y Uruguay». Los
  // alrededores de la ciudad son las tres zonas del Gran Buenos Aires, y van
  // por su nombre porque así se pregunta: «cortinas en zona norte». Si alguna
  // zona no la atienden, se saca de acá y la ficha la deja de decir.
  zonas: [
    "Ciudad de Buenos Aires",
    "Zona Norte del Gran Buenos Aires",
    "Zona Oeste del Gran Buenos Aires",
    "Zona Sur del Gran Buenos Aires",
    "Uruguay",
  ],
};
