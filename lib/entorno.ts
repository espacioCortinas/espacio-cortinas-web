/**
 * Variables de entorno públicas.
 *
 * Todo lo que está acá viaja al navegador dentro del paquete de JavaScript.
 * Antes de agregar una variable a este archivo, verificar que sea información
 * pública. Los secretos van en `lib/entorno-servidor.ts`.
 *
 * Ver docs/arquitectura.md ("Variables de entorno") y docs/seguridad.md
 * ("Claves").
 */

// Next reemplaza `process.env.NEXT_PUBLIC_*` por su valor literal en tiempo de
// build. Por eso hay que nombrar cada variable una por una: un acceso dinámico
// (`process.env[nombre]`) no se reemplaza y llega vacío al navegador.
const CRUDAS: Record<string, string | undefined> = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_WHATSAPP: process.env.NEXT_PUBLIC_WHATSAPP,
};

function exigir(nombre: string): string {
  const valor = CRUDAS[nombre]?.trim();
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${nombre}. ` +
        `Completala en .env.local (local) o en Cloudflare → el Worker → ` +
        `Settings (producción). Va en las dos listas: «Build variables and ` +
        `secrets» y «Variables and Secrets».`,
    );
  }
  return valor;
}

/**
 * Se accede con getters, no con constantes: así importar este módulo nunca
 * falla, y el error aparece recién cuando alguien usa un valor que no existe.
 * La verificación completa, con la lista entera de faltantes de una sola vez,
 * la hace `lib/entorno-validacion.ts` en el build y al arrancar.
 */
export const entornoPublico = {
  /**
   * Sin barra final: el panel de Supabase la copia con barra y así quedan URLs
   * con doble barra al armar las rutas de la API.
   */
  get supabaseUrl(): string {
    return exigir("NEXT_PUBLIC_SUPABASE_URL").replace(/\/+$/, "");
  },
  get supabaseAnonKey(): string {
    return exigir("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },
  /** Base para canonical, sitemap y Open Graph. Sin barra final. */
  get urlSitio(): string {
    return exigir("NEXT_PUBLIC_SITE_URL").replace(/\/+$/, "");
  },
  /** Número en formato internacional. `null` hasta la Fase 4.6. */
  get whatsapp(): string | null {
    return CRUDAS.NEXT_PUBLIC_WHATSAPP?.trim() || null;
  },
};
