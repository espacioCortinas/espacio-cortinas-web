import Link from "next/link";

import { EnlaceWhatsapp } from "@/components/whatsapp";
import { Contenedor } from "@/components/ui/contenedor";
import { contacto } from "@/contenido/contacto";
import { DESCRIPCION_SITIO } from "@/lib/metadata";
import { ENLACES } from "@/lib/navegacion";
import { numeroInternacional, numeroVisible } from "@/lib/whatsapp";

/**
 * El pie del sitio.
 *
 * **Solo dice lo que es cierto.** No hay dirección —la empresa trabaja a
 * domicilio y no dio una para publicar—. El teléfono, la casilla y las redes
 * salen de `contenido/contacto.ts`, que es de donde los leen también
 * `/contacto` y la ficha de negocio local: los tres dicen siempre lo mismo.
 *
 * **Y no repite el logo.** El amarillo va una vez por pantalla (`docs/diseno.md`,
 * «La marca»), y esa vez la gasta el encabezado. Acá el nombre va compuesto en
 * la familia de títulos, que es texto y no marca.
 *
 * Sin año: el sitio se construye entero en cada despliegue, así que un «© 2026»
 * escrito acá quedaría congelado en la fecha del último build y envejecería en
 * silencio.
 */
export function Pie() {
  const telefono = contacto.telefono ?? {
    visible: numeroVisible(),
    internacional: numeroInternacional(),
  };

  return (
    /*
     * Sin margen arriba: el aire que separa el pie del contenido lo pone el
     * `py` del `<main>` de cada página, que ya es el ritmo del sistema —64 en
     * teléfono, 112 en escritorio—. Sumarle acá otro tanto daba 224 px de papel
     * vacío antes del filete, que en Inicio se veía como un error.
     */
    <footer className="border-linea border-t">
      <Contenedor>
        <div className="grid gap-10 py-12 md:grid-cols-[1fr_auto] md:gap-20 md:py-16">
          <div>
            <p className="font-titulo text-titulo">Espacio Cortinas</p>
            <p className="max-w-lectura text-texto-suave mt-3">
              {DESCRIPCION_SITIO}
            </p>
            <p className="text-texto-suave mt-5 text-meta tracking-[0.12em] uppercase">
              Buenos Aires
            </p>

            {/*
              Los medios directos, como enlaces de texto: se llama, se escribe
              un mail o se abre la red con un toque, sin pasar por /contacto.
              Negros y subrayados, que es la forma de un enlace en este sitio,
              y con 44 px de alto cada uno.
            */}
            <ul className="mt-4 flex flex-wrap gap-x-6">
              <li>
                <a
                  href={`tel:${telefono.internacional}`}
                  className="text-texto inline-flex min-h-11 items-center underline decoration-1 underline-offset-4 hover:decoration-2"
                >
                  {telefono.visible}
                </a>
              </li>
              <li className="min-w-0">
                <a
                  href={`mailto:${contacto.email}`}
                  className="text-texto inline-flex min-h-11 items-center break-all underline decoration-1 underline-offset-4 hover:decoration-2"
                >
                  {contacto.email}
                </a>
              </li>
              {contacto.redes.map((red) => (
                <li key={red.url}>
                  <a
                    href={red.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-texto inline-flex min-h-11 items-center underline decoration-1 underline-offset-4 hover:decoration-2"
                  >
                    {red.nombre}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Pie de página">
            <ul className="flex flex-col gap-1">
              {ENLACES.map(({ href, texto }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-texto inline-flex min-h-11 items-center text-meta tracking-[0.1em] uppercase underline-offset-[6px] hover:underline"
                  >
                    {texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/*
          WhatsApp es el canal principal del negocio, así que está al alcance
          desde el final de cualquier página sin tener que buscarlo. Con el
          mensaje general: el pie es el mismo en todas las páginas, y el que
          lleva el nombre del producto o del proyecto es el del cierre de cada
          una, que está justo arriba.
        */}
        <div className="border-linea border-t py-8">
          <EnlaceWhatsapp
            contexto={{ tipo: "general" }}
            variante="secundario"
          />
        </div>
      </Contenedor>
    </footer>
  );
}
