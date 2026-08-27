import { useState } from "react";

/**
 * Estado local que se rinde ante el servidor cuando el servidor cambia.
 *
 * El panel muestra varias cosas al instante y las guarda de fondo: el orden de
 * la galería, los interruptores de publicado y destacado. Eso necesita una
 * copia local del valor. Pero cuando llega una versión nueva desde el servidor
 * —porque se subió una foto, o porque `router.refresh()` trajo los datos
 * frescos— la copia local tiene que desaparecer: la verdad la tiene el
 * servidor.
 *
 * **Por qué no un `useEffect`:** el `useEffect` que hace `setState` para
 * copiar una prop renderiza una vez con el valor viejo, y recién en la segunda
 * pasada muestra el nuevo. En una galería eso se ve: las fotos aparecen un
 * instante en el orden anterior. Ajustar el estado durante el render, como
 * acá, hace que React descarte esa primera pasada antes de tocar el DOM, así
 * que no llega a verse. Es el patrón que documenta React para «cambiar el
 * estado cuando cambia una prop».
 *
 * **`clave` es obligatoria cuando el valor se construye en el render.** La
 * comparación es por identidad, así que un `{ activo, destacado }` armado en
 * cada pasada nunca sería igual al anterior y el estado local se borraría en
 * cada render — se perdería justo lo que se está editando. En esos casos se
 * pasa aparte algo que sí sea estable: los valores primitivos concatenados, o
 * la prop original de la que deriva.
 *
 * Se llama `useEstadoDelServidor` y no `usarEstadoDelServidor` a pesar de la
 * regla 7 de CLAUDE.md: React reconoce los hooks por el prefijo `use`, y el
 * linter y el compilador dejan de aplicar las reglas de hooks si el nombre no
 * empieza así. Es una restricción de la herramienta, no una elección de
 * idioma.
 */
export function useEstadoDelServidor<T>(
  desdeElServidor: T,
  clave: unknown = desdeElServidor,
): [T, (valor: T) => void] {
  const [valor, setValor] = useState(desdeElServidor);
  const [ultimaClave, setUltimaClave] = useState(clave);

  if (clave !== ultimaClave) {
    setUltimaClave(clave);
    setValor(desdeElServidor);
  }

  return [valor, setValor];
}
