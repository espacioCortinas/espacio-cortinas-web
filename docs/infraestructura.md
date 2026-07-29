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

| Tipo | Nombre              | Contenido                                                 | Para qué                 |
| ---- | ------------------- | --------------------------------------------------------- | ------------------------ |
| MX   | `@`                 | `smtp.google.com` (prio 1)                                | correo de Workspace      |
| TXT  | `@`                 | `google-site-verification=…`                              | verificación del dominio |
| TXT  | `@`                 | `v=spf1 include:_spf.google.com ~all`                     | SPF                      |
| TXT  | `google._domainkey` | `v=DKIM1; k=rsa; p=…`                                     | DKIM                     |
| TXT  | `_dmarc`            | `v=DMARC1; p=none; rua=mailto:ventas@conceptoespacio.com` | DMARC                    |

Pendiente de agregar en Fase 1: el registro que apunta a Vercel. **Va en modo
"DNS only" (nube gris), no proxeado** — decisión 15.

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

Vercel, cuenta activa.

El alta estuvo retenida un tiempo por el sistema antifraude —le pasa a cuentas
nuevas asociadas a una cuenta de GitHub también recién creada— y se destrabó por
el formulario de recuperación.

El despliegue se conecta al repositorio de GitHub en Fase 1. El registro DNS que
apunta a Vercel va en Cloudflare **en modo "DNS only", no proxeado** —
decisión 15.

Si alguna vez hubiera que mudarse, la arquitectura es portable: el flujo de
subida de imágenes esquiva los límites de funciones serverless por diseño, así
que Netlify sirve igual sin cambiar ninguna decisión.

## Pendiente de dar de alta

- Google Search Console
- **Perfil de Empresa de Google** — para búsquedas locales pesa más que cualquier
  optimización del sitio
- Vercel Analytics (con el despliegue)

Los tres tienen que quedar bajo la cuenta de la empresa, no una personal.
