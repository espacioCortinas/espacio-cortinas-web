import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Configuración del adaptador de Cloudflare para Next.
 *
 * Vuelve a ir sin overrides. Tenía un caché incremental compartido —Workers KV
 * para las páginas y D1 para las etiquetas— porque el panel revalidaba rutas al
 * guardar y, sin un almacén compartido, esa revalidación tocaba una sola
 * instancia del Worker mientras el resto seguía sirviendo lo viejo.
 *
 * **Al sacar el panel dejó de haber qué revalidar** (decisión 36): el contenido
 * es parte del build, así que un cambio se publica construyendo de nuevo y no
 * hay ninguna copia guardada que pueda quedar vieja. Los dos recursos se
 * borraron; mantenerlos habría sido pagar complejidad por una capacidad que ya
 * nadie usa.
 *
 * **Si alguna vez vuelve a existir contenido que cambie sin build** —un panel,
 * un CMS, cualquier cosa que revalide en caliente— hay que volver a enchufarlo,
 * y son dos piezas y no una: sin el `tagCache`, `revalidatePath()` no hace nada
 * y no avisa. Está explicado en la decisión 29.
 */
export default defineCloudflareConfig();
