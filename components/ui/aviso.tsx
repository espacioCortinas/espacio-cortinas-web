import type { ReactNode } from "react";

/**
 * Un mensaje al pie de una acción: salió bien o salió mal.
 *
 * **Sin color, y es una decisión medida** — decisión 46. La versión del panel
 * usaba rojo, verde y ámbar de Tailwind. La paleta de este sitio es la del
 * boceto de la empresa (Fase 4.7): un rojo sería un color inventado, y el azul
 * verdoso de la marca no puede marcar un estado — 2,28:1 contra el fondo, y
 * hacen falta 3:1.
 *
 * Lo que distingue un error de una confirmación es lo mismo que lo distinguía
 * antes de que el color existiera: **las palabras**, el peso y un borde más
 * grueso. El color nunca podía ir solo de todas formas, porque una de cada doce
 * personas no distingue rojo de verde.
 *
 * Es un recuadro blanco, como los campos del formulario al que responde. Hasta
 * la Fase 4.7 era un filete al costado del texto, que es una de las marcas más
 * repetidas de los sitios hechos con IA.
 *
 * `role="alert"` solo en los errores: es lo que interrumpe al lector de
 * pantalla para leerlo enseguida, y usarlo en todo hace que deje de
 * distinguirse. Una confirmación va con `role="status"`, que se anuncia cuando
 * termina la frase en curso.
 *
 * Contraste medido: el texto, `#2F2F2F`, sobre el blanco del recuadro,
 * **13,39:1**.
 */

type Tono = "error" | "nota";

const ESTILOS: Record<Tono, string> = {
  error: "border-2 border-texto font-semibold",
  nota: "border border-texto-suave",
};

export function Aviso({
  tono = "error",
  children,
}: {
  tono?: Tono;
  children: ReactNode;
}) {
  if (!children) return null;

  return (
    <p
      role={tono === "error" ? "alert" : "status"}
      className={`bg-superficie text-texto max-w-lectura rounded-chico px-4 py-3 text-cuerpo ${ESTILOS[tono]}`}
    >
      {children}
    </p>
  );
}
