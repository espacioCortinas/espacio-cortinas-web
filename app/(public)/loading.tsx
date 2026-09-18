import { Cargando } from "@/components/ui/boton";
import { CLASES_CONTENEDOR } from "@/components/ui/contenedor";

/**
 * Mientras una página pública todavía no llegó.
 *
 * **Se ve poco y sirve igual.** Todas las rutas de este sitio son estáticas, así
 * que la primera visita no espera nada: el HTML ya está escrito. Lo que sí
 * espera es el salto de una página a otra ya estando adentro del sitio, cuando
 * Next va a buscar la siguiente por la red. Con una conexión de teléfono en la
 * calle eso son unos segundos en los que, sin este archivo, no pasa nada
 * visible y se toca el enlace dos veces.
 *
 * **No es un esqueleto de contenido falso.** Dibujar bloques grises con la forma
 * aproximada de una grilla de fotos promete una composición que después puede
 * no coincidir, y con `prefers-reduced-motion` hay que apagarle el brillo igual.
 * Una línea que dice qué está pasando, anunciada con `role="status"`, informa lo
 * mismo y no miente.
 *
 * La rueda respeta `prefers-reduced-motion` —queda quieta— y por eso el texto
 * también está: es el que informa cuando la rueda no se mueve.
 */
export default function CargandoPagina() {
  return (
    <div className={`${CLASES_CONTENEDOR} py-16 md:py-28`}>
      <Cargando>Cargando…</Cargando>
    </div>
  );
}
