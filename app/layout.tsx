import type { Metadata } from "next";
import "./globals.css";

// Metadata mínima para que el documento sea válido. La metadata real por página
// (title, description y Open Graph propios) se arma en la Fase 5.
export const metadata: Metadata = {
  title: "Espacio Cortinas",
};

export default function LayoutRaiz({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
