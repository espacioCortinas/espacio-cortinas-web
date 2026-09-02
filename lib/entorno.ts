/**
 * Variables de entorno públicas.
 *
 * Todo lo que está acá viaja al navegador dentro del paquete de JavaScript.
 * Antes de agregar una variable a este archivo, verificar que sea información
 * pública. Los secretos van en `lib/entorno-servidor.ts`.
 *
 * Quedó corto al sacar el panel: las tres variables de Supabase se fueron con
 * él (decisión 36). Sobrevive la dirección del sitio, que es de dónde salen las
 * URLs canónicas, el sitemap y el Open Graph.
 */

// Next reemplaza `process.env.NEXT_PUBLIC_*` por su valor literal en tiempo de
// build. Por eso hay que nombrar cada variable una por una: un acceso dinámico
// (`process.env[nombre]`) no se reemplaza y llega vacío al navegador.
const CRUDAS: Record<string, string | undefined> = {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_WHATSAPP: process.env.NEXT_PUBLIC_WHATSAPP,
};

function exigir(nombre: string): string {
  const valor = CRUDAS[nombre]?.trim();
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${nombre}. ` +
        `Completala en .env.local (local) o en el bloque \`vars\` de ` +
        `wrangler.jsonc (producción).`,
    );
  }
  return valor;
}

/**
 * Se accede con getters, no con constantes: así importar este módulo nunca
 * falla, y el error aparece recién cuando alguien usa un valor que no existe.
 * La verificación completa la hace `lib/entorno-validacion.ts` en el build y al
 * arrancar.
 */
export const entornoPublico = {
  /** Base para canonical, sitemap y Open Graph. Sin barra final. */
  get urlSitio(): string {
    return exigir("NEXT_PUBLIC_SITE_URL").replace(/\/+$/, "");
  },
  /** Número en formato internacional. `null` hasta la Fase 4.6. */
  get whatsapp(): string | null {
    return CRUDAS.NEXT_PUBLIC_WHATSAPP?.trim() || null;
  },
};
