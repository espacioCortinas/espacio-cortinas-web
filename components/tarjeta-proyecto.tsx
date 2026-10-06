import Link from "next/link";

import {
  CeldaDeTexto,
  FilaConLineas,
  FotoEnCelda,
  MarcoDelDamero,
} from "@/components/damero";
import { FotoImg } from "@/components/foto";
import { Chip } from "@/components/ui/chip";
import type { ConFotos, Proyecto } from "@/contenido/tipos";
import { portadaDe } from "@/lib/fotos";
import { altAutomatico, recortar } from "@/lib/texto";

/**
 * Un proyecto del portfolio: la portada, el título y la ubicación como chip.
 *
 *     Cowork en Nordelta
 *     [ Nordelta, Buenos Aires ]
 *
 * Es lo que pide `docs/producto.md` —«el título es el trabajo y la ubicación va
 * como chip»— y es la análoga de `components/tarjeta-producto.tsx`: sin borde,
 * sin sombra, sin fondo y sin radio, con el texto **debajo** de la foto y nunca
 * encima.
 *
 * # Dos formas, y quién decide cuál
 *
 *     tarjeta   portada arriba, texto abajo. Es el elemento de la grilla
 *     fila      una fila del damero: la portada en una celda y el texto
 *               centrado en la otra, con la descripción y la línea que dice
 *               que se abre. Es la de `/productos` — Fase 4.7
 *
 * **La forma la elige `components/listado-proyectos.tsx`, no quien carga el
 * contenido**: el primero del arreglo va en fila y el resto en tarjeta —
 * decisión 52—. No hay un campo `destacado` visual: la regla de los cuatro
 * campos (decisión 11) sigue valiendo.
 *
 * # Un solo enlace por proyecto
 *
 * El título es el único `<a>`, y en la forma de fila se estira sobre toda la
 * fila con `after:absolute after:inset-0` —el mismo enlace estirado de
 * `/productos`, decisión 49—, así que la foto, el chip y la línea de acción
 * abren el proyecto sin un segundo elemento enfocable. En la tarjeta el enlace
 * envuelve foto y título, como en la de producto.
 *
 * El chip va **fuera del enlace**: lo que decide el nombre accesible es el
 * contenido del `<a>`, y sumarle la ubicación lo convertiría en una frase que
 * un lector de pantalla lee entera cada vez.
 */

export function TarjetaProyecto({
  proyecto,
  forma,
  nivel,
  sizes,
  prioridad = false,
}: {
  proyecto: ConFotos<Proyecto>;
  forma: "fila" | "tarjeta";
  /**
   * El nivel del título. **Es una prop y en la de producto no**, porque acá
   * hay dos consumidores que cuelgan de lugares distintos: en `/proyectos` la
   * lista cuelga del `<h1>` y es `h2`; en Inicio cuelga del `<h2>` del sector y
   * es `h3`. La decisión 49 sacó esta misma prop de la tarjeta de producto
   * porque le quedaba un solo consumidor; acá hay dos desde el primer día.
   */
  nivel: 2 | 3;
  /**
   * Solo para la forma de tarjeta: el ancho de la columna de la grilla, escrito
   * dos veces —acá y en la grilla—. La fila lleva el suyo, fijo.
   */
  sizes?: string;
  prioridad?: boolean;
}) {
  const portada = portadaDe(proyecto.fotos);
  const Titulo = nivel === 2 ? "h2" : "h3";
  const href = `/proyectos/${proyecto.slug}`;

  if (forma === "tarjeta") {
    return (
      <article>
        <Link href={href} className="group block">
          {portada ? (
            <FotoImg
              foto={portada}
              alt={altAutomatico(proyecto.titulo, 1)}
              // Los listados usan siempre la portada, y la portada siempre es
              // 4:5: es lo que hace que la grilla quede pareja aunque la
              // galería mezcle orientaciones (decisión 14).
              proporcion="4/5"
              sizes={sizes ?? "100vw"}
              prioridad={prioridad}
            />
          ) : (
            // Sin portada, el mismo bloque de superficie que ocupa una foto
            // mientras carga: la grilla no se descuadra y no hay un ícono de
            // imagen rota.
            <div className="bg-superficie" style={{ aspectRatio: "4/5" }} />
          )}
          <Titulo className="mt-3 text-subtitulo underline-offset-4 group-hover:underline">
            {proyecto.titulo}
          </Titulo>
        </Link>
        <p className="mt-2">
          <Chip>{proyecto.ubicacion}</Chip>
        </p>
      </article>
    );
  }

  /*
   * La fila, con las mismas piezas que el damero de las páginas de producto:
   * las líneas las pone el marco y la fila, y la foto va en su proporción y
   * con su tope (`components/damero.tsx`). Llega hasta donde llegue quien la
   * contiene: de borde a borde en `/proyectos`, el ancho de la columna en
   * Inicio.
   */
  return (
    <MarcoDelDamero>
      <article className="group relative">
        <FilaConLineas
          primera={
            portada ? (
              <FotoEnCelda
                foto={portada}
                alt={altAutomatico(proyecto.titulo, 1)}
                prioridad={prioridad}
              />
            ) : (
              <div className="md:p-10">
                <div className="bg-superficie" style={{ aspectRatio: "4/5" }} />
              </div>
            )
          }
          segunda={
            <CeldaDeTexto>
              <Titulo className="text-titulo">
                <Link
                  href={href}
                  className="underline-offset-4 group-hover:underline after:absolute after:inset-0"
                >
                  {proyecto.titulo}
                </Link>
              </Titulo>

              <p className="mt-4">
                <Chip>{proyecto.ubicacion}</Chip>
              </p>

              <p className="text-texto-suave mt-5 max-w-[42ch] text-left">
                {recortar(proyecto.descripcion, 240)}
              </p>

              {/*
                Lo que dice que la fila se abre, sin depender del `hover` — el
                mismo recurso de `/productos` (decisión 49). No es un enlace:
                el enlace estirado del título ya cubre esta línea, y un segundo
                `<a>` duplicaría el nombre accesible.
              */}
              <p className="mt-6">
                <span className="underline decoration-1 underline-offset-4">
                  Ver el trabajo
                </span>
                <span aria-hidden> →</span>
              </p>
            </CeldaDeTexto>
          }
        />
      </article>
    </MarcoDelDamero>
  );
}
