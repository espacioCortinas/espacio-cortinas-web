import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

/**
 * Configuración del adaptador de Cloudflare para Next.
 *
 * Acá vive la pieza que hace cierta la promesa del panel: «guardo y lo veo
 * enseguida». Sin caché compartido, `revalidatePath()` desde una Server Action
 * invalida la copia de UNA instancia del Worker y todas las demás siguen
 * sirviendo la página vieja hasta que se les ocurra vencer. La administradora
 * guardaría un cambio, recargaría, y lo vería o no según qué instancia la
 * atienda. Ver decisión 29 de docs/decisiones.md.
 *
 * Son DOS piezas y conviene no confundirlas, porque la de arriba sola no
 * alcanza y es el error fácil de cometer:
 *
 *   incrementalCache → DÓNDE se guarda la página ya renderizada
 *   tagCache         → CUÁNDO se revalidó cada etiqueta, o sea quién decide
 *                      si lo guardado todavía sirve
 *
 * `revalidatePath()` no borra nada: anota en el tagCache que la etiqueta de
 * esa ruta se revalidó recién. En la siguiente visita el adaptador compara esa
 * marca contra la fecha de lo guardado, y si es más nueva trata la entrada
 * como inexistente: Next vuelve a renderizar en esa misma petición y devuelve
 * lo nuevo. **No hay ventana de espera.**
 */
export default defineCloudflareConfig({
  /**
   * Workers KV, no R2.
   *
   * R2 es lo que recomienda la documentación de OpenNext, y no se puede: R2
   * hay que habilitarlo desde el panel de Cloudflare con un método de pago
   * cargado, y esta cuenta es de la empresa y está en plan gratuito.
   * `wrangler r2 bucket list` responde «Please enable R2 through the
   * Cloudflare Dashboard» (código 10042).
   *
   * La objeción a KV es que es de consistencia eventual: una escritura puede
   * tardar hasta 60 s en verse desde otra región. Acá eso no se traduce en
   * contenido viejo, y la razón es la de arriba — quien decide si algo está
   * vencido no es esta caché, es el tagCache, que es D1 y sí es fuertemente
   * consistente. Si KV devolviera una copia atrasada, su fecha sería MÁS VIEJA
   * que la marca de revalidación y el adaptador la descartaría igual. El peor
   * caso es renderizar de más durante un minuto, no mostrar lo viejo.
   *
   * Donde la consistencia eventual sí dolería es en el tagCache, y por eso ese
   * no es de KV.
   */
  incrementalCache: kvIncrementalCache,

  /**
   * D1, no el tagCache de KV ni el de Durable Objects.
   *
   * El de KV existe (`kv-next-tag-cache`) y ahorraría un recurso, pero está
   * marcado experimental en el propio adaptador y avisa que «las
   * revalidaciones pueden tardar hasta 60 s en aplicarse». Eso es exactamente
   * la promesa que esta fase tiene que cumplir, así que queda descartado.
   *
   * El de Durable Objects (`doShardedTagCache`) es el que la documentación
   * recomienda para tráfico alto o revalidaciones frecuentes. Este sitio es lo
   * contrario: una persona cargando contenido unas veces por mes.
   *
   * La tabla `revalidations` la crea `opennextjs-cloudflare deploy` en cada
   * despliegue. Por eso el comando de despliegue no puede ser `wrangler
   * deploy` pelado.
   */
  tagCache: d1NextTagCache,

  /**
   * SIN `queue`, a propósito, y esto es lo que hay que revisar en la Fase 4.
   *
   * El `queue` del adaptador NO interviene en la revalidación bajo demanda
   * —la del panel, que es la que importa acá— sino en la revalidación POR
   * TIEMPO: la de una página declarada con `revalidate: 60`, que al vencer se
   * regenera de fondo. Este sitio no tiene ninguna: el contenido cambia solo
   * cuando la administradora guarda, y ahí ya hay un `revalidatePath()`
   * explícito. Un `queue` hoy sería un Durable Object más una referencia de
   * servicio para algo que nunca se dispara.
   *
   * **Si en la Fase 4 alguna página pública se declara con `revalidate: N`,
   * hay que agregar el `queue` en el mismo movimiento.** Sin él esa página no
   * se regenera sola: el adaptador intenta encolar, falla, y lo anota en los
   * registros del Worker sin que nada más se entere. Sigue sirviendo la
   * versión guardada, así que no se cae — simplemente se congela.
   */
});
