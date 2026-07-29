# Diseño

Este documento define **restricciones y sistema**, no maquetas. La composición de
cada página se decide en su fase, dentro de estas reglas.

## El material real

Antes de decidir nada visual hay que partir del material que existe:

- **Fotos sacadas con celular**, no por un fotógrafo
- **El archivo existente es todo horizontal**
- **Las fotos nuevas se sacan verticales** (ver `docs/fotografia.md`)
- Iluminación, encuadre y orden del ambiente desparejos

Esto tiene tres consecuencias que mandan sobre todo lo demás.

### 1. Conviven dos orientaciones, y hay una regla para que no se rompa nada

**Portadas y tarjetas: vertical 4:5.** Es lo que llena la pantalla del teléfono sin
llegar al extremo del 9:16, y en escritorio arma grillas editoriales que funcionan.

**La galería admite las dos orientaciones.** Una toma horizontal por ambiente sirve
para mostrar el contexto de la habitación, que en vertical no entra.

**La regla que evita las grillas rotas:** los listados usan siempre la portada, y
la portada es siempre vertical. Aunque la galería mezcle, los listados quedan
parejos. El panel valida que la portada sea vertical.

Mientras el archivo siga siendo mayoritariamente horizontal, un proyecto sin foto
vertical usa una horizontal recortada a 4:5 como portada. Es una solución de
transición, no el objetivo.

### 2. Fotos de celular no aguantan escala gigante

Es contraintuitivo: cuanto más grande se muestra una foto mediocre, más se le ven
el ruido, el encuadre torcido y el desorden del ambiente.

Fotos de calidad desigual se ven **mejor** en un grid estructurado, a tamaño
moderado, con aire alrededor, que a pantalla completa. El marco y el espacio hacen
la mitad del trabajo.

### 3. La curaduría importa más que el diseño

Seis fotos buenas de un proyecto comunican más que veinte donde tres son buenas.
Esto va como recomendación explícita en el panel: **cargar pocas y elegidas**.

## Dirección visual

El sitio tiene que sentirse más cerca de **arquitectura, interiorismo y
fotografía editorial** que de software.

Los ejes:

- **Espacio antes que elementos.** Ante la duda, sacar algo, no agregar.
- **Tipografía como estructura.** Es lo que va a sostener las páginas, no las
  imágenes.
- **Neutros cálidos.** Las fotos de celular se ven duras contra blanco puro; sobre
  un fondo cálido apagado se integran mucho mejor y se disimula que vienen de
  distintas cámaras y horas del día.
- **Quietud.** El producto son cortinas: luz, textura, calma. La interfaz no tiene
  que competir con eso.

El nombre ayuda: _Espacio_ Cortinas sugiere ambiente, no producto. El sitio muestra
espacios, no artículos.

## Sistema

### Color

Paleta corta. Un fondo, dos tonos de texto, un acento, nada más.

```
Fondo          blanco cálido apagado, no #FFFFFF
Superficie     un paso más oscuro que el fondo, para separar sin bordes
Texto          gris muy oscuro cálido, no #000000
Texto suave    para metadatos y chips
Acento         uno solo, terroso o bronce apagado
Línea          gris cálido muy tenue
```

Sin azul ni violeta: son el color por defecto de las interfaces genéricas y no
tienen nada que ver con este negocio. El acento se usa poco: enlaces, estado
activo, botón principal. Si aparece en todos lados deja de acentuar.

Los valores exactos se fijan en `tailwind.config` en la fase de diseño y se usan
siempre por token, nunca sueltos en los componentes.

### Tipografía

**Dos familias como máximo.** Una serif de contraste para títulos, una sans neutra
para texto. Cargadas con `next/font` para que no haya salto al renderizar.

Escala corta y con saltos amplios: un tamaño de display, dos de título, uno de
cuerpo, uno chico para metadatos. Media docena de tamaños, no doce.

Texto de lectura entre 60 y 75 caracteres por línea. En el teléfono nunca menos de
16px.

### Espaciado

Una sola escala, múltiplos de 4. El ritmo vertical entre secciones tiene que ser
generoso y **consistente**: es lo que hace que un sitio se lea como diseñado y no
como ensamblado.

### Imágenes

- **Portadas y tarjetas: 4:5 vertical.** Siempre, sin excepción, para que las
  grillas queden parejas.
- **Galería: 3:2 horizontal o 4:5 vertical**, según la foto. Está permitido
  mezclar; la galería no es una grilla rígida.
- Contenedor con proporción fija y `object-fit: cover`. Nunca deformar.
- Siempre con `ancho` y `alto` para que no salte el contenido al cargar.
- Carga diferida en todo menos en la primera imagen visible.
- Sin filtros CSS sobre las fotos. Si una foto no sirve, se cambia la foto.

### Componentes

Radios de esquina chicos, de 0 a 4px. `rounded-2xl` en todo es una de las marcas
más reconocibles de la plantilla genérica.

**Sin sombras.** La separación se logra con espacio y con un cambio de tono de
fondo. Las tarjetas flotantes con sombra difusa son la otra marca reconocible.

Botones: uno principal sólido, uno secundario con línea, y enlaces de texto. Tres
variantes, no siete.

## Reglas verificables

Prohibido, salvo justificación escrita en `docs/decisiones.md`:

1. Fondos con gradiente
2. Sombras difusas en tarjetas
3. Radios mayores a 4px
4. Ícono decorativo al lado de cada título
5. Grilla de tres columnas con ícono, título y párrafo ("nuestros valores")
6. Azul o violeta como color de marca
7. Más de dos familias tipográficas
8. `fade-in` o `slide-up` al hacer scroll en secciones enteras
9. Parallax, marquesinas, contadores animados
10. Texto sobre foto sin capa que garantice contraste

## Movimiento

Escaso y con función: transiciones de estado (150–200 ms), apertura de la galería,
cambio de foto. Nada que se dispare solo al hacer scroll.

Respetar `prefers-reduced-motion`.

## Mobile-first

Se diseña primero para 375px de ancho, y recién después tablet y escritorio. No al
revés.

- Nada depende de `hover` para funcionar o entenderse
- Zonas táctiles de 44px como mínimo
- La galería se recorre con el pulgar, gestos naturales
- WhatsApp siempre alcanzable sin buscarlo
- Se verifica en 320, 375, 768, 1024 y 1440

## Accesibilidad

Es parte de terminado, no un extra:

- Contraste mínimo 4.5:1 en texto
- Foco visible en todo lo navegable por teclado
- Encabezados jerárquicos, un solo `h1` por página
- Toda imagen con texto alternativo
- La galería se puede cerrar con `Escape`

## Orden de trabajo en la fase de diseño

```
Material fotográfico real
        ↓
Dirección visual (color, tipografía, ritmo)
        ↓
Sistema y componentes base
        ↓
Composición de cada página
        ↓
Implementación
        ↓
Verificación en los cinco anchos
```

No se escriben componentes antes de haber fijado la dirección visual. Ese salto es
exactamente lo que produce el resultado genérico que queremos evitar.
