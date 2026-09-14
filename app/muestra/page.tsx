import type { Metadata } from "next";

import { FotoImg } from "@/components/foto";
import { productoPorSlug } from "@/contenido";
import type { Foto } from "@/contenido/tipos";
import { altAutomatico } from "@/lib/texto";

import { clasesDeFuentes } from "./tipografias";

import "./muestra.css";

/**
 * `/muestra` — las tres direcciones visuales de la Fase 4.1, con las fotos
 * reales.
 *
 * **ESTA PÁGINA SE BORRA.** Existe para decidir, no para publicar: se elige una
 * dirección mirándola, sus valores pasan a `app/globals.css` como tokens y en la
 * Fase 4.5 se borra la carpeta `app/muestra/` entera — decisión 41 y
 * `docs/plan.md`.
 *
 * Tres cosas que son deliberadas y parecen errores:
 *
 * **1. Carga seis familias tipográficas.** Incumple la regla 7 de
 * `docs/diseno.md` a propósito: comparar tres propuestas tipográficas con las
 * fuentes equivocadas no compara nada. Ver `tipografias.ts`.
 *
 * **2. Tiene CSS a mano en vez de utilidades de Tailwind.** Las tres direcciones
 * necesitan tres juegos de variables simultáneos en la misma página, que es
 * justo lo que un sistema de tokens único no puede representar. Y fijar tokens
 * hoy sería decidir antes de mirar.
 *
 * **3. El conmutador es CSS puro**, con tres `input[type=radio]` ocultos y
 * selectores de hermano. Sin `"use client"`, sin estado, sin JavaScript: la
 * página es HTML estático y funciona igual con el JS apagado.
 *
 * `noindex` va por metadata y **no** por `Disallow` en `robots.txt`. Son cosas
 * distintas y combinarlas es un error clásico: un `Disallow` impide el rastreo,
 * así que el buscador nunca llega a leer el `noindex` y la página puede terminar
 * indexada igual. Por eso `app/robots.ts` sigue con la lista vacía.
 */

export const metadata: Metadata = {
  title: "Muestra de dirección visual",
  robots: { index: false, follow: false },
};

/* ------------------------------------------------------------------ */
/* Las tres direcciones                                                 */
/* ------------------------------------------------------------------ */

type Color = { nombre: string; hex: string };

type Direccion = {
  id: string;
  clase: string;
  letra: string;
  nombre: string;
  subtitulo: string;
  tesis: string;
  paleta: Color[];
  /** Familias tal como se anuncian en `docs/diseno.md`. */
  familias: string;
  escala: { rol: string; medida: string; css: string; titulo: boolean }[];
  espaciado: number[];
  /** Solo B: la foto sangra en teléfono y admite banda sólida. */
  sangra: boolean;
  /** Solo C: numeración visible y módulos de grilla de tres tamaños. */
  numerada: boolean;
  /** Cómo le va al amarillo del logo contra el fondo de esta dirección. */
  marca: {
    /** Contraste medido del amarillo contra el fondo, en formato «1,13:1». */
    contraste: string;
    veredicto: string;
    /** Solo B: el logo es negro y sobre fondo oscuro desaparece. */
    logoIlegible?: boolean;
  };
  nota: string;
};

/** El amarillo del logo, medido del archivo: amarillo proceso, croma máximo. */
const AMARILLO = "#FFF100";

/** El negro del logo. No es el mismo negro que usa ninguna de las tres. */
const NEGRO_LOGO = "#211F20";

const DIRECCIONES: Direccion[] = [
  {
    id: "cal",
    clase: "dir-cal",
    letra: "A",
    nombre: "Cal",
    subtitulo: "El papel cálido",
    tesis:
      "El papel hace el trabajo. Un fondo de cal, apagado y cálido, integra " +
      "las fotos desparejas rodeándolas de aire en vez de enmarcándolas. La " +
      "foto nunca toca el borde de la pantalla: entra en la misma columna que " +
      "el texto y alineada al mismo margen, así la página se lee como una sola " +
      "columna editorial.",
    paleta: [
      { nombre: "Fondo", hex: "#F6F2EC" },
      { nombre: "Superficie", hex: "#EFE9E0" },
      { nombre: "Texto", hex: NEGRO_LOGO },
      { nombre: "Texto suave", hex: "#6B645C" },
      { nombre: "Acento (enlaces)", hex: NEGRO_LOGO },
      { nombre: "Línea", hex: "#DED6CA" },
      { nombre: "Marca (logo)", hex: AMARILLO },
    ],
    familias: "Fraunces (títulos) · Karla (texto)",
    escala: [
      {
        rol: "Display",
        medida: "32 → 56 px",
        css: "clamp(32px, 5.2vw, 56px)",
        titulo: true,
      },
      {
        rol: "Título",
        medida: "24 → 34 px",
        css: "clamp(24px, 3.2vw, 34px)",
        titulo: true,
      },
      {
        rol: "Subtítulo",
        medida: "19 → 22 px",
        css: "clamp(19px, 2vw, 22px)",
        titulo: true,
      },
      {
        rol: "Cuerpo",
        medida: "17 → 18 px",
        css: "clamp(17px, 1.6vw, 18px)",
        titulo: false,
      },
      { rol: "Meta", medida: "13 px", css: "13px", titulo: false },
    ],
    espaciado: [4, 8, 12, 16, 24, 32, 48, 64, 112],
    sangra: false,
    numerada: false,
    marca: {
      contraste: "1,06:1",
      veredicto:
        "ESTA ES LA ELEGIDA, con el acento de C incorporado. El terracota se " +
        "fue —era el vecino de al lado del amarillo y competía con él— y el " +
        "acento pasó a ser el negro del propio logo. Queda el punto que no se " +
        "puede arreglar con paleta: el papel de cal ES un amarillo " +
        "desaturado, así que el amarillo del logo cae sobre su propio tono y " +
        "da 1,06:1. Por eso el botón de acá abajo es negro y no amarillo, y " +
        "el amarillo se queda en el logo y como forma que nunca es el único " +
        "indicio de algo.",
    },
    nota:
      "DIRECCIÓN ELEGIDA — decisión 43. Sus valores ya están fijados como " +
      "tokens en app/globals.css. Lo que queda por mirar: si la foto floja " +
      "—la portada del roller, donde la cortina es una franja— se salva con el " +
      "aire de alrededor, y si el conjunto se lee cálido o se lee blando.",
  },
  {
    id: "contraluz",
    clase: "dir-contraluz",
    letra: "B",
    nombre: "Contraluz",
    subtitulo: "La sombra",
    tesis:
      "El archivo entero es lo mismo: una ventana encendida dentro de un cuarto " +
      "oscuro. Si la interfaz adopta la oscuridad del cuarto, cada foto pasa a " +
      "ser lo que ya era en la realidad, la fuente de luz. No hace falta marco: " +
      "el contraste lo pone el fondo.",
    paleta: [
      { nombre: "Fondo", hex: "#1A1714" },
      { nombre: "Superficie", hex: "#242019" },
      { nombre: "Texto", hex: "#EDE7DD" },
      { nombre: "Texto suave", hex: "#A2988A" },
      { nombre: "Acento", hex: "#C98A3E" },
      { nombre: "Línea", hex: "#3A332B" },
      { nombre: "Marca (logo)", hex: AMARILLO },
    ],
    familias: "Spectral (títulos) · Barlow (texto)",
    escala: [
      {
        rol: "Display",
        medida: "34 → 60 px",
        css: "clamp(34px, 5.6vw, 60px)",
        titulo: true,
      },
      {
        rol: "Título",
        medida: "25 → 36 px",
        css: "clamp(25px, 3.4vw, 36px)",
        titulo: true,
      },
      {
        rol: "Subtítulo",
        medida: "19 → 22 px",
        css: "clamp(19px, 2vw, 22px)",
        titulo: true,
      },
      {
        rol: "Cuerpo",
        medida: "17 → 18 px",
        css: "clamp(17px, 1.6vw, 18px)",
        titulo: false,
      },
      { rol: "Meta", medida: "13 px", css: "13px", titulo: false },
    ],
    espaciado: [4, 8, 12, 16, 24, 32, 48, 72, 120],
    sangra: true,
    numerada: false,
    marca: {
      contraste: "15,16:1",
      veredicto:
        "Es donde el amarillo rinde más: sobre el oscuro sirve incluso como " +
        "color de texto, que en las otras dos es imposible. Pero el logo es " +
        "NEGRO sobre transparente, así que sobre este fondo desaparece. " +
        "Hay que pedirle a la empresa una versión invertida, o meterlo en una " +
        "placa blanca — que es lo de abajo, y se ve como una calcomanía pegada.",
      logoIlegible: true,
    },
    nota:
      "Lo que hay que mirar acá: si las fotos de hormigón gris —la compacta en " +
      "el living, la oficina vacía— se embarran contra el fondo oscuro. Y si un " +
      "sitio oscuro no contradice el mensaje, que es luz natural entrando a una " +
      "casa. Es la dirección que más puede ganar y la que más puede fallar.",
  },
  {
    id: "regla",
    clase: "dir-regla",
    letra: "C",
    nombre: "Regla",
    subtitulo: "La grilla que cura",
    tesis:
      "La foto pone la calidez y la textura; la interfaz pone únicamente orden. " +
      "Papel casi neutro, un solo grotesco en dos tamaños muy separados, filetes " +
      "de 1 px como único recurso gráfico y numeración visible en monoespaciada. " +
      "El tamaño del módulo que le toca a cada foto es la curaduría, y el " +
      "único color de la interfaz es el amarillo del logo.",
    paleta: [
      { nombre: "Fondo", hex: "#F8F6F2" },
      { nombre: "Superficie", hex: "#EFEDE7" },
      { nombre: "Texto", hex: NEGRO_LOGO },
      { nombre: "Texto suave", hex: "#6E6A64" },
      { nombre: "Acento (enlaces)", hex: NEGRO_LOGO },
      { nombre: "Línea", hex: "#DCD8D1" },
      { nombre: "Marca (logo)", hex: AMARILLO },
    ],
    familias: "Chivo (todo) · DM Mono (numeración y metadatos)",
    escala: [
      {
        rol: "Display",
        medida: "40 → 72 px",
        css: "clamp(40px, 6.6vw, 72px)",
        titulo: true,
      },
      {
        rol: "Título",
        medida: "22 → 26 px",
        css: "clamp(22px, 2.4vw, 26px)",
        titulo: true,
      },
      {
        rol: "Cuerpo",
        medida: "16 → 17 px",
        css: "clamp(16px, 1.5vw, 17px)",
        titulo: false,
      },
      { rol: "Meta (mono)", medida: "12 px", css: "12px", titulo: false },
    ],
    espaciado: [4, 8, 12, 16, 24, 32, 56, 96],
    sangra: false,
    numerada: true,
    marca: {
      contraste: "1,09:1",
      veredicto:
        "Tampoco alcanza para texto —ningún fondo claro alcanza— pero acá el " +
        "papel es casi neutro y el amarillo se lee limpio y deliberado. Esta " +
        "dirección ya incorpora la marca: el papel subió un paso hacia el " +
        "cálido de Cal y se frenó donde el amarillo todavía aguanta, el texto " +
        "pasó a ser el negro del propio logo y el oliva se fue. Quedan los " +
        "tres colores del logo y ninguno más: papel, negro y amarillo.",
    },
    nota:
      "Lo que hay que mirar acá: si la numeración y los filetes se leen como " +
      "rigor editorial o como pliego técnico. Y sobre todo si la grilla cumple " +
      "lo que promete: mirá la galería, donde la foto buena ocupa seis columnas " +
      "y la de 1600 px ocupa tres, y fijate si eso se lee como una decisión o " +
      "como una foto que sobró.",
  },
];

/* ------------------------------------------------------------------ */
/* Piezas                                                               */
/* ------------------------------------------------------------------ */

/** Un módulo de foto que conserva la proporción propia de la foto. */
function Lamina({
  foto,
  alt,
  sizes,
  prioridad,
}: {
  foto: Foto;
  alt: string;
  sizes: string;
  prioridad?: boolean;
}) {
  return (
    <div
      className="marco"
      style={{ aspectRatio: `${foto.ancho} / ${foto.alto}` }}
    >
      <FotoImg foto={foto} alt={alt} sizes={sizes} prioridad={prioridad} />
    </div>
  );
}

/**
 * Los tres tamaños de módulo de la dirección C, con el `sizes` que le
 * corresponde a cada uno.
 *
 * **El módulo sale de la tabla de calidad de `docs/diseno.md`, no del orden de
 * la foto.** Es toda la tesis de «Regla»: si el tamaño se asignara por posición,
 * la grilla no curaría nada — le tocaría el módulo grande a la foto que salió
 * primera, que es justo lo que no queremos.
 */
const MODULOS = {
  grande: {
    clase: "mod-grande",
    sizes: "(max-width: 899px) calc(100vw - 40px), 580px",
  },
  media: {
    clase: "mod-media",
    sizes: "(max-width: 899px) calc(100vw - 40px), 385px",
  },
  apoyo: {
    clase: "mod-apoyo",
    sizes: "(max-width: 899px) calc(50vw - 26px), 290px",
  },
} as const;

type Modulo = keyof typeof MODULOS;

function Panel({ d }: { d: Direccion }) {
  const cortinas = productoPorSlug("cortinas-tela");
  const roller = productoPorSlug("roller");
  const toldos = productoPorSlug("toldos");
  const pvc = productoPorSlug("venecianas-pvc");

  if (!cortinas || !roller || !toldos || !pvc) {
    throw new Error(
      "La muestra necesita cortinas-tela, roller, toldos y venecianas-pvc en contenido/productos.ts",
    );
  }

  /* Las dos puntas del archivo, juntas a propósito: la mejor portada y la peor.
     Si una dirección solo funciona con la buena, no sirve. */
  const tarjetas = [cortinas, roller];

  /*
   * La galería es la de Cortinas de tela por dos razones a la vez: es el único
   * producto cuyas tres fotos cubren el rango completo de la tabla de calidad
   * —grande, media, apoyo— y además tiene una variante «Riel motorizado» con
   * video propio, así que el video cae donde de verdad le toca.
   */
  const galeria: { foto: Foto; modulo: Modulo }[] = [
    { foto: cortinas.fotos[0], modulo: "grande" },
    { foto: cortinas.fotos[1], modulo: "media" },
    { foto: cortinas.fotos[2], modulo: "apoyo" },
  ];

  const anchoTarjeta =
    "(max-width: 639px) calc(100vw - 2 * var(--margen, 20px)), 480px";
  const anchoGaleria = d.sangra
    ? "(max-width: 899px) 100vw, 520px"
    : "(max-width: 899px) calc(100vw - 40px), 520px";

  const claseModulo = (m: Modulo) =>
    d.numerada ? MODULOS[m].clase : undefined;
  const sizesModulo = (m: Modulo) =>
    d.numerada ? MODULOS[m].sizes : anchoGaleria;

  return (
    <section
      id={`panel-${d.id}`}
      className={`panel ${d.clase}`}
      aria-label={`Dirección ${d.letra} · ${d.nombre}`}
    >
      <div className="caja">
        {/* Cabecera --------------------------------------------------- */}
        <header>
          <p className="rotulo" style={{ marginBottom: 12 }}>
            Dirección {d.letra} · {d.subtitulo}
          </p>
          <h2 className="titular">{d.nombre}</h2>
          <p className="tesis">{d.tesis}</p>
        </header>

        {/* La marca --------------------------------------------------- */}
        <section className="bloque">
          <h3 className="rotulo">La marca sobre este fondo</h3>

          <div className="marca-fila">
            <div className="marca-plancha">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/muestra-logo.png"
                width={524}
                height={145}
                alt="Espacio Cortinas"
              />
            </div>
            {d.marca.logoIlegible && (
              <div className="marca-plancha marca-placa">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/muestra-logo.png"
                  width={524}
                  height={145}
                  alt="Espacio Cortinas, sobre una placa blanca"
                />
              </div>
            )}
          </div>

          <ul className="marca-datos">
            <li>
              <div
                className="muestra-color"
                style={{ background: AMARILLO }}
                aria-hidden="true"
              />
              <b>Amarillo del logo</b>
              <code>{AMARILLO}</code>
            </li>
            <li>
              <div
                className="muestra-color"
                style={{ background: NEGRO_LOGO }}
                aria-hidden="true"
              />
              <b>Negro del logo</b>
              <code>{NEGRO_LOGO}</code>
            </li>
          </ul>

          <p className="pie">
            Contraste del amarillo contra el fondo de esta dirección:{" "}
            <b>{d.marca.contraste}</b>. Hace falta 4,5:1 para texto.{" "}
            {Number(d.marca.contraste.replace(",", ".").split(":")[0]) >= 4.5
              ? "Acá sí alcanza."
              : "Acá no alcanza, ni de lejos: el amarillo no puede ser color de texto, ni de enlace, ni de línea fina."}
          </p>

          <p className="pie">
            A la izquierda, el CTA de esta dirección. A la derecha, el mismo
            botón en amarillo: el texto negro encima da 13,92:1, pero el bloque
            contra el papel da {d.marca.contraste} — sobre un fondo claro se
            apaga, sobre el oscuro de B se enciende.
          </p>
          <p className="botones">
            <span className="boton">Consultar por WhatsApp</span>
            <span className="boton boton-marca">Consultar por WhatsApp</span>
          </p>

          <p className="nota" style={{ marginTop: 24 }}>
            <b>Veredicto. </b>
            {d.marca.veredicto}
          </p>
        </section>

        {/* Paleta ----------------------------------------------------- */}
        <section className="bloque">
          <h3 className="rotulo">Paleta</h3>
          <ul className="paleta">
            {d.paleta.map((c) => (
              <li key={c.nombre}>
                <div
                  className="muestra-color"
                  style={{ background: c.hex }}
                  aria-hidden="true"
                />
                <b>{c.nombre}</b>
                <code>{c.hex}</code>
              </li>
            ))}
          </ul>
        </section>

        {/* Tipografía ------------------------------------------------- */}
        <section className="bloque">
          <h3 className="rotulo">Escala tipográfica</h3>
          <p className="pie" style={{ marginTop: -8, marginBottom: 16 }}>
            {d.familias}
          </p>
          <ul className="escala">
            {d.escala.map((e) => (
              <li key={e.rol}>
                <span className="medida">
                  {e.rol} · {e.medida}
                </span>
                <p
                  style={{
                    fontFamily: e.titulo
                      ? "var(--fuente-titulo)"
                      : "var(--fuente-texto)",
                    fontSize: e.css,
                    lineHeight: 1.2,
                    letterSpacing: e.titulo ? "-0.015em" : undefined,
                  }}
                >
                  Cortinas a medida en Buenos Aires
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Espaciado -------------------------------------------------- */}
        <section className="bloque">
          <h3 className="rotulo">Escala de espaciado</h3>
          <ul className="espaciado">
            {d.espaciado.map((v) => (
              <li key={v}>
                <span>{v}</span>
                <i style={{ width: v }} />
              </li>
            ))}
          </ul>
          <p className="pie">
            Múltiplos de 4. El último valor es el ritmo entre secciones en
            escritorio.
          </p>
        </section>

        {/* Tarjeta de producto ---------------------------------------- */}
        <section className="bloque">
          <h3 className="rotulo">Tarjeta de producto</h3>
          <ul className="tarjetas">
            {tarjetas.map((p, i) => {
              const portada = p.fotos[0];
              if (!portada) return null;
              return (
                <li key={p.slug} className="tarjeta">
                  <div className={`marco marco-45 ${d.sangra ? "sangra" : ""}`}>
                    <FotoImg
                      foto={portada}
                      alt={altAutomatico(p.nombre, 1)}
                      sizes={anchoTarjeta}
                      prioridad={i === 0}
                    />
                  </div>
                  {d.numerada && (
                    <span className="meta">
                      {String(i + 1).padStart(2, "0")} / 07
                    </span>
                  )}
                  <h4>{p.nombre}</h4>
                  <p>{p.descripcion}</p>
                  {p.variantes.length > 0 && (
                    <ul className="chips">
                      {p.variantes.map((v) => (
                        <li key={v.nombre}>{v.nombre}</li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="pie">
            Las dos puntas del archivo, juntas a propósito: a la izquierda la
            mejor portada que hay, a la derecha una donde el producto es una
            franja que casi no se ve. Las dos son 4:5 y las dos van a aparecer
            en el mismo listado.
          </p>
        </section>

        {/* Galería ---------------------------------------------------- */}
        <section className="bloque">
          <h3 className="rotulo">Galería, con el video de la variante</h3>
          <ul
            className="galeria"
            aria-label="Galería del producto Cortinas de tela"
          >
            {galeria.map(({ foto, modulo }, i) => (
              <li key={foto.carpeta} className={claseModulo(modulo)}>
                <Lamina
                  foto={foto}
                  alt={altAutomatico(cortinas.nombre, i + 1)}
                  sizes={sizesModulo(modulo)}
                />
                {d.numerada && (
                  <p className="pie">
                    {String(i + 1).padStart(2, "0")} · {foto.ancho}×{foto.alto}{" "}
                    · módulo {modulo}
                  </p>
                )}
              </li>
            ))}
            <li className={claseModulo("media")}>
              <div
                className={`marco ${d.sangra && !d.numerada ? "sangra" : ""}`}
                style={{ aspectRatio: "16 / 9" }}
              >
                {/*
                  El video va DENTRO de la galería, en la posición de la variante
                  que documenta —«Riel motorizado» es una variante de Cortinas de
                  tela—, y no como protagonista de la página: son 1280 px y 16:9,
                  así que no entra en el ritmo 4:5 ni se puede mostrar grande
                  (docs/diseno.md, «Movimiento»). Cablearlo de verdad —incluido el
                  cuadro de cartel y el respeto por `prefers-reduced-motion`— es
                  de la Fase 4.4.
                */}
                <video
                  src="/videos/cortinas-tela/riel-motorizado.mp4"
                  width={1280}
                  height={720}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="Cortina de tela sobre riel motorizado, abriéndose"
                />
              </div>
              <p className="pie">
                {d.numerada && "04 · 1280×720 · "}Variante «Riel motorizado». Es
                lo único que una foto no puede mostrar.
              </p>
            </li>
          </ul>
          <p className="pie">
            El único producto cuyas tres fotos cubren el rango entero: la mejor
            del archivo, una correcta y una con muebles embalados. En «Regla» el
            módulo de cada una sale de esa tabla de calidad y no del orden.
          </p>
        </section>

        {/* El caso difícil -------------------------------------------- */}
        <section className="bloque">
          <h3 className="rotulo">El caso difícil</h3>
          <ul className="galeria">
            <li className={claseModulo("apoyo")}>
              <Lamina
                foto={toldos.fotos[2]}
                alt={altAutomatico(toldos.nombre, 3)}
                sizes={sizesModulo("apoyo")}
              />
              <p className="pie">
                1600 × 900. La única foto del archivo que no llegó a las cuatro
                medidas: nunca va a poder mostrarse grande.
              </p>
            </li>
            <li className={claseModulo("apoyo")}>
              <Lamina
                foto={pvc.fotos[1]}
                alt={altAutomatico(pvc.nombre, 2)}
                sizes={sizesModulo("apoyo")}
              />
              <p className="pie">
                Obra en curso: caja de herramientas y trapos en el piso. Va a
                volver a pasar, porque es el momento en que se instala.
              </p>
            </li>
          </ul>
        </section>

        {/* Texto sobre foto, solo en B -------------------------------- */}
        {d.sangra && (
          <section className="bloque">
            <h3 className="rotulo">Texto sobre foto, con banda sólida</h3>
            <div
              className="marco marco-45 sangra"
              style={{ maxWidth: 520, position: "relative" }}
            >
              <FotoImg
                foto={cortinas.fotos[0]}
                alt={altAutomatico(cortinas.nombre, 1)}
                sizes="(max-width: 899px) 100vw, 520px"
              />
              <div className="banda">
                <h4>Cortinas de tela</h4>
                <span>Riel, barral, blackout y translúcidas</span>
              </div>
            </div>
            <p className="pie" style={{ maxWidth: 520 }}>
              Banda <b>opaca</b> del color de fondo, no gradiente y no velo
              translúcido: es lo único que garantiza contraste cuando la zona
              clara cambia de lugar en cada foto. Esta es la única de las tres
              direcciones que lo admite, y está acá para poder rechazarlo.
            </p>
          </section>
        )}

        {/* Bloque de texto -------------------------------------------- */}
        <section className="bloque">
          <h3 className="rotulo">Bloque de texto</h3>
          <div className="lectura">
            <h4>Cortinas de tela</h4>
            <p>{cortinas.descripcion}</p>
            <p>
              La colocación no es un producto aparte: asesoramos, fabricamos a
              medida e instalamos. Trabajamos en toda Buenos Aires, con
              particulares, estudios de arquitectura y oficinas.
            </p>
            <p>
              <a href="#panel-cal">Ver los trabajos realizados</a>
            </p>
            <a className="boton" href="#panel-cal">
              Consultar por WhatsApp
            </a>
          </div>
        </section>

        {/* Nota ------------------------------------------------------- */}
        <section className="bloque">
          <p className="nota">
            <b>Qué mirar en esta dirección. </b>
            {d.nota}
          </p>
        </section>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export default function Muestra() {
  return (
    <div className={`muestra ${clasesDeFuentes}`}>
      <div className="muestra-intro">
        <h1>Fase 4.1 · Tres direcciones visuales</h1>
        <p>
          Página de decisión, no del sitio. Se borra en la Fase 4.5. Las fotos y
          el video son los reales; los textos también. Pesa alrededor de 3 MB
          porque el video se carga en las tres direcciones: mejor con wifi.
        </p>
        <p>
          <strong>Mirala primero en el teléfono.</strong> Tocá una dirección,
          bajá entera, y volvé a la siguiente. El orden que conviene: tarjeta de
          producto → galería → el caso difícil → bloque de texto.
        </p>
      </div>

      {/*
        Conmutador sin JavaScript: tres radios ocultos pero enfocables y
        selectores de hermano en `muestra.css`. La página es HTML estático y
        funciona con el JS apagado.
      */}
      <input
        type="radio"
        name="direccion"
        id="dir-cal"
        className="muestra-radio"
        defaultChecked
      />
      <input
        type="radio"
        name="direccion"
        id="dir-contraluz"
        className="muestra-radio"
      />
      <input
        type="radio"
        name="direccion"
        id="dir-regla"
        className="muestra-radio"
      />

      <div className="barra">
        {DIRECCIONES.map((d) => (
          <label key={d.id} htmlFor={`dir-${d.id}`}>
            {d.letra} · {d.nombre}
          </label>
        ))}
      </div>

      <div className="paneles">
        {DIRECCIONES.map((d) => (
          <Panel key={d.id} d={d} />
        ))}
      </div>
    </div>
  );
}
