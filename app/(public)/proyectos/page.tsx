import type { Metadata } from "next";
import Link from "next/link";

import { FotoImg } from "@/components/foto";
import { EnlaceWhatsapp } from "@/components/whatsapp";
import { clasesDeBoton } from "@/components/ui/boton";
import { Chip } from "@/components/ui/chip";
import { CLASES_CONTENEDOR } from "@/components/ui/contenedor";
import { Vacio } from "@/components/ui/vacio";
import { proyectosPublicados } from "@/contenido";
import { portadaDe } from "@/lib/fotos";
import { metadataDePagina } from "@/lib/metadata";
import { altAutomatico, recortar } from "@/lib/texto";

/**
 * El portfolio.
 *
 * **Hoy está vacío, y la sección se construye igual.** No se llegó a cargar
 * ningún proyecto antes de sacar el panel, y llenarla con trabajos inventados
 * sería mentir sobre lo que la empresa hizo.
 *
 * **Que esté vacía se dice, no se tapa.** Es el único listado del sitio que
 * hoy se ve en ese estado, así que es el que prueba que el estado vacío
 * funciona: ver `components/ui/vacio.tsx`.
 *
 * La composición del listado con contenido —la grilla, el tamaño de cada
 * módulo, la galería de cada proyecto— es de la Fase 4.3. Lo que hay acá es el
 * armazón con los componentes del sistema, que es lo que esta fase deja.
 */

export const metadata: Metadata = metadataDePagina({
  titulo: "Proyectos",
  descripcion:
    "Trabajos realizados por Espacio Cortinas en casas, estudios de " +
    "arquitectura y oficinas de Buenos Aires.",
  ruta: "/proyectos",
});

export default function Proyectos() {
  const proyectos = proyectosPublicados();

  return (
    <main className={`${CLASES_CONTENEDOR} py-16 md:py-28`}>
      <h1 className="text-display">Proyectos</h1>
      <p className="max-w-lectura text-texto-suave mt-6 text-subtitulo">
        Trabajos terminados, con fotos de las casas y oficinas reales.
      </p>

      {proyectos.length === 0 ? (
        <div className="mt-12 md:mt-16">
          <Vacio
            etiqueta="Todavía sin proyectos publicados"
            titulo="El archivo de trabajos terminados se está armando."
            acciones={
              <>
                <Link href="/productos" className={clasesDeBoton("principal")}>
                  Ver los productos
                </Link>
                <Link href="/contacto" className={clasesDeBoton("enlace")}>
                  Escribirnos
                </Link>
              </>
            }
          >
            <p>
              Cada proyecto se publica con las fotos de la casa o la oficina
              donde se instaló, y preferimos no publicar ninguno antes que
              publicar algo que no sea un trabajo nuestro. Mientras tanto, el
              catálogo muestra los siete productos con fotos de instalaciones
              reales.
            </p>
          </Vacio>
        </div>
      ) : (
        <ul className="mt-12 flex flex-col gap-12 md:mt-16">
          {proyectos.map((proyecto, i) => {
            const portada = portadaDe(proyecto.fotos);
            return (
              <li key={proyecto.slug}>
                <article>
                  {portada && (
                    <div className="max-w-xs">
                      <FotoImg
                        foto={portada}
                        alt={altAutomatico(proyecto.titulo, 1)}
                        // Los listados usan siempre la portada, y la portada
                        // siempre es 4:5: es lo que hace que la grilla quede
                        // pareja aunque la galería mezcle orientaciones
                        // (decisión 14).
                        proporcion="4/5"
                        // El ancho de la caja, escrito dos veces: acá y en
                        // `max-w-xs`. Los dos cambian juntos en la Fase 4.3.
                        sizes="(max-width: 320px) 100vw, 320px"
                        prioridad={i === 0}
                      />
                    </div>
                  )}
                  <h2 className="mt-4 text-titulo">
                    <Link
                      href={`/proyectos/${proyecto.slug}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {proyecto.titulo}
                    </Link>
                  </h2>
                  {/* El título es el trabajo y la ubicación va aparte, como
                      chip (docs/producto.md). */}
                  <p className="mt-3">
                    <Chip>{proyecto.ubicacion}</Chip>
                  </p>
                  <p className="max-w-lectura text-texto-suave mt-3">
                    {recortar(proyecto.descripcion, 180)}
                  </p>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      {/* `empty:hidden` porque sin `NEXT_PUBLIC_WHATSAPP` el enlace no dibuja
          nada, y un bloque vacío con su margen arriba deja un hueco que parece
          un error de maquetación (Fase 4.6). */}
      <div className="empty:hidden mt-16 md:mt-20">
        <EnlaceWhatsapp contexto={{ tipo: "general" }} />
      </div>
    </main>
  );
}
