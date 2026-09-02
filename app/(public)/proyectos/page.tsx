import type { Metadata } from "next";
import Link from "next/link";

import { FotoImg } from "@/components/foto";
import { EnlaceWhatsapp } from "@/components/whatsapp";
import { proyectosPublicados } from "@/contenido";
import { portadaDe } from "@/lib/fotos";
import { metadataDePagina } from "@/lib/metadata";
import { altAutomatico, recortar } from "@/lib/texto";

/**
 * El portfolio.
 *
 * MAQUETACIÓN MÍNIMA A PROPÓSITO — la composición se decide en la Fase 4.1.
 *
 * **Hoy está vacío, y la sección se construye igual.** No se llegó a cargar
 * ningún proyecto antes de sacar el panel, y llenarla con trabajos inventados
 * sería mentir sobre lo que la empresa hizo. Que esté vacía es información:
 * dice qué material falta para la Fase 4.1, que es la que necesita fotos
 * reales para definir la dirección visual.
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
    <main>
      <h1>Proyectos</h1>
      <p>Trabajos terminados, con fotos de las casas y oficinas reales.</p>

      {proyectos.length === 0 ? (
        <p>Todavía no hay proyectos publicados.</p>
      ) : (
        <ul>
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
                        sizes="(max-width: 320px) 100vw, 320px"
                        prioridad={i === 0}
                      />
                    </div>
                  )}
                  <h2>
                    <Link href={`/proyectos/${proyecto.slug}`}>
                      {proyecto.titulo}
                    </Link>
                  </h2>
                  {/* El título es el trabajo y la ubicación va aparte, como
                      chip, cuando haya diseño (docs/producto.md). */}
                  <p>{proyecto.ubicacion}</p>
                  <p>{recortar(proyecto.descripcion, 180)}</p>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      <EnlaceWhatsapp contexto={{ tipo: "general" }} />
    </main>
  );
}
