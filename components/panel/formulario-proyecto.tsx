"use client";

import { useActionState, useId } from "react";

import type { Resultado } from "@/acciones/resultado";
import { Aviso } from "@/components/ui/aviso";
import { Boton } from "@/components/ui/boton";
import { Campo, CampoLargo } from "@/components/ui/campo";

/**
 * Los textos de un proyecto.
 *
 * Cuatro campos y no más — decisión 11. Sin categoría, sin fecha, sin cliente,
 * sin superficie, sin qué productos se usaron. **Cada campo que se agregue es
 * un campo que hay que completar en cada carga**, y de eso depende que el
 * portfolio se mantenga al día o quede desactualizado a los tres meses.
 */
export function FormularioProyecto({
  accion,
  proyecto,
}: {
  accion: (estado: Resultado | null, datos: FormData) => Promise<Resultado>;
  proyecto: {
    titulo: string;
    slug: string;
    ubicacion: string | null;
    descripcion: string | null;
  };
}) {
  const id = useId();
  const [estado, enviar, pendiente] = useActionState(accion, null);

  const errorDe = (campo: string) =>
    estado && !estado.ok && estado.campo === campo ? estado.mensaje : undefined;

  return (
    <form action={enviar} className="flex flex-col gap-5">
      <Campo
        id={`${id}-titulo`}
        name="titulo"
        etiqueta="Título"
        required
        maxLength={140}
        defaultValue={proyecto.titulo}
        error={errorDe("titulo")}
        ayuda="El trabajo, no el lugar. Por ejemplo: Casa en Nordelta."
      />

      <Campo
        id={`${id}-ubicacion`}
        name="ubicacion"
        etiqueta="Ubicación"
        maxLength={120}
        defaultValue={proyecto.ubicacion ?? ""}
        ayuda="Se muestra como etiqueta debajo del título. Por ejemplo: Nordelta, Buenos Aires."
      />

      <Campo
        id={`${id}-slug`}
        name="slug"
        etiqueta="Dirección web"
        maxLength={80}
        defaultValue={proyecto.slug}
        error={errorDe("slug")}
        ayuda={
          <>
            Es la parte final del enlace:{" "}
            <span className="break-all text-neutral-900">
              espaciocortinas.com.ar/proyectos/{proyecto.slug || "…"}
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
        defaultValue={proyecto.descripcion ?? ""}
        ayuda="Qué se hizo y qué se resolvió. Un párrafo alcanza."
      />

      <div className="flex items-center gap-3">
        <Boton type="submit" variante="primario" disabled={pendiente}>
          {pendiente ? "Guardando…" : "Guardar cambios"}
        </Boton>
      </div>

      {estado && !estado.ok && !estado.campo && (
        <Aviso tono="error">{estado.mensaje}</Aviso>
      )}
      {estado?.ok && (
        <Aviso tono="exito">Guardado. Ya se ve así en el sitio.</Aviso>
      )}
    </form>
  );
}
