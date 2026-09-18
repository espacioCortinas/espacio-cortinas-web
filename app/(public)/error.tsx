"use client";

import { Boton } from "@/components/ui/boton";
import { CLASES_CONTENEDOR } from "@/components/ui/contenedor";

/**
 * Algo se rompió al renderizar una página pública.
 *
 * **Tiene que existir aunque el sitio sea estático.** Las páginas se
 * prerenderizan en el build, así que un error de servidor haría fallar el build
 * antes de publicarse; lo que sí puede pasar en vivo es que se corte la
 * navegación del lado del cliente —una red que se cae a la mitad de un salto
 * entre páginas— y sin este archivo eso deja una pantalla en blanco.
 *
 * Es componente de cliente por obligación de Next: `reset()` es una función que
 * vuelve a intentar el render, y eso solo existe en el navegador.
 *
 * **No se muestra el detalle del error.** No le dice nada a quien está buscando
 * cortinas y puede filtrar rutas internas. Queda en la consola, que es donde
 * sirve.
 */
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className={`${CLASES_CONTENEDOR} py-16 md:py-28`}>
      <p className="text-texto-suave text-meta tracking-[0.12em] uppercase">
        Algo falló
      </p>
      <h1 className="mt-4 text-display">No se pudo mostrar esta página</h1>
      <p className="max-w-lectura text-texto-suave mt-6 text-subtitulo">
        Puede ser un problema momentáneo de conexión. Probá de nuevo; si sigue
        igual, escribinos y te respondemos igual de rápido.
      </p>

      <div className="mt-10">
        <Boton variante="principal" onClick={reset}>
          Reintentar
        </Boton>
      </div>
    </main>
  );
}
