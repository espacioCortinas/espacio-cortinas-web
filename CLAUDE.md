# Espacio Cortinas — sitio web

Sitio institucional con catálogo y portfolio para una empresa de cortinas, rollers
blackout, venecianas y toldos con colocación, que trabaja en Buenos Aires.

**No hay panel de administración ni base de datos.** Hubo los dos y se sacaron
—decisión 36—: el contenido son archivos de este repositorio, se edita a mano y
se publica con un `git push`.

**No es un e-commerce.** No hay carrito, precios, stock ni pagos.

Antes de trabajar leé el documento que corresponda en `docs/`:

| Documento                 | Cuándo leerlo                                        |
| ------------------------- | ---------------------------------------------------- |
| `docs/producto.md`        | qué construimos, para quién, qué queda afuera        |
| `docs/arquitectura.md`    | stack, estructura, renderizado, preparación de fotos |
| `docs/modelo-de-datos.md` | dónde vive el contenido y qué forma tiene            |
| `docs/diseno.md`          | dirección visual y reglas de composición             |
| `docs/fotografia.md`      | guía para la empresa sobre cómo sacar las fotos      |
| `docs/publicar-fotos.md`  | el paso a paso para que una foto llegue al sitio     |
| `docs/seguridad.md`       | privacidad de las fotos, claves, formulario          |
| `docs/infraestructura.md` | estado real de dominio, DNS, correo, cuentas         |
| `docs/decisiones.md`      | **por qué** se decidió cada cosa                     |
| `docs/plan.md`            | fases y criterio de terminado                        |

`docs/decisiones.md` es de lectura obligatoria antes de proponer cambios de
arquitectura. Varias cosas que parecen mejorables fueron descartadas a propósito.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres, Auth,
Storage) · Cloudflare (Workers, DNS) · Resend

El sitio corre en Cloudflare Workers con el adaptador `@opennextjs/cloudflare`.
Se mudó desde Vercel en julio de 2026 — decisión 24 de `docs/decisiones.md`.

## Reglas duras

1. **App Router únicamente.** Nunca Pages Router. No mezclar convenciones de los
   dos (`getServerSideProps`, `_app.tsx`, `next/router` no se usan).
2. **Todo el contenido viene de `contenido/`.** Ningún producto ni proyecto
   hardcodeado en componentes, y las páginas leen de `contenido/index.ts`, que
   es el que une los textos con las fotos.
3. **Lo escrito a mano y lo generado no comparten archivo.** `productos.ts` y
   `proyectos.ts` se editan; `fotos.ts` lo escribe el script y se pisa entero.
4. **La ruta de una foto se arma leyendo el manifiesto**, nunca con las
   constantes del código: `medidas` dice qué anchos existen de ESA foto y
   `formato` con qué extensión se escribieron. Una foto chica no tiene todas las
   medidas y el navegador pediría un archivo que no existe — decisiones 32 y 37.
   Todo eso vive en `lib/fotos.ts`, que es lo único que arma rutas de imágenes.
5. **Se borra el EXIF de toda imagen antes de publicarla.** Las fotos son de
   casas de clientes y traen coordenadas GPS.
6. **Español en todo:** interfaz, nombres de tablas y columnas, comentarios,
   mensajes de error, commits.
7. **Sin dependencias nuevas sin justificarlas.** Preferir la plataforma antes
   que una librería.

## Reglas de diseño

9. **No usar patrones visuales genéricos de landing generada por IA.** Nada de
   hero centrado + tres tarjetas + gradiente + `rounded-xl` + `shadow-lg` como
   punto de partida. Cada decisión responde a la fotografía real y al recorrido
   comercial. Ver `docs/diseno.md`.
10. **Las portadas son verticales 4:5; la galería mezcla orientaciones.** El
    archivo histórico es horizontal, las fotos nuevas se sacan verticales. Los
    listados usan siempre la portada, por eso quedan parejos.
11. **Mobile-first real.** Se diseña primero para teléfono. Nada depende de
    `hover` para funcionar o entenderse.
12. **Animaciones escasas y con función.** Sin parallax, sin fade-in en todo.

## Antes de dar algo por terminado

- Se ve bien en 320, 375, 768, 1024 y 1440 px.
- Las páginas públicas devuelven HTML con contenido real (verificable con
  "ver código fuente", no con el inspector).
- Cada página pública tiene `title`, `description` y Open Graph propios.
- `npm run build` y `npx tsc --noEmit` pasan sin errores.
- Si el cambio tocó fotos, `npm run fotos:revisar` da verde: ninguna publicada
  conserva GPS. **No es opcional** — son fotos de casas de clientes.
- Si el cambio toca rutas, renderizado, caché o código de servidor, además pasa
  por `npm run preview`, que lo corre en el mismo runtime que producción.
  `npm run dev` corre sobre Node: no detecta un uso de API que Workers no
  soporte, y **tampoco usa el caché incremental del adaptador**. En la Fase 4.0
  eso escondió un 404 en todas las páginas de producto, con `npm run build` y
  `npm run dev` en verde — decisión 39.
