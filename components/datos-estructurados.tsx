import { entornoPublico } from "@/lib/entorno";
import { DESCRIPCION_SITIO } from "@/lib/metadata";

/**
 * Datos estructurados del negocio, en JSON-LD.
 *
 * Es lo que le dice a Google que acá hay una empresa que atiende una zona, y
 * no un sitio cualquiera. Para las búsquedas locales —«cortinas roller zona
 * norte»— pesa junto con el Perfil de Empresa de Google, que es el otro alta
 * pendiente (docs/plan.md, Fase 5).
 *
 * **Solo se declara lo que sabemos que es cierto.** Falta el dato central de
 * un negocio local, que es la dirección: la empresa trabaja a domicilio en
 * todo Buenos Aires y no hay local a la calle documentado en
 * `docs/infraestructura.md`. Sin `address`, Google puede leer la ficha pero no
 * la muestra como resultado enriquecido. Inventar una dirección o un horario
 * para completar el formato sería publicar un dato falso sobre la empresa, que
 * es peor que no aparecer. Queda anotado como material pendiente.
 */
export function DatosEstructurados() {
  const numero = entornoPublico.whatsapp;

  const negocio = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Espacio Cortinas",
    description: DESCRIPCION_SITIO,
    url: entornoPublico.urlSitio,
    // No es la dirección del local: es la zona donde la empresa trabaja, que
    // es lo que este negocio sí tiene definido (docs/producto.md).
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Buenos Aires, Argentina",
    },
    // El número del sitio es el de WhatsApp, y entra recién en la Fase 4.6.
    ...(numero ? { telephone: `+${numero.replace(/\D/g, "")}` } : {}),
  };

  return (
    <script
      type="application/ld+json"
      // El contenido sale de constantes y de una variable de entorno propia,
      // no de nada que escriba un visitante. Aun así se escapa `<`, que es lo
      // único que puede cerrar la etiqueta antes de tiempo.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(negocio).replace(/</g, "\u003c"),
      }}
    />
  );
}
