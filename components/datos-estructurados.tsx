import { productosPublicados } from "@/contenido";
import { contacto } from "@/contenido/contacto";
import { logo } from "@/contenido/marca";
import { entornoPublico } from "@/lib/entorno";
import {
  DESCRIPCION_SITIO,
  imagenParaCompartir,
  urlAbsoluta,
} from "@/lib/metadata";
import { numeroInternacional } from "@/lib/whatsapp";

/**
 * La ficha del negocio, en JSON-LD.
 *
 * Es lo que le dice a un buscador —y a un asistente de IA que lee la página—
 * que acá hay una empresa que atiende una zona, qué hace y cómo contactarla. La
 * pregunta que tiene que poder contestar es del tipo «¿a quién le compro
 * cortinas en zona norte?», y para eso hacen falta tres cosas: qué vende, dónde
 * trabaja y un teléfono. Para las búsquedas locales pesa junto con el Perfil de
 * Empresa de Google, que es el otro alta pendiente (docs/plan.md, Fase 5).
 *
 * **Todo sale de `contenido/contacto.ts` y de las variables de entorno**, que
 * es de donde lo leen también la página de contacto y el pie: los tres dicen
 * siempre lo mismo.
 *
 * # Qué campos tiene y por qué
 *
 * - `@type` es `HomeAndConstructionBusiness`, el tipo de `LocalBusiness` que
 *   schema.org define para quien presta servicios en casas y edificios. Es más
 *   preciso que el genérico, y la colocación propia es justo lo que distingue a
 *   este negocio (docs/producto.md).
 * - **`areaServed` es el más importante**: la pregunta siempre trae un lugar.
 *   Una zona por entrada, con su nombre, como la escribe la gente.
 * - `telephone` es el de WhatsApp salvo que la empresa tenga otro para llamar.
 * - `knowsAbout` lista el catálogo, sacado del mismo arreglo que `/productos`:
 *   «cortinas» sola no dice si hacen rollers, venecianas o toldos.
 * - `sameAs` son las redes y el Perfil de Empresa, cuando exista.
 * - `image` es la imagen que se ve al compartir Inicio: **una foto**, con el
 *   logo en una banda abajo. schema.org pide ahí una imagen del negocio, y el
 *   logo solo ya va en `logo`. Hasta la decisión 63 era el logo sobre el papel.
 *
 * # Lo que NO tiene, a propósito
 *
 * **Ni dirección ni horario.** La empresa trabaja a domicilio y no dio ninguno
 * de los dos para publicar. Sin `address`, Google lee la ficha pero no la
 * muestra como resultado enriquecido, y eso es preferible a publicar un dato
 * falso sobre la empresa. Entran en `contenido/contacto.ts` el día que la
 * empresa los dé.
 */
export function DatosEstructurados() {
  const telefono = contacto.telefono?.internacional ?? numeroInternacional();
  const mismoPerfil = [
    ...contacto.redes.map((red) => red.url),
    ...(contacto.perfilDeGoogle ? [contacto.perfilDeGoogle] : []),
  ];

  const negocio = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${entornoPublico.urlSitio}/#negocio`,
    name: "Espacio Cortinas",
    description: DESCRIPCION_SITIO,
    url: entornoPublico.urlSitio,
    logo: urlAbsoluta(logo.ruta),
    image: urlAbsoluta(imagenParaCompartir("/").ruta),
    telephone: telefono,
    email: contacto.email,
    areaServed: contacto.zonas.map((zona) => ({
      "@type": "AdministrativeArea",
      name: zona,
    })),
    knowsAbout: productosPublicados().map((producto) => producto.nombre),
    ...(mismoPerfil.length > 0 ? { sameAs: mismoPerfil } : {}),
  };

  return (
    <script
      type="application/ld+json"
      // El contenido sale de archivos del repositorio y de variables de
      // entorno propias, no de nada que escriba un visitante. Aun así se escapa
      // `<`, que es lo único que puede cerrar la etiqueta antes de tiempo.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(negocio).replace(/</g, "\\u003c"),
      }}
    />
  );
}
