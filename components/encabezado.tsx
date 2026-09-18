import Link from "next/link";

import { Logo } from "@/components/logo";
import { Navegacion } from "@/components/navegacion";
import { Contenedor } from "@/components/ui/contenedor";

/**
 * El encabezado del sitio.
 *
 * La estructura —`<header>`, `<nav aria-label="Principal">`, la lista de cuatro
 * enlaces— es la misma que dejó la Fase 4.0 y es definitiva. Lo que cambia acá
 * es cómo se ve.
 *
 * **No se pega arriba al hacer scroll.** Un encabezado fijo se come una franja
 * de una pantalla de teléfono en un sitio cuyo contenido son fotos, y la
 * dirección elegida pide quietud: la interfaz no compite con la foto. El menú
 * son cuatro enlaces a un toque de distancia del principio de cualquier página.
 *
 * **Filete de 1 px y nada más.** Sin sombra, sin barra de otro color, sin
 * degradado: lo que separa el encabezado del contenido es el filete y el aire
 * que hay debajo.
 *
 * El logo es también el enlace a Inicio. Su texto alternativo —«Espacio
 * Cortinas»— es el nombre accesible del enlace, así que no lleva `aria-label`
 * encima, que lo duplicaría.
 */
export function Encabezado() {
  return (
    <header className="border-linea border-b">
      <Contenedor>
        <div className="flex flex-col gap-1 py-4 md:flex-row md:items-center md:justify-between md:gap-10 md:py-6">
          <Link href="/" className="inline-flex w-fit items-center py-2">
            <Logo />
          </Link>
          <Navegacion />
        </div>
      </Contenedor>
    </header>
  );
}
