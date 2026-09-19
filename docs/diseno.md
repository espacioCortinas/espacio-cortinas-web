# Diseño

Este documento define **restricciones y sistema**, no maquetas. La composición de
cada página se decide en su fase, dentro de estas reglas.

> **Estado: Fase 4.2 cerrada.** La dirección es **«Cal», con el acento de
> «Regla»** — decisión 43, elegida en la 4.1 y **no se reabre**. Sus valores son
> tokens de `app/globals.css` y están descritos abajo en «La dirección». La 4.2
> los convirtió en componentes: ver «Componentes», que ahora dice qué existe y
> qué no. Las otras dos propuestas quedan documentadas al final, en «Las dos que
> no se eligieron», porque la razón por la que se descartaron sigue valiendo.
> `/muestra` sigue en pie hasta la Fase 4.5.

---

## El material real

Esta sección no es una impresión: sale de mirar las 23 fotos publicadas una por
una, con el manifiesto al lado. **Todo lo visual que sigue está justificado acá.**

### Qué hay

23 fotos de 7 productos, más 2 videos. No hay proyectos cargados todavía, así que
el archivo de portfolio —el que va a ser el grueso del sitio— **no existe y no se
puede diseñar contra él**. Lo que hay es catálogo.

| Proporción  | Cuántas | Cuáles                                                    |
| ----------- | ------: | --------------------------------------------------------- |
| 4:5 vert.   |       7 | las 7 portadas, una por producto                          |
| 3:4 vert.   |       5 | cortinas-tela/2, roller/3, toldos/2, ven-madera/2 y /3    |
| 4:3 horiz.  |       7 | bandas-verticales/2 a /5, cortinas-tela/3, ven-pvc/2 y /3 |
| 5:4 horiz.  |       3 | compacta-blackout/2 y /3, roller/2                        |
| 16:9 horiz. |       1 | toldos/3                                                  |

Doce verticales y once horizontales: **la mezcla es mitad y mitad**, no una
excepción ocasional. Una galería que suponga un formato dominante se va a ver
rota la mitad de las veces.

### Cuatro hechos que mandan sobre el diseño

**1. Hay exactamente siete fotos 4:5, y son exactamente las siete portadas.**

No hay una sola 4:5 de repuesto. Si una portada se cae —porque tiene un problema,
porque no muestra el producto— **no hay con qué reemplazarla sin recortar una
3:4**. La regla «los listados usan siempre la portada» se sostiene hoy por un
margen de cero. Cargar fotos nuevas tiene que empezar por ahí.

**2. Ninguna portada aguanta sangrado a pantalla completa en escritorio.**

Los anchos máximos de las siete portadas son 2338, 2418, 2418, 2560, 2560, 2560 y
2560 px. Una foto a todo el ancho en un monitor de 1440 con pantalla de doble
densidad pide 2880 px. La mejor del archivo, `cortinas-tela/1`, se agrandaría un
23 %. **El hero a sangre completa no está disponible en este archivo**, y no es
una cuestión de gusto: es aritmética.

En el teléfono sí: 375 × 3 = 1125 px, y ahí sobra con cualquiera.

**3. `toldos/3` tiene 1600 px y es la única 16:9.**

Es la única foto del archivo que no llegó a las cuatro medidas. En un módulo chico
de una grilla se ve perfecta; en cualquier lugar grande, no. El diseño tiene que
poder **asignarle un lugar chico sin que eso se vea como un error**.

**4. Los dos videos son 16:9 de 1280 px y once segundos.**

Horizontales, mudos —sin pista de audio, no «silenciados»— y cortos. No entran en
el ritmo vertical 4:5 de las portadas y no se pueden mostrar grandes: 1280 px a
doble densidad es una caja de 640 px de CSS. **El video no puede ser el
protagonista de una página; es un ítem más de la galería**, y encima horizontal.

### La paleta del material: son dos archivos, no uno

La premisa de partida era «paleta cálida y baja en saturación». **Es cierta para un
tercio del material y falsa para el resto.** Conviven dos conjuntos:

**Doméstico cálido (8 fotos)** — `cortinas-tela/1` y `/2`, `compacta-blackout/1` y
`/2`, `venecianas-madera/1` y `/3`, `roller/2`, `venecianas-pvc/3`. Lino, roble,
beige, luz dorada de media tarde. Es la paleta que describía el documento.

**Obra y corporativo frío (15 fotos)** — las cinco de `bandas-verticales`, las tres
de `toldos`, `venecianas-madera/2`, `venecianas-pvc/1` y `/2`,
`compacta-blackout/3`, `roller/1` y `/3`, `cortinas-tela/3`. Hormigón visto,
carpintería negra, alfombra gris, y sobre todo **cielo azul saturado y césped verde
brillante** vistos a través de la cortina.

El color más presente del archivo no es el beige: es el **azul de cielo**, y
aparece en ocho fotos. Los «colores fuertes accidentales» no son un accidente
aislado —el auto rojo de `venecianas-madera/1`, el exhibidor de esmaltes de
`venecianas-pvc/1`, la pileta turquesa de `toldos/3`— sino el borde visible de un
archivo partido en dos.

**Consecuencia:** el fondo del sitio no puede ser un beige que «combine» con las
fotos cálidas, porque contra las frías se vería sucio y contra el azul,
amarillento. Tiene que ser un neutro capaz de sostener las dos familias. Eso se
resuelve con **saturación muy baja**, no con temperatura.

### El contraluz: menos grave, y más específico, de lo que se suponía

La premisa era «todas a contraluz, con exteriores quemados». **La primera mitad es
cierta, la segunda no.** La ventana está a contraluz en las 23, pero el HDR del
teléfono resolvió bien el exterior en la mayoría: `bandas-verticales/1` a `/4`,
`toldos/3` y `venecianas-madera/2` tienen el exterior perfectamente expuesto. Se
quema de verdad en tres: `cortinas-tela/1`, `venecianas-pvc/1` y `roller/1`.

Lo que sí vale para las 23, y es la restricción real:

> **La ventana es siempre la zona más clara del cuadro, y está casi siempre en la
> mitad superior. El piso, siempre en la mitad inferior, es la zona más oscura y
> la más desordenada.**

Eso deja el encuadre sin ningún lugar seguro para texto superpuesto. Arriba, donde
suele haber cielorraso plano, es lo más parejo —pero en `bandas-verticales/1` y
`venecianas-madera/1` arriba hay cielo quemado y una lámpara—. Abajo, que es donde
todas las plantillas ponen el título, están el mueble, el piso y el desorden.

**Conclusión operativa:** en este archivo, el texto sobre foto no se «resuelve con
cuidado»; **no se hace**. La única variante defendible es una banda sólida del
color de fondo, opaca, que tape la foto en vez de teñirla —y una banda sólida es,
en los hechos, texto al lado de la foto con pasos de más.

### Calidad, foto por foto

Lo que puede sostener cada una. «Grande» es un módulo que ocupa más de media
pantalla en escritorio; «apoyo» es un módulo chico dentro de una grilla.

| Foto                         | Aguanta | Por qué                                                              |
| ---------------------------- | ------- | -------------------------------------------------------------------- |
| `cortinas-tela/1`            | grande  | la mejor del archivo: luz, caída, sombras en el piso, ambiente vacío |
| `venecianas-madera/2`        | grande  | arquitectura de verdad; bañera, lamas negras, río de fondo           |
| `toldos/1` y `/2`            | grande  | diagonal fuerte, cielo dramático — pero mueble embalado adelante     |
| `venecianas-madera/1`        | media   | gran textura de lamas; el auto rojo ocupa el centro                  |
| `venecianas-madera/3`        | media   | mármol y lamas; artículos de tocador sobre la mesada                 |
| `bandas-verticales/1`        | media   | muy gráfica, pero es un pasillo y el azul domina                     |
| `bandas-verticales/2` y `/3` | media   | oficinas vacías, correctas, sin acontecimiento                       |
| `cortinas-tela/2`            | media   | cocina cálida y linda; la cortina es un tercio del cuadro            |
| `compacta-blackout/1`        | media   | el producto se entiende perfecto — es un detalle, no un ambiente     |
| `compacta-blackout/2`        | media   | dormitorio correcto; portarretratos en la mesa de luz                |
| `venecianas-pvc/3`           | media   | pared verde oscuro, almohadones; cálida y con carácter               |
| `roller/1`                   | apoyo   | ambiente lindo donde el roller es una franja que casi no se ve       |
| `roller/2`                   | apoyo   | **ropa tendida visible** en el patio del fondo                       |
| `compacta-blackout/3`        | apoyo   | luz plana, gris, sin acontecimiento                                  |
| `bandas-verticales/4`        | apoyo   | cartera, botella y anteojos sobre el escritorio                      |
| `bandas-verticales/5`        | apoyo   | interior subexpuesto, cajas y papeles en el piso                     |
| `venecianas-pvc/1`           | apoyo   | exhibidor de esmaltes multicolor; ambiente frío y oscuro             |
| `venecianas-pvc/2`           | apoyo   | obra en curso: caja de herramientas y trapos en el piso              |
| `cortinas-tela/3`            | apoyo   | arquitectura excelente arriba, muebles embalados «FRÁGIL» abajo      |
| `toldos/3`                   | apoyo   | 1600 px, 16:9 — y hay una persona junto a la pileta                  |
| `roller/3`                   | revisar | **una persona y un perro**, valija, bolsas de residuos, cables       |

Cuatro fotos tienen mueble embalado o material de obra a la vista
—`cortinas-tela/3`, `toldos/1`, `toldos/2`, `venecianas-pvc/2`—: son casas
entregadas pero no habitadas. No es un defecto fotográfico, es el momento en que
la empresa va a instalar. Va a volver a pasar, así que el diseño tiene que
convivir con eso: **el recorte alto, que deja el piso afuera, es lo que salva a
esas cuatro**.

### Tres fotos con problemas de privacidad, ya resueltas

**`roller/3` y `toldos/3` tienen personas visibles** y **`roller/2` tiene ropa
tendida** en el patio vecino. `docs/fotografia.md` dice «nada de personas».

**Se quedan las tres** — decisión 42: en las dos con personas están de espaldas
o lejos y no son identificables, que es lo que la regla existe para evitar. La
guía rige para las fotos nuevas, donde no hay excepción; el archivo viejo se
mira caso por caso y el criterio es la identificabilidad, no la presencia.

Esto no cambia nada de lo visual, pero sí baja a las tres de categoría: ninguna
de las tres se muestra grande.

### El motivo formal que sí sirve

Dieciséis de las 23 fotos están dominadas por una **línea fina repetida**: las
lamas de una veneciana, las bandas verticales, los pliegues de una cortina, los
parantes de una carpintería. Es el rasgo visual más consistente del archivo, por
encima del color.

Eso se puede leer de dos maneras, y las dos son legítimas:

- **La interfaz rima con la foto** y usa la línea fina —filetes de 1 px— como su
  único recurso de separación.
- **La interfaz se calla** porque la foto ya trae toda la textura que la página
  necesita, y cualquier trama agregada vibra contra ella.

Las direcciones de abajo toman partido distinto sobre esto, y es una de las cosas
concretas que hay que ir a mirar a `/muestra`.

### Lo que este archivo no puede sostener

- Un hero a sangre completa con el título encima
- Cualquier texto sobre foto sin una banda opaca
- Una grilla que suponga una sola orientación
- Mostrar las 23: `roller/1`, `roller/3`, `bandas-verticales/5` y
  `venecianas-pvc/2` restan. La curaduría sigue siendo más importante que el
  diseño
- Una portada nueva, de cualquier tipo, sin volver a fotografiar

---

## La marca

El logo llegó después de las propuestas y terminó confirmando la elección por su
cuenta. Los valores están medidos del archivo, no estimados:

```
Amarillo   #FFF100   amarillo proceso, croma máximo
Negro      #211F20   neutro
Fondo      #FFFFFF
```

Es una tipografía geométrica —familia Futura—, «espacio» en minúscula y
«CORTINAS» en versalita espaciada, con un círculo amarillo detrás de la «e».

### El amarillo no es un acento: es un color de superficie

Es el dato que manda sobre toda la paleta.

| Combinación                        |   Contraste |          |
| ---------------------------------- | ----------: | -------- |
| amarillo sobre el papel de cal     |      1,06:1 | inusable |
| amarillo sobre blanco puro         |      1,18:1 | inusable |
| **negro sobre amarillo**           | **13,92:1** | perfecto |
| amarillo sobre un fondo muy oscuro |     15,16:1 | perfecto |

Hace falta 4,5:1 para texto y 3:1 para un elemento de interfaz que signifique
algo. O sea que sobre este papel el amarillo **no puede ser color de enlace, ni
de texto, ni de línea fina, ni el único indicio de un estado**. Lo que sí puede
ser es una superficie con texto negro encima, o una forma.

**Las reglas de uso:**

1. Solo como superficie con texto negro encima, o como forma.
2. Nunca como texto, enlace o línea.
3. Nunca como único indicio de algo: lo que el amarillo marque tiene que estar
   marcado también por peso, subrayado o posición.
4. **Una vez por pantalla.** El logo, y a lo sumo una cosa más. Si aparece en
   todos lados deja de ser la marca y pasa a ser ruido.

**Y desde la Fase 4.2 esa vez la gasta entera el logo del encabezado**, que está
en todas las páginas. Por eso no hay amarillo en ningún otro lado del sitio: ni
en el botón principal, ni en los chips, ni en el foco, ni en el estado activo del
menú, ni en los avisos — decisión 44.

### El logo sobre el papel: por qué va directo y sin campo propio

Es el problema que la 4.2 tenía que resolver, porque el encabezado se ve en todas
las páginas. **El logo se apoya directo sobre el papel de cal, con el fondo
blanco del JPG recortado, y `--color-fondo` no se movió.**

Lo que tiene que ser legible es la palabra, y la palabra es negra: **14,69:1**.
El amarillo es el círculo, que es una forma, y para una forma el contraste WCAG
—que mide luminancia— es el instrumento equivocado: el amarillo tiene L\* 93,5 y
el papel L\* 95,6, casi la misma claridad. La separación es de croma:

| Fondo del logo         | Contraste WCAG | ΔE2000 |
| ---------------------- | -------------: | -----: |
| papel de cal `#F6F2EC` |         1,06:1 |   28,5 |
| recambio `#F8F6F2`     |         1,09:1 |   29,0 |
| campo blanco `#FFFFFF` |         1,18:1 |   30,3 |

Los tres papeles están a menos de dos unidades entre sí, o sea que **ninguna de
las salidas compra lo que cuesta**: mover el papel gana 0,5 —por debajo de lo que
se nota— y afloja lo único que resuelve la disparidad del archivo fotográfico. El
detalle completo, con lo que se descartó y por qué, está en la decisión 44.

### Lo que falta pedirle a la empresa

- **El logo en vector** (SVG, `.ai` o `.eps`). Hoy hay un JPG de 524 px, que
  después de recortarle el fondo y el aire quedan 504: alcanza justo para los
  168 px del encabezado en una pantalla de triple densidad, y para nada más
  grande. **En el vector, además, el círculo tiene que estar entero**: en el JPG
  viene cortado por el borde superior del archivo y arriba le queda una tangente
  plana.
- **Una versión para fondo oscuro**, con la palabra en claro. La que hay es
  negra y sobre oscuro desaparece. No hace falta para el sitio, sí para el pie
  de un PDF o una publicación.
- **Un favicon**, o la autorización para componer uno con las formas del logo.
  Sigue pendiente después de la Fase 4.2 y ahora se sabe por qué: el recorte
  literal del círculo sale sucio —está cortado arriba y la «e» lo pisa— y
  cualquier otra composición sería un lockup nuevo. Decisión 45.

---

## La dirección

**«Cal», con el acento de «Regla»** — decisión 43. Los valores de abajo están
fijados como tokens en `app/globals.css` y **se usan siempre por token, nunca
sueltos en los componentes**.

### Los ejes

El sitio tiene que sentirse más cerca de **arquitectura, interiorismo y
fotografía editorial** que de software.

- **Espacio antes que elementos.** Ante la duda, sacar algo, no agregar.
- **Tipografía como estructura.** Es lo que va a sostener las páginas, no las
  imágenes: la mitad del archivo no da para sostener nada.
- **Un solo color, y es el de la marca.** Todo lo demás es papel y negro.
- **Quietud.** El producto son cortinas: luz, textura, calma. La interfaz no
  tiene que competir con eso.
- **Texto sobre foto: no.** Ver el análisis de contraluz.
- **Nada a sangre completa.** Ver el punto 2 del análisis.

El nombre ayuda: _Espacio_ Cortinas sugiere ambiente, no producto. El sitio
muestra espacios, no artículos.

### La tesis

El papel hace el trabajo. Un fondo de cal, apagado y cálido, integra las fotos
desparejas rodeándolas de aire en vez de enmarcándolas. La foto nunca toca el
borde de la pantalla: entra en la misma columna que el texto y alineada al mismo
margen, de modo que la página se lee como una sola columna editorial.

**Qué problema del material resuelve:** la disparidad de calidad, que es el
problema número uno de este archivo. Una foto mediana rodeada de aire cálido se
lee como una lámina; la misma foto a sangre se lee como un error.

**Qué hay que vigilar:** es la respuesta esperable, y llevada al extremo blando
puede terminar oliendo a spa. La disciplina está en no redondear nada, en no
agregar un segundo color, y en que el ritmo vertical sea grande de verdad.

### Color

```
Fondo         #F6F2EC   papel de cal
Superficie    #EFE9E0   un paso, para separar sin bordes ni sombras
Texto         #211F20   el negro del logo, exacto        14,69:1
Texto suave   #6B645C   metadatos, pies y chips           5,23:1
Acento        #211F20   el mismo negro
Línea         #DED6CA
Marca         #FFF100   uso restringido, ver «La marca»
```

**El acento es el mismo negro, y es una decisión, no una omisión.** La marca ya
aporta un color, y ese color no puede llevar texto sobre fondo claro. Agregar
ADEMÁS un tercer color para los enlaces daría un sitio de cuatro colores con la
marca compitiendo contra un acento inventado. Así que:

- **Enlaces:** negros y subrayados.
- **Botón principal:** negro sólido, papel encima — 14,69:1.
- **Botón secundario:** línea de 1 px, sin relleno.
- **El amarillo no es el CTA.** Un botón amarillo sobre este papel sería una
  mancha clara sobre fondo claro, justo en lo único que este sitio tiene que
  lograr.

Sin azul ni violeta: son el color por defecto de las interfaces genéricas. Que el
azul de cielo aparezca en ocho fotos no lo habilita como color de interfaz — al
contrario, es una razón más para que la interfaz no compita con él.

### Tipografía

**Fraunces** para títulos y **Karla** para texto. Dos familias, que es el máximo.
Se cargan con `next/font` en `app/tipografias.ts`: los archivos se descargan en
el build y se sirven desde el propio dominio, así que no hay pedido a un tercero
en tiempo de ejecución ni salto al renderizar.

Fraunces tiene eje óptico: a tamaño de display abre las formas y a tamaño chico
las cierra, así que una sola familia sostiene la escala entera.

**El logo es geométrico y las dos familias no lo son, a propósito.** Si los
títulos del sitio también fueran geométricos, el logo dejaría de leerse como
logo y se confundiría con la página. Y las geométricas tienen altura de x chica,
que a 17 px en un teléfono se lee peor.

```
Display      32 → 56 px    títulos
Título       24 → 34 px    títulos
Subtítulo    19 → 22 px    títulos
Cuerpo       17 → 18 px    texto
Meta            13 px      texto
```

Cada tamaño crece solo entre el teléfono y el escritorio, así que la escala no se
repite en cada punto de quiebre. Texto de lectura entre 60 y 75 caracteres por
línea. En el teléfono nunca menos de 16 px.

### Espaciado

Una sola escala, múltiplos de 4. El ritmo vertical entre secciones es **64 en
teléfono y 112 en escritorio**, y es lo que hace que un sitio se lea como
diseñado y no como ensamblado. Margen lateral 20 → 48.

### Imagen

- **Nunca a sangre, ni en el teléfono.** La foto entra en la columna, alineada al
  mismo margen que el texto. Además de ser la tesis, es lo único que el archivo
  aguanta: ninguna portada tiene píxeles para un sangrado en escritorio.
- **Sin texto encima, nunca.** Ver el análisis de contraluz.
- Sin borde y sin sombra: lo que separa es el cambio de tono de fondo.
- Radio 0.

### Movimiento en la galería

El video es un ítem más de la galería, en la posición de la variante que
documenta — y **no al ancho de la columna**, que es lo que decía este documento
hasta la Fase 4.4 y contradecía su propia aritmética cuatro secciones más
arriba: los videos tienen 1280 px y a doble densidad eso es una caja de 640, no
de 1024. Cae solo con la regla del módulo de abajo, sin ninguna excepción.

### El tamaño de cada foto sale de la foto, no de su posición

Es lo que sobrevivió de la dirección «Regla» — decisión 48. Todo sale de
`contenido/fotos.ts`, que lo escribe el script, y nada de una lista escrita a
mano.

**En la galería**, que es una tira que se desliza de costado (decisión 50), la
caja de cada diapositiva sale de la foto **más alta de esa galería**, con tope
en 4:5. Una galería de puras apaisadas queda en una tira baja y ancha sin nada
de aire desperdiciado —`bandas-verticales` da 4:3—; una que mezcla queda en una
caja vertical donde las apaisadas flotan. Nada se recorta ni se deforma: lo que
sobra queda en papel.

**En el resto del sitio**, donde una foto ocupa un lugar fijo, manda el **tope
de píxeles**: nada se muestra más ancho que `ancho / 2`, con el 2 de
`DENSIDAD_DE_REFERENCIA`. Hoy muerde en `toldos/3` (1600 px → 800), en
`cortinas-tela/barral/2` (1028 px → 514) y en los dos videos (1280 → 640).

**El aire que queda al lado es la curaduría.** Que `toldos/3` no pueda ocupar un
lugar grande deja de ser una limitación y pasa a ser una decisión editorial.

**No reemplaza a la tabla de calidad de más arriba**, que califica por contenido
y que ningún número deduce: `bandas-verticales/4` y `/5` están calificadas
«apoyo» y aparecen igual. La respuesta a una foto floja sigue siendo sacarla.

---

## Sistema

Lo que sigue son reglas que no dependen de la dirección: valían para las tres y
siguen valiendo.

### Imágenes

- **Portadas y tarjetas: 4:5 vertical.** Siempre, sin excepción, para que las
  grillas queden parejas. Hoy hay exactamente siete y son exactamente las siete
  portadas: no hay margen.
- **Galería: la proporción propia de cada foto.** Está permitido mezclar; la galería
  no es una grilla rígida. Doce verticales y once horizontales.
- Contenedor con proporción fija y `object-fit: cover`. Nunca deformar.
- Siempre con `ancho` y `alto` para que no salte el contenido al cargar.
- Carga diferida en todo menos en la primera imagen visible.
- Sin filtros CSS sobre las fotos. Si una foto no sirve, se cambia la foto.
- **Recorte alto antes que centrado** cuando haya que recortar: el piso es la zona
  desordenada de casi todas.

### Componentes

Radios de esquina chicos, de 0 a 4 px. `rounded-2xl` en todo es una de las marcas
más reconocibles de la plantilla genérica.

**Sin sombras.** La separación se logra con espacio y con un cambio de tono de
fondo. Las tarjetas flotantes con sombra difusa son la otra marca reconocible.

**Lo que existe, desde la Fase 4.2.** La lista es corta a propósito: cada
componente que se agrega es uno que hay que mantener coherente con todos los
demás.

| Componente          | Archivo                                           | Variantes                            |
| ------------------- | ------------------------------------------------- | ------------------------------------ |
| Botón               | `components/ui/boton.tsx`                         | principal, secundario, enlace — tres |
| Chip                | `components/ui/chip.tsx`                          | una                                  |
| Campo               | `components/ui/campo.tsx`                         | una, con dos controles               |
| Aviso               | `components/ui/aviso.tsx`                         | error y nota                         |
| Estado vacío        | `components/ui/vacio.tsx`                         | una                                  |
| Columna de página   | `components/ui/contenedor.tsx`                    | una                                  |
| Foto                | `components/foto.tsx`                             | cinco proporciones, tres recortes    |
| Galería             | `components/galeria.tsx`                          | tira que se desliza de costado       |
| Video de variante   | `components/video-variante.tsx`                   | una                                  |
| Tarjeta de producto | `components/tarjeta-producto.tsx`                 | una — solo Inicio                    |
| Logo                | `components/logo.tsx`                             | una                                  |
| Encabezado y pie    | `components/encabezado.tsx`, `components/pie.tsx` | una                                  |

Botones: **uno principal sólido, uno secundario con línea, y enlaces de texto.
Tres variantes, no siete.** El principal es negro, no amarillo — decisión 43.

**Los estados no usan color** — decisión 46. Un error va en negro, en negrita, con
un filete de 3 px al costado y la palabra escrita; un campo inválido engorda su
borde. La paleta son tres colores y son los del logo: un rojo sería un cuarto, y
el amarillo no puede marcar un estado (1,06:1 contra el papel, contra los 3:1 que
hacen falta).

**El borde de un control es `--color-texto-suave`, no `--color-linea`.** La línea
da 1,29:1 contra el papel: alcanza para un filete decorativo y no para el borde de
un campo, que es lo único que dice dónde empieza y dónde termina. WCAG pide 3:1;
el texto suave da 5,23:1.

**El estado vacío se dice, no se tapa.** Un listado sin contenido —hoy,
`/proyectos`— lleva un bloque de superficie con el mismo ritmo vertical que una
sección de verdad, alineado al margen de la columna, que explica por qué está
vacío y ofrece a dónde seguir. Sin ícono y sin centrar: un bloque centrado con un
ícono arriba es el estado vacío de plantilla que la regla 4 existe para evitar.

---

## Reglas verificables

Prohibido, salvo justificación escrita en `docs/decisiones.md`:

1. Fondos con gradiente
2. Sombras difusas en tarjetas
3. Radios mayores a 4 px
4. Ícono decorativo al lado de cada título
5. Grilla de tres columnas con ícono, título y párrafo («nuestros valores»)
6. Azul o violeta como color de marca
7. Más de dos familias tipográficas
8. `fade-in` o `slide-up` al hacer scroll en secciones enteras
9. Parallax, marquesinas, contadores animados
10. Texto sobre foto sin capa que garantice contraste

La regla 10 se endurece con lo que muestra el archivo: **la capa tiene que ser opaca
y del color de fondo**. Un velo translúcido o un gradiente sobre estas fotos no
garantiza nada, porque la zona clara de cada cuadro cambia de lugar.

`/muestra` carga seis familias tipográficas a la vez y por lo tanto **incumple la
regla 7 a propósito**: es una página de comparación que se borra en la Fase 4.5, no
una página del sitio. Es la única excepción y está acotada a ese archivo
— decisión 41.

---

## Movimiento

Escaso y con función: transiciones de estado (150–200 ms), apertura de la galería,
cambio de foto. Nada que se dispare solo al hacer scroll.

**Los dos videos** son 1280×720, once segundos, sin pista de audio. Se presentan
como un ítem más de la galería, en la posición de la variante motorizada que
documentan —que es lo único que una foto no puede mostrar, decisión 40—, con
`muted`, `loop` y `playsinline`, sin controles y con `preload="none"`. Con
`prefers-reduced-motion: reduce` no se reproducen: queda el cuadro fijo y un
control para iniciarlo.

**Acá el movimiento ES el contenido y no un adorno**, y es la única excepción a
«escaso y con función» de arriba. Cableados en la Fase 4.4 — decisión 48, que
además anota qué muestra cada archivo, porque no es lo que dice su nombre.

Respetar `prefers-reduced-motion` en todo lo demás también.

---

## Mobile-first

Se diseña primero para 375 px de ancho, y recién después tablet y escritorio. No al
revés.

- Nada depende de `hover` para funcionar o entenderse
- Zonas táctiles de 44 px como mínimo
- La galería se recorre con el pulgar, gestos naturales — cumplido en la
  decisión 50, con `scroll-snap` y sin JavaScript
- WhatsApp siempre alcanzable sin buscarlo
- Se verifica en 320, 375, 768, 1024 y 1440

---

## Accesibilidad

Es parte de terminado, no un extra:

- Contraste mínimo 4.5:1 en texto
- Foco visible en todo lo navegable por teclado
- Encabezados jerárquicos, un solo `h1` por página
- Toda imagen con texto alternativo
- La galería se puede cerrar con `Escape`

---

## Orden de trabajo en la fase de diseño

```
Material fotográfico real                       ✓ Fase 4.1
        ↓
Dirección visual (color, tipografía, ritmo)     ✓ Fase 4.1
        ↓
Sistema y componentes base                      ← acá estamos, Fase 4.2
        ↓
Composición de cada página
        ↓
Implementación
        ↓
Verificación en los cinco anchos
```

No se escriben componentes antes de haber fijado la dirección visual. Ese salto es
exactamente lo que produce el resultado genérico que queremos evitar.

---

## Las dos que no se eligieron

Quedan acá porque la razón por la que se descartaron sigue valiendo, y porque
volver sobre una de ellas sin leer esto sería repetir el análisis.

### B · «Contraluz» — la sombra · DESCARTADA

**La tesis:** el archivo entero es lo mismo, una ventana encendida dentro de un
cuarto oscuro. Si la interfaz adopta la oscuridad del cuarto, cada foto pasa a ser
lo que ya era en la realidad: la fuente de luz. No hace falta marco: el contraste lo
pone el fondo.

**Qué problema del material resuelve:** dos. El contraluz quemado, que en fondo
oscuro deja de leerse como error de exposición y se lee como luminosidad. Y la
partición entre fotos cálidas y frías, que se disuelve porque sobre el oscuro las
dos se convierten en «luz». Además es la única de las tres donde una foto sí puede
sangrar en el teléfono, porque el fondo no compite.

**Qué arriesga:** bastante, y hay que mirarlo de frente en `/muestra`. Un sitio
oscuro para un negocio de luz natural puede contradecir el mensaje. Las fotos de
hormigón gris —`compacta-blackout/3`, `bandas-verticales/3`— se embarran. Y el
oscuro es el atajo de «lujo» de los últimos diez años.

```
Fondo        #1A1714   marrón muy oscuro, no negro
Superficie   #242019   un paso más claro
Texto        #EDE7DD   crema
Texto suave  #A2988A   metadatos y chips
Acento       #C98A3E   bronce, el color de la luz de las 17
Línea        #3A332B   filete apenas visible
```

**Tipografía:** Spectral para títulos (serif hecha para pantalla, cálida, no brilla
de más en fondo oscuro) y Barlow para texto.
**Escala:** display 34→60, título 25→36, subtítulo 19→22, cuerpo 17→18, meta 13.
**Espaciado:** base 4. Ritmo entre secciones 72 → 120 —el oscuro necesita más aire
que el claro para no apelmazarse—. Margen lateral 16 → 40.
**Imagen:** puede sangrar de borde a borde **solo en teléfono**. En escritorio,
dentro de la columna. Sin borde, sin sombra, radio 0.
**Texto sobre foto:** permitido en un solo caso, y con **banda sólida opaca** del
color de fondo sobre el tercio superior. Nunca con gradiente ni con velo
translúcido. Es la única de las tres que lo permite, y en `/muestra` está el ejemplo
para poder rechazarlo.
**Video:** a sangre en teléfono, dentro de la columna en escritorio.

---

### C · «Regla» — la grilla que cura · DESCARTADA, pero aportó el acento

**La tesis:** la foto pone la calidez y la textura; la interfaz pone únicamente
orden. Papel casi neutro, un solo grotesco en dos tamaños muy separados, filetes de
1 px como único recurso gráfico, y **numeración visible** —`01 / 07`— en
monoespaciada. La página se parece a un catálogo razonado, no a una tienda.

**Qué problema del material resuelve:** la disparidad, pero de la única manera
estructural de las tres. La grilla tiene módulos de tres tamaños y **el tamaño del
módulo es la curaduría**: `cortinas-tela/1` ocupa tres unidades, `roller/1` ocupa
una. `toldos/3`, la de 1600 px, nunca sale del módulo chico y eso deja de ser una
limitación para pasar a ser una decisión editorial. Es también la que mejor le habla
a arquitectos y a oficinas, que son dos de los tres públicos.

**Qué arriesga:** frialdad. Un particular que quiere ver si «queda lindo» se puede
topar con algo que parece un pliego técnico. Y la trama de filetes puede vibrar
contra las 16 fotos que ya son una trama de líneas finas.

```
Fondo        #FBFAF8   papel, apenas tibio
Superficie   #F1EFEB   un paso
Texto        #1C1B19   casi negro
Texto suave  #77736D   metadatos y numeración
Acento       #4E5A3E   oliva seca, el verde que se ve por toda persiana
Línea        #D9D5CE   filete de 1 px, el recurso principal
```

**Tipografía:** Chivo para todo y DM Mono para numeración y metadatos. Chivo y
Archivo son de Omnibus-Type, de Buenos Aires: no es un dato decorativo, es una
tipografía hecha acá para un negocio de acá.
**Escala:** display 40→72 —los dos extremos bien separados, nada en el medio—,
título 22→26, cuerpo 16→17, meta 12 en mono, versalita, con tracking.
**Espaciado:** base 4, rejilla de 12 columnas en escritorio y 4 en teléfono. Ritmo
entre secciones 56 → 96. Margen lateral 20 → 40.
**Imagen:** dentro de módulos de 1, 2 o 3 unidades. **Nunca a sangre.** Filete de 1
px arriba de cada bloque, ninguno alrededor de la foto. Radio 0.
**Sin texto sobre foto, nunca.** El pie va debajo, en mono.
**Video:** módulo de 2 unidades, horizontal, con su numeración como cualquier otro
ítem de la galería.

**Por qué se descartó B:** el producto es luz natural entrando a una casa, y un
sitio oscuro trabaja en contra de ese mensaje. Además el logo es negro y sobre
fondo oscuro desaparece, así que haría falta una versión invertida que hoy no
existe. Es, eso sí, la única de las tres donde el amarillo del logo rinde al
máximo: 15,16:1, sirve hasta como color de texto.

**Por qué se descartó C, y qué sobrevivió de ella:** se descartó por frialdad —un
particular que quiere ver si «queda lindo» se topa con algo que parece un pliego
técnico—. **Pero su acento es el que quedó**: el negro del logo para enlaces y
botón, sin ningún color inventado. Y su idea central sigue disponible para la
Fase 4.3: el tamaño del módulo que le toca a cada foto puede salir de la tabla de
calidad de este documento en vez del orden, que es la única forma estructural de
curar un archivo desparejo.
