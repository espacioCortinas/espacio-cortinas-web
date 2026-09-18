# Seguridad

El sitio no maneja pagos ni datos sensibles, no tiene base de datos, no tiene
autenticación y nadie escribe en él desde internet. **Queda un solo riesgo
serio, y es de contenido: las fotos son de casas de clientes.**

Este documento era tres veces más largo. Cubría el acceso al panel, RLS,
políticas de Postgres, subidas firmadas y caché de respuestas autenticadas —
todo eso desapareció con el panel (decisión 36). Lo que queda es lo que sigue
siendo cierto.

## Qué superficie hay

```
Navegador
    │
    ▼
Cloudflare Workers   sirve HTML y archivos estáticos, generados en el build
    │
    ▼
(nada más)           sin base, sin sesión, sin API, sin escritura
```

La única parte que ejecuta código en respuesta a algo que manda un visitante es
el **formulario de contacto** de la Fase 4.6. Todo lo demás es contenido
generado al construir.

**Lo que esto elimina de raíz**, y conviene tenerlo presente antes de
reintroducir cualquier cosa: no hay credenciales que robar en el sitio, no hay
sesión que secuestrar, no hay inyección SQL posible porque no hay SQL, y no hay
forma de que un visitante modifique nada — para cambiar el sitio hay que tener
acceso de escritura al repositorio.

## Privacidad de las imágenes

**Este es el riesgo real del proyecto y no cambió.**

Las fotos son de casas particulares de clientes, y las de celular llevan las
coordenadas del domicilio en el EXIF. Publicarlas sin limpiar expone la
dirección exacta de un cliente a cualquiera que descargue la imagen. No es
hipotético: cualquier visor de metadatos lo muestra, y se comprobó en la Fase 3
con una foto real de la empresa — traía EXIF de iPhone, IPTC y las coordenadas
de la casa con precisión de metros.

`scripts/preparar-fotos.mjs` recomprime cada foto con `sharp`, que **descarta
todos los metadatos** salvo que se le pidan explícitamente con
`.withMetadata()`, cosa que ese código no hace en ningún lado. Y `.rotate()`
aplica la orientación del EXIF **antes** de recomprimir, que es la única
oportunidad: después el EXIF ya no existe y una foto sacada con el teléfono de
costado quedaría acostada para siempre.

**Igual hay que verificarlo, no darlo por sentado**, porque es el tipo de cosa
que se rompe en silencio el día que alguien toca el pipeline:

```
npm run fotos:revisar
```

Recorre `public/fotos/` **y `public/videos/`** enteros, dice qué metadatos tiene
cada archivo, imprime las coordenadas si las hay y **devuelve 1 si alguno las
conserva**. Se corre sobre todas las medidas, no solo sobre la más grande.

**Los videos también.** Un video de celular guarda las coordenadas igual que una
foto, en una de dos cajas del contenedor MP4: `©xyz`, la de QuickTime que pone
un iPhone, y `loci`, la de 3GPP que ponen Android y ffmpeg. El script lee las
dos. Hasta la Fase 4.4 no sabía leer MP4 y **daba por bueno cualquier formato
que no reconociera**, así que los dos videos del catálogo pasaban el control sin
que nadie los mirara. Ahora un formato ilegible cuenta como fallo: todo lo que
hay en esas dos carpetas es material que se publica, y lo que no se puede
comprobar no se aprueba — decisión 48.

Del lado del pipeline, lo que borra los metadatos de un video es
`-map_metadata -1`, y lo que le saca la pista de audio es `-an`. El script
comprueba además que ningún video publicado conserve pista.

Lo único que sobrevive a propósito es el **perfil de color ICC** (unos 480
bytes). Describe el espacio de color y no dice nada del lugar, del equipo ni de
la fecha; se conserva porque un iPhone saca en Display P3 y, sin declararlo, los
navegadores asumen sRGB y los colores de las telas salen apagados.

### La regla de contenido, que no es de código

No publicar fotos donde se vean personas, documentos, correspondencia con
direcciones, o el frente de la casa con el número. Ninguna herramienta atrapa
eso: se mira antes de poner el archivo en `fotos-originales/`.

## Los originales no se versionan

`fotos-originales/` está en `.gitignore`. Ahí adentro hay fotos **con** el EXIF
intacto, así que commitearlas publicaría en el repositorio exactamente lo que
este documento existe para evitar. Viven en el Drive de la empresa — decisión 18.

## Claves

Queda una sola, y todavía no se usa:

| Clave            | Dónde puede estar                                   |
| ---------------- | --------------------------------------------------- |
| `RESEND_API_KEY` | **solo servidor**, como Secret del Worker. Fase 4.6 |

`lib/entorno-servidor.ts` lleva `import "server-only"` en la primera línea, para
que el build falle si alguien lo importa desde un componente cliente.

Cualquier cosa con prefijo `NEXT_PUBLIC_` termina en el paquete que descarga el
navegador. No hay excepciones ni forma de ocultarlo, y por eso
`NEXT_PUBLIC_SITE_URL` se declara en `wrangler.jsonc` a la vista: no hay nada
que proteger y sí algo que ganar en poder auditar el valor — decisión 30.

## El repositorio es privado

Es lo que reemplaza a toda la capa de autenticación que había: **el control de
acceso al contenido ahora es el control de acceso al repositorio.** Quien puede
pushear puede cambiar el sitio.

Además, `docs/infraestructura.md` publica el vencimiento del dominio, quién es
el titular registral y que el acceso a NIC es por Clave Fiscal. Nada de eso
tiene por qué estar indexado.

**Ya se volvió público una vez** sin que nadie lo notara. No es un estado que se
pueda dar por sentado. Se verifica sin autenticar, que es la única comprobación
que vale:

```powershell
Invoke-RestMethod -Uri 'https://api.github.com/repos/espacioCortinas/espacio-cortinas-web' -Headers @{'User-Agent'='check'}
```

Si responde con datos, es público. Si devuelve 404, es privado. Mirar la página
en el navegador no sirve: la sesión propia la muestra igual en los dos casos.

## Formulario de contacto — Fase 4.6

Es lo único que va a aceptar datos de un desconocido, así que es donde hay que
poner el cuidado:

- Validación de entrada en el servidor
- Escape del contenido en el email: nada de HTML del usuario
- Campo trampa oculto contra bots
- Límite por IP
- Los mensajes no se guardan en ningún lado: van al correo y ahí quedan
  (decisión 12)

## Cabeceras — Fase 5

En `next.config.ts`:

- `Content-Security-Policy` acotada a los orígenes propios
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

`Strict-Transport-Security` no va acá: lo agrega Cloudflare en el borde, para
que también cubra las respuestas de los redireccionamientos, que nunca llegan a
este código.

## Checklist antes de publicar

- [ ] `npm run fotos:revisar` en verde: ninguna foto ni ningún video publicado
      conserva GPS
- [ ] Ninguna foto muestra personas, documentos ni el número de la casa
- [ ] `fotos-originales/` sigue en `.gitignore`
- [ ] El repositorio sigue siendo privado, verificado sin autenticar
- [ ] `RESEND_API_KEY` cargada como Secret y ausente del paquete del navegador
- [ ] El formulario resiste un envío automatizado básico
- [ ] Next en la última versión estable
