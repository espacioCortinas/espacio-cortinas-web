"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { crearClienteNavegador } from "@/lib/supabase/navegador";

/**
 * Formulario de login. **Este es el primer componente cliente del proyecto.**
 *
 * ESTO NO SE DISEÑA. Dos campos, un botón y un mensaje de error. Sin colores
 * propios, sin tipografía elegida, sin logo. La identidad visual se decide en
 * la Fase 4.1, con las fotos reales del negocio a la vista; si esta pantalla
 * saliera «linda» ahora, condicionaría todo lo demás sin haber mirado una sola
 * foto. Las pocas clases que hay son estructurales: Tailwind resetea los
 * bordes de `input` y `button`, así que sin ellas el formulario no se ve.
 *
 * Es cliente y no una Server Action porque el login es lo único que el
 * navegador hace directamente contra Supabase — ver el comentario de
 * `lib/supabase/navegador.ts`. `createBrowserClient` guarda la sesión en
 * cookies (no en `localStorage`), que es lo que después lee el servidor.
 *
 * Esto **no** debilita la regla 3 de CLAUDE.md: no hay ninguna escritura a la
 * base acá. Y no debilita la autorización: quien inicie sesión con una cuenta
 * que no sea la de la administradora obtiene una sesión válida y aun así no
 * entra — `verificarAdmin()` compara el `user.id`.
 */
export function FormularioLogin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function iniciarSesion(datos: FormData) {
    setError(null);
    setEnviando(true);

    const supabase = crearClienteNavegador();
    const { error: fallo } = await supabase.auth.signInWithPassword({
      email: String(datos.get("email") ?? ""),
      password: String(datos.get("contrasena") ?? ""),
    });

    if (fallo) {
      // Mensaje único a propósito: distinguir «esa cuenta no existe» de «la
      // contraseña está mal» le confirma a cualquiera qué direcciones están
      // dadas de alta.
      setError("Correo o contraseña incorrectos.");
      setEnviando(false);
      return;
    }

    // `refresh()` antes de navegar: el layout del panel se renderiza en el
    // servidor y tiene que ver la cookie de sesión recién escrita.
    router.refresh();
    router.replace("/admin");
  }

  return (
    <form action={iniciarSesion} className="flex max-w-sm flex-col gap-4 p-8">
      <h1>Panel — Espacio Cortinas</h1>

      <label className="flex flex-col gap-1">
        Correo
        <input
          type="email"
          name="email"
          required
          autoComplete="username"
          className="border p-2"
        />
      </label>

      <label className="flex flex-col gap-1">
        Contraseña
        <input
          type="password"
          name="contrasena"
          required
          autoComplete="current-password"
          className="border p-2"
        />
      </label>

      <button type="submit" disabled={enviando} className="border p-2">
        {enviando ? "Entrando…" : "Entrar"}
      </button>

      {/* `role="alert"` para que el lector de pantalla lo anuncie al aparecer. */}
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
