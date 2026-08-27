"use client";

import { useActionState, useId } from "react";

import type { Resultado } from "@/acciones/resultado";
import { Aviso } from "@/components/ui/aviso";
import { Boton } from "@/components/ui/boton";
import { Campo, CampoLargo } from "@/components/ui/campo";
import { useEstadoDelServidor } from "@/lib/estado-del-servidor";
import type { Variante } from "@/lib/panel/tipos";

/**
 * Los textos de un producto y su lista de variantes.
 *
 * El formulario funciona **sin JavaScript** en lo esencial: es un `<form>` con
 * una Server Action, así que un envío entra igual si el paquete todavía no
 * cargó. Lo que agrega el JavaScript es el estado «Guardando…», el error al
 * lado del campo y poder sumar variantes sin recargar.
 */
export function FormularioProducto({
  accion,
  producto,
  variantes,
}: {
  accion: (estado: Resultado | null, datos: FormData) => Promise<Resultado>;
  producto: { nombre: string; slug: string; descripcion: string | null };
  variantes: Variante[];
}) {
  const id = useId();
  const [estado, enviar, pendiente] = useActionState(accion, null);
  // Después de guardar, el servidor manda: si se recortó un nombre o se quitó
  // una variante vacía, la lista vuelve a lo que quedó realmente guardado.
  // La clave es la prop `variantes`, no la lista derivada: esta última se
  // construye en cada render y compararla por identidad borraría lo que se
  // está escribiendo.
  const [nombres, setNombres] = useEstadoDelServidor(
    variantes.length > 0 ? variantes.map((v) => v.nombre) : [""],
    variantes,
  );

  const errorDe = (campo: string) =>
    estado && !estado.ok && estado.campo === campo ? estado.mensaje : undefined;

  return (
    <form action={enviar} className="flex flex-col gap-5">
      <Campo
        id={`${id}-nombre`}
        name="nombre"
        etiqueta="Nombre"
        required
        maxLength={120}
        defaultValue={producto.nombre}
        error={errorDe("nombre")}
        ayuda="Como se va a leer en el catálogo. Por ejemplo: Roller Blackout."
      />

      <Campo
        id={`${id}-slug`}
        name="slug"
        etiqueta="Dirección web"
        maxLength={80}
        defaultValue={producto.slug}
        error={errorDe("slug")}
        ayuda={
          <>
            Es la parte final del enlace:{" "}
            <span className="break-all text-neutral-900">
              espaciocortinas.com.ar/productos/{producto.slug || "…"}
            </span>
            .{" "}
            <strong className="font-medium">
              Si la cambiás, los enlaces que ya mandaste por WhatsApp dejan de
              funcionar.
            </strong>{" "}
            No hace falta tocarla.
          </>
        }
      />

      <CampoLargo
        id={`${id}-descripcion`}
        name="descripcion"
        etiqueta="Descripción"
        defaultValue={producto.descripcion ?? ""}
        ayuda="Un párrafo corto: para qué sirve, en qué se destaca. Sin precios."
      />

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-neutral-900">
          Variantes
        </legend>
        <p className="text-sm text-neutral-600">
          Las opciones de este mismo producto — por ejemplo «Dos paños»,
          «Motorizado». No son productos aparte: no llevan foto ni descripción
          propia.
        </p>

        {nombres.map((nombre, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              name="variante"
              value={nombre}
              maxLength={80}
              aria-label={`Variante ${i + 1}`}
              placeholder="Nombre de la variante"
              onChange={(e) =>
                setNombres(
                  nombres.map((v, j) => (j === i ? e.target.value : v)),
                )
              }
              className="min-h-12 w-full rounded border border-neutral-400 px-3 text-base"
            />
            <Boton
              type="button"
              aria-label={`Quitar la variante ${i + 1}`}
              className="min-h-12 w-12 shrink-0 px-0"
              onClick={() =>
                setNombres(
                  nombres.length === 1
                    ? [""]
                    : nombres.filter((_, j) => j !== i),
                )
              }
            >
              <span aria-hidden>✕</span>
            </Boton>
          </div>
        ))}

        <Boton
          type="button"
          className="self-start"
          onClick={() => setNombres([...nombres, ""])}
        >
          Agregar variante
        </Boton>
      </fieldset>

      <div className="flex items-center gap-3">
        <Boton type="submit" variante="primario" cargando={pendiente}>
          {pendiente ? "Guardando…" : "Guardar cambios"}
        </Boton>
      </div>

      {/* No hay aviso de «guardado» acá: al guardar bien, la acción lleva
          al listado y el aviso se muestra allá. Lo único que queda en esta
          pantalla es lo que hay que corregir sin moverse. */}
      {estado && !estado.ok && !estado.campo && (
        <Aviso tono="error">{estado.mensaje}</Aviso>
      )}
    </form>
  );
}
