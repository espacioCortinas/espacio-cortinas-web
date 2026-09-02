import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import cacheDeAssets from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

/**
 * Configuración del adaptador de Cloudflare para Next.
 *
 * ## El caché incremental: qué se sacó y qué hubo que volver a poner
 *
 * Tenía un caché incremental compartido —Workers KV para las páginas y D1 para
 * las etiquetas— porque el panel revalidaba rutas al guardar y, sin un almacén
 * compartido, esa revalidación tocaba una sola instancia del Worker mientras el
 * resto seguía sirviendo lo viejo. **Al sacar el panel dejó de haber qué
 * revalidar** (decisión 36) y los dos recursos se borraron.
 *
 * Lo que esa decisión no vio: el caché incremental **no sirve solo para
 * revalidar, también es de donde el servidor lee las páginas prerenderizadas**.
 * Sin ninguno configurado, el adaptador deja el `dummy`, que siempre falla la
 * búsqueda. Una ruta estática se vuelve a renderizar y no se nota. Una ruta
 * dinámica con `dynamicParams = false` —`/productos/[slug]`— no puede
 * renderizarse fuera de su lista de params, así que **devuelve 404**.
 *
 * Se descubrió en la Fase 4.0 con `npm run preview`, después de que
 * `npm run build` y `npm run dev` mostraran la página perfecta. Decisión 39.
 *
 * ## Por qué este override y no volver a KV
 *
 * `staticAssetsIncrementalCache` guarda las páginas prerenderizadas entre los
 * assets estáticos del Worker, que ya es donde vive el resto del sitio. Es el
 * override que la documentación del adaptador marca para aplicaciones que **no
 * quieren revalidación y solo sirven contenido prerenderizado**, que es
 * exactamente este sitio desde la decisión 36. No agrega ningún recurso de
 * Cloudflare que administrar, ni namespace, ni base.
 *
 * **Sin `tagCache`, y a propósito.** Sin él `revalidatePath()` no hace nada y
 * no avisa (decisión 29). Acá nadie lo llama: el contenido es parte del build.
 * Si alguna vez vuelve a haber contenido que cambie sin build, hay que enchufar
 * las dos piezas, no una.
 */
export default defineCloudflareConfig({
  incrementalCache: cacheDeAssets,
});
