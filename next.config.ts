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

  // El optimizador de imágenes queda apagado. El sitio sirve las fotos con
  // `<img>` y un `srcset` armado desde el manifiesto, así que hoy nadie lo
  // invoca; esto es el cerrojo, para que usar `next/image` por costumbre falle
  // rápido en vez de empezar a gastar cuota en silencio. En Cloudflare el
  // optimizador son las Transformations, con tope de 5.000 únicas por mes en el
  // plan gratuito: pasado el tope devuelve error y las fotos dejan de cargar,
  // que es lo único que este sitio hace — decisión 25.
  images: {
    unoptimized: true,
  },

  // Sin `headers()`. El bloque que había era el bypass de caché de `/admin`, y
  // se fue con el panel: ya no hay ninguna respuesta autenticada que una caché
  // compartida pueda servirle a otra persona (decisión 36).
  //
  // Queda pendiente para la Fase 5: cabeceras de seguridad (CSP, nosniff,
  // Referrer-Policy), junto con el resto del checklist de docs/seguridad.md.
  // HSTS no va acá: lo agrega Cloudflare en el borde, para que también cubra
  // las respuestas de los redireccionamientos, que nunca llegan a este código.
};

export default nextConfig;
