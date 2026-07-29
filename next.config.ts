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

  // Queda afuera de la Fase 1 a propósito:
  // - Cabeceras de seguridad (CSP, HSTS, nosniff, Referrer-Policy) → Fase 5,
  //   junto con el resto del checklist de docs/seguridad.md.
  // - `images.remotePatterns` para Supabase Storage → Fase 3, cuando exista el
  //   bucket y se conozca su host.
};

export default nextConfig;
