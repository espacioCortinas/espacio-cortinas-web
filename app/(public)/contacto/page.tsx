import type { Metadata } from "next";
import type { ReactNode } from "react";

import { FormularioContacto } from "@/components/formulario-contacto";
import { EnlaceWhatsapp } from "@/components/whatsapp";
import { clasesDeBoton } from "@/components/ui/boton";
import { CLASES_CONTENEDOR } from "@/components/ui/contenedor";
import { productosPublicados } from "@/contenido";
import { contacto } from "@/contenido/contacto";
import { INTERES_OTRO } from "@/lib/consulta";
import { metadataDePagina } from "@/lib/metadata";
import { numeroInternacional, numeroVisible } from "@/lib/whatsapp";

import { enviarFormularioDeContacto } from "./acciones";

/**
 * Contacto.
 *
 * **Es la página que importa.** El objetivo comercial del sitio es uno solo
 * —que alguien termine escribiendo por WhatsApp (docs/producto.md)— y todo lo
 * demás existe para traer a alguien hasta acá.
 *
 * # Los sectores
 *
 *     1  APERTURA     antetítulo, titular, bajada y WhatsApp
 *     2  OTRAS FORMAS teléfono, email, redes y dónde trabajamos
 *     3  MENSAJE      el formulario, para quien prefiere escribir con tiempo
 *
 * **WhatsApp va primero y es el único botón principal de la página.** El
 * formulario existe y funciona, pero es la segunda opción: su botón es el
 * secundario, con filete, para que la jerarquía la diga el propio dibujo.
 *
 * **Los datos no están escritos acá**: salen de `contenido/contacto.ts`, que
 * es también de donde los leen el pie y la ficha de negocio local. El número de
 * WhatsApp sale de `NEXT_PUBLIC_WHATSAPP`, la misma variable que arma el
 * enlace, así que el número que se lee es siempre el que abre el chat.
 *
 * **La página sigue siendo estática.** El formulario es un componente de
 * cliente y el envío es una Server Action: lo único que corre en el servidor
 * es el envío, cuando alguien lo pide (`docs/arquitectura.md`).
 */

export const metadata: Metadata = metadataDePagina({
  titulo: "Contacto",
  descripcion:
    "Consultanos por WhatsApp, por teléfono o por email por cortinas, " +
    "rollers, venecianas y toldos a medida, con medición y colocación propias.",
  ruta: "/contacto",
});

/** El ritmo entre sectores: 64 en teléfono, 112 en escritorio. */
const SECTOR = "mt-16 md:mt-28";

export default function Contacto() {
  // Las opciones de «qué estás buscando»: el catálogo, en su orden, con «no
  // sé» primero —es la respuesta de mucha gente antes de que la asesoren— y
  // «otra cosa» al final. Del mismo arreglo que `/productos`: si entra un
  // producto, aparece solo.
  const intereses = [
    { valor: "", texto: "Todavía no lo sé" },
    ...productosPublicados().map((producto) => ({
      valor: producto.slug,
      texto: producto.nombre,
    })),
    { valor: INTERES_OTRO, texto: "Otra cosa" },
  ];

  const telefono = contacto.telefono ?? {
    visible: numeroVisible(),
    internacional: numeroInternacional(),
  };

  return (
    <main className={`${CLASES_CONTENEDOR} py-16 md:py-28`}>
      {/* 1 — APERTURA ------------------------------------------------ */}
      {/*
        Las mismas tres piezas que `/productos` y `/proyectos` (decisión 49):
        un antetítulo, un titular que dice qué hacer en vez de repetir el
        nombre del menú, y una bajada. Y enseguida, la acción.
      */}
      <header>
        <p className="text-texto-suave text-meta tracking-[0.12em] uppercase">
          Contacto
        </p>
        <h1 className="mt-4 max-w-lectura text-display">
          Escribinos por WhatsApp
        </h1>
        <p className="max-w-lectura text-texto-suave mt-6 text-subtitulo">
          Contanos qué ventana o qué ambiente hay que resolver —con las medidas
          aproximadas, si las tenés— y te asesoramos. La medición y la
          colocación son nuestras.
        </p>
        <div className="mt-10">
          <EnlaceWhatsapp contexto={{ tipo: "general" }} />
        </div>
      </header>

      {/*
        Dos columnas desde 1024: los datos a la izquierda, angostos, y el
        formulario a la derecha, que es lo que necesita ancho. Abajo de eso,
        todo en una columna y en el orden en que se lee: primero lo que se
        resuelve con un toque —llamar, escribir un mail— y después lo que pide
        sentarse a escribir.
      */}
      <div
        className={`${SECTOR} lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16`}
      >
        {/* 2 — OTRAS FORMAS -------------------------------------------- */}
        <section aria-labelledby="otras-formas">
          <h2 id="otras-formas" className="text-titulo">
            Otras formas
          </h2>

          {/*
            Una lista de definiciones con filetes, como las variantes de un
            producto: el filete de 1 px es el único recurso gráfico del sistema.
            Sin íconos al lado de cada dato — la regla 4 de `docs/diseno.md`, y
            además el nombre escrito dice más que un dibujo de un sobre.
          */}
          <dl className="border-linea mt-8 border-t">
            <Dato
              etiqueta={contacto.telefono ? "Teléfono" : "Teléfono y WhatsApp"}
            >
              <a
                href={`tel:${telefono.internacional}`}
                className={clasesDeBoton("enlace")}
              >
                {telefono.visible}
              </a>
            </Dato>

            <Dato etiqueta="Email">
              <a
                href={`mailto:${contacto.email}`}
                // Una dirección larga no tiene dónde partirse y en 320 px
                // empujaría la página de costado.
                className={`${clasesDeBoton("enlace")} break-all`}
              >
                {contacto.email}
              </a>
            </Dato>

            {contacto.redes.map((red) => (
              <Dato key={red.url} etiqueta={red.nombre}>
                <a
                  href={red.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={clasesDeBoton("enlace")}
                >
                  {red.usuario}
                </a>
              </Dato>
            ))}

            {/*
              Una zona por renglón y no todas en una línea con puntos: son
              varias, y quien entra acá busca la suya.
            */}
            <Dato etiqueta="Dónde trabajamos">
              <ul className="py-2">
                {contacto.zonas.map((zona) => (
                  <li key={zona}>{zona}</li>
                ))}
              </ul>
            </Dato>
          </dl>
        </section>

        {/* 3 — MENSAJE --------------------------------------------------- */}
        <section aria-labelledby="mensaje" className={`${SECTOR} lg:mt-0`}>
          <h2 id="mensaje" className="text-titulo">
            Dejanos un mensaje
          </h2>
          <p className="max-w-lectura text-texto-suave mt-4">
            Si preferís escribir con tiempo, completá esto y te respondemos por
            email. Tus datos llegan a nuestro correo y se usan solo para
            responderte.
          </p>
          <div className="mt-8">
            <FormularioContacto
              enviar={enviarFormularioDeContacto}
              intereses={intereses}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

/**
 * Un dato de contacto: el nombre del medio y el dato. El nombre va en el
 * tratamiento del antetítulo —13 px en versalita, texto suave, 5,23:1— y el
 * dato en negro.
 *
 * **Al costado solo entre 768 y 1023**, que es cuando la lista tiene la
 * columna entera. Desde 1024 comparte el ancho con el formulario y le quedan
 * unos 360 px: con el nombre al costado, la casilla de email tendría 160 y se
 * partiría en tres renglones.
 */
function Dato({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: ReactNode;
}) {
  return (
    <div className="border-linea border-b py-4 md:grid md:grid-cols-[11rem_minmax(0,1fr)] md:items-baseline md:gap-6 lg:block">
      <dt className="text-texto-suave text-meta tracking-[0.12em] uppercase">
        {etiqueta}
      </dt>
      <dd className="mt-1 md:mt-0 lg:mt-1">{children}</dd>
    </div>
  );
}
