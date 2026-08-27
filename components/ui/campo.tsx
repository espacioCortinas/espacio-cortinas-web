import type { ComponentProps, ReactNode } from "react";

/**
 * Un campo de formulario: etiqueta, ayuda, control y error.
 *
 * Sin diseño propio — ver el comentario de `boton.tsx`. Lo que sí resuelve:
 *
 * - la etiqueta es un `<label>` de verdad, así que tocar el texto enfoca el
 *   campo. En un teléfono eso duplica el área para acertar;
 * - el error va **debajo** del campo y con `role="alert"`, para que un lector
 *   de pantalla lo anuncie al aparecer en vez de dejarlo mudo;
 * - `aria-invalid` y `aria-describedby` conectan el error con el campo, que es
 *   lo que hace que se lea junto y no como un texto suelto al final.
 */

const CONTROL =
  "min-h-12 w-full rounded border border-neutral-400 bg-white px-3 py-2 text-base " +
  "text-neutral-900 placeholder:text-neutral-500 " +
  "focus:border-neutral-900 focus:outline-2 focus:outline-offset-0 focus:outline-neutral-900 " +
  "aria-[invalid=true]:border-red-700";

type Comunes = {
  etiqueta: string;
  ayuda?: ReactNode;
  error?: string;
};

export function Campo({
  etiqueta,
  ayuda,
  error,
  id,
  className = "",
  ...resto
}: ComponentProps<"input"> & Comunes) {
  const idAyuda = ayuda ? `${id}-ayuda` : undefined;
  const idError = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-neutral-900">
        {etiqueta}
      </label>
      {ayuda && (
        <p id={idAyuda} className="text-sm text-neutral-600">
          {ayuda}
        </p>
      )}
      <input
        {...resto}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [idAyuda, idError].filter(Boolean).join(" ") || undefined
        }
        className={`${CONTROL} ${className}`.trim()}
      />
      {error && (
        <p id={idError} role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function CampoLargo({
  etiqueta,
  ayuda,
  error,
  id,
  className = "",
  ...resto
}: ComponentProps<"textarea"> & Comunes) {
  const idAyuda = ayuda ? `${id}-ayuda` : undefined;
  const idError = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-neutral-900">
        {etiqueta}
      </label>
      {ayuda && (
        <p id={idAyuda} className="text-sm text-neutral-600">
          {ayuda}
        </p>
      )}
      <textarea
        {...resto}
        id={id}
        rows={resto.rows ?? 5}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [idAyuda, idError].filter(Boolean).join(" ") || undefined
        }
        className={`${CONTROL} min-h-32 ${className}`.trim()}
      />
      {error && (
        <p id={idError} role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
