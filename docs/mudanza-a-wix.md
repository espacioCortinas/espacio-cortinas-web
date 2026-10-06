# Pasar el sitio a Wix

El paso a paso para que `espaciocortinas.com.ar` deje de servir el sitio de este
repositorio y pase a servir uno armado en Wix, **si se decide hacerlo**.

**La mudanza no está decidida: es una posibilidad.** En octubre de 2026 apareció
la opción de usar un sitio que la empresa diseñó en Wix, y este documento existe
para que, si se elige ese camino, se haga sin romper el correo ni los enlaces.
Hasta entonces no se hizo ninguno de estos pasos: el sitio sigue siendo el de
este repositorio, y el estado real es el que describe `docs/infraestructura.md`.

Se comprobó el 05/10/2026 contra la documentación de Wix y de Cloudflare y
contra el DNS público. Los nombres de los botones cambian: si alguno no
coincide, lo que importa es el objetivo de cada paso.

---

## Qué cambia y qué no

**El dominio sigue en NIC Argentina y el DNS sigue en Cloudflare.** Wix se
conecta por _apuntamiento_: dos registros de Cloudflare pasan a apuntar a Wix.

| Qué                                    | Con la mudanza                                     |
| -------------------------------------- | -------------------------------------------------- |
| el registro en NIC y la delegación     | no cambian                                         |
| los cinco registros del correo         | **no se tocan**                                    |
| `@` y `www`                            | apuntan a Wix, en solo DNS                         |
| la dirección principal                 | pasa a ser `www`: Wix redirige el apex ahí         |
| Redirect Rule, rate limiting y HSTS    | dejan de aplicarse solos; se borran en la limpieza |
| el Worker, Workers Builds y Resend     | quedan unas semanas para volver atrás              |
| el vencimiento del dominio, 21/07/2027 | sigue igual: **Wix no lo renueva**                 |
| el costo                               | aparece uno: Wix exige un plan Premium             |

### Por qué apuntamiento y no nameservers

Wix va a recomendar que le pases los nameservers. No:

- **Habría que cambiar la delegación en NIC**, con la Clave Fiscal del titular,
  y volver atrás tarda.
- **El correo dependería de una importación.** Wix dice que trae los `MX`, pero
  no menciona el SPF, el DKIM, el DMARC ni la verificación de Google. Si se
  pierde uno, el correo de la empresa rebota o cae en spam.
- **Por apuntamiento no se toca ningún registro del correo**, y volver atrás son
  tres cambios en Cloudflare.

---

## Antes de empezar

Nada de esto toca el sitio actual.

### El sitio de Wix, en una cuenta de la empresa

Como todas las cuentas de servicios, el sitio y su plan tendrían que estar a
nombre de `ventas@conceptoespacio.com` (`docs/infraestructura.md`,
«Titularidad»). Si se armó en una cuenta personal, Wix permite transferir el
sitio con su plan a otra cuenta, que tiene que aceptarlo desde un correo de
confirmación.

### Un plan Premium

Wix no deja conectar un dominio propio a un sitio gratuito. Es un costo mensual
que hoy no existe: Cloudflare y Resend están en plan gratuito.

### El sitio, publicado y probado en su dirección de Wix

Completo y publicado en la dirección gratuita (`….wixsite.com/…`). Desde que se
conecta el dominio, lo que haya ahí es lo que ve todo el mundo.

### Las fotos, sin coordenadas

**Es la regla que más importa del proyecto, y no depende del hosting**: las
fotos son de casas de clientes, y las de teléfono traen el GPS del domicilio.
No encontré documentación de Wix que diga que lo borra.

- **Se suben las de `public/fotos/`**, que ya están limpias y revisadas. Cada
  foto es una carpeta con un archivo por medida, y el del número más grande es
  la foto entera: `public/fotos/productos/roller/1/2418.webp`. Wix acepta WebP.
- Los videos son los `.mp4` de `public/videos/`, que ya salieron sin audio ni
  metadatos.
- **Nunca de `fotos-originales/`**, ni directo desde el teléfono.
- Una foto que no está publicada pasa primero por `npm run fotos`
  (`docs/publicar-fotos.md`), y se sube la que sale.

**Si el sitio de Wix ya tiene fotos**, comprobá si conservan el GPS:

1. Abrí una foto del sitio en una pestaña nueva. La dirección empieza con
   `https://static.wixstatic.com/media/` y sigue con algo como
   `…~mv2.jpg/v1/fill/…`.
2. Borrá todo lo que viene después de `~mv2.jpg` —o `.jpeg`, `.png`— y guardá
   lo que abre: es el archivo como se subió.
3. Revisalo con el mismo control que usa el proyecto:

   ```bash
   node scripts/revisar-metadatos.mjs ruta/de/la/foto.jpg
   ```

Si dice `COORDENADAS GPS`, esa foto está publicando una dirección: reemplazala
por la de `public/fotos/` y borrá la vieja del Administrador de medios de Wix.

### El formulario de Wix, a `ventas@`

Los formularios de Wix avisan cada consulta por correo, desde
`notifications@wix-forms.com`, y no necesitan ningún registro DNS. Por defecto
le escriben al dueño del sitio. Para que lleguen a
`ventas@espaciocortinas.com.ar`, hay que agregar la casilla como contacto del
sitio y después elegirla en Automations → la automatización del formulario →
Edit → Send an email → Show additional settings → Recipients.

Probalo antes del cambio: una consulta mandada desde la dirección gratuita
tiene que llegar a la bandeja de `ventas@`.

### La lista de redirecciones

Los enlaces que ya circulan por WhatsApp e Instagram llevan a estas rutas. Si en
Wix las páginas tienen otra dirección, cada una necesita una redirección, que se
carga recién con el dominio conectado —el paso 8 del día del cambio—. Completá
ahora la columna de la derecha:

| Ruta de hoy                    | Página de Wix |
| ------------------------------ | ------------- |
| `/productos`                   |               |
| `/productos/roller`            |               |
| `/productos/compacta-blackout` |               |
| `/productos/cortinas-tela`     |               |
| `/productos/venecianas-madera` |               |
| `/productos/venecianas-pvc`    |               |
| `/productos/toldos`            |               |
| `/productos/bandas-verticales` |               |
| `/proyectos`                   |               |
| `/proyectos/cowork-nordelta`   |               |
| `/nosotros`                    |               |
| `/contacto`                    |               |

Es la lista del sitemap al 05/10/2026, más `/nosotros`, que entró con el
rediseño de la Fase 4.7. Si después se agregó algún producto o
proyecto, hay que mirarla de nuevo:

```bash
curl -s https://espaciocortinas.com.ar/sitemap.xml
```

### Opcional, con un par de semanas de margen: la redirección de `www` a 307

**Qué evita.** Hoy `www` responde un 308 hacia el apex, sin cabeceras de caché,
y Chrome guarda una redirección permanente así sin fecha de vencimiento. Wix
hace lo contrario: manda el apex a `www`. Un navegador que entró alguna vez por
`www` va a seguir su 308 guardado hasta el apex, Wix lo devuelve a `www`, y
queda en un bucle —«redirige demasiadas veces»— hasta que se borre la caché.

**Qué se hace.** Rules → Redirect Rules → `Canonizar al apex en https` → Edit →
Status code **307** → Save. Un 307 es temporal y el navegador no lo guarda:
desde ese día no se suman casos. Los que ya lo tienen guardado no se arreglan.

```bash
curl -sI https://www.espaciocortinas.com.ar
```

Tiene que decir `307 Temporary Redirect`. **Si al final no hay mudanza, se
vuelve a 308**: es lo que pide la decisión 22.

---

## El día del cambio

**El sitio va a estar caído hasta que Wix emita el certificado, y Wix habla de
hasta 48 horas.** Como hoy el sitio manda HSTS por un año, quien ya lo visitó ve
un error que no puede saltear. Elegí un momento de poco movimiento: WhatsApp
sigue funcionando todo ese tiempo.

Hacen falta las dos cuentas abiertas a la vez, Wix y Cloudflare. **Los pasos 3,
4 y 5 van seguidos**: entre el 3 y el 4, el apex no apunta a ningún lado.

### 1. Respaldar el DNS

En Cloudflare, en `espaciocortinas.com.ar` → DNS → Records → **Import and
Export** → **Export**. Baja un archivo con todos los registros: con eso se
reconstruye cualquiera que se borre por error. Guardalo en el Drive de la
empresa, no en el repositorio.

Y anotá cómo está el correo, para comparar después:

```powershell
Resolve-DnsName -Name espaciocortinas.com.ar -Type MX -Server leia.ns.cloudflare.com
```

```powershell
Resolve-DnsName -Name espaciocortinas.com.ar -Type TXT -Server leia.ns.cloudflare.com
```

Tiene que dar `smtp.google.com` con prioridad 1, y dos textos:
`google-site-verification=…` y `v=spf1 include:_spf.google.com ~all`.

### 2. Empezar la conexión en Wix

1. **Domains** → **Add an Existing Domain** → **Connect a domain you already
   own**.
2. Elegí el sitio → **Continue**. Escribí `espaciocortinas.com.ar` y tocá la
   flecha.
3. **connect it to your site** → **go to our manual setup** → **Start**.
4. Arriba, **pointing** → **Switch to Pointing Instructions**.

Wix va a ofrecer tres cosas que se rechazan:

- **Pasarle los nameservers.** Es lo que recomienda; ver «Por qué apuntamiento y
  no nameservers».
- **Conectarlo solo, iniciando sesión en Cloudflare.** Los registros se cargan a
  mano, con el mismo criterio que con Resend: nadie recibe permiso para escribir
  en la zona entera.
- **Correo para el dominio.** El correo ya funciona con Google Workspace, y no
  pasa por Wix.

Wix muestra dos registros. **Anotá exactamente los que muestre**; hoy son estos:

| Tipo  | Nombre | Valor                 |
| ----- | ------ | --------------------- |
| A     | `@`    | `185.230.63.107`      |
| CNAME | `www`  | `pointing.wixdns.net` |

Si muestra más de un `A`, van todos. Va a decir que el dominio todavía no está
conectado: es lo esperable, falta el DNS.

### 3. Sacarle el dominio al Worker

En Cloudflare: **Workers & Pages** → `espacio-cortinas-web` → **Settings** →
**Domains & Routes**. En la fila de `espaciocortinas.com.ar` —la de tipo Custom
domain—, abrí el menú de la derecha y quitala.

**Desde acá el sitio deja de responder**, y vuelve recién en el paso 7.

**Se quita el dominio, no se borra el Worker.** El Worker es la vuelta atrás, y
se borra recién en la limpieza.

En DNS → Records tiene que haber desaparecido el registro del apex marcado como
gestionado por Workers. Mientras siga, Cloudflare no deja crear otro en ese
nombre.

### 4. Crear el registro del apex

DNS → Records → **Add record**:

| Campo        | Valor                                    |
| ------------ | ---------------------------------------- |
| Type         | `A`                                      |
| Name         | `@`                                      |
| IPv4 address | el que mostró Wix; hoy, `185.230.63.107` |
| Proxy status | **apagado: DNS only, la nube gris**      |
| TTL          | Auto                                     |

**El proxy viene encendido, y es el error más fácil de cometer.** Wix no admite
registros proxeados: con la nube naranja el dominio no conecta y el certificado
no sale.

Que no quede ningún otro `A` ni `AAAA` en `@`. Wix da solo direcciones IPv4, y
un `AAAA` que apunte a otro lado partiría las visitas en dos.

### 5. Cambiar `www`

1. Borrá el `AAAA` de `www`, el que apunta a `100::`.
2. **Add record**: Type `CNAME`, Name `www`, Target `pointing.wixdns.net`, Proxy
   status **DNS only**, TTL Auto.

En ese orden: un `CNAME` no puede convivir con otro registro en el mismo nombre,
y Cloudflare no deja crearlo mientras exista el `AAAA`.

### 6. Comprobar el DNS

Contra el autoritativo, que responde con lo último:

```powershell
Resolve-DnsName -Name espaciocortinas.com.ar -Type A -Server leia.ns.cloudflare.com
```

Tiene que dar la IP de Wix y ninguna otra. Si aparecen direcciones de Cloudflare
—hoy, `104.21.89.194` y `172.67.164.143`—, el registro quedó proxeado.

```powershell
Resolve-DnsName -Name espaciocortinas.com.ar -Type AAAA -Server leia.ns.cloudflare.com
```

No tiene que dar ninguna dirección: solo el `SOA`.

```powershell
Resolve-DnsName -Name www.espaciocortinas.com.ar -Type CNAME -Server leia.ns.cloudflare.com
```

Tiene que dar `pointing.wixdns.net`.

**Y las dos del correo, del paso 1**, que tienen que dar exactamente lo mismo.
No es opcional: `docs/infraestructura.md` las pide después de cualquier cambio
de DNS.

### 7. Esperar el certificado

Wix lo emite cuando ve los dos registros, y dice que puede tardar hasta 48
horas. En Domains, el dominio tiene que pasar a conectado.

Mientras tanto, cada tanto:

```bash
curl -sI https://www.espaciocortinas.com.ar
```

Mientras no haya certificado, `curl` falla con un error de certificado. Cuando
lo haya, responde `200` con una cabecera `x-wix-request-id`.

**Cómo se sabe quién responde:** `x-wix-request-id` es Wix, `x-opennext` es el
Worker. **No sirve mirar `server: cloudflare`**: Wix también puede responder
así.

### 8. Cargar las redirecciones

Con el dominio conectado —antes no funcionan—, en Wix: **SEO & GEO** → **Tools
and settings** → **URL Redirect Manager** → **+ New Redirect** → **Single
redirect**. En **Old URL** va la ruta de hoy, por ejemplo `/productos/roller`, y
en la nueva, la página de la lista de «Antes de empezar». **Save & Add Another**
para la siguiente.

Tardan unos minutos en aplicarse.

### 9. Comprobar todo

| Pedido                               | Tiene que responder                                       |
| ------------------------------------ | --------------------------------------------------------- |
| `https://www.espaciocortinas.com.ar` | `200`, con `x-wix-request-id` y sin `x-opennext`          |
| `https://espaciocortinas.com.ar`     | `301` a `https://www.espaciocortinas.com.ar/`             |
| `http://espaciocortinas.com.ar`      | `301` a `https://`, y de ahí a `www`                      |
| una ruta vieja, en el apex           | después de las redirecciones, la página de Wix, con `200` |

Las tres primeras filas son como responde un sitio de Wix revisado el
05/10/2026, conectado por nameservers. Por apuntamiento tendría que ser igual, y
esta tabla es la que lo confirma. Ese sitio manda además su propio HSTS de un
año en las dos direcciones: el que ya guardaron los navegadores no molesta,
porque las dos siguen sirviendo HTTPS.

```bash
curl -sI https://espaciocortinas.com.ar
```

Además del `301`, fijate si trae `cache-control: no-cache`: es lo que hace
segura la vuelta atrás —ver más abajo—.

```bash
curl -sIL https://espaciocortinas.com.ar/productos/roller
```

Sigue todas las redirecciones: la última respuesta tiene que ser `200`, y el
último `location`, la página de Wix.

Y además, a mano:

- **El correo**: un mail desde una cuenta de afuera a
  `ventas@espaciocortinas.com.ar`, y la respuesta. Tienen que llegar los dos.
- **El formulario de Wix**: una consulta tiene que llegar a `ventas@`.
- **Un enlace viejo desde el teléfono**: tiene que abrir la página que
  corresponde.

---

## Si algo sale mal: volver al Worker

Mientras no se haga la limpieza, volver es deshacer los pasos 3, 4 y 5:

1. Borrá el `A` de `@` y el `CNAME` de `www`.
2. Creá de nuevo el `AAAA` de `www` → `100::`, **proxeado: nube naranja**.
3. **Workers & Pages** → `espacio-cortinas-web` → **Settings** → **Domains &
   Routes** → **Add** → **Custom Domain** → `espaciocortinas.com.ar` → **Add
   Custom Domain**. Cloudflare vuelve a crear el registro del apex.
4. Si se pasó la Redirect Rule a 307, volvela a 308.
5. En Wix, desconectá el dominio, para que deje de intentar conectarlo.
6. Comprobá con los `curl` de `docs/infraestructura.md`, «Dominio principal»:
   `200` con `x-opennext: 1` en el apex, y `308` en las otras tres. Y el correo,
   igual que en el paso 6.

**Si la redirección de Wix trae `cache-control: no-cache`, la vuelta no deja
bucles**: el navegador la vuelve a pedir en vez de reutilizarla. Si no lo trae,
quien haya visitado el sitio de Wix tiene guardado el salto del apex a `www`,
que es el contrario del nuestro, y cuanto más tiempo pase, más gente queda
expuesta a un bucle.

**Después de la limpieza ya no hay vuelta corta**: sería rehacer la mudanza de
julio de 2026. Por eso la limpieza espera.

---

## Unas semanas después: la limpieza

Recién cuando el sitio de Wix esté firme y nadie piense en volver. Nada de esto
toca el correo, y aun así se comprueba al final.

### En Cloudflare, en el dominio

1. **Rules** → **Redirect Rules** → borrar `Canonizar al apex en https`.
2. **Security** → **Security rules** → borrar la de rate limiting,
   `Formulario de contacto`.
3. **SSL/TLS** → **Edge Certificates**: si quedó un certificado avanzado de
   `espaciocortinas.com.ar` hecho para el Worker, borralo. Cloudflare no lo
   borra al quitarle el dominio al Worker. El Universal no se toca.
4. En la misma pantalla, el **HSTS** se puede apagar: sin registros proxeados no
   hace nada. No cambia lo que ya guardaron los navegadores, y Wix manda el
   suyo.

**La zona no se borra.** Sigue siendo el DNS del dominio, y adentro está el
correo.

### El Worker y el despliegue

5. **Workers & Pages** → `espacio-cortinas-web` → **Settings** → **Build**:
   desconectar el repositorio.
6. Borrar el Worker, desde el final de **Settings**. Se lleva el Secret
   `RESEND_API_KEY` y la dirección `espacio-cortinas-web.ventas-ccf.workers.dev`.
7. En GitHub, con la cuenta `espacioCortinas`: Settings → Applications →
   Installed GitHub Apps → la de Cloudflare → **Uninstall**, si no se usa para
   nada más.

### Resend

8. En Resend: **Domains** → `sitio.espaciocortinas.com.ar` → borrar, y **API
   Keys** → revocar la clave. Primero Resend y después el DNS, para que no avise
   que el dominio dejó de verificar.
9. En Cloudflare, borrar los tres registros del formulario: el `TXT`
   `resend._domainkey.sitio` y los `CNAME` `send.sitio` y `rsend.sitio`.
   **Ojo con el `TXT`: en la lista hay dos claves DKIM.** La que se borra es
   `resend._domainkey.sitio`; **`google._domainkey` es la del correo de la
   empresa**.
10. Si la cuenta de Resend no se usa para otra cosa, cerrarla.

### Comprobar el correo

11. Las dos del paso 1 del día del cambio, y además la clave DKIM de Google:

    ```powershell
    Resolve-DnsName -Name google._domainkey.espaciocortinas.com.ar -Type TXT -Server leia.ns.cloudflare.com
    ```

    Tiene que dar `v=DKIM1; k=rsa; p=…`, terminada en `IDAQAB`.

### En la máquina y en el repositorio

12. Borrar `RESEND_API_KEY` de `.env.local` y de `.dev.vars`. Ya está revocada,
    pero no tiene por qué quedar escrita.
13. Actualizar `docs/infraestructura.md`: la sección «Sitio» con los dos
    registros nuevos, y «Hosting», «Resend» y la regla de rate limiting como
    dados de baja. **Sigue siendo la referencia del DNS del correo**, así que
    tiene que quedar fiel. Y una decisión nueva en `docs/decisiones.md` con el
    porqué de la mudanza.
14. Una línea al principio del `README.md` con la fecha de la mudanza, y después
    GitHub → Settings → **Archive this repository**. Archivado queda de solo
    lectura y con toda la historia. No se borra.

---

## Lo que no se toca en ningún paso

- **La delegación en NIC Argentina**: `leia.ns.cloudflare.com` y
  `simon.ns.cloudflare.com`.
- **Los cinco registros del correo**: el `MX`, el SPF, la clave DKIM
  `google._domainkey`, el `_dmarc` y la verificación de Google.
- **La zona ni la cuenta de Cloudflare.**
- **El recordatorio de renovación de junio de 2027.** El dominio sigue en NIC, y
  Wix no lo administra.

Si más adelante Wix pide agregar registros —su email marketing lo hace—, dos
cuidados:

- **Uno de esos registros configura el DMARC**, y el dominio ya tiene uno, con
  los reportes a `ventas@conceptoespacio.com`. No se reemplaza sin revisarlo.
- **Nunca un segundo `v=spf1` en `@`.** Dos invalidan a los dos, y el correo de
  la empresa empieza a rebotar.

---

## Problemas que se pueden ver

### Wix dice que el dominio no está conectado

Casi siempre, un registro quedó con la nube naranja: si el `A` del paso 6 da
direcciones de Cloudflare, está proxeado. Si no, revisá que estén los dos
registros: Wix necesita los dos para emitir el certificado.

### Alguien dice que la página «redirige demasiadas veces»

Es el 308 de `www` que guardó su navegador —ver «la redirección de `www` a
307»—. Se arregla borrando los archivos en caché del navegador, o entrando sin
`www`.

### El certificado no sale después de 48 horas

Wix nombra DNSSEC como causa. El 05/10/2026 el dominio no lo tenía activado, ni
registros CAA que limiten quién puede emitir certificados. Se comprueba así:

```powershell
Resolve-DnsName -Name espaciocortinas.com.ar -Type DS -Server 1.1.1.1
```

Si da un registro `DS`, DNSSEC está activo y hay que sacarlo: **primero el `DS`
en NIC, y recién cuando desaparezca, el DNSSEC en Cloudflare**. Al revés, el
dominio entero deja de resolver, correo incluido. Si no da ningún `DS`, es una
consulta al soporte de Wix.

### No llega el correo

Lo primero, las dos comprobaciones del paso 1. Si el `MX` o el SPF cambiaron, el
archivo exportado en ese mismo paso tiene los valores originales.

---

## Fuentes

Consultadas el 05/10/2026:

- [Wix: conectar un dominio por apuntamiento](https://support.wix.com/en/article/connecting-a-domain-to-wix-using-the-pointing-method)
- [Wix: la configuración de Cloudflare](https://support.wix.com/en/article/verifying-your-cloudflare-settings-for-connecting-a-domain-to-wix)
- [Wix: no admite registros proxeados](https://support.wix.com/en/article/request-cloudflare-proxy-support)
- [Wix: apuntamiento o nameservers](https://support.wix.com/en/article/pointing-vs-name-servers-domain-connection-methods)
- [Wix: problemas con el certificado](https://support.wix.com/en/article/troubleshooting-your-ssl-certificate)
- [Wix: redirecciones 301](https://support.wix.com/en/article/setting-up-a-301-redirect-for-a-page-on-your-site)
- [Wix: a quién avisa el formulario](https://support.wix.com/en/article/wix-forms-choosing-who-gets-notified-about-form-submissions)
- [Wix: transferir un sitio Premium a otra cuenta](https://support.wix.com/en/article/transferring-a-premium-site-to-another-wix-account)
- [Wix: formatos de archivo que acepta](https://support.wix.com/en/article/wix-media-supported-media-file-types-and-file-sizes)
- [Wix: el dominio en el email marketing](https://support.wix.com/en/article/email-marketing-authenticating-your-custom-email-domain)
- [Cloudflare: Custom Domains de Workers](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Cloudflare: importar y exportar registros DNS](https://developers.cloudflare.com/dns/manage-dns-records/how-to/import-and-export/)
