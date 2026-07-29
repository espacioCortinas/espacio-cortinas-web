import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Configuración del adaptador de Cloudflare para Next.
 *
 * Va sin overrides a propósito. El adaptador permite enchufar un caché
 * incremental compartido (R2, Workers KV o D1) para que las páginas
 * revalidadas y `revalidatePath()` se propaguen entre las instancias del
 * Worker. **Hoy no hace falta:** la única página del sitio es estática y no
 * hay base de datos todavía.
 *
 * Se decide en la Fase 3, cuando el contenido venga de Supabase y el panel
 * revalide rutas al guardar. Elegirlo ahora sería crear un recurso de
 * Cloudflare que no se usa. Ver docs/arquitectura.md.
 */
export default defineCloudflareConfig();
