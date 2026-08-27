"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  eliminarImagen,
  guardarAlt,
  marcarPortada,
  reordenarImagenes,
} from "@/acciones/imagenes";
import { Aviso, Chip } from "@/components/ui/aviso";
import { Boton } from "@/components/ui/boton";
import { BotonConConfirmacion } from "@/components/ui/confirmar";
import { useEstadoDelServidor } from "@/lib/estado-del-servidor";
import type { Entidad, ImagenConUrls } from "@/lib/panel/tipos";

/**
 * La galería del panel: reordenar, elegir portada, editar el texto
 * alternativo y eliminar.
 *
 * **Se reordena con botones de subir y bajar, no arrastrando.** Arrastrar es
 * más lindo de mirar y bastante peor de usar: en un teléfono compite con el
 * desplazamiento de la página —el gesto es el mismo— y con un lector de
 * pantalla o solo con teclado directamente no existe. Dos botones funcionan
 * en todos lados y no hay nada que aprender.
 *
 * El orden se aplica **enseguida en pantalla** y se guarda de fondo. Si el
 * guardado falla se avisa y se recarga desde el servidor: es preferible eso a
 * congelar la lista en cada toque, porque reordenar doce fotos son once
 * toques seguidos.
 *
 * Se comparte entre productos y proyectos recibiendo la entidad como
 * parámetro. Es lo que la decisión 7 ya preveía al elegir dos tablas en vez de
 * una polimórfica: lo que se evitaba duplicar era el código, no el esquema.
 */
export function Galeria({
  entidad,
  padreId,
  imagenes,
}: {
  entidad: Entidad;
  padreId: string;
  imagenes: ImagenConUrls[];
}) {
  const router = useRouter();
  // El servidor manda: cuando llega una galería nueva —se subió una foto, se
  // borró otra— se descarta el orden local.
  const [orden, setOrden] = useEstadoDelServidor(imagenes);
  const [fallo, setFallo] = useState<string | null>(null);
  const [enCurso, iniciar] = useTransition();
  // Qué se está haciendo exactamente, para poner la rueda en el botón que se
  // tocó y no en todos a la vez. Con «algo está cargando» no alcanza: en una
  // galería de doce fotos hay veinticinco botones, y encenderlos todos no dice
  // nada sobre qué se está guardando.
  const [tocado, setTocado] = useState<string | null>(null);

  function mover(desde: number, hacia: number) {
    if (hacia < 0 || hacia >= orden.length) return;

    const nuevo = [...orden];
    [nuevo[desde], nuevo[hacia]] = [nuevo[hacia], nuevo[desde]];
    setOrden(nuevo);
    setFallo(null);
    setTocado(`mover:${orden[desde].id}`);

    iniciar(async () => {
      const r = await reordenarImagenes(
        entidad,
        padreId,
        nuevo.map((i) => i.id),
      );
      if (!r.ok) {
        setFallo(r.mensaje);
        router.refresh();
      }
      setTocado(null);
    });
  }

  function usarDePortada(id: string) {
    setFallo(null);
    setTocado(`portada:${id}`);
    iniciar(async () => {
      const r = await marcarPortada(entidad, id);
      if (!r.ok) setFallo(r.mensaje);
      router.refresh();
      setTocado(null);
    });
  }

  if (orden.length === 0) {
    return (
      <p className="rounded border border-neutral-300 bg-neutral-50 px-3 py-6 text-center text-sm text-neutral-600">
        Todavía no hay fotos. Subí la primera con el botón de arriba.
      </p>
    );
  }

  const hayPortada = orden.some((i) => i.es_portada);

  return (
    <div className="flex flex-col gap-3">
      {fallo && <Aviso tono="error">{fallo}</Aviso>}

      {!hayPortada && (
        <Aviso tono="atencion">
          Falta elegir la foto de portada. Es la que se ve en los listados del
          sitio, y tiene que ser una foto vertical.
        </Aviso>
      )}

      <ul className="flex flex-col gap-3">
        {orden.map((imagen, i) => {
          const esVertical = imagen.alto > imagen.ancho;

          return (
            <li
              key={imagen.id}
              className="flex flex-col gap-3 rounded border border-neutral-300 p-3 sm:flex-row"
            >
              <div className="flex gap-3">
                {imagen.urlMiniatura ? (
                  // Las fotos del bucket privado llegan con URL firmada y las
                  // medidas ya están generadas: el optimizador de `next/image`
                  // acá gastaría cuota de Transformations para rehacer un
                  // trabajo hecho (decisión 25).
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagen.urlMiniatura}
                    alt={imagen.alt}
                    width={imagen.ancho}
                    height={imagen.alto}
                    className="h-28 w-24 shrink-0 rounded bg-neutral-100 object-cover"
                  />
                ) : (
                  <span className="flex h-28 w-24 shrink-0 items-center justify-center rounded bg-neutral-100 text-center text-xs text-neutral-500">
                    No se pudo cargar
                  </span>
                )}

                {/* Subir y bajar, pegados a la miniatura para que se entienda
                    qué se está moviendo. */}
                <div className="flex flex-col justify-center gap-2">
                  <Boton
                    type="button"
                    aria-label={`Subir la foto ${i + 1}`}
                    disabled={i === 0 || enCurso}
                    cargando={tocado === `mover:${imagen.id}`}
                    onClick={() => mover(i, i - 1)}
                    className="min-h-12 w-12 px-0"
                  >
                    {tocado !== `mover:${imagen.id}` && (
                      <span aria-hidden>↑</span>
                    )}
                  </Boton>
                  <Boton
                    type="button"
                    aria-label={`Bajar la foto ${i + 1}`}
                    disabled={i === orden.length - 1 || enCurso}
                    cargando={tocado === `mover:${imagen.id}`}
                    onClick={() => mover(i, i + 1)}
                    className="min-h-12 w-12 px-0"
                  >
                    {tocado !== `mover:${imagen.id}` && (
                      <span aria-hidden>↓</span>
                    )}
                  </Boton>
                </div>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip>{`Foto ${i + 1}`}</Chip>
                  <Chip tono={esVertical ? "neutro" : "apagado"}>
                    {esVertical ? "Vertical" : "Apaisada"}
                  </Chip>
                  <Chip tono="apagado">
                    {`${imagen.medidas.length} ${
                      imagen.medidas.length === 1 ? "medida" : "medidas"
                    }: ${imagen.medidas.join(" · ")}`}
                  </Chip>
                  {imagen.es_portada && <Chip>Portada</Chip>}
                </div>

                {!imagen.es_portada &&
                  (esVertical ? (
                    <Boton
                      type="button"
                      disabled={enCurso}
                      cargando={tocado === `portada:${imagen.id}`}
                      onClick={() => usarDePortada(imagen.id)}
                      className="self-start"
                    >
                      {tocado === `portada:${imagen.id}`
                        ? "Poniendo de portada…"
                        : "Usar de portada"}
                    </Boton>
                  ) : (
                    <p className="text-sm text-neutral-600">
                      No puede ser portada porque es apaisada. Volvé a subirla
                      con la opción de recortar a vertical.
                    </p>
                  ))}

                <TextoAlternativo
                  entidad={entidad}
                  imagenId={imagen.id}
                  valor={imagen.alt}
                />

                <BotonConConfirmacion
                  className="self-start"
                  accion={eliminarImagen.bind(null, entidad, imagen.id)}
                  etiqueta="Eliminar foto"
                  titulo={`¿Eliminar la foto ${i + 1}?`}
                  descripcion={
                    imagen.es_portada
                      ? "Es la portada. Al eliminarla se usa de portada la siguiente foto vertical, si hay alguna. No se puede deshacer."
                      : "La foto se borra del sitio y del servidor. No se puede deshacer."
                  }
                  confirmar="Sí, eliminar"
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * El texto que lee un lector de pantalla, y lo que se muestra si la foto no
 * carga.
 *
 * Va plegado dentro de un `<details>` a propósito: se genera solo al subir y
 * casi nunca hace falta tocarlo. Mostrarlo abierto en cada foto llenaría la
 * galería de campos de texto que nadie va a completar, que es exactamente lo
 * que docs/modelo-de-datos.md quería evitar cuando decidió generarlo.
 */
function TextoAlternativo({
  entidad,
  imagenId,
  valor,
}: {
  entidad: Entidad;
  imagenId: string;
  valor: string;
}) {
  const [texto, setTexto] = useEstadoDelServidor(valor);
  const [guardado, setGuardado] = useState(false);
  const [enCurso, iniciar] = useTransition();

  return (
    <details className="text-sm">
      <summary className="cursor-pointer py-2 text-neutral-700">
        Descripción de la foto
      </summary>
      <div className="flex flex-col gap-2 pt-2">
        <p className="text-neutral-600">
          Es lo que se lee en voz alta para quien no puede ver la foto, y lo que
          aparece si la foto no carga. Ya viene escrita; cambiala solo si vale
          la pena describir lo que se ve.
        </p>
        <input
          type="text"
          value={texto}
          maxLength={200}
          onChange={(e) => {
            setTexto(e.target.value);
            setGuardado(false);
          }}
          aria-label="Descripción de la foto"
          className="min-h-12 w-full rounded border border-neutral-400 px-3 text-base"
        />
        <div className="flex items-center gap-3">
          <Boton
            type="button"
            disabled={texto === valor}
            cargando={enCurso}
            onClick={() =>
              iniciar(async () => {
                await guardarAlt(entidad, imagenId, texto);
                setGuardado(true);
              })
            }
          >
            {enCurso ? "Guardando…" : "Guardar descripción"}
          </Boton>
          {guardado && (
            <span role="status" className="text-neutral-600">
              Guardada.
            </span>
          )}
        </div>
      </div>
    </details>
  );
}
