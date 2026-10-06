import type { Metadata } from "next";
import Link from "next/link";

import { Encabezado } from "@/components/encabezado";
import { Pie } from "@/components/pie";
import { clasesDeBoton } from "@/components/ui/boton";
import { CLASES_CONTENEDOR } from "@/components/ui/contenedor";

/**
 * Una dirección que no existe.
 *
 * **Vive en la raíz y no dentro de `(public)`** porque una URL que no coincide
 * con ninguna ruta no entra a ningún grupo, así que no puede heredar el layout
 * de las públicas. Por eso el encabezado y el pie son componentes sueltos: se
 * arman también acá, y quien cae en un 404 ve el sitio y no una página huérfana.
 *
 * El caso más probable de este sitio no es un error de tipeo: es **un enlace
 * viejo compartido por WhatsApp**, de cuando un producto tenía otro slug. De ahí
 * que la salida sea el catálogo y no «volver al inicio» a secas.
 *
 * Next responde con código 404, que es lo que hace que un buscador no lo
 * indexe: no hace falta `noindex` encima.
 */
export const metadata: Metadata = {
  title: "Página no encontrada",
};

export default function NoEncontrada() {
  return (
    <>
      <Encabezado />
      <main className={`${CLASES_CONTENEDOR} py-16 md:py-28`}>
        {/* La frase chica de arriba, como los lemas del boceto: en
            minúscula y gris, no en mayúscula espaciada (Fase 4.7). */}
        <p className="text-texto-suave text-subtitulo">error 404</p>
        <h1 className="mt-2 text-display">Esta página no existe</h1>
        <p className="max-w-lectura text-texto-suave mt-6 text-subtitulo">
          La dirección no corresponde a ninguna página del sitio. Puede ser un
          enlace viejo: el catálogo tiene los siete productos con sus fotos, y
          desde ahí se llega a todo lo demás.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
          <Link href="/productos" className={clasesDeBoton("principal")}>
            Ver los productos
          </Link>
          <Link href="/" className={clasesDeBoton("enlace")}>
            Ir al inicio
          </Link>
        </div>
      </main>
      <Pie />
    </>
  );
}
