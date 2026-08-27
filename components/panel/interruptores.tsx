"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { Resultado } from "@/acciones/resultado";
import { Aviso } from "@/components/ui/aviso";
import { useEstadoDelServidor } from "@/lib/estado-del-servidor";

/**
 * Publicado / Destacado.
 *
 * **Son dos cosas distintas y es lo que más se confunde**, así que el panel lo
 * dice con todas las letras en vez de mostrar dos casillas parecidas:
 *
 *   Publicado  → si existe en el sitio
 *   Destacado  → si además puede salir en la portada
 *
 * `activo` manda: algo destacado pero sin publicar no se ve en ningún lado
 * (decisión 8). Cuando se da esa combinación, el texto de abajo lo avisa —es
 * el estado en el que alguien marca «destacado», mira la portada, no lo ve, y
 * concluye que el panel no anda.
 *
 * Se guarda **al tocar**, sin botón de guardar: es un interruptor, y un
 * interruptor que hay que confirmar aparte se queda a medias la mitad de las
 * veces. Como no hay botón, el cartel de «Guardado» es lo único que confirma
 * que pasó algo.
 */
export function Interruptores({
  activo,
  destacado,
  cambiar,
}: {
  activo: boolean;
  destacado: boolean;
  cambiar: (
    campo: "activo" | "destacado",
    valor: boolean,
  ) => Promise<Resultado>;
}) {
  const router = useRouter();
  // El objeto se arma en cada render, así que la comparación no puede ser por
  // identidad: la clave son los dos booleanos, que sí son estables.
  const [valores, setValores] = useEstadoDelServidor(
    { activo, destacado },
    `${activo}/${destacado}`,
  );
  const [fallo, setFallo] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [enCurso, iniciar] = useTransition();

  function alternar(campo: "activo" | "destacado") {
    const valor = !valores[campo];

    // Se mueve en pantalla enseguida y se guarda de fondo. Si falla, se vuelve
    // atrás: dejar el interruptor puesto después de un error sería mentir
    // sobre lo que está publicado.
    setValores({ ...valores, [campo]: valor });
    setFallo(null);
    setGuardado(false);

    iniciar(async () => {
      const r = await cambiar(campo, valor);
      if (!r.ok) {
        setValores({ ...valores, [campo]: !valor });
        setFallo(r.mensaje);
        return;
      }
      setGuardado(true);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded border border-neutral-300 p-4">
      <Interruptor
        etiqueta="Publicado en el sitio"
        descripcion="Si está apagado, no se ve en ningún lado. Sigue guardado acá."
        valor={valores.activo}
        deshabilitado={enCurso}
        alCambiar={() => alternar("activo")}
      />

      <Interruptor
        etiqueta="Destacado en la portada"
        descripcion="Puede aparecer en la página de inicio. Entran los primeros de la lista."
        valor={valores.destacado}
        deshabilitado={enCurso}
        alCambiar={() => alternar("destacado")}
      />

      {valores.destacado && !valores.activo && (
        <Aviso tono="atencion">
          Está destacado pero no publicado, así que no se ve en ningún lado.
          Prendé «Publicado en el sitio» para que aparezca.
        </Aviso>
      )}

      {fallo && <Aviso tono="error">{fallo}</Aviso>}
      {guardado && !fallo && <Aviso tono="exito">Guardado.</Aviso>}
    </div>
  );
}

/**
 * Una casilla grande. Toda la fila es el `<label>`, así que el área para
 * acertar con el pulgar es el ancho de la pantalla y no los 20 px de la
 * casilla.
 */
function Interruptor({
  etiqueta,
  descripcion,
  valor,
  deshabilitado,
  alCambiar,
}: {
  etiqueta: string;
  descripcion: string;
  valor: boolean;
  deshabilitado: boolean;
  alCambiar: () => void;
}) {
  return (
    <label className="flex min-h-12 cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={valor}
        disabled={deshabilitado}
        onChange={alCambiar}
        className="mt-0.5 size-6 shrink-0"
      />
      <span>
        <span className="block text-base font-medium text-neutral-900">
          {etiqueta}
        </span>
        <span className="block text-sm text-neutral-600">{descripcion}</span>
      </span>
    </label>
  );
}
