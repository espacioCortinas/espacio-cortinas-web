# Espacio Cortinas — sitio web

Sitio institucional con catálogo y portfolio, más un panel de administración
propio. No es un e-commerce.

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

| Comando             | Para qué               |
| ------------------- | ---------------------- |
| `npm run dev`       | servidor de desarrollo |
| `npm run build`     | build de producción    |
| `npm run lint`      | ESLint                 |
| `npm run format`    | formatear con Prettier |
| `npm run typecheck` | `tsc --noEmit`         |

Antes de dar algo por terminado tienen que pasar `npm run build` y
`npm run typecheck`.

## Estado

Fase 1 (cimientos) terminada. El sitio público y el panel todavía no existen.
Ver [`docs/plan.md`](docs/plan.md).
