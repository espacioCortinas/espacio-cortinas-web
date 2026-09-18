import Link from "next/link";

import { EnlaceWhatsapp } from "@/components/whatsapp";
import { Contenedor } from "@/components/ui/contenedor";
import { DESCRIPCION_SITIO } from "@/lib/metadata";
import { ENLACES } from "@/lib/navegacion";

/**
 * El pie del sitio.
 *
 * **Solo dice lo que es cierto hoy.** No hay dirección —la empresa trabaja a
 * domicilio en todo Buenos Aires y no hay local documentado—, no hay teléfono
 * ni casilla, porque `contacto@espaciocortinas.com.ar` y el número de WhatsApp
 * entran con el formulario en la Fase 4.6. Publicar una casilla que todavía no
 * recibe es peor que no publicar ninguna. Es la misma regla que sigue
 * `components/datos-estructurados.tsx`.
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
          desde el final de cualquier página sin tener que buscarlo. Hoy no se
          dibuja: sin `NEXT_PUBLIC_WHATSAPP` cargada, el enlace no existe
          (Fase 4.6).
        */}
        <div className="border-linea empty:hidden border-t py-8">
          <EnlaceWhatsapp
            contexto={{ tipo: "general" }}
            variante="secundario"
          />
        </div>
      </Contenedor>
    </footer>
  );
}
