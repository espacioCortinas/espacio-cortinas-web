# Espacio Cortinas — sitio web

Sitio institucional con catálogo y portfolio para una empresa de cortinas, rollers
blackout, venecianas y toldos con colocación, que trabaja en Buenos Aires.
Incluye un panel de administración propio para que la dueña cargue el contenido.

**No es un e-commerce.** No hay carrito, precios, stock ni pagos.

Antes de trabajar leé el documento que corresponda en `docs/`:

| Documento                 | Cuándo leerlo                                      |
| ------------------------- | -------------------------------------------------- |
| `docs/producto.md`        | qué construimos, para quién, qué queda afuera      |
| `docs/arquitectura.md`    | stack, estructura, renderizado, subida de imágenes |
| `docs/modelo-de-datos.md` | tablas, campos, relaciones                         |
| `docs/diseno.md`          | dirección visual y reglas de composición           |
| `docs/fotografia.md`      | guía para la empresa sobre cómo sacar las fotos    |
| `docs/seguridad.md`       | autenticación, autorización, uploads               |
| `docs/infraestructura.md` | estado real de dominio, DNS, correo, cuentas       |
| `docs/decisiones.md`      | **por qué** se decidió cada cosa                   |
| `docs/plan.md`            | fases y criterio de terminado                      |

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
2. **Todo el contenido viene de la base.** Ningún producto ni proyecto
   hardcodeado en componentes.
3. **Toda mutación pasa por el servidor.** Server Actions o Route Handlers, con
   verificación de identidad propia. El navegador nunca escribe en la base.
4. **El middleware no autoriza.** Solo redirige al login. Toda Server Action
   revalida por su cuenta. Ver `docs/seguridad.md`.
5. **La `service_role key` nunca sale del servidor.** Ni en un componente cliente,
   ni en una variable `NEXT_PUBLIC_*`.
6. **Se borra el EXIF de toda imagen antes de publicarla.** Las fotos son de
   casas de clientes y traen coordenadas GPS.
7. **Español en todo:** interfaz, nombres de tablas y columnas, comentarios,
   mensajes de error, commits.
8. **Sin dependencias nuevas sin justificarlas.** Preferir la plataforma antes
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
- Si el cambio toca código de servidor, además pasa por `npm run preview`, que
  lo corre en el mismo runtime que producción. `npm run dev` corre sobre Node y
  no detecta un uso de API que Cloudflare Workers no soporte.
