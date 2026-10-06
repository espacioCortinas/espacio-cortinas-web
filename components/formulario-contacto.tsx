"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  type FormEvent,
} from "react";

import { Aviso } from "@/components/ui/aviso";
import { Boton, BotonEnlace, clasesDeBoton } from "@/components/ui/boton";
import { Campo, CampoLargo, CampoSelector } from "@/components/ui/campo";
import {
  CAMPOS,
  CAMPO_TRAMPA,
  camposDe,
  validarConsulta,
  type Campo as NombreDeCampo,
  type ErroresDeConsulta,
  type ResultadoDeConsulta,
} from "@/lib/consulta";
import { enlaceWhatsapp } from "@/lib/whatsapp";

/**
 * El formulario de contacto.
 *
 * **Es el tercer componente de cliente del sitio público**, después de la
 * navegación y del video. Hace falta porque el formulario tiene estados que
 * solo existen en el navegador —enviando, enviada, fallida— y porque lo que
 * escribió la persona **no se puede perder en ningún caso**.
 *
 * # Por qué no usa `<form action>`
 *
 * Es la forma que Next propone para una Server Action, y tiene dos problemas
 * justo en lo que este formulario no puede fallar:
 *
 * - **React vacía el formulario al terminar la acción.** Es el comportamiento
 *   de React 19 con `<form action>`, y con un envío fallido borraría lo que
 *   la persona escribió.
 * - **Si el pedido no llega a la acción, lanza.** Un corte de red, el 429 de
 *   la regla de rate limiting o un error del Worker terminan en una excepción
 *   que sube hasta `error.tsx` y reemplaza la página entera, formulario
 *   incluido.
 *
 * Así que el envío lo maneja `onSubmit`: se lee el formulario, se valida acá,
 * y la Server Action se llama como una función, dentro de un `try`. Los campos
 * no son controlados y nadie los vacía: lo escrito queda en la pantalla pase
 * lo que pase, hasta que el envío sale bien.
 *
 * Lo que se resigna es que funcione sin JavaScript. A cambio, la página ofrece
 * sin JavaScript todo lo demás: el enlace de WhatsApp, el teléfono y el email
 * son enlaces comunes. Decisión 57.
 *
 * # Antes de que React lo tome, el botón está apagado
 *
 * Hasta la hidratación, el formulario es HTML pelado, y enviarlo es el envío
 * nativo del navegador: un GET con los datos en la URL. Por eso el botón nace
 * apagado —`useHidratado`— y el formulario lleva `method="post"` como segunda
 * red. **La hidratación de esta página tarda más de lo que parece**: el
 * contenido llega en diferido dentro del mismo HTML y React 19.2 lo revela en
 * el cuadro siguiente, así que en una pestaña abierta en segundo plano no se
 * revela ni se hidrata hasta que alguien la mira.
 */

type Estado =
  | { tipo: "escribiendo" }
  | { tipo: "enviada"; email: string }
  /** Lo que se pasa a WhatsApp, ya armado con lo que escribió. */
  | { tipo: "fallida"; textoParaWhatsapp: string };

type Opcion = { valor: string; texto: string };

const sinSuscripcion = () => () => {};

/**
 * `false` en el HTML del servidor y mientras React hidrata; `true` recién
 * cuando el formulario tiene su `onSubmit` puesto.
 *
 * **Existe por lo que pasa antes**: hasta que React toma el formulario, enviar
 * es el envío nativo del navegador, que sin `method` es un GET y **pone el
 * nombre, el email y el mensaje en la URL** — al historial y a los registros
 * del Worker, que guardan la dirección de cada pedido. Y la consulta no llega a
 * ningún lado. Se vio probando en la Fase 4.6: con la página todavía sin
 * hidratar, un envío terminó en `/contacto?nombre=…&email=…&mensaje=…`. En
 * un teléfono con una conexión lenta, esa ventana dura segundos.
 *
 * `useSyncExternalStore` y no un `useEffect` con estado: devuelve el valor del
 * servidor durante la hidratación, así que el HTML coincide, y el del cliente
 * después, sin un render de más.
 */
function useHidratado(): boolean {
  return useSyncExternalStore(
    sinSuscripcion,
    () => true,
    () => false,
  );
}

export function FormularioContacto({
  enviar,
  intereses,
}: {
  /** La Server Action. Llega de la página para que este archivo no dependa de `app/`. */
  enviar: (datos: FormData) => Promise<ResultadoDeConsulta>;
  /** Las opciones de «qué estás buscando», con la vacía primero. */
  intereses: readonly Opcion[];
}) {
  const [estado, setEstado] = useState<Estado>({ tipo: "escribiendo" });
  const [errores, setErrores] = useState<ErroresDeConsulta>({});
  const [enviando, iniciarEnvio] = useTransition();
  const hidratado = useHidratado();
  const formulario = useRef<HTMLFormElement>(null);
  const confirmacion = useRef<HTMLDivElement>(null);

  // Los valores que el servidor acepta: los mismos que muestra la lista.
  const valoresDeInteres = intereses.map((o) => o.valor).filter(Boolean);

  // Al enviarse, el formulario se reemplaza por la confirmación, y el foco va
  // ahí: si no, quien navega con teclado o con lector de pantalla queda
  // parado en un botón que ya no existe.
  useEffect(() => {
    if (estado.tipo === "enviada") confirmacion.current?.focus();
  }, [estado.tipo]);

  /** Lleva el foco al primer campo con error, en el orden del formulario. */
  function enfocarPrimerError(conErrores: ErroresDeConsulta) {
    const primero = CAMPOS.find((campo) => conErrores[campo]);
    const control = primero && formulario.current?.elements.namedItem(primero);
    if (control instanceof HTMLElement) control.focus();
  }

  function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando) return;

    const datos = new FormData(evento.currentTarget);
    const { consulta, errores: encontrados } = validarConsulta(
      camposDe(datos),
      valoresDeInteres,
    );

    // Lo que se puede decir sin ir al servidor, se dice acá. El servidor lo
    // vuelve a comprobar igual: esto es para no hacer esperar a nadie.
    if (Object.keys(encontrados).length > 0) {
      setErrores(encontrados);
      setEstado({ tipo: "escribiendo" });
      enfocarPrimerError(encontrados);
      return;
    }

    setErrores({});
    // Un aviso de un intento anterior no puede quedar a la vista mientras sale
    // el siguiente: diría que falló algo que todavía no terminó.
    setEstado({ tipo: "escribiendo" });

    iniciarEnvio(async () => {
      let resultado: ResultadoDeConsulta;
      try {
        resultado = await enviar(datos);
      } catch {
        // No llegó a la acción: sin conexión, el 429 del borde, el Worker
        // caído. Para quien escribió es lo mismo que un envío fallido.
        resultado = { tipo: "fallida" };
      }

      if (resultado.tipo === "enviada") {
        setEstado({ tipo: "enviada", email: consulta.email });
      } else if (resultado.tipo === "invalida") {
        setErrores(resultado.errores);
        setEstado({ tipo: "escribiendo" });
        enfocarPrimerError(resultado.errores);
      } else {
        const interes = intereses.find(
          (o) => o.valor && o.valor === consulta.interes,
        )?.texto;
        setEstado({
          tipo: "fallida",
          textoParaWhatsapp: interes
            ? `Sobre ${interes}: ${consulta.mensaje}`
            : consulta.mensaje,
        });
      }
    });
  }

  /** Al corregir un campo, su error se va: un error viejo a la vista confunde. */
  function alCambiar(evento: FormEvent<HTMLFormElement>) {
    const nombre = (evento.target as HTMLInputElement).name as NombreDeCampo;
    if (errores[nombre]) {
      setErrores((previos) => {
        const siguientes = { ...previos };
        delete siguientes[nombre];
        return siguientes;
      });
    }
  }

  if (estado.tipo === "enviada") {
    return (
      /*
        En un bloque azul verdoso, como los cierres de cada página: es la
        respuesta a lo que la página pedía. Hasta la Fase 4.7 era un filete al
        costado, una de las marcas de los sitios hechos con IA.

        Todo el texto en el color del texto: sobre el azul verdoso da 5,08:1,
        y el gris suave, 2,30:1. El enlace de abajo hereda el color.
      */
      <div
        ref={confirmacion}
        tabIndex={-1}
        role="status"
        className="bg-marca text-texto max-w-lectura px-6 py-8 focus-visible:outline-none md:px-8"
      >
        <p className="font-titulo text-subtitulo font-bold">
          Recibimos tu mensaje.
        </p>
        <p className="mt-3">
          Te respondemos a <span className="font-semibold">{estado.email}</span>
          . Si no te llega nada, revisá la carpeta de correo no deseado.
        </p>
        <button
          type="button"
          onClick={() => setEstado({ tipo: "escribiendo" })}
          className={`${clasesDeBoton("enlace")} mt-4`}
        >
          Escribir otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formulario}
      onSubmit={alEnviar}
      onChange={alCambiar}
      // Red de seguridad para el envío nativo, el que ocurre si React todavía
      // no tomó el formulario (ver `useHidratado`): con POST los datos viajan
      // en el cuerpo y nunca en la URL. Next no lo toma como acción —no lleva
      // `Next-Action`— y vuelve a dibujar la página sin procesar nada.
      method="post"
      // Los mensajes de error los da `lib/consulta.ts`, en castellano y en el
      // mismo lugar siempre. Sin esto, cada navegador mostraría su globo, en su
      // idioma y con su estilo, antes de que corra nada de lo nuestro.
      noValidate
      className="max-w-lectura flex flex-col gap-6"
    >
      <Campo
        etiqueta="Nombre"
        id="consulta-nombre"
        name="nombre"
        autoComplete="name"
        required
        error={errores.nombre}
      />
      <Campo
        etiqueta="Email"
        ayuda="Es adonde te respondemos."
        id="consulta-email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        error={errores.email}
      />
      <Campo
        etiqueta="Teléfono (opcional)"
        ayuda="Si preferís que te llamemos o te escribamos por WhatsApp."
        id="consulta-telefono"
        name="telefono"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        error={errores.telefono}
      />
      <CampoSelector
        etiqueta="¿Qué estás buscando? (opcional)"
        id="consulta-interes"
        name="interes"
        defaultValue=""
        opciones={intereses}
        error={errores.interes}
      />
      <CampoLargo
        etiqueta="Mensaje"
        ayuda="Qué ventana o qué ambiente hay que resolver, y las medidas aproximadas si las tenés."
        id="consulta-mensaje"
        name="mensaje"
        rows={6}
        required
        error={errores.mensaje}
      />

      {/*
        El campo trampa (`lib/consulta.ts`). Fuera de la pantalla y no oculto
        con `display: none`, que algunos robots saben saltear; fuera del orden
        de tabulación y del árbol de accesibilidad, así que una persona no lo
        encuentra de ninguna forma. `autoComplete="off"` es para que ningún
        navegador lo llene por su cuenta.
      */}
      <div
        aria-hidden
        className="absolute -left-[10000px] h-px w-px overflow-hidden"
      >
        <label htmlFor="consulta-trampa">Dejá este campo vacío</label>
        <input
          id="consulta-trampa"
          name={CAMPO_TRAMPA}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      {estado.tipo === "fallida" && (
        <div className="flex flex-col items-start gap-4">
          <Aviso>
            No pudimos enviar el mensaje. Lo que escribiste quedó acá: podés
            probar de nuevo en un rato, o mandarlo ahora por WhatsApp, que ya va
            escrito.
          </Aviso>
          <BotonEnlace
            href={enlaceWhatsapp({
              tipo: "consulta",
              texto: estado.textoParaWhatsapp,
            })}
            variante="principal"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mandarlo por WhatsApp
          </BotonEnlace>
        </div>
      )}

      <div>
        {/*
          Apagado hasta que React toma el formulario: un botón de enviar
          apagado bloquea también el Enter desde un campo, así que no hay forma
          de disparar el envío nativo. En una conexión normal dura una fracción
          de segundo, y el formulario está lejos del principio de la página.
        */}
        <Boton
          type="submit"
          variante="secundario"
          cargando={enviando}
          disabled={!hidratado}
        >
          {enviando ? "Enviando…" : "Enviar mensaje"}
        </Boton>
        <noscript>
          <p className="text-texto-suave mt-3 max-w-lectura text-meta">
            Sin JavaScript el formulario no se puede enviar. Escribinos por
            WhatsApp, por teléfono o por email, que están en esta misma página.
          </p>
        </noscript>
      </div>
    </form>
  );
}
