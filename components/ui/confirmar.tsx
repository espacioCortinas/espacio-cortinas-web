"use client";

import { useId, useRef, useState, useTransition } from "react";

import type { Resultado } from "@/acciones/resultado";

import { Aviso } from "./aviso";
import { Boton } from "./boton";

/**
 * Un botón que abre un diálogo antes de hacer algo que no se puede deshacer.
 *
 * **Por qué un `<dialog>` y no `window.confirm()`:** el `confirm` del
 * navegador no deja escribir de qué se trata más allá de una línea, en el
 * teléfono aparece como una alerta del sistema que se confunde con un aviso
 * del propio navegador, y no permite mostrar el resultado si la operación
 * falla. Acá el diálogo dice **qué** se va a borrar, por su nombre, y **qué
 * más se lleva puesto** — las fotos.
 *
 * `showModal()` da gratis lo que costaría escribir a mano: el foco queda
 * atrapado adentro, Escape cierra, y el resto de la página queda inerte para
 * un lector de pantalla.
 *
 * El botón de confirmar **no es el que queda debajo del dedo**: el orden es
 * «Cancelar» y después «Eliminar». Con el pulgar en el borde inferior, el
 * botón más cómodo es el último, y el más cómodo tiene que ser el que no
 * rompe nada.
 */
export function BotonConConfirmacion({
  accion,
  etiqueta,
  titulo,
  descripcion,
  confirmar,
  className,
}: {
  /** Server Action ya ligada a su identificador con `.bind(null, id)`. */
  accion: () => Promise<Resultado>;
  etiqueta: string;
  titulo: string;
  descripcion: string;
  confirmar: string;
  className?: string;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  // Hay un diálogo por foto en la galería: un id fijo daría varios elementos
  // con el mismo id y el `aria-labelledby` apuntaría siempre al primero.
  const idTitulo = useId();
  const [enCurso, iniciar] = useTransition();
  const [fallo, setFallo] = useState<string | null>(null);

  function ejecutar() {
    setFallo(null);
    iniciar(async () => {
      // Si la acción termina bien suele redirigir, y entonces esto no vuelve.
      const resultado = await accion();
      if (resultado && !resultado.ok) {
        setFallo(resultado.mensaje);
        return;
      }
      dialogo.current?.close();
    });
  }

  return (
    <>
      <Boton
        type="button"
        variante="peligro"
        className={className}
        onClick={() => {
          setFallo(null);
          dialogo.current?.showModal();
        }}
      >
        {etiqueta}
      </Boton>

      <dialog
        ref={dialogo}
        aria-labelledby={idTitulo}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-lg border border-neutral-400 p-0 backdrop:bg-neutral-900/50"
      >
        <div className="flex flex-col gap-4 p-5">
          <h2 id={idTitulo} className="text-lg font-semibold">
            {titulo}
          </h2>
          <p className="text-sm text-neutral-700">{descripcion}</p>

          {fallo && <Aviso tono="error">{fallo}</Aviso>}

          <div className="flex flex-col gap-2 sm:flex-row-reverse sm:justify-start">
            <Boton
              type="button"
              variante="peligro"
              onClick={ejecutar}
              disabled={enCurso}
            >
              {enCurso ? "Eliminando…" : confirmar}
            </Boton>
            <Boton
              type="button"
              onClick={() => dialogo.current?.close()}
              disabled={enCurso}
            >
              Cancelar
            </Boton>
          </div>
        </div>
      </dialog>
    </>
  );
}
