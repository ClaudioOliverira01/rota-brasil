/**
 * Cenário decorativo (sol, morros e arbustos) das telas em React.
 * É só enfeite: leitores de tela ignoram.
 */
export default function Backdrop() {
  return (
    <div className="decor" aria-hidden="true">
      <div className="decor__sun" />
      <div className="decor__hill decor__hill--left" />
      <div className="decor__hill decor__hill--right" />
      <div className="decor__bushes" />
    </div>
  );
}