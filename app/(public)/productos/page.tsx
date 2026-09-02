import type { Metadata } from "next";
import Link from "next/link";

import { FotoImg } from "@/components/foto";
import { EnlaceWhatsapp } from "@/components/whatsapp";
import { productosPublicados } from "@/contenido";
import { portadaDe } from "@/lib/fotos";
import { metadataDePagina } from "@/lib/metadata";
import { altAutomatico, recortar } from "@/lib/texto";

/**
 * El catálogo.
 *
 * MAQUETACIÓN MÍNIMA A PROPÓSITO: una lista, sin grilla, sin tarjetas y sin
 * colores propios. Esta fase construye el armazón; la composición se decide en
 * la Fase 4.1 con las fotos reales delante (docs/plan.md).
 *
 * **Productos es el catálogo y Proyectos es el portfolio.** La distinción tiene
 * que quedar clara para el visitante: qué vendemos y qué hicimos
 * (docs/producto.md).
 */

export const metadata: Metadata = metadataDePagina({
  titulo: "Productos",
  descripcion:
    "Rollers blackout y screen, cortinas de tela, venecianas y toldos. " +
    "Todo a medida, con asesoramiento y colocación en Buenos Aires.",
  ruta: "/productos",
});

export default function Productos() {
  const productos = productosPublicados();

  return (
    <main>
      <h1>Productos</h1>
      <p>
        Cortinas y protección solar a medida, con asesoramiento y colocación.
      </p>

      {productos.length === 0 ? (
        // Un listado vacío se dice, no se tapa: es información sobre el estado
        // del contenido, no un problema a esconder.
        <p>Todavía no hay productos publicados.</p>
      ) : (
        <ul>
          {productos.map((producto, i) => {
            const portada = portadaDe(producto.fotos);
            return (
              <li key={producto.slug}>
                <article>
                  {portada && (
                    <div className="max-w-xs">
                      <FotoImg
                        foto={portada}
                        alt={altAutomatico(producto.nombre, 1)}
                        // El ancho de la caja, escrito dos veces: acá y en
                        // `max-w-xs`. Los dos cambian juntos en la Fase 4.1.
                        sizes="(max-width: 320px) 100vw, 320px"
                        prioridad={i === 0}
                      />
                    </div>
                  )}
                  <h2>
                    <Link href={`/productos/${producto.slug}`}>
                      {producto.nombre}
                    </Link>
                  </h2>
                  <p>{recortar(producto.descripcion, 180)}</p>
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
