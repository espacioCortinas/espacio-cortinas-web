import type { Metadata } from "next";
import Link from "next/link";

import { FotoImg } from "@/components/foto";
import { TarjetaProducto } from "@/components/tarjeta-producto";
import { EnlaceWhatsapp } from "@/components/whatsapp";
import { clasesDeBoton } from "@/components/ui/boton";
import { CLASES_CONTENEDOR } from "@/components/ui/contenedor";
import { fotoDe, productosDestacados } from "@/contenido";
import { inicio } from "@/contenido/inicio";
import { PRODUCTOS_DESTACADOS_HOME } from "@/lib/constantes";
import { entornoPublico } from "@/lib/entorno";
import { DESCRIPCION_SITIO, metadataDePagina } from "@/lib/metadata";
import { altAutomatico } from "@/lib/texto";

/**
 * Inicio.
 *
 * # Los sectores, y por qué son estos
 *
 *     1  APERTURA                  la frase, la foto, una acción
 *     2  QUÉ HACEMOS               los cuatro productos destacados
 *     3  CÓMO TRABAJAMOS           asesoramiento, medición, fabricación, colocación
 *     4  ARQUITECTOS Y OFICINAS    los otros dos públicos
 *     5  CIERRE                    una sola acción
 *
 * Se decidió mirando cuatro sitios profesionales del rubro —Silent Gliss, The
 * Shade Store, Dino Conte y un estudio de interiorismo— y **lo único que las
 * cuatro comparten es una grilla de fotos con nombre**: ninguna se sostiene con
 * texto. De ahí que el sector 2 sea el que lleva el peso visual.
 *
 * Dos diferencias con el orden que pedía `docs/producto.md`, y las dos son
 * decisión 47:
 *
 * - **«Empresa» no abre la página.** Es la apertura más débil posible para un
 *   negocio visual, y además no hay con qué: ni foto de equipo, ni taller, ni
 *   años documentados. Se disuelve en la bajada y en «cómo trabajamos».
 * - **Productos antes que proyectos**, porque productos es la única sección con
 *   material.
 *
 * # Lo que NO está, y es a propósito
 *
 * **No hay sección de proyectos.** `contenido/proyectos.ts` está vacío, y una
 * página de inicio no promete lo que no existe. `/proyectos` sigue en el menú
 * con su bloque de vacío, así que un enlace ya compartido no cae en el aire.
 * El día que se cargue el primer proyecto, esta página suma su sector.
 *
 * **No hay grilla de tres columnas con ícono, título y párrafo** para explicar
 * el servicio, que es exactamente lo que hace The Shade Store en ese lugar y
 * lo que prohíbe la regla 5 de `docs/diseno.md`. En su lugar hay una lista
 * numerada con filetes.
 *
 * **No hay texto sobre ninguna foto.** En este archivo no se hace nunca: la
 * ventana es la zona más clara del cuadro y cambia de lugar en cada foto.
 *
 * # Los textos son provisorios
 *
 * Todos salen de `contenido/inicio.ts` y **los reemplaza la empresa**.
 * Reemplazarlos es editar ese archivo: acá no hay ninguna cadena escrita.
 */

export const metadata: Metadata = metadataDePagina({
  titulo: "Cortinas, rollers y toldos a medida en Buenos Aires",
  descripcion: DESCRIPCION_SITIO,
  ruta: "/",
});

/** El ritmo entre sectores: 64 en teléfono, 112 en escritorio. */
const SECTOR = "mt-16 md:mt-28";

export default function Inicio() {
  const destacados = productosDestacados(PRODUCTOS_DESTACADOS_HOME);
  const hayWhatsapp = entornoPublico.whatsapp !== null;

  /*
   * La foto que abre. Es `venecianas-madera/2`, una de las cuatro que
   * `docs/diseno.md` califica como capaces de sostener un lugar grande
   * —«arquitectura de verdad; bañera, lamas negras, río de fondo»— y es
   * vertical.
   *
   * **No es `cortinas-tela/1`, que es la mejor del archivo, y es por una razón
   * de composición:** esa es la portada de Cortinas de tela, que está en la
   * grilla de acá abajo. La misma foto dos veces en la misma pantalla se lee
   * como un error.
   */
  const fotoApertura = fotoDe("productos", "venecianas-madera", 2);

  /*
   * El bloque de arquitectos y oficinas. Las cinco fotos de bandas verticales
   * son oficinas reales, y esta es horizontal, que es lo que entra bien al
   * lado de un texto.
   */
  const fotoProfesionales = fotoDe("productos", "bandas-verticales", 2);

  return (
    <main className={`${CLASES_CONTENEDOR} py-16 md:py-28`}>
      {/* 1 — APERTURA ------------------------------------------------ */}
      {/*
        La frase primero y la foto después. Es lo contrario de lo que hacen los
        cuatro sitios de referencia, y es deliberado por dos razones: la
        dirección elegida dice que lo que sostiene las páginas es la tipografía
        —«la mitad del archivo no da para sostener nada»— y en un teléfono una
        foto 4:5 arriba de todo empuja el mensaje abajo del pliegue.
      */}
      <section>
        <h1 className="max-w-lectura text-display">{inicio.titular}</h1>
        <p className="max-w-lectura text-texto-suave mt-6 text-subtitulo">
          {inicio.bajada}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
          <EnlaceWhatsapp contexto={{ tipo: "general" }} />
          <Link
            href="/productos"
            className={clasesDeBoton(hayWhatsapp ? "secundario" : "principal")}
          >
            Ver los productos
          </Link>
        </div>

        {fotoApertura && (
          // Dentro de la columna y alineada al margen izquierdo, no centrada:
          // el aire que queda a la derecha es parte de la composición. Y nunca
          // a sangre, que además de ser la tesis es aritmética — ninguna foto
          // del archivo tiene píxeles para el ancho de un escritorio.
          <div className="mt-12 max-w-[34rem] md:mt-16">
            <FotoImg
              foto={fotoApertura}
              alt={altAutomatico("Venecianas de madera", 2)}
              sizes="(min-width: 768px) 544px, 100vw"
              prioridad
            />
          </div>
        )}
      </section>

      {/* 2 — QUÉ HACEMOS --------------------------------------------- */}
      {destacados.length > 0 && (
        <section className={SECTOR}>
          <h2 className="text-titulo">{inicio.productos.titulo}</h2>
          <p className="max-w-lectura text-texto-suave mt-4">
            {inicio.productos.bajada}
          </p>

          {/*
            Dos columnas hasta 1024 y cuatro arriba. A cuatro columnas en una
            tablet cada portada quedaría en 150 px, que para una foto de
            interior es una estampilla.
          */}
          <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:gap-x-6 lg:grid-cols-4">
            {destacados.map((producto, i) => (
              <li key={producto.slug}>
                <TarjetaProducto
                  producto={producto}
                  // El mismo dato que los anchos de la grilla de arriba,
                  // escrito dos veces. Cambian juntos.
                  sizes="(min-width: 1024px) 238px, (min-width: 768px) 324px, 45vw"
                  prioridad={i === 0}
                />
              </li>
            ))}
          </ul>

          <p className="mt-10">
            <Link href="/productos" className={clasesDeBoton("enlace")}>
              {inicio.productos.enlace}
            </Link>
          </p>
        </section>
      )}

      {/* 3 — CÓMO TRABAJAMOS ----------------------------------------- */}
      <section className={SECTOR}>
        <h2 className="text-titulo">{inicio.trabajo.titulo}</h2>

        {/*
          Lista numerada con filetes, y no cuatro columnas con un ícono arriba.
          La numeración es el recurso que aportó la dirección «Regla» y el
          filete de 1 px es el único elemento gráfico del sistema.

          Es un `<ol>` de verdad: el orden es información —primero se mide y
          después se coloca— y así lo anuncia un lector de pantalla sin
          depender de que vea el número.
        */}
        <ol className="border-linea mt-8 border-t">
          {inicio.trabajo.pasos.map((paso, i) => (
            <li
              key={paso.titulo}
              className="border-linea border-b py-6 md:grid md:grid-cols-[5rem_1fr] md:gap-8 md:py-8"
            >
              <span
                // El número ya lo anuncia el `<ol>`; acá es tipografía.
                aria-hidden
                className="text-texto-suave block text-meta tracking-[0.12em]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="mt-2 md:mt-0">
                <h3 className="text-subtitulo">{paso.titulo}</h3>
                <p className="max-w-lectura text-texto-suave mt-2">
                  {paso.descripcion}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 4 — ARQUITECTOS Y OFICINAS ---------------------------------- */}
      <section className={SECTOR}>
        <div className="md:grid md:grid-cols-2 md:items-start md:gap-12">
          <div>
            <h2 className="text-titulo">{inicio.profesionales.titulo}</h2>
            <p className="max-w-lectura text-texto-suave mt-4">
              {inicio.profesionales.texto}
            </p>
          </div>

          {fotoProfesionales && (
            <div className="mt-8 md:mt-0">
              <FotoImg
                foto={fotoProfesionales}
                alt={altAutomatico("Bandas verticales", 2)}
                sizes="(min-width: 1024px) 488px, (min-width: 768px) 312px, 100vw"
              />
            </div>
          )}
        </div>
      </section>

      {/* 5 — CIERRE --------------------------------------------------- */}
      <section
        className={`${SECTOR} bg-superficie -mx-5 px-5 py-12 md:-mx-12 md:px-12 md:py-20`}
      >
        <h2 className="text-titulo">{inicio.cierre.titulo}</h2>
        <p className="max-w-lectura text-texto-suave mt-4">
          {inicio.cierre.texto}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
          {hayWhatsapp ? (
            <>
              <EnlaceWhatsapp contexto={{ tipo: "general" }} />
              <Link href="/contacto" className={clasesDeBoton("enlace")}>
                Otras formas de contacto
              </Link>
            </>
          ) : (
            // Sin número cargado el botón de WhatsApp no se dibuja (Fase 4.6),
            // y un cierre sin ninguna acción no cierra nada.
            <Link href="/contacto" className={clasesDeBoton("principal")}>
              Escribinos
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
