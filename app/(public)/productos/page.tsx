import type { Metadata } from "next";
import Link from "next/link";

import { FotoImg } from "@/components/foto";
import { EnlaceWhatsapp } from "@/components/whatsapp";
import { CLASES_CONTENEDOR } from "@/components/ui/contenedor";
import { Vacio } from "@/components/ui/vacio";
import { productosPublicados } from "@/contenido";
import { portadaDe } from "@/lib/fotos";
import { metadataDePagina } from "@/lib/metadata";
import { altAutomatico, recortar } from "@/lib/texto";

/**
 * El catálogo.
 *
 * ARMAZÓN, NO COMPOSICIÓN. La Fase 4.2 le puso la columna, el ritmo vertical,
 * la escala tipográfica y los componentes del sistema. **La grilla, la tarjeta
 * de producto y el tamaño de cada módulo son de la Fase 4.4**, que es la que
 * decide cómo se cura un archivo desparejo — sigue siendo una lista en una sola
 * columna a propósito.
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
    <main className={`${CLASES_CONTENEDOR} py-16 md:py-28`}>
      <h1 className="text-display">Productos</h1>
      <p className="max-w-lectura text-texto-suave mt-6 text-subtitulo">
        Cortinas y protección solar a medida, con asesoramiento y colocación.
      </p>

      {productos.length === 0 ? (
        // Un listado vacío se dice, no se tapa: es información sobre el estado
        // del contenido, no un problema a esconder. Hoy este camino no se
        // recorre —hay siete productos— pero es el mismo componente que sí se
        // ve en `/proyectos`.
        <div className="mt-12 md:mt-16">
          <Vacio
            etiqueta="Todavía sin productos publicados"
            titulo="El catálogo se está cargando."
          >
            <p>
              En cuanto haya productos publicados aparecen acá, con sus fotos y
              sus variantes.
            </p>
          </Vacio>
        </div>
      ) : (
        <ul className="mt-12 flex flex-col gap-12 md:mt-16">
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
                        // Los listados usan siempre la portada, y la portada
                        // siempre es 4:5 (decisión 14).
                        proporcion="4/5"
                        // El ancho de la caja, escrito dos veces: acá y en
                        // `max-w-xs`. Los dos cambian juntos en la Fase 4.4.
                        sizes="(max-width: 320px) 100vw, 320px"
                        prioridad={i === 0}
                      />
                    </div>
                  )}
                  <h2 className="mt-4 text-titulo">
                    <Link
                      href={`/productos/${producto.slug}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {producto.nombre}
                    </Link>
                  </h2>
                  <p className="max-w-lectura text-texto-suave mt-3">
                    {recortar(producto.descripcion, 180)}
                  </p>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      {/* `empty:hidden`: sin `NEXT_PUBLIC_WHATSAPP` el enlace no dibuja nada, y
          un bloque vacío con su margen deja un hueco (Fase 4.6). */}
      <div className="empty:hidden mt-16 md:mt-20">
        <EnlaceWhatsapp contexto={{ tipo: "general" }} />
      </div>
    </main>
  );
}
