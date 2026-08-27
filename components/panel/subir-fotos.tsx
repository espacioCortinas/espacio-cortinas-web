"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";

import { pedirSubida, registrarImagen } from "@/acciones/imagenes";
import { Aviso } from "@/components/ui/aviso";
import { Boton } from "@/components/ui/boton";
import { BUCKET, TIPO_SUBIDO } from "@/lib/constantes";
import { ErrorDeImagen, prepararImagen } from "@/lib/imagenes";
import type { Entidad } from "@/lib/panel/tipos";
import { crearClienteNavegador } from "@/lib/supabase/navegador";

/**
 * Subir fotos. Es el corazón de la Fase 3 y el paso más lento del panel.
 *
 * El reparto del trabajo no es negociable (docs/arquitectura.md, decisiones 5
 * y 25): **el navegador comprime y sube; el servidor autoriza y registra.** El
 * servidor nunca ve el archivo.
 *
 *   1. NAVEGADOR   normaliza la orientación, borra el EXIF y genera los WebP
 *   2. SERVIDOR    verifica identidad, valida tipo y peso, arma la ruta y firma
 *   3. NAVEGADOR   sube directo a Storage con esa firma
 *   4. SERVIDOR    guarda la fila y revalida las rutas públicas
 *
 * **Las fotos se procesan de a una, no todas juntas.** Cuatro fotos de 8 MB
 * decodificadas a la vez son unos 400 MB de mapas de bits en memoria, y un
 * teléfono de gama media mata la pestaña sin avisar: la pantalla se queda en
 * blanco y parece que el panel se rompió. De a una tarda lo mismo en total y
 * cada una avisa cómo va.
 *
 * Y por eso hay estados de carga con nombre y no un girador genérico: subir
 * cuatro medidas de una foto desde un teléfono tarda, y una barra que no dice
 * qué está pasando invita a tocar el botón otra vez.
 */

type Estado =
  "esperando" | "preparando" | "subiendo" | "guardando" | "lista" | "falló";

type EnCola = {
  clave: string;
  archivo: File;
  estado: Estado;
  detalle: string;
  vistaPrevia: string | null;
};

const ETIQUETAS: Record<Estado, string> = {
  esperando: "En espera",
  preparando: "Preparando la foto…",
  subiendo: "Subiendo…",
  guardando: "Guardando…",
  lista: "Lista",
  falló: "No se pudo",
};

export function SubirFotos({
  entidad,
  padreId,
}: {
  entidad: Entidad;
  padreId: string;
}) {
  const router = useRouter();
  const entrada = useRef<HTMLInputElement>(null);
  const idRecorte = useId();

  const [cola, setCola] = useState<EnCola[]>([]);
  const [trabajando, setTrabajando] = useState(false);
  const [recortar, setRecortar] = useState(false);

  function actualizar(clave: string, cambios: Partial<EnCola>) {
    setCola((antes) =>
      antes.map((f) => (f.clave === clave ? { ...f, ...cambios } : f)),
    );
  }

  async function subirUna(item: EnCola): Promise<void> {
    const { clave, archivo } = item;

    actualizar(clave, { estado: "preparando", detalle: "" });

    const preparada = await prepararImagen(archivo, {
      recortarAVertical: recortar,
    });

    actualizar(clave, {
      vistaPrevia: preparada.vistaPrevia,
      estado: "subiendo",
      detalle: `0 de ${preparada.archivos.length} medidas`,
    });

    const firma = await pedirSubida({
      entidad,
      padreId,
      medidas: preparada.medidas,
      pesos: preparada.archivos.map((a) => a.blob.size),
      tipo: TIPO_SUBIDO,
    });

    if (!firma.ok) throw new ErrorDeImagen(firma.mensaje);

    const supabase = crearClienteNavegador();
    let subidas = 0;

    for (const { ancho, path, token } of firma.subida.archivos) {
      const blob = preparada.archivos.find((a) => a.ancho === ancho);
      if (!blob) throw new ErrorDeImagen("Faltó una medida. Probá de nuevo.");

      const { error: fallo } = await supabase.storage
        .from(BUCKET)
        .uploadToSignedUrl(path, token, blob.blob, {
          contentType: TIPO_SUBIDO,
        });

      if (fallo) {
        throw new ErrorDeImagen(
          "Se cortó la subida. Suele ser la señal: probá de nuevo con wifi.",
        );
      }

      subidas += 1;
      actualizar(clave, {
        detalle: `${subidas} de ${firma.subida.archivos.length} medidas`,
      });
    }

    actualizar(clave, { estado: "guardando", detalle: "" });

    const guardado = await registrarImagen({
      entidad,
      padreId,
      ruta: firma.subida.ruta,
      medidas: preparada.medidas,
      ancho: preparada.ancho,
      alto: preparada.alto,
    });

    if (!guardado.ok) throw new ErrorDeImagen(guardado.mensaje);

    actualizar(clave, {
      estado: "lista",
      detalle: `${preparada.ancho} × ${preparada.alto}`,
    });
  }

  async function procesar(archivos: File[]) {
    const nuevos: EnCola[] = archivos.map((archivo, i) => ({
      clave: `${Date.now()}-${i}-${archivo.name}`,
      archivo,
      estado: "esperando",
      detalle: "",
      vistaPrevia: null,
    }));

    setCola((antes) => [...antes, ...nuevos]);
    setTrabajando(true);

    for (const item of nuevos) {
      try {
        await subirUna(item);
      } catch (fallo) {
        // Un `ErrorDeImagen` ya trae un mensaje escrito para ella. Cualquier
        // otra cosa es un problema nuestro y no tiene sentido mostrárselo tal
        // cual, así que va a la consola y ella recibe algo accionable.
        if (fallo instanceof ErrorDeImagen) {
          actualizar(item.clave, { estado: "falló", detalle: fallo.message });
        } else {
          console.error("[subir-fotos]", fallo);
          actualizar(item.clave, {
            estado: "falló",
            detalle: "No se pudo subir esta foto. Probá de nuevo.",
          });
        }
      }
    }

    setTrabajando(false);
    // Trae la galería recién guardada desde el servidor.
    router.refresh();
  }

  const fallidas = cola.filter((f) => f.estado === "falló");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded border border-dashed border-neutral-400 p-4">
        <label className="flex items-start gap-3 text-sm text-neutral-700">
          <input
            id={idRecorte}
            type="checkbox"
            checked={recortar}
            onChange={(e) => setRecortar(e.target.checked)}
            className="mt-0.5 size-5 shrink-0"
          />
          <span>
            <strong className="font-medium text-neutral-900">
              Recortar a vertical las fotos apaisadas
            </strong>
            <br />
            Solo una foto vertical puede ser la portada. Si estas fotos son
            viejas y están apaisadas, marcá esto y se recortan por el centro.
          </span>
        </label>

        <input
          ref={entrada}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={trabajando}
          onChange={(e) => {
            const archivos = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (archivos.length > 0) void procesar(archivos);
          }}
          className="sr-only"
        />

        <Boton
          type="button"
          variante="primario"
          disabled={trabajando}
          onClick={() => entrada.current?.click()}
        >
          {trabajando ? "Subiendo fotos…" : "Elegir fotos"}
        </Boton>

        <p className="text-sm text-neutral-600">
          Se pueden elegir varias de una vez. Cada foto se achica en el teléfono
          antes de subirse, así que tarda un poco y usa menos datos.
        </p>
      </div>

      {cola.length > 0 && (
        <ul className="flex flex-col gap-2">
          {cola.map((f) => (
            <li
              key={f.clave}
              className="flex items-center gap-3 rounded border border-neutral-300 p-2"
            >
              {f.vistaPrevia ? (
                // Es un `blob:` local que dura lo que dura la pantalla, no una
                // imagen del sitio: `next/image` no aporta nada acá.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={f.vistaPrevia}
                  alt=""
                  className="size-12 shrink-0 rounded object-cover"
                />
              ) : (
                <span className="size-12 shrink-0 rounded bg-neutral-200" />
              )}

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-neutral-900">
                  {f.archivo.name}
                </span>
                <span
                  className={`block text-xs ${
                    f.estado === "falló" ? "text-red-700" : "text-neutral-600"
                  }`}
                >
                  {ETIQUETAS[f.estado]}
                  {f.detalle ? ` — ${f.detalle}` : ""}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {fallidas.length > 0 && !trabajando && (
        <Aviso tono="atencion">
          {fallidas.length === 1
            ? "Una foto no se pudo subir. El motivo está al lado de su nombre."
            : `${fallidas.length} fotos no se pudieron subir. El motivo está al lado de cada nombre.`}
        </Aviso>
      )}
    </div>
  );
}
