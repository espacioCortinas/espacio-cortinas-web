# Infraestructura

Estado real de los servicios. Se actualiza cuando algo cambia.

**Acá no van claves ni contraseñas.** Las credenciales viven en el gestor de
contraseñas de la empresa y en las variables de entorno. Ver
`docs/arquitectura.md`.

## Titularidad

Todas las cuentas de servicios están a nombre de **`ventas@conceptoespacio.com`**,
una dirección de la empresa, no personal. Es deliberado: si la persona que
desarrolla el sitio deja la empresa, la empresa conserva el control.

`ventas@espaciocortinas.com.ar` es un alias de esa misma casilla — las dos
direcciones entran al mismo buzón.

## Dominio

`espaciocortinas.com.ar`

|                   |                               |
| ----------------- | ----------------------------- |
| Registrador       | NIC Argentina                 |
| Alta              | 21/07/2026                    |
| **Vencimiento**   | **21/07/2027**                |
| Titular registral | persona física, no la empresa |
| DNS               | Cloudflare, plan Free         |

**Poner recordatorio de renovación para junio de 2027.** Un dominio vencido tira
el sitio y el correo a la vez, y si otro lo registra puede ser irrecuperable.

El acceso a NIC es con Clave Fiscal de AFIP del CUIT titular, con el servicio
"NIC Argentina" adherido en el Administrador de Relaciones.

### Delegación

```
leia.ns.cloudflare.com
simon.ns.cloudflare.com
```

Activa y verificada.

## Registros DNS

Todo se administra en Cloudflare.

| Tipo  | Nombre              | Contenido                                                 | Para qué                 |
| ----- | ------------------- | --------------------------------------------------------- | ------------------------ |
| MX    | `@`                 | `smtp.google.com` (prio 1)                                | correo de Workspace      |
| TXT   | `@`                 | `google-site-verification=…`                              | verificación del dominio |
| TXT   | `@`                 | `v=spf1 include:_spf.google.com ~all`                     | SPF                      |
| TXT   | `google._domainkey` | `v=DKIM1; k=rsa; p=…`                                     | DKIM                     |
| TXT   | `_dmarc`            | `v=DMARC1; p=none; rua=mailto:ventas@conceptoespacio.com` | DMARC                    |
| A     | `@`                 | `216.198.79.1`                                            | sitio en Vercel          |
| CNAME | `www`               | `18643b45bdd17525.vercel-dns-017.com`                     | redirección al apex      |

Los dos registros de Vercel están **en modo "DNS only" (nube gris), no
proxeados** — decisión 15. Se agregaron en la Fase 1 y están verificados: el
apex resuelve a una IP de Vercel, no a una de Cloudflare, que es cómo se
comprueba que el proxy está apagado.

El destino del `CNAME` es propio de este proyecto de Vercel. No es un valor
genérico: si alguna vez se recrea el proyecto, cambia.

## Dominio principal

`espaciocortinas.com.ar`, sin `www`. `www` existe solo para redirigir al apex con
un 308 — decisión 22.

Vercel lo configura al revés por defecto, así que hay que invertirlo a mano en
Settings → Domains. Verificado:

```
http://espaciocortinas.com.ar       → 308 → https://espaciocortinas.com.ar/
https://www.espaciocortinas.com.ar  → 308 → https://espaciocortinas.com.ar/
https://espaciocortinas.com.ar      → 200
```

### Notas para diagnosticar

- Cloudflare publica los cambios casi al instante, pero los resolvers públicos
  **cachean las respuestas negativas**. Si un registro recién agregado "no
  aparece", consultar directo al autoritativo antes de concluir que falta:

  ```
  Resolve-DnsName -Name <dominio> -Type MX -Server leia.ns.cloudflare.com
  ```

- Una clave DKIM completa termina en `IDAQAB`. Si termina en otra cosa, el panel
  la cortó al pegarla.

## Correo

Google Workspace, dominio principal `conceptoespacio.com`.

`espaciocortinas.com.ar` está agregado como **alias de dominio** (gratis, no
consume licencias). Cambiar el dominio principal quedó descartado por ahora —
decisión 13.

Verificado de punta a punta: entrada y salida funcionando, con SPF, DKIM y DMARC
publicados.

DMARC está en `p=none` a propósito: monitorea sin bloquear. Se puede endurecer a
`p=quarantine` dentro de unos meses, una vez confirmado que todo firma bien.

## Repositorio

`github.com/espacioCortinas/espacio-cortinas-web` — privado.

`espacioCortinas` es una cuenta personal de GitHub, no una organización. El repo
es suyo, y quien desarrolla entra como **colaborador con permiso de escritura**
(hoy `faculuna1097`). Es lo mismo que persigue la regla de titularidad: si cambia
el desarrollador, se le quita el acceso y la empresa no pierde nada.

**Por qué conviene que siga privado:** el código no tiene secretos, pero este
mismo documento publica el vencimiento del dominio, quién es el titular registral
y que el acceso a NIC es por Clave Fiscal. Nada de eso tiene por qué estar
indexado.

## Base de datos y archivos

Supabase, plan gratuito, organización Espacio Cortinas, región São Paulo.

- Registro público de usuarios **desactivado** (requisito de `docs/seguridad.md`)
- El usuario administrador se crea a mano en Fase 2
- Sin copias automáticas: exportación manual periódica — decisión 18

## Hosting

Vercel, **plan Hobby**, conectado a la cuenta de GitHub `espacioCortinas`.

El alta estuvo retenida un tiempo por el sistema antifraude —le pasa a cuentas
nuevas asociadas a una cuenta de GitHub también recién creada— y se destrabó por
el formulario de recuperación.

**El plan Hobby no admite colaboradores.** Vercel solo despliega commits cuyo
autor sea el dueño de la cuenta: si el autor es otro, corta con "the commit
author does not have contributing access". Por eso todos los commits se firman
con la identidad de la empresa — decisión 23.

**Las variables de entorno hay que cargarlas en Vercel además de en
`.env.local`.** Si falta alguna, el build falla a propósito con la lista
completa. Son cuatro en la Fase 1 y van marcadas para Production, Preview y
Development. `NEXT_PUBLIC_SITE_URL` es la única que difiere del archivo local:
en Vercel va `https://espaciocortinas.com.ar`.

Vercel avisa que `NEXT_PUBLIC_SUPABASE_ANON_KEY` no es segura de exponer. En
este caso el aviso no aplica: esa clave es pública por diseño y lo que se puede
hacer con ella lo decide RLS. Ver `docs/seguridad.md`.

Conectado al repositorio de GitHub desde la Fase 1: cada push a `main` despliega.

Si alguna vez hubiera que mudarse, la arquitectura es portable: el flujo de
subida de imágenes esquiva los límites de funciones serverless por diseño, así
que Netlify sirve igual sin cambiar ninguna decisión.

## Pendiente de dar de alta

- Google Search Console
- **Perfil de Empresa de Google** — para búsquedas locales pesa más que cualquier
  optimización del sitio
- Vercel Analytics (con el despliegue)

Los tres tienen que quedar bajo la cuenta de la empresa, no una personal.
