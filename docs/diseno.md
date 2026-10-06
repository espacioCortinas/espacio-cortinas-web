# Diseño

Este documento define **restricciones y sistema**, no maquetas. La composición de
cada página se decide en su fase, dentro de estas reglas.

> **Estado: el sitio está compuesto con la dirección del boceto de la
> empresa** — Fase 4.7, decisión 66. La anterior, «Cal», se usó de la Fase 4.1
> a la 4.6, y la empresa la rechazó en octubre de 2026 porque se notaba hecha
> con IA: queda al final, en «Las direcciones descartadas», con las otras dos
> de la 4.1. Los valores de la dirección son tokens de `app/globals.css` y
> están descritos abajo, en «La dirección». **El análisis del material real
> sigue valiendo**: las fotos son las mismas, y lo que de ellas salía como
> restricción se mantuvo.

---

## El material real

Esta sección no es una impresión: sale de mirar las 23 fotos publicadas una por
una, con el manifiesto al lado. **Todo lo visual que sigue está justificado acá.**

### Qué hay

23 fotos de 7 productos, más 2 videos. No había proyectos cargados cuando se
escribió esta sección, así que el archivo de portfolio —el que va a ser el grueso
del sitio— **no existía y no se podía diseñar contra él**. Lo que había era
catálogo.

**Desde la Fase 4.3 hay uno**, `cowork-nordelta`: seis fotos —dos 4:5 y cuatro
3:2, todas de 2560 px— y dos videos que son recorridos de cámara por la
oficina, uno apaisado de 15 s y el primer vertical del sitio, de 22 s. Es un
juego más parejo que el de productos y es **el primer material corporativo**:
fachada vidriada curva, rollers screen, puestos de trabajo — decisiones 51 y 52.

**Desde la Fase 4.4 están también las ocho fotos de variante** —Screen y
Blackout de Roller, Riel y Barral de Cortinas de confección, que hasta la 4.7 se
llamaba Cortinas de tela y sigue en la carpeta `cortinas-tela`—: cuatro 4:5, tres 5:4 y
una 3:4 (decisión 48). Entre ellas está la más chica del catálogo,
`cortinas-tela/barral/2`, de 1028 × 822. La tabla y el análisis que siguen son
los de la 4.1, sobre las 23 de producto.

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

Así era en la 4.1. **Desde la 4.4 hay repuesto para dos productos**: las fotos
de variante suman cuatro 4:5, dos de Roller y dos de Cortinas de tela. Los otros
cinco siguen con margen cero. Las dos 4:5 del cowork son de proyecto.

**2. Ninguna portada aguanta sangrado a pantalla completa en escritorio.**

Los anchos máximos de las siete portadas son 2338, 2418, 2418, 2560, 2560, 2560 y
2560 px. Una foto a todo el ancho en un monitor de 1440 con pantalla de doble
densidad pide 2880 px. La mejor del archivo, `cortinas-tela/1`, se agrandaría un
23 %. **El hero a sangre completa no está disponible en este archivo**, y no es
una cuestión de gusto: es aritmética.

En el teléfono sí: 375 × 3 = 1125 px, y ahí sobra con cualquiera.

**3. `toldos/3` tiene 1600 px y es la única 16:9.**

Era la única foto del archivo que no llegó a las cuatro medidas —desde la 4.4
está también `cortinas-tela/barral/2`, de 1028 px, con tres—. En un módulo chico
de una grilla se ve perfecta; en cualquier lugar grande, no. El diseño tiene que
poder **asignarle un lugar chico sin que eso se vea como un error**.

**4. Los dos videos son 16:9 de 1280 px y once segundos.**

Horizontales, mudos —sin pista de audio, no «silenciados»— y cortos. No entran en
el ritmo vertical 4:5 de las portadas y no se pueden mostrar grandes: 1280 px a
doble densidad es una caja de 640 px de CSS. **El video no puede ser el
protagonista de una página; es una celda más del damero.**

Desde la 4.3 hay además dos de proyecto, uno de ellos vertical. Y el de «Riel
motorizado» era un vertical que llegó metido en un cuadro horizontal, con las
franjas negras dentro del archivo: en la 4.7 se recortó, y hoy es un vertical
de 710 × 1076 (decisión 66).

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

El fondo del boceto de la empresa, `#EDEFF0`, es exactamente eso: un gris de
saturación muy baja, apenas frío (decisión 66).

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

### Cuatro fotos con problemas de privacidad, ya resueltas

**`roller/3` y `toldos/3` tienen personas visibles** y **`roller/2` tiene ropa
tendida** en el patio vecino. `docs/fotografia.md` dice «nada de personas».

**Se quedan las tres** — decisión 42: en las dos con personas están de espaldas
o lejos y no son identificables, que es lo que la regla existe para evitar. La
guía rige para las fotos nuevas, donde no hay excepción; el archivo viejo se
mira caso por caso y el criterio es la identificabilidad, no la presencia.

Esto no cambia nada de lo visual, pero sí baja a las tres de categoría: ninguna
de las tres se muestra grande.

**Una cuarta, encontrada al elegir las imágenes para compartir** — decisión
63: `cortinas-tela/3` tiene, contra el borde izquierdo, el pelo y el hombro de
una persona, cortados por el cuadro. No se la reconoce y la foto se queda,
con el mismo criterio; pero ninguna imagen para compartir lleva ni un pedazo
de alguien, así que esa no es la de Cortinas de confección.

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

«Cal» tomó la segunda. El boceto de la empresa toma la primera: las líneas
finas en pizarra del damero son su recurso de separación (decisión 66).

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

La empresa tiene dos logos, los dos del boceto, y un color: el azul verdoso de
sus bloques. Los valores están medidos de los archivos y del código del boceto,
no estimados:

```
Logo           #35363A   gris carbón, un solo color
Azul verdoso   #80A6AD   el color de la marca: una superficie
```

### Los dos logos

**El de círculos de línea** es el principal: dos círculos de línea fina,
«espacio» en minúscula y «CORTINAS» en versalita espaciada, todo en el mismo
gris carbón. Llegó en un PNG transparente de 1.695 px y
`scripts/preparar-marca.mjs` lo publica en 600 y 1.200. Va grande en el bloque
azul verdoso de la apertura de Inicio —4,58:1 sobre ese color— y en la banda
de las imágenes para compartir.

**El circular** es un círculo gris carbón con el logo calado adentro y un aro
fino alrededor. Lo calado deja ver el fondo, así que sobre el gris del sitio las
letras quedan claras. Es el que el boceto pone en su Nosotros; llegó bajado del
boceto, en AVIF de 704 px, y se publica en 96 y 144. Va en la barra de enlaces
de todas las páginas menos Inicio, en el lugar del enlace «Inicio». **Y es el
ícono de la pestaña**, sobre un disco del color del fondo para que no
desaparezca en una pestaña oscura — decisiones 45 y 66.

**Nunca los dos en la misma pantalla.** En Inicio la barra no lleva el
circular, porque el de líneas está grande en la apertura: es lo que hace el
boceto, cuyo encabezado no tiene logo. En las demás páginas el circular es el
único.

**El pie escribe el nombre en vez de poner un logo**: los dos son gris carbón,
y sobre el teal oscuro del pie no se leerían. No hay versión clara, y no se
inventa una.

### El azul verdoso es un color de superficie

Como el amarillo del logo anterior, y por la misma razón: no le da el
contraste para llevar cualquier cosa encima, ni para ser una línea.

| Combinación                           | Contraste |             |
| ------------------------------------- | --------: | ----------- |
| texto `#2F2F2F` sobre azul verdoso    |    5,08:1 | se usa      |
| pizarra `#405357` sobre azul verdoso  |    3,08:1 | solo grande |
| blanco sobre azul verdoso             |    2,63:1 | no se usa   |
| azul verdoso sobre el fondo `#EDEFF0` |    2,28:1 | no se usa   |

**Las reglas de uso:**

1. Solo como superficie, con el texto oscuro encima. Nunca como texto, enlace
   ni línea.
2. Nunca como único indicio de un estado: contra el fondo no llega a los 3:1
   de un elemento de interfaz con significado.
3. **Bloques con función, y no más**: la apertura de Inicio, el nombre de un
   producto destacado, el cierre de cada página, la confirmación del formulario
   y el botón flotante de WhatsApp. Si todo fuera un bloque azul verdoso,
   ninguno diría nada.

**El teal oscuro del pie, `#5A767B`, es el mismo color un paso más oscuro**,
para que el blanco encima llegue a 4,87:1. El del boceto, `#607D82`, daba 4,42.

### Lo que falta pedirle a la empresa

- **El logo en vector** (SVG, `.ai` o `.eps`), para imprenta. Para el sitio
  alcanza el PNG: lo más grande que se publica son 1.200 px.
- **Una versión clara, para fondo oscuro.** El sitio no la necesita —el pie
  escribe el nombre—; un PDF o una publicación, sí.

---

## La dirección

**La del boceto de la empresa** — decisión 66. Los valores de abajo están
fijados como tokens en `app/globals.css` y **se usan siempre por token, nunca
sueltos en los componentes**.

### Los ejes

- **La idea de la empresa, adaptada al teléfono.** Se toman sus colores, su
  letra, sus bloques y el armado de sus páginas; no su maqueta, que no anda en
  un teléfono, y el sitio se ve casi entero desde uno.
- **Un color propio, el de la empresa.** El azul verdoso, en bloques. Todo lo
  demás es gris, pizarra y blanco.
- **Espacio antes que elementos.** Ante la duda, sacar algo, no agregar.
- **Texto sobre foto: no.** Ver el análisis de contraluz.
- **Nada que delate un sitio hecho con IA** —reglas 11 a 13—: es lo que la
  empresa vio en la dirección anterior, y tenía razón.
- **Quietud.** El producto son cortinas: luz, textura, calma. La interfaz no
  tiene que competir con eso.

El nombre ayuda: _Espacio_ Cortinas sugiere ambiente, no producto. El sitio
muestra espacios, no artículos.

### La tesis

**Bloques de color y líneas finas.** El boceto compone con dos recursos: un
bloque azul verdoso, opaco, que lleva el nombre o el mensaje y se monta sobre el
borde de una foto sin taparla; y una grilla de 2×2 con líneas finas en
pizarra, donde foto y texto se alternan.

**Qué problemas del material resuelve:**

- **La partición del archivo entre fotos cálidas y frías.** El fondo es un gris
  de saturación muy baja que sostiene las dos familias, y el azul verdoso,
  apagado, no pelea con el cielo de las frías ni ensucia las cálidas.
- **La disparidad de calidad.** En el damero cada foto tiene su celda y su
  proporción, al lado de un texto: una foto mediana se lee como parte de la
  página, no como un error.
- **Que el sitio no tenía un color propio.** Ahora lo tiene, y es el de la
  empresa.

**Qué hay que vigilar:** que el bloque azul verdoso no se use para todo, y que
las líneas sigan siendo finas. Un recuadro con sombra o con las esquinas
redondeadas ya es la tarjeta de plantilla.

### Color

```
Fondo          #EDEFF0   el gris del boceto
Superficie     #FFFFFF   campos, avisos, el lugar de una foto mientras carga
Texto          #2F2F2F                                       11,61:1
Texto suave    #56656A   lemas, pies y chips                  5,25:1
Acento         #405357   pizarra: títulos, enlaces, botón      7,02:1
Acento hondo   #2F3E41   el hover del botón principal
Línea          #C9D1D3   filetes decorativos
Marca          #80A6AD   azul verdoso, ver «La marca»
Marca oscuro   #5A767B   el pie
```

Los contrastes son sobre el fondo; sobre el blanco, el texto suave da 6,06:1.

- **Títulos y enlaces en pizarra.** Los enlaces van subrayados. Sobre un bloque
  azul verdoso heredan el color del texto que los rodea, porque la pizarra ahí
  da 3,08:1.
- **Botón principal: pizarra sólida, blanco encima** — 8,10:1.
- **Botón secundario: filete pizarra de 1 px**, sin relleno.
- **El azul verdoso no es el botón principal**: no le da para llevar texto
  blanco. El único botón azul verdoso es el flotante de WhatsApp, con el texto
  oscuro, como en el boceto.

**Sin el azul de las interfaces.** El azul saturado y el violeta son el color
por defecto de las interfaces genéricas, y siguen prohibidos (regla 6). El azul
verdoso de la empresa es otra cosa: apagado, elegido por ella y solo de
superficie.

### Tipografía

**Raleway para todo**, títulos y texto: una sola familia, como el boceto. Se
carga con `next/font` en `app/tipografias.ts`: los archivos se descargan en el
build y se sirven desde el propio dominio, así que no hay pedido a un tercero
en tiempo de ejecución ni salto al renderizar.

**Con cifras de línea**, todas de la misma altura. Raleway trae por defecto las
antiguas, que suben y bajan como minúsculas: quedan lindas en un párrafo y
desparejan un teléfono, una medida —«25 mm»— o un precio.

**Tahoma, que el boceto usa en algunos títulos, no**: es de Windows, y en los
teléfonos no está.

```
Display      32 → 56 px    títulos
Título       24 → 34 px    títulos
Subtítulo    19 → 22 px    títulos y lemas
Cuerpo       17 → 18 px    texto
Menú            15 px      la barra de enlaces, en escritorio
Meta            13 px      texto
```

Cada tamaño crece solo entre el teléfono y el escritorio, así que la escala no
se repite en cada punto de quiebre. Texto de lectura entre 60 y 75 caracteres
por línea. En el teléfono nunca menos de 16 px, salvo la barra de enlaces, que
baja hasta 12 para entrar en una fila.

**Mayúscula espaciada, solo donde la pone el boceto y en grande**: «TU MEJOR
COMPAÑÍA», en la apertura de Inicio, y el nombre de cada producto en su bloque.
Las etiquetas chicas en mayúscula espaciada se fueron todas, y las reemplazan
los **lemas**: en minúscula, en el gris del texto suave y arriba del título —
«filtrar u oscurecer», «a medida», «error 404».

**Sin palabras solas al final de un párrafo** (`text-wrap: pretty`), y los
títulos y los textos centrados cortos, equilibrados (`balance`).

### Espaciado

Una sola escala, múltiplos de 4. El ritmo vertical entre secciones es **64 en
teléfono y 112 en escritorio**, y es lo que hace que un sitio se lea como
diseñado y no como ensamblado. Margen lateral 20 → 48. El damero no lleva
margen: va de borde a borde.

### Las piezas

**El bloque azul verdoso.** Opaco, sin borde ni sombra. En la apertura de
Inicio lleva el logo grande y se monta sobre el borde de la foto; en los
productos destacados, el nombre en mayúscula y una flecha, sobre el borde de su
portada; al final de cada página, el cierre, con una sola acción. Nunca más
angosto que su palabra más larga.

**El damero.** Foto y texto alternados en una grilla de 2×2 con líneas finas
en pizarra, de borde a borde, como las páginas de producto del boceto. En el
teléfono es una columna, con cada foto arriba de su texto; en escritorio son
dos, y las filas alternan el lado. Qué va en cada celda lo decide
`lib/damero.ts`, y `components/damero.tsx` lo dibuja:

1. la portada, con el recuadro del producto;
2. cada variante con texto propio —Screen y Blackout de Roller— arma su propio
   2×2: una foto con su nombre, su lema y su descripción, y otra con su
   recuadro;
3. las demás variantes van juntas en una celda de texto, centrada y con
   filetes entre una y otra. La que tiene fotos o video y no tiene descripción
   no se repite ahí: ya está nombrada arriba de sus medios;
4. lo suelto va de a dos, con el nombre de su variante arriba de cada foto.

Un proyecto es más simple: todas sus fotos y videos de a dos, en el orden de la
carpeta. El catálogo, el listado de trabajos y Nosotros se arman con las mismas
piezas.

**La barra de enlaces.** A la vista, en una fila y sin franja: a la derecha en
escritorio, a lo ancho en el teléfono. En minúscula y con «Trabajos» en vez de
«Nuestros trabajos», porque es lo único que entra en una fila en un teléfono de
320 (`components/navegacion.tsx`, con las medidas). **Se ve igual en todas las
páginas**: fuera de Inicio, el enlace «Inicio» es el logo circular. No se pega
arriba al hacer scroll.

**El botón flotante de WhatsApp.** Abajo a la derecha, en todas las páginas:
«Chateá con nosotros», azul verdoso con el texto oscuro, como el del boceto. El
pie deja aire abajo para que no tape su último enlace.

**El pie**, en el teal oscuro con el texto blanco: el nombre escrito, los
medios directos de contacto con su símbolo y los enlaces. El anillo de foco
pasa a blanco, porque el pizarra ahí da 1,66:1.

### Imagen

- **En el damero, de borde a borde en el teléfono y a media pantalla en
  escritorio**, a la proporción de cada foto y sin recortar. Es lo que el
  archivo aguanta: en el teléfono sobra con cualquiera —375 × 3 = 1.125 px—, y
  ninguna portada tiene píxeles para un sangrado entero en escritorio (punto 2
  del análisis).
- **Sin texto encima, nunca.** Los bloques se montan sobre el borde de una
  foto, opacos, y no tapan lo que la foto muestra.
- **Sin borde y sin sombra.** Lo que separa es el aire o la línea del damero.
- Radio 0.

### El tamaño de cada foto sale de la foto, no de su posición

Es lo que sobrevivió de la dirección «Regla» — decisión 48. Todo sale de
`contenido/fotos.ts`, que lo escribe el script, y nada de una lista escrita a
mano.

**Ninguna foto se muestra más ancha que su tope**: `ancho / 2`, con el 2 de
`DENSIDAD_DE_REFERENCIA`. En el damero cada foto ocupa su celda, sin pasar de
44 rem de alto, y el tope la frena antes cuando el archivo no da:
`cortinas-tela/barral/2` (1028 px → 514) queda más angosta que su celda, y los
videos también (1280 → 640; los verticales, 720 → 360 y 710 → 355). En el teléfono
la celda es más angosta que cualquier tope.

**El ancho de cada foto se calcula con su proporción**, y no se deja
automático: una foto que todavía no cargó mide 300 px, y en Roller la página
pasaba de 4.814 a 6.503 px mientras llegaban.

**El aire que queda al lado es la curaduría.** Que `toldos/3` o
`cortinas-tela/barral/2` no puedan ocupar un lugar grande deja de ser una
limitación y pasa a ser una decisión editorial.

**No reemplaza a la tabla de calidad de más arriba**, que califica por
contenido y que ningún número deduce: `bandas-verticales/4` y `/5` están
calificadas «apoyo» y aparecen igual. La respuesta a una foto floja sigue
siendo sacarla.

---

## Sistema

Lo que sigue son reglas que no dependen de la dirección: valían con «Cal» y
siguen valiendo con el boceto.

### Imágenes

- **Portadas y tarjetas: 4:5 vertical.** Siempre, sin excepción, para que las
  grillas queden parejas. De producto, las únicas 4:5 de repuesto son cuatro de
  variante, de Roller y de Cortinas de confección: los otros cinco no tienen
  margen.
- **Damero: la proporción propia de cada foto.** Está permitido mezclar; el
  damero no es una grilla rígida. Las 37 fotos publicadas son 19 verticales y
  18 horizontales.
- Donde la proporción es fija, contenedor con proporción y `object-fit: cover`.
  Nunca deformar.
- Siempre con `ancho` y `alto` para que no salte el contenido al cargar.
- Carga diferida en todo menos en la primera imagen visible.
- Sin filtros CSS sobre las fotos. Si una foto no sirve, se cambia la foto.
- **Recorte alto antes que centrado** cuando haya que recortar: el piso es la
  zona desordenada de casi todas.

### Componentes

Radios de esquina chicos: 2 px en campos y botones. `rounded-2xl` en todo es
una de las marcas más reconocibles de la plantilla genérica. **Lo único redondo
es el logo circular**, que es una imagen, y el anillo de foco del enlace que lo
lleva, que sigue su borde.

**Sin sombras.** La separación se logra con espacio, con la línea del damero o
con un cambio de color de fondo. Las tarjetas flotantes con sombra difusa son la
otra marca reconocible.

**Lo que existe.** La lista es corta a propósito: cada componente que se agrega
es uno que hay que mantener coherente con todos los demás.

| Componente              | Archivo                                                                        | Variantes                                                              |
| ----------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Botón                   | `components/ui/boton.tsx`                                                      | principal, secundario, enlace — tres                                   |
| Chip                    | `components/ui/chip.tsx`                                                       | una                                                                    |
| Campo                   | `components/ui/campo.tsx`                                                      | una, con tres controles: línea, párrafo y lista                        |
| Aviso                   | `components/ui/aviso.tsx`                                                      | error y nota                                                           |
| Estado vacío            | `components/ui/vacio.tsx`                                                      | una                                                                    |
| Columna de página       | `components/ui/contenedor.tsx`                                                 | una                                                                    |
| Foto                    | `components/foto.tsx`                                                          | cinco proporciones, tres recortes                                      |
| Damero                  | `components/damero.tsx`, con la regla en `lib/damero.ts`                       | producto y proyecto, y sus piezas sueltas para los listados y Nosotros |
| Video mudo              | `components/video-mudo.tsx`                                                    | una: en bucle, en su celda                                             |
| Tarjeta de producto     | `components/tarjeta-producto.tsx`                                              | una: la portada con su bloque azul verdoso — solo Inicio               |
| Tarjeta de proyecto     | `components/tarjeta-proyecto.tsx`                                              | fila y tarjeta — dos                                                   |
| Listado de proyectos    | `components/listado-proyectos.tsx`                                             | una: el primero en fila, el resto en grilla                            |
| Formulario de contacto  | `components/formulario-contacto.tsx`                                           | una: sin hidratar, escribiendo, enviando, enviada, fallida             |
| Medios de contacto      | `components/medios-de-contacto.tsx`                                            | número de WhatsApp, email, red y «Llamar» — cuatro                     |
| Símbolos de contacto    | `components/iconos-de-contacto.tsx`                                            | WhatsApp, Instagram y el sobre — tres, y ninguno más                   |
| WhatsApp flotante       | `components/whatsapp.tsx`                                                      | una                                                                    |
| Logos                   | `components/logo.tsx`                                                          | el grande de la apertura y el circular de la barra — dos               |
| Encabezado, barra y pie | `components/encabezado.tsx`, `components/navegacion.tsx`, `components/pie.tsx` | una                                                                    |

Botones: **uno principal sólido, uno secundario con línea, y enlaces de texto.
Tres variantes, no siete.** El principal es pizarra, no azul verdoso.

**Los estados no usan color** — decisión 46. Un rojo sería un color más,
inventado, en una paleta que es la del boceto, y el azul verdoso no puede
marcar un estado: 2,28:1 contra el fondo, contra los 3:1 que hacen falta. Lo
que marca un estado son las palabras, el peso y el borde. **Y sin filetes al
costado**, que son otra marca de sitio hecho con IA (regla 13).

**El formulario de contacto es el único lugar con estados, y los usa así** —
decisión 57:

| Estado       | Cómo se ve                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| sin hidratar | el botón **apagado** al 50 %: hasta que React toma el formulario, enviarlo pondría los datos en la URL      |
| inválido     | el error en negrita debajo de cada campo, que engorda su borde; el foco va al primero                       |
| enviando     | «Enviando…» con la rueda. El botón no se puede tocar y **no se apaga al 50 %**, que lo dejaría ilegible     |
| enviada      | el formulario se reemplaza por la confirmación, en un bloque azul verdoso, y la confirmación recibe el foco |
| fallida      | el aviso en un recuadro blanco con borde de 2 px, y WhatsApp como salida, con lo escrito ya en el mensaje   |

**Uno solo es principal en `/contacto`: el de WhatsApp.** El de enviar el
formulario es el secundario, con filete: la jerarquía entre los dos canales la
dice el propio dibujo. En el estado fallido aparece un segundo principal,
«Mandarlo por WhatsApp», porque ahí es la única salida que queda.

**El borde de un control es `--color-texto-suave`, no `--color-linea`.** La
línea da 1,55:1 contra el blanco del campo: alcanza para un filete decorativo y
no para el borde de un campo, que es lo único que dice dónde empieza y dónde
termina. WCAG pide 3:1; el texto suave da 6,06:1.

**El estado vacío se dice, no se tapa.** Un listado sin contenido —`/proyectos`
hasta la Fase 4.3, y de nuevo si algún día todos quedan inactivos— lleva un
bloque de superficie con el mismo ritmo vertical que una sección de verdad,
alineado al margen de la columna, que explica por qué está vacío y ofrece a
dónde seguir. Sin ícono y sin centrar: un bloque centrado con un ícono arriba es
el estado vacío de plantilla que la regla 4 existe para evitar.

---

## Reglas verificables

Prohibido, salvo justificación escrita en `docs/decisiones.md`:

1. Fondos con gradiente
2. Sombras difusas en tarjetas
3. Radios mayores a 4 px
4. Ícono decorativo al lado de cada título
5. Grilla de tres columnas con ícono, título y párrafo («nuestros valores»)
6. Azul saturado o violeta como color de marca o de interfaz
7. Más de dos familias tipográficas
8. `fade-in` o `slide-up` al hacer scroll en secciones enteras
9. Parallax, marquesinas, contadores animados
10. Texto sobre foto sin capa que garantice contraste
11. Etiquetas chicas en mayúscula espaciada
12. Listas numeradas con filetes —«01 · 02 · 03»— como recurso decorativo
13. Un filete grueso al costado de un texto, para marcar un aviso o una cita

**Las reglas 11 a 13 entraron con la decisión 66.** Son lo que la empresa vio
en la dirección anterior —«se nota que lo hizo una IA»—, junto con el fondo
crema y la serif de display. La mayúscula espaciada en grande, donde la pone el
boceto, no es la regla 11.

**La regla 6 se reescribió con la 66.** Decía «azul o violeta como color de
marca», y la marca de la empresa es un azul verdoso. Lo que protegía es otra
cosa: el azul saturado de las interfaces genéricas. El de la empresa es apagado
y va solo de superficie.

**La regla 3 tiene una excepción, que no es un radio de interfaz**: el logo
circular, y el anillo de foco que lo sigue.

**La regla 4 tiene una excepción, y es una sola**: los medios directos de
contacto —WhatsApp, el email e Instagram— llevan su símbolo al lado del enlace,
en `/contacto` y en el pie. No son adorno: dicen qué se abre al tocarlo. Van en
el color del texto que los rodea, nunca en el verde de WhatsApp ni en el degradé
de Instagram, y no se extienden a ningún otro dato; «Llamar» no lleva, porque la
palabra ya lo dice — decisión 65.

La regla 10 se endurece con lo que muestra el archivo: **la capa tiene que ser
opaca**. Un velo translúcido o un gradiente sobre estas fotos no garantiza nada,
porque la zona clara de cada cuadro cambia de lugar.

**La regla 7 ya no tiene excepciones**: la única era `/muestra`, que cargaba
seis familias tipográficas a la vez para comparar las tres direcciones de la
4.1. No era una página del sitio, y se borró el 29/09/2026 al cerrar la
Fase 4.5 — decisión 41. Desde la 4.7 el sitio usa una sola.

---

## Movimiento

Escaso y con función: transiciones de estado (150–200 ms). Nada que se dispare
solo al hacer scroll.

**Los videos** —los dos de variante y los dos de proyecto— van en su celda del
damero: mudos, en bucle, sin controles y con `preload="none"`. Arrancan cuando
quedan a la vista y se pausan al salir, así que uno que está más abajo no se
descarga hasta que alguien llega. Con `prefers-reduced-motion: reduce` no se
reproducen: queda el cuadro fijo y un control para iniciarlo. Si la
reproducción automática está bloqueada —el modo de bajo consumo de iOS—,
aparece el mismo control.

**Acá el movimiento ES el contenido y no un adorno**, y es la única excepción a
«escaso y con función»: el video de una variante muestra la cortina moviéndose
sola, que es lo único que una foto no puede (decisión 40), y los de proyecto son
recorridos de cámara (decisión 51). La decisión 48 anota qué muestra cada
archivo, porque no es lo que dice su nombre.

Respetar `prefers-reduced-motion` en todo lo demás también.

---

## Mobile-first

Se diseña primero para 375 px de ancho, y recién después tablet y escritorio. No
al revés. **Y con razón**: se calcula que nueve de cada diez visitas van a
llegar desde un teléfono.

- Nada depende de `hover` para funcionar o entenderse
- Zonas táctiles de 44 px como mínimo. El logo circular de la barra, que es más
  chico, no baja de los 24 que pide WCAG
- **La barra de enlaces, en una fila**, sin menú desplegable, también a 320
- **WhatsApp siempre alcanzable sin buscarlo**: desde la Fase 4.7, el botón
  flotante, en todas las páginas. Además está en la apertura de Inicio, de
  Contacto y de cada producto y proyecto, y en el cierre de cada página
  (decisión 61)
- Se verifica en 320, 375, 768, 1024 y 1440

---

## Accesibilidad

Es parte de terminado, no un extra:

- Contraste mínimo 4.5:1 en texto, también sobre el azul verdoso y en el pie
- Foco visible en todo lo navegable por teclado; en el pie, el anillo es blanco
- Encabezados jerárquicos, un solo `h1` por página
- Toda imagen con texto alternativo. El logo circular, que es un enlace, dice
  adónde lleva: «Espacio Cortinas, inicio»
- El botón flotante va último al tabular: no se interpone entre el salto al
  contenido y la página

---

## Orden de trabajo en la fase de diseño

```
Material fotográfico real                       ✓ Fase 4.1
        ↓
Dirección visual (color, tipografía, ritmo)     ✓ Fase 4.1, rehecha en la 4.7
        ↓
Sistema y componentes base                      ✓ Fase 4.2, rehecho en la 4.7
        ↓
Composición de cada página                      ✓ Fases 4.3 a 4.6, y 4.7
        ↓
Implementación                                  ✓ Fases 4.3 a 4.7
        ↓
Verificación en los cinco anchos                ✓ la última, en la etapa 5 de la 4.7
```

No se escriben componentes antes de haber fijado la dirección visual. Ese salto
es exactamente lo que produce el resultado genérico que queremos evitar. **La
4.7 mostró el otro lado**: una dirección fijada con cuidado también puede salir
genérica, si sus decisiones son las mismas que toma cualquier generador. De ahí
las reglas 11 a 13.

---

## Las direcciones descartadas

Quedan acá porque la razón por la que se descartaron sigue valiendo, y porque
volver sobre una de ellas sin leer esto sería repetir el análisis. **«Cal» fue
la del sitio de la Fase 4.1 a la 4.6**; las otras dos se descartaron en la 4.1.

### A · «Cal» — el papel · USADA HASTA LA 4.7, Y DESCARTADA POR LA EMPRESA

**La tesis:** el papel hace el trabajo. Un fondo de cal, apagado y cálido,
integra las fotos desparejas rodeándolas de aire en vez de enmarcándolas. La
foto nunca toca el borde de la pantalla: entra en la misma columna que el texto,
alineada al mismo margen, y la página se lee como una sola columna editorial.

**Qué problema del material resolvía:** la disparidad de calidad. Una foto
mediana rodeada de aire cálido se lee como una lámina; la misma foto a sangre se
lee como un error.

```
Fondo         #F6F2EC   papel de cal
Superficie    #EFE9E0   un paso, para separar sin bordes ni sombras
Texto         #211F20   el negro del logo de entonces        14,69:1
Texto suave   #6B645C   metadatos, pies y chips               5,23:1
Acento        #211F20   el mismo negro
Línea         #DED6CA
Marca         #FFF100   el amarillo del logo de entonces, solo como superficie
```

**Tipografía:** Fraunces para títulos y Karla para texto. **Con el acento de
«Regla»**: el negro del logo para enlaces y botón, y ningún color inventado —
decisión 43.

**Por qué se descartó:** la empresa lo miró terminado y lo rechazó en lo
visual —«no tiene diseño, se nota que lo hizo una IA»—, y armó un boceto con sus
colores. Tenía razón: el fondo crema, la serif de display, la lista numerada con
filetes y las etiquetas chicas en mayúscula espaciada son hoy las marcas más
repetidas de los sitios generados con IA, y el sitio no tenía un color propio.
Lo que este documento anotaba como el riesgo —que «llevado al extremo blando
puede terminar oliendo a spa»— era el problema. Decisión 66.

**Lo que sobrevivió de «Cal»:** el análisis del material, la regla de no poner
texto sobre una foto, el tope de píxeles, el ritmo vertical de 64 a 112, la
escala tipográfica y los estados sin color.

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

**Qué arriesga:** bastante, y hubo que mirarlo de frente en `/muestra`. Un sitio
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
translúcido. Es la única de las tres que lo permite, y en `/muestra` estaba el
ejemplo para poder rechazarlo.
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

Lo que sigue es el análisis de la 4.1, con el logo de entonces, el del círculo
amarillo.

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
curar un archivo desparejo. La 4.4 tomó el mecanismo pero no la tabla —decisión
48—, y la 50 cambió el módulo por la tira: de esa idea queda el tope de píxeles,
que con la decisión 66 vale también en el damero.
