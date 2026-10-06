import type { ComponentProps, ReactNode } from "react";

/**
 * Un campo de formulario: etiqueta, ayuda, control y error. **Uno solo**, con
 * tres controles —una línea, un párrafo y una lista—, que es lo que el
 * formulario de contacto necesita y nada más. La lista entró en la Fase 4.6,
 * para «qué estás buscando»: elegir entre siete productos es un toque, y
 * escribirlo son veinte (decisión 57).
 *
 * Lo que resuelve, y no es estético:
 *
 * - la etiqueta es un `<label>` de verdad, así que tocar el texto enfoca el
 *   campo. En un teléfono eso duplica el área para acertar;
 * - el error va **debajo** del campo y con `role="alert"`, para que un lector
 *   de pantalla lo anuncie al aparecer en vez de dejarlo mudo;
 * - `aria-invalid` y `aria-describedby` conectan el error con el campo, que es
 *   lo que hace que se lea junto y no como un texto suelto al final;
 * - **17 px de texto**: por debajo de 16, iOS hace zoom solo al enfocar y
 *   descoloca la pantalla entera.
 *
 * ## El borde es `texto-suave` y no `linea`, y es por contraste
 *
 * `--color-linea` da 1,55:1 contra el blanco del campo: alcanza para un filete
 * decorativo y **no** para el borde de un control, que es lo único que dice
 * dónde empieza y dónde termina un campo. WCAG pide 3:1 para eso.
 * `--color-texto-suave` da 6,06:1 y es el token que corresponde.
 *
 * ## El error no es rojo
 *
 * Un rojo sería un color más, inventado, en una paleta que es la del boceto de
 * la empresa, y el azul verdoso de la marca no puede marcar un estado: da
 * 2,28:1 contra el fondo. Así que el error se marca como se marca en un
 * impreso: en el color del texto, en negrita y con la palabra escrita, justo
 * debajo de un campo que engorda su borde. Decisión 46.
 *
 * Hasta la Fase 4.7 el mensaje llevaba además un filete de 3 px al costado:
 * es una de las marcas más repetidas de los sitios hechos con IA, y no decía
 * nada que la negrita y el borde del campo no dijeran ya.
 *
 * El color tampoco era lo que comunicaba: una de cada doce personas no
 * distingue rojo de verde, así que el aviso ya tenía que decirlo con palabras.
 */

const CONTROL =
  "min-h-12 w-full rounded-chico border border-texto-suave bg-superficie px-3 py-2.5 " +
  "text-cuerpo text-texto placeholder:text-texto-suave " +
  "focus:border-texto aria-[invalid=true]:border-texto aria-[invalid=true]:border-2";

const ETIQUETA = "text-meta font-medium text-texto";
const AYUDA = "text-meta text-texto-suave";

/** El error: color del texto y negrita, pegado al campo. */
const ERROR = "text-meta font-bold text-texto";

type Comunes = {
  etiqueta: string;
  ayuda?: ReactNode;
  error?: string;
};

function Envoltorio({
  etiqueta,
  ayuda,
  error,
  id,
  idAyuda,
  idError,
  children,
}: Comunes & {
  id?: string;
  idAyuda?: string;
  idError?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={ETIQUETA}>
        {etiqueta}
      </label>
      {ayuda && (
        <p id={idAyuda} className={AYUDA}>
          {ayuda}
        </p>
      )}
      {children}
      {error && (
        <p id={idError} role="alert" className={ERROR}>
          {error}
        </p>
      )}
    </div>
  );
}

/** Los `id` del error y de la ayuda, que son los que los atan al control. */
function identificadores(id: string | undefined, comunes: Comunes) {
  const idAyuda = comunes.ayuda ? `${id}-ayuda` : undefined;
  const idError = comunes.error ? `${id}-error` : undefined;
  return {
    idAyuda,
    idError,
    descritoPor: [idAyuda, idError].filter(Boolean).join(" ") || undefined,
  };
}

export function Campo({
  etiqueta,
  ayuda,
  error,
  id,
  className = "",
  ...resto
}: ComponentProps<"input"> & Comunes) {
  const { idAyuda, idError, descritoPor } = identificadores(id, {
    etiqueta,
    ayuda,
    error,
  });

  return (
    <Envoltorio
      etiqueta={etiqueta}
      ayuda={ayuda}
      error={error}
      id={id}
      idAyuda={idAyuda}
      idError={idError}
    >
      <input
        {...resto}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={descritoPor}
        className={`${CONTROL} ${className}`.trim()}
      />
    </Envoltorio>
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
  const { idAyuda, idError, descritoPor } = identificadores(id, {
    etiqueta,
    ayuda,
    error,
  });

  return (
    <Envoltorio
      etiqueta={etiqueta}
      ayuda={ayuda}
      error={error}
      id={id}
      idAyuda={idAyuda}
      idError={idError}
    >
      <textarea
        {...resto}
        id={id}
        rows={resto.rows ?? 5}
        aria-invalid={error ? true : undefined}
        aria-describedby={descritoPor}
        className={`${CONTROL} min-h-32 ${className}`.trim()}
      />
    </Envoltorio>
  );
}

/**
 * Una lista de opciones, con el selector del sistema.
 *
 * **El nativo y no uno dibujado a mano.** En un teléfono abre la rueda o la
 * hoja del sistema, que se maneja con el pulgar y que conoce todo el mundo, y
 * con teclado o lector de pantalla funciona sin una línea de JavaScript. Un
 * desplegable propio tendría que reimplementar todo eso para verse un poco más
 * a tono.
 *
 * Lo único que se le cambia es la caja cerrada —`appearance-none`— para que
 * tenga el mismo borde, fondo y radio que los otros dos controles. La flecha la
 * dibuja el componente, con el color del texto: sin ella, nada diría que la
 * caja se abre.
 */
export function CampoSelector({
  etiqueta,
  ayuda,
  error,
  id,
  opciones,
  className = "",
  ...resto
}: ComponentProps<"select"> &
  Comunes & { opciones: readonly { valor: string; texto: string }[] }) {
  const { idAyuda, idError, descritoPor } = identificadores(id, {
    etiqueta,
    ayuda,
    error,
  });

  return (
    <Envoltorio
      etiqueta={etiqueta}
      ayuda={ayuda}
      error={error}
      id={id}
      idAyuda={idAyuda}
      idError={idError}
    >
      <div className="relative">
        <select
          {...resto}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={descritoPor}
          className={`${CONTROL} appearance-none pr-10 ${className}`.trim()}
        >
          {opciones.map(({ valor, texto }) => (
            <option key={valor} value={valor}>
              {texto}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 12 8"
          className="text-texto pointer-events-none absolute top-1/2 right-4 h-2 w-3 -translate-y-1/2"
        >
          <path
            d="M1 1.5l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </Envoltorio>
  );
}
