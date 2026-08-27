"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { Resultado } from "@/acciones/resultado";
import { Aviso, Chip } from "@/components/ui/aviso";
import { Boton } from "@/components/ui/boton";
import { useEstadoDelServidor } from "@/lib/estado-del-servidor";
import type { FilaDeListado } from "@/lib/panel/tipos";

/**
 * El listado de productos o de proyectos.
 *
 * **Con la portada visible en cada fila**, y no solo el nombre: la
 * administradora reconoce un trabajo por la foto mucho antes que por el
 * título, sobre todo cuando hay veinte y varios se llaman parecido.
 *
 * El orden se cambia con subir y bajar, por lo mismo que en la galería:
 * arrastrar compite con el desplazamiento en un teléfono y no existe con
 * teclado. Y acá el orden no es cosmético — decide **cuáles de los destacados
 * entran en la portada**, porque el tope del Inicio se aplica al consultar,
 * ordenando por `orden` (docs/modelo-de-datos.md).
 */
export function Listado({
  filas,
  base,
  reordenar,
  vacio,
}: {
  filas: FilaDeListado[];
  /** `/admin/productos` o `/admin/proyectos`. */
  base: string;
  reordenar: (ids: string[]) => Promise<Resultado>;
  vacio: string;
}) {
  const router = useRouter();
  const [orden, setOrden] = useEstadoDelServidor(filas);
  const [fallo, setFallo] = useState<string | null>(null);
  const [enCurso, iniciar] = useTransition();
  // Cuál se está moviendo, para que la rueda salga en ese y no en todos.
  const [tocado, setTocado] = useState<string | null>(null);

  function mover(desde: number, hacia: number) {
    if (hacia < 0 || hacia >= orden.length) return;

    const nuevo = [...orden];
    [nuevo[desde], nuevo[hacia]] = [nuevo[hacia], nuevo[desde]];
    setOrden(nuevo);
    setFallo(null);
    setTocado(orden[desde].id);

    iniciar(async () => {
      const r = await reordenar(nuevo.map((f) => f.id));
      if (!r.ok) {
        setFallo(r.mensaje);
        router.refresh();
      }
      setTocado(null);
    });
  }

  if (orden.length === 0) {
    return (
      <p className="rounded border border-neutral-300 bg-neutral-50 px-3 py-8 text-center text-sm text-neutral-600">
        {vacio}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {fallo && <Aviso tono="error">{fallo}</Aviso>}

      <ul className="flex flex-col gap-3">
        {orden.map((fila, i) => (
          <li
            key={fila.id}
            className="flex gap-3 rounded border border-neutral-300 p-3"
          >
            {fila.urlPortada ? (
              // Portada ya generada en el navegador al subir: el optimizador
              // de `next/image` gastaría cuota de Transformations para rehacer
              // un trabajo hecho (decisión 25).
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fila.urlPortada}
                alt=""
                className="h-24 w-20 shrink-0 rounded bg-neutral-100 object-cover"
              />
            ) : (
              <span className="flex h-24 w-20 shrink-0 items-center justify-center rounded bg-neutral-100 px-1 text-center text-xs text-neutral-500">
                Sin portada
              </span>
            )}

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Link
                href={`${base}/${fila.id}`}
                className="text-base font-medium text-neutral-900 underline underline-offset-2"
              >
                {fila.titulo}
              </Link>

              <div className="flex flex-wrap gap-1.5">
                <Chip tono={fila.activo ? "neutro" : "apagado"}>
                  {fila.activo ? "Publicado" : "Sin publicar"}
                </Chip>
                {fila.destacado && <Chip>Destacado</Chip>}
                <Chip tono="apagado">
                  {fila.cantidadDeFotos === 1
                    ? "1 foto"
                    : `${fila.cantidadDeFotos} fotos`}
                </Chip>
                {!fila.tienePortada && fila.cantidadDeFotos > 0 && (
                  <Chip tono="atencion">Falta la portada</Chip>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-center gap-2">
              <Boton
                type="button"
                aria-label={`Subir ${fila.titulo}`}
                disabled={i === 0 || enCurso}
                cargando={tocado === fila.id}
                onClick={() => mover(i, i - 1)}
                className="min-h-12 w-12 px-0"
              >
                {tocado !== fila.id && <span aria-hidden>↑</span>}
              </Boton>
              <Boton
                type="button"
                aria-label={`Bajar ${fila.titulo}`}
                disabled={i === orden.length - 1 || enCurso}
                cargando={tocado === fila.id}
                onClick={() => mover(i, i + 1)}
                className="min-h-12 w-12 px-0"
              >
                {tocado !== fila.id && <span aria-hidden>↓</span>}
              </Boton>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
