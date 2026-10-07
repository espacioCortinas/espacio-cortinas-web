import type { Metadata } from "next";
import Link from "next/link";

import { FotoImg } from "@/components/foto";
import { ListadoProyectos } from "@/components/listado-proyectos";
import { LogoGrande } from "@/components/logo";
import { EnlaceLlamar, EnlaceRed } from "@/components/medios-de-contacto";
import { TarjetaProducto } from "@/components/tarjeta-producto";
import { EnlaceWhatsapp } from "@/components/whatsapp";
import { clasesDeBoton } from "@/components/ui/boton";
import { CLASES_CONTENEDOR } from "@/components/ui/contenedor";
import { fotoDe, productosDestacados, proyectosDestacados } from "@/contenido";
import { contacto } from "@/contenido/contacto";
import { inicio } from "@/contenido/inicio";
import {
  PRODUCTOS_DESTACADOS_HOME,
  PROYECTOS_DESTACADOS_HOME,
} from "@/lib/constantes";
import { sizesConTope } from "@/lib/fotos";
import { DESCRIPCION_SITIO, metadataDePagina } from "@/lib/metadata";
import { altAutomatico } from "@/lib/texto";

/**
 * Inicio.
 *
 * # Los sectores
 *
 *     1  APERTURA                  el bloque con el logo sobre la foto, el lema
 *     2  PRODUCTOS                 los cuatro destacados, en zigzag
 *     3  CÓMO TRABAJAMOS           los cuatro pasos, en una grilla de 2×2
 *     4  NUESTROS TRABAJOS         los proyectos destacados — solo si hay alguno
 *     5  ARQUITECTOS Y OFICINAS    los otros dos públicos
 *     6  CIERRE                    una sola acción, en un bloque azul verdoso
 *
 * Son los mismos sectores que fijó la decisión 47 y en el mismo orden: la
 * empresa dijo que la estructura estaba bien. **Lo que cambió en la Fase 4.7
 * es cómo se ven**, y sale del boceto que armó la empresa en Wix
 * (`docs/plan.md`).
 *
 * # Lo que se tomó del boceto
 *
 * - **La apertura**: un bloque azul verdoso con el logo, montado sobre el borde
 *   de una foto, y el lema debajo —«hacé de tus espacios», chico; «tu mejor
 *   compañía», en mayúscula espaciada—, con Instagram y un filete corto abajo.
 *   Y lo que hace el encabezado del boceto: en Inicio no lleva el logo, para
 *   que el del bloque sea el único de la primera pantalla.
 * - **Los productos en zigzag**, cada uno con un bloque azul verdoso con su
 *   nombre, y entre ellos las tres frases del boceto. El boceto no tenía fotos
 *   en esos bloques; acá cada uno pisa la portada de su producto.
 * - **La frase que abre los productos**: «Brindamos asesoramiento e instalación
 *   de nuestros productos.», centrada, como en el boceto.
 * - **La grilla de 2×2 con líneas finas** de sus páginas de producto, para los
 *   cuatro pasos de «Cómo trabajamos», que eran una lista numerada con filetes.
 *   El número a la izquierda de cada paso —01, 02— era una de las marcas de
 *   sitio hecho con IA; el orden lo siguen diciendo la grilla y el `<ol>`.
 * - **El cierre** en el azul verdoso de los bloques.
 *
 * # Lo que no se tomó, y es a propósito
 *
 * **El boceto no tiene versión de teléfono**: la armó Wix sola, y se desarma.
 * Todo esto se compuso primero a 375 px.
 *
 * **No hay texto sobre ninguna foto.** Los bloques que pisan las fotos son
 * opacos y el texto va sobre ellos, no sobre la imagen: en este archivo la
 * ventana es la zona más clara del cuadro y cambia de lugar en cada foto.
 *
 * **Ningún bloque lleva el texto en blanco**, que es como lo pone el boceto:
 * sobre el azul verdoso el blanco da 2,63:1. Va en el color del texto, 5,08:1.
 *
 * # Los textos
 *
 * Todos salen de `contenido/inicio.ts`, que dice cuáles son del boceto y cuáles
 * son nuestros y provisorios. Acá no hay ninguna cadena escrita.
 */

export const metadata: Metadata = metadataDePagina({
  titulo: "Cortinas, rollers y toldos a medida en Buenos Aires",
  descripcion: DESCRIPCION_SITIO,
  ruta: "/",
});

/** El ritmo entre sectores: 64 en teléfono, 112 en escritorio. */
const SECTOR = "mt-16 md:mt-28";

/*
 * El ancho de la foto de cada producto destacado. La fila es una grilla de 12
 * columnas desde 768 y la tarjeta ocupa 5, con la foto al 80 %: 330 px con la
 * columna entera de 1.024. En el teléfono la foto es el 72 % de la columna.
 * Es el mismo dato que esos anchos, escrito dos veces: cambian juntos.
 */
const SIZES_TARJETA =
  "(min-width: 1216px) 330px, (min-width: 768px) calc(33vw - 2.75rem), calc(72vw - 1.8rem)";

export default function Inicio() {
  const destacados = productosDestacados(PRODUCTOS_DESTACADOS_HOME);
  const proyectos = proyectosDestacados(PROYECTOS_DESTACADOS_HOME);

  /*
   * La foto de la apertura. Es `roller/screen/3`, la que eligió la empresa en
   * octubre de 2026: dos rollers screen sobre un ventanal y una veneciana
   * negra, en un living. Llegó ya recortada a 4:5 por quien desarrolla, así que
   * el recorte de `proporcion` no le saca nada.
   *
   * Vive en la carpeta de Screen porque el script solo publica fotos de un
   * producto o de un proyecto, así que también se ve en la página de Roller.
   * Hasta octubre era `venecianas-madera/2`, que sigue en su galería.
   *
   * Va en 4:5 para que en el teléfono el lema entre en la primera pantalla.
   */
  const fotoApertura = fotoDe("productos", "roller/screen", 3);

  /*
   * El bloque de arquitectos y oficinas. Las cinco fotos de bandas verticales
   * son oficinas reales, y esta es horizontal, que es lo que entra bien al
   * lado de un texto.
   */
  const fotoProfesionales = fotoDe("productos", "bandas-verticales", 2);

  /* La red que el boceto pone en la apertura. Si algún día se va, no se dibuja. */
  const instagram = contacto.redes.find((red) => red.nombre === "Instagram");

  return (
    // Arriba, poco aire: en Inicio el encabezado no lleva logo, y lo primero de
    // la página es el bloque del logo (`components/navegacion.tsx`).
    <main className={`${CLASES_CONTENEDOR} pt-2 pb-16 md:pt-8 md:pb-28`}>
      {/* 1 — APERTURA ------------------------------------------------ */}
      {/*
        Tres piezas que se pisan, como en el boceto: el bloque con el logo, la
        foto y el texto. El logo de este bloque es el único de la primera
        pantalla: en Inicio el encabezado no lo repite.

        En el teléfono van una debajo de la otra y escalonadas: el bloque
        arriba, recostado a la izquierda, y la foto debajo, recostada a la
        derecha, metida 40 px por debajo del bloque. Es el boceto de escritorio
        —bloque a la izquierda, foto a la derecha— doblado para una columna.

        Desde 768 es una grilla de 12 columnas: la foto a la derecha, en las
        columnas 7 a 12 y las dos filas; el bloque a la izquierda, en la 1 a la
        7, así que se mete una columna adentro de la foto; y el texto debajo
        del bloque. `grid-rows-[auto_1fr]` manda el alto que sobra de la foto a
        la segunda fila, debajo del texto, y no entre el bloque y el texto.

        El bloque va antes que la foto en el documento —es lo primero que se
        lee— y `relative z-10` lo deja encima de la foto que pisa.
      */}
      <section className="md:grid md:grid-cols-12 md:grid-rows-[auto_1fr] md:gap-x-6">
        <div className="bg-marca relative z-10 mr-10 px-6 py-7 md:col-span-7 md:col-start-1 md:row-start-1 md:mt-12 md:mr-0 md:self-start md:px-10 md:py-12 lg:px-12 lg:py-14">
          <div className="max-w-[26rem]">
            <LogoGrande sizes="(min-width: 1024px) 26rem, (min-width: 768px) 20rem, calc(100vw - 8rem)" />
          </div>
        </div>

        {fotoApertura && (
          <div className="-mt-10 ml-10 md:col-span-6 md:col-start-7 md:row-span-2 md:row-start-1 md:mt-0 md:ml-0">
            <FotoImg
              foto={fotoApertura}
              alt={altAutomatico("Roller Screen", 3)}
              proporcion="4/5"
              sizes={sizesConTope(fotoApertura, [
                { desde: "1216px", ancho: "500px" },
                { desde: "768px", ancho: "calc(50vw - 3.75rem)" },
                { ancho: "calc(100vw - 5rem)" },
              ])}
              prioridad
            />
          </div>
        )}

        <div className="mt-10 md:col-span-6 md:col-start-1 md:row-start-2 md:mt-12">
          {/*
            El lema es el `<h1>`, en sus dos partes. El remate va en mayúscula
            espaciada, que es como lo compuso el boceto, y siempre en dos
            renglones —«tu mejor» y «compañía»—: con el espaciado no entra en
            uno en ningún ancho, y `text-wrap: balance` los parte parejos.
          */}
          <h1>
            <span className="block text-subtitulo font-normal tracking-[0.02em]">
              {inicio.lema.entrada}
            </span>
            <span className="mt-2 block text-[clamp(1.75rem,4.2vw,2.75rem)] leading-[1.2] tracking-[0.28em] uppercase">
              {inicio.lema.remate}
            </span>
          </h1>

          {/*
            Instagram, debajo del lema, que es donde lo pone el boceto: la
            empresa lo quiere en la primera pantalla. Es el mismo enlace del pie
            y de /contacto, con el logo de la red y la cuenta, que es lo que se
            busca en la app.
          */}
          {instagram && (
            <p className="mt-4">
              <EnlaceRed
                red={instagram}
                className="text-texto inline-flex min-h-11 items-center gap-2 font-semibold underline decoration-1 underline-offset-4 hover:decoration-2"
              />
            </p>
          )}

          {/* El filete corto que el boceto pone debajo del lema. */}
          <span aria-hidden className="bg-acento mt-5 block h-0.5 w-32" />

          <p className="max-w-lectura text-texto-suave mt-6 text-subtitulo">
            {inicio.bajada}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <EnlaceWhatsapp contexto={{ tipo: "general" }} />
            <Link href="/productos" className={clasesDeBoton("secundario")}>
              Ver los productos
            </Link>
          </div>
        </div>
      </section>

      {/* 2 — PRODUCTOS ----------------------------------------------- */}
      {destacados.length > 0 && (
        <section className={SECTOR}>
          <h2 className="mx-auto max-w-[22ch] text-center text-titulo">
            {inicio.productos.titulo}
          </h2>

          {/*
            Una fila por producto, alternando el lado: es el zigzag del boceto.
            Al lado de cada una, una de sus tres frases; el cuarto producto va
            solo.

            No es una lista, a propósito: las frases no son de cada producto
            sino una sola idea partida en tres, y dentro de un `<li>` un lector
            de pantalla las leería como parte del producto.

            En el teléfono la frase va debajo de su fila. Desde 768, la fila es
            una grilla de 12 columnas: la tarjeta en 5 y la frase en otras 5,
            con una columna de aire en el medio.
          */}
          <div className="mt-12 flex flex-col gap-14 md:mt-16 md:gap-20">
            {destacados.map((producto, i) => {
              const derecha = i % 2 === 1;
              const frase = inicio.productos.frases[i];
              return (
                <div
                  key={producto.slug}
                  className="md:grid md:grid-cols-12 md:items-center md:gap-x-6"
                >
                  <div
                    className={
                      "md:row-start-1 md:col-span-5 " +
                      (derecha ? "md:col-start-8" : "md:col-start-1")
                    }
                  >
                    <TarjetaProducto
                      producto={producto}
                      lado={derecha ? "derecha" : "izquierda"}
                      sizes={SIZES_TARJETA}
                    />
                  </div>
                  {frase && (
                    <p
                      className={
                        "mt-6 max-w-[26rem] text-subtitulo leading-[1.55] " +
                        "md:row-start-1 md:mt-0 md:col-span-5 " +
                        (derecha ? "md:col-start-2" : "md:col-start-7")
                      }
                    >
                      {frase}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-12 text-center md:mt-16">
            <Link href="/productos" className={clasesDeBoton("secundario")}>
              {inicio.productos.enlace}
            </Link>
          </p>
        </section>
      )}

      {/* 3 — CÓMO TRABAJAMOS ----------------------------------------- */}
      <section className={SECTOR}>
        <h2 className="text-titulo">{inicio.trabajo.titulo}</h2>

        {/*
          La grilla de 2×2 con líneas finas de las páginas de producto del
          boceto. Las líneas las arman el borde de arriba y el de la izquierda
          de la lista, y el de la derecha y el de abajo de cada paso: así cada
          línea es una sola, sin dobles donde dos pasos se tocan. En el
          teléfono la grilla es de una columna y queda una caja por paso.

          Es un `<ol>` de verdad: el orden es información —primero se mide y
          después se coloca— y así lo anuncia un lector de pantalla. La
          numeración a la vista se fue con la lista: el orden lo da la grilla,
          que se lee de izquierda a derecha y de arriba abajo.
        */}
        <ol className="border-acento mt-8 grid border-t border-l md:mt-10 md:grid-cols-2">
          {inicio.trabajo.pasos.map((paso) => (
            <li
              key={paso.titulo}
              className="border-acento border-r border-b p-6 md:p-10"
            >
              <h3 className="text-subtitulo">{paso.titulo}</h3>
              <p className="max-w-lectura text-texto-suave mt-3">
                {paso.descripcion}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* 4 — NUESTROS TRABAJOS --------------------------------------- */}
      {proyectos.length > 0 && (
        <section className={SECTOR}>
          <h2 className="text-titulo">{inicio.proyectos.titulo}</h2>
          <p className="max-w-lectura text-texto-suave mt-4">
            {inicio.proyectos.bajada}
          </p>

          <div className="mt-10">
            <ListadoProyectos proyectos={proyectos} nivel={3} />
          </div>

          <p className="mt-10">
            <Link href="/proyectos" className={clasesDeBoton("enlace")}>
              {inicio.proyectos.enlace}
            </Link>
          </p>
        </section>
      )}

      {/* 5 — ARQUITECTOS Y OFICINAS ---------------------------------- */}
      <section className={SECTOR}>
        <div className="md:grid md:grid-cols-2 md:items-start md:gap-12">
          <div>
            <h2 className="text-titulo">{inicio.profesionales.titulo}</h2>
            <p className="max-w-lectura text-texto-suave mt-4">
              {inicio.profesionales.texto}
            </p>
            {/*
              Llamar, para los que prefieren hablarlo: este sector es el único
              de Inicio que les habla a ellos, y no tenía ninguna acción —
              decisión 65. WhatsApp está en el cierre, justo abajo.
            */}
            <p className="mt-6">
              <EnlaceLlamar />
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

      {/* 6 — CIERRE --------------------------------------------------- */}
      {/*
        El azul verdoso de los bloques del boceto, de borde a borde de la
        columna. Todo lo de adentro va en el color del texto —el título
        también, aunque los títulos sean pizarra—: sobre este color la pizarra
        da 3,08:1, y el texto, 5,08. El botón principal sigue siendo la
        pizarra sólida, que se recorta bien contra el azul verdoso.
      */}
      <section
        className={`${SECTOR} bg-marca text-texto -mx-5 px-5 py-12 md:-mx-12 md:px-12 md:py-20`}
      >
        <h2 className="text-texto text-titulo">{inicio.cierre.titulo}</h2>
        <p className="max-w-lectura mt-4">{inicio.cierre.texto}</p>

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
          <EnlaceWhatsapp contexto={{ tipo: "general" }} />
          <Link href="/contacto" className={clasesDeBoton("enlace")}>
            Otras formas de contacto
          </Link>
        </div>
      </section>
    </main>
  );
}
