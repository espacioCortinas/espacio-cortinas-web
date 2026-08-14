import type { NextConfig } from "next";

import { validarEntorno } from "./lib/entorno-validacion";

// Next carga los archivos `.env` antes de leer esta configuración, así que acá
// ya están disponibles. Si falta alguna variable obligatoria, el build corta
// con la lista completa en vez de publicar un sitio que falla en cada visita.
validarEntorno();

const nextConfig: NextConfig = {
  // La raíz del proyecto se fija a mano: hay un `package-lock.json` suelto en
  // el directorio del usuario y, sin esto, Turbopack lo toma como raíz del
  // espacio de trabajo.
  turbopack: {
    root: process.cwd(),
  },

  async headers() {
    return [
      {
        // El panel no se cachea en ningún lado. Desde la mudanza a Cloudflare
        // el proxy es obligatorio, así que hay una caché COMPARTIDA delante de
        // la aplicación: si una respuesta autenticada de `/admin` quedara
        // guardada ahí, Cloudflare podría servírsela a otra persona. Es el modo
        // clásico de filtrar una sesión — docs/seguridad.md.
        //
        // Esto cubre las páginas del panel, sus Server Actions y sus Route
        // Handlers. Va acá y no solo en el middleware para que no dependa de
        // que el middleware haya corrido.
        //
        // La segunda capa, independiente de este código, es la Cache Rule de
        // bypass para `/admin/*` en Cloudflare. Las dos, porque cada una cubre
        // un hueco de la otra: la regla protege aunque la aplicación se
        // equivoque, y esta cabecera protege si algún día se cambia de
        // proveedor.
        source: "/admin/:ruta*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, max-age=0, must-revalidate",
          },
          // El panel no tiene por qué aparecer en ningún buscador.
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },

  // Queda afuera de la Fase 1 a propósito:
  // - Cabeceras de seguridad (CSP, nosniff, Referrer-Policy) → Fase 5, junto
  //   con el resto del checklist de docs/seguridad.md. HSTS no va acá: lo
  //   agrega Cloudflare en el borde, para que también cubra las respuestas de
  //   los redireccionamientos, que nunca llegan a este código.
  // - `images.unoptimized` → Fase 3. En Cloudflare no se usa el optimizador de
  //   `next/image`: los tamaños se generan al subir y se sirven con `srcset`.
  //   Ver la decisión 25 de docs/decisiones.md.
};

export default nextConfig;
