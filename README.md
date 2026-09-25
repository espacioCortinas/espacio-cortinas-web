# Espacio Cortinas — sitio web

Sitio institucional con catálogo y portfolio. No es un e-commerce y no tiene
panel de administración: el contenido son archivos de este repositorio
([decisión 36](docs/decisiones.md)).

La documentación del proyecto está en [`docs/`](docs/). Empezar por
[`CLAUDE.md`](CLAUDE.md) y [`docs/decisiones.md`](docs/decisiones.md).

## Cómo levantarlo

```bash
npm install
cp .env.example .env.local   # y completar los valores
npm run dev
```

Si falta alguna variable de entorno obligatoria, el servidor no arranca y avisa
cuál falta. Las claves están en el gestor de contraseñas de la empresa.

## Comandos

| Comando                 | Para qué                                          |
| ----------------------- | ------------------------------------------------- |
| `npm run dev`           | servidor de desarrollo                            |
| `npm run build`         | build de producción                               |
| `npm run preview`       | el sitio en el runtime real de Cloudflare Workers |
| `npm run deploy`        | despliegue a mano (normalmente no hace falta)     |
| `npm run lint`          | ESLint                                            |
| `npm run format`        | formatear con Prettier                            |
| `npm run typecheck`     | `tsc --noEmit`                                    |
| `npm run fotos`         | prepara las fotos y las imágenes para compartir   |
| `npm run fotos:revisar` | comprueba que ninguna publicada conserve GPS      |

Antes de dar algo por terminado tienen que pasar `npm run build` y
`npm run typecheck`. Si el cambio toca código de servidor, además `npm run
preview`: es el único que lo ejecuta en el mismo runtime que producción.

## Dónde vive

El sitio corre en **Cloudflare Workers** con el adaptador
`@opennextjs/cloudflare`. Cada push a `main` despliega solo. Detalle en
[`docs/arquitectura.md`](docs/arquitectura.md) y
[`docs/infraestructura.md`](docs/infraestructura.md).

## Estado

El sitio público está publicado: Inicio, Productos, Proyectos y Contacto, con
el formulario y WhatsApp en todas las páginas (Fase 4.6). Ver
[`docs/plan.md`](docs/plan.md).
