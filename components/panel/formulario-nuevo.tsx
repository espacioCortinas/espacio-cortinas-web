"use client";

import { useActionState, useId } from "react";

import type { Resultado } from "@/acciones/resultado";
import { Boton } from "@/components/ui/boton";
import { Campo } from "@/components/ui/campo";

/**
 * El alta: **un solo campo**.
 *
 * Pedir todo junto —descripción, variantes, fotos— obligaría a elegir las
 * fotos antes de que exista el producto, y las fotos necesitan que exista para
 * tener una carpeta donde ir. Con un campo se crea en dos toques y se sigue
 * completando en la pantalla siguiente, que es donde está la galería.
 *
 * Lo que se crea nace **sin publicar**, así que se puede cargar con calma sin
 * que aparezca a medias en el sitio.
 */
export function FormularioNuevo({
  accion,
  campo,
  etiqueta,
  ayuda,
  boton,
}: {
  accion: (estado: Resultado | null, datos: FormData) => Promise<Resultado>;
  /** `nombre` para productos, `titulo` para proyectos. */
  campo: string;
  etiqueta: string;
  ayuda: string;
  boton: string;
}) {
  const id = useId();
  const [estado, enviar, pendiente] = useActionState(accion, null);

  return (
    <form action={enviar} className="flex max-w-xl flex-col gap-5">
      <Campo
        id={`${id}-${campo}`}
        name={campo}
        etiqueta={etiqueta}
        ayuda={ayuda}
        required
        autoFocus
        maxLength={140}
        error={estado && !estado.ok ? estado.mensaje : undefined}
      />

      <Boton
        type="submit"
        variante="primario"
        disabled={pendiente}
        className="self-start"
      >
        {pendiente ? "Creando…" : boton}
      </Boton>

      <p className="text-sm text-neutral-600">
        Se crea sin publicar. Después vas a poder cargar la descripción y las
        fotos, y publicarlo cuando esté listo.
      </p>
    </form>
  );
}
