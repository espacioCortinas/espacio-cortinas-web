import type { ComponentType } from "react";

import {
  IconoEmail,
  LogoInstagram,
  LogoWhatsapp,
  type PropsDeIcono,
} from "@/components/iconos-de-contacto";
import { clasesDeBoton } from "@/components/ui/boton";
import { contacto, type Red } from "@/contenido/contacto";
import {
  enlaceWhatsapp,
  numeroInternacional,
  numeroVisible,
} from "@/lib/whatsapp";

/**
 * Los medios directos, como enlaces de texto con su símbolo: el número de
 * WhatsApp, el email y las redes, en `/contacto` y en el pie; y «Llamar», la
 * variante para los profesionales, en `/contacto` y en Inicio — decisión 65.
 *
 * **Las clases las pone quien los usa**, porque un enlace de `/contacto` y uno
 * del pie no pesan lo mismo. Tienen que traer `inline-flex` y un `gap`, que es
 * lo que separa el símbolo del texto. «Llamar» no, porque va igual en los dos
 * lugares.
 *
 * El texto de cada enlace va en un solo elemento: dentro de un `inline-flex`,
 * dos pedazos de texto sueltos serían dos columnas que no se parten juntas.
 */

/**
 * El número, con el logo de WhatsApp adelante.
 *
 * **Abre el chat, no llama**, aunque sea un número: con el logo al lado, quien
 * lo toca espera WhatsApp. Lleva el mensaje general, igual que el botón. Para
 * llamar está `EnlaceLlamar`.
 *
 * El nombre de la app va en el texto del enlace, oculto, porque el número solo
 * no dice adónde lleva: un lector de pantalla leería el número y nada más.
 */
export function NumeroWhatsapp({ className }: { className: string }) {
  return (
    <a
      href={enlaceWhatsapp({ tipo: "general" })}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      <LogoWhatsapp />
      <span className="sr-only">WhatsApp: </span>
      <span>{numeroVisible()}</span>
    </a>
  );
}

/**
 * La casilla, con el sobre adelante.
 *
 * **Se parte después de la arroba**, si no entra. A 320 px, con el sobre al
 * lado, entra justo: ocupa la columna entera, sin un píxel de sobra. Con zoom,
 * o con una casilla más larga, ya no entraría, y ahí queda «ventas@» arriba y
 * el dominio abajo —medido a 300 y a 267 px—. Antes se partía donde cayera, con
 * `break-all`, que habría dejado una «r» sola abajo. Y si ni así entra, se parte
 * donde haga falta, antes que empujar la página de costado.
 *
 * Sin nombre oculto: una dirección con arroba ya dice que es un email.
 */
export function EnlaceEmail({ className }: { className: string }) {
  const [usuario, dominio] = contacto.email.split("@");

  return (
    <a href={`mailto:${contacto.email}`} className={className}>
      <IconoEmail />
      <span className="min-w-0 wrap-anywhere">
        {usuario}@<wbr />
        {dominio}
      </span>
    </a>
  );
}

/**
 * El logo de cada red, por su nombre. Una red que no está acá se muestra igual,
 * sin logo: si la empresa suma Facebook, el enlace aparece solo y el logo es una
 * línea más en este archivo y un dibujo más en `iconos-de-contacto.tsx`.
 */
const LOGOS_DE_REDES: Partial<Record<string, ComponentType<PropsDeIcono>>> = {
  Instagram: LogoInstagram,
};

/**
 * Una red, como se la busca: el logo y la cuenta, `@espaciocortinasarg`.
 *
 * **No dice «Instagram» a la vista.** La palabra sola no decía qué cuenta era,
 * y la cuenta es lo que alguien tipea en el buscador de la app; el logo dice de
 * qué red es. El nombre va igual en el texto del enlace, oculto, para que un
 * lector de pantalla no anuncie solo «arroba espaciocortinasarg».
 */
export function EnlaceRed({ red, className }: { red: Red; className: string }) {
  const Logo = LOGOS_DE_REDES[red.nombre];

  return (
    <a
      href={red.url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {Logo && <Logo />}
      <span className="sr-only">{red.nombre}: </span>
      <span>{red.usuario}</span>
    </a>
  );
}

/**
 * «Llamar al +54 9 11 2233 4455»: la variante para los profesionales.
 *
 * **No está en todas las páginas, a propósito.** El objetivo del sitio es uno
 * solo —que alguien escriba por WhatsApp (`docs/producto.md`)— y un «Llamar»
 * al lado de cada botón de WhatsApp partiría las consultas en dos canales. Va
 * donde el sitio les habla a arquitectos, estudios y oficinas, que son los que
 * más seguido prefieren hablarlo: su sector de Inicio y la apertura de
 * Contacto. El número se puede llamar igual desde cualquier lado; lo que no
 * está en todos lados es la invitación.
 *
 * **Es un enlace de texto y no un botón**: en esas dos páginas el único
 * principal sigue siendo WhatsApp. Sin símbolo: los tres de arriba dicen qué
 * app se abre, y acá lo dice la palabra «Llamar». En un teléfono, `tel:`
 * llama; en una computadora abre lo que haya para llamar, y el número queda
 * escrito para marcarlo a mano. El número no se parte entre dos renglones.
 *
 * Llama a `contacto.telefono` si la empresa da un número aparte para llamadas;
 * si no, al mismo de WhatsApp.
 */
export function EnlaceLlamar() {
  const telefono = contacto.telefono ?? {
    visible: numeroVisible(),
    internacional: numeroInternacional(),
  };

  return (
    <a
      href={`tel:${telefono.internacional}`}
      className={clasesDeBoton("enlace")}
    >
      <span>
        Llamar al <span className="whitespace-nowrap">{telefono.visible}</span>
      </span>
    </a>
  );
}
