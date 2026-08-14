/**
 * `/admin` — vacía a propósito.
 *
 * El criterio de terminado de la Fase 2 es la autenticación, no el panel: que
 * esta ruta redirija al login sin sesión, que rechace una sesión que no sea la
 * de la administradora, y que no se cachee en el borde. El ABML de productos y
 * proyectos es la Fase 3, y adelantarlo ahora sería trabajo de otra fase
 * (docs/plan.md).
 *
 * Si llegaste hasta acá viendo este texto, las tres capas funcionaron.
 */
export default function PanelInicio() {
  return (
    <main>
      <p>Sesión iniciada.</p>
      <p>Las secciones de productos y proyectos se construyen en la Fase 3.</p>
    </main>
  );
}
