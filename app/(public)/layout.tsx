// Layout de las páginas públicas.
//
// Todavía no envuelve nada: la navegación y el pie se construyen en la
// Fase 4.2, una vez definida la dirección visual. Existe ahora para fijar la
// estructura de carpetas de docs/arquitectura.md.
export default function LayoutPublico({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
