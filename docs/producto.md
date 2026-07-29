# Producto

## Qué es

Sitio institucional para **Espacio Cortinas**, empresa de cortinas, rollers
blackout, venecianas y toldos con colocación propia, que trabaja en todo Buenos
Aires.

El objetivo comercial es uno solo:

> Que alguien que llega al sitio termine escribiendo por WhatsApp.

Todo lo demás está subordinado a eso. El sitio no vende online, no toma pedidos y
no publica precios.

## Para quién

| Público                    | Qué necesita ver                                  |
| -------------------------- | ------------------------------------------------- |
| **Particulares**           | que queda lindo; fotos de casas reales terminadas |
| **Arquitectos y estudios** | que la empresa puede trabajar dentro de una obra  |
| **Oficinas y empresas**    | que tiene capacidad para instalaciones grandes    |

Un solo sitio para los tres. No hay secciones separadas por público.

## Posicionamiento

No "venta de cortinas", sino:

> Soluciones de cortinas y protección solar a medida, con asesoramiento y
> colocación profesional, para hogares, estudios de arquitectura y espacios
> corporativos en Buenos Aires.

**La colocación no es un producto.** Es parte de la propuesta de valor:
asesoramiento + provisión a medida + colocación.

Lo que el sitio tiene que transmitir, en orden:

1. **Estética** — queda bien
2. **Calidad** — los productos son buenos
3. **Profesionalismo** — saben lo que hacen
4. **Integral** — asesoran y colocan

Los proyectos reales son la evidencia de las cuatro. Por eso pesan más que
cualquier texto.

## Estructura

```
INICIO      Empresa, productos destacados, proyectos destacados,
            servicio de colocación, trabajo con arquitectos, CTA

PROYECTOS   Listado de trabajos realizados
            Proyecto → título, ubicación, descripción, galería

PRODUCTOS   Catálogo
            Producto → descripción, variantes, galería, CTA

CONTACTO    WhatsApp, teléfono, email, formulario, redes
```

**Productos vive como sección aparte del recorrido institucional.** Inicio,
Proyectos y Contacto son el recorrido comercial; Productos es el catálogo, que se
explora por separado. En Inicio aparecen algunos productos como anticipo, nunca el
catálogo completo.

La distinción tiene que quedar clara para el visitante:

- **Productos = qué vendemos**
- **Proyectos = qué hicimos**

## Contenido

### Producto

- Nombre
- Descripción breve
- Variantes (ej. Cortinas → dos paños, rieles, barrales; Toldos → manuales,
  motorizados)
- Galería de fotos, con una de portada
- Activo / inactivo · Destacado / no destacado

Las variantes **no** son productos independientes. `Toldos motorizados` es una
variante de `Toldos`, no una entrada más del catálogo.

Catálogo inicial: Cortinas, Roller Blackout, Venecianas, Toldos.

### Proyecto

- Título
- Ubicación
- Descripción
- Galería de fotos, con una de portada
- Activo / inactivo · Destacado / no destacado

Nada más. Sin categoría, sin fecha, sin cliente, sin superficie, sin productos
utilizados. Cada campo agregado es un campo que hay que completar en cada carga.

En la tarjeta, el título es el trabajo y la ubicación va como chip:

```
Casa en Nordelta
[ Nordelta · Buenos Aires ]
```

## Visibilidad

Dos estados independientes:

- **Activo / inactivo** — controla si existe públicamente. Inactivo sigue
  guardado, no se muestra en ningún lado.
- **Destacado / no destacado** — controla si puede aparecer en Inicio.

```
Todos los activos     → /productos y /proyectos
Los destacados        → Inicio (con tope)
```

Así se puede rotar lo que aparece en Inicio sin borrar nada, y el tope de Inicio
nunca limita el portfolio completo.

**Desactivar no es eliminar.** Eliminar pide confirmación.

## Panel de administración

Un solo usuario. Dos secciones, ninguna más:

```
Productos           Proyectos
├── Crear           ├── Crear
├── Editar          ├── Editar
├── Eliminar        ├── Eliminar
├── Activar         ├── Activar
├── Destacar        ├── Destacar
└── Fotos           └── Fotos

Fotos: subir · eliminar · reordenar · elegir portada
```

## Contacto

WhatsApp es el canal principal. El mensaje se arma según de dónde salió el clic:

```
Desde /productos/roller-blackout
→ "Hola, vi en su página web el Roller Blackout y quisiera consultar..."

Desde /proyectos/casa-nordelta
→ "Hola, vi en su página web el proyecto Casa en Nordelta y quisiera consultar..."
```

Eso permite saber que la consulta vino del sitio y sobre qué.

Hay además un formulario que envía a `contacto@espaciocortinas.com.ar`. No hay
bandeja de mensajes en el panel: los mensajes van por email.

## Fuera del alcance de V1

Nada de esto se construye ahora:

- E-commerce, carrito, precios, stock, pagos
- Editor de la home o de textos institucionales desde el panel
- Pantalla de configuración general
- Roles, permisos, varios administradores
- Bandeja de mensajes en el panel
- CRM, estadísticas administrativas
- Vista previa antes de publicar
- Historial de versiones
- Blog
- Varios idiomas
- Relación entre productos y proyectos ("productos usados en este proyecto")

Algunas de estas se evaluaron y se descartaron con razones. Ver
`docs/decisiones.md` antes de reintroducir cualquiera.
