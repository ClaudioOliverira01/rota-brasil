import { useCallback, useEffect, useState } from "react";

import MenuScreen from "./Screens/MenuScreen.jsx";

import PhaserStage from "./phaser/PhaserStage.jsx";

import { gameBridge, BRIDGE_EVENTS } from "./bridge/gameBridge.js";

const MENU = { screen: "menu", entryScene: null };

/**
 * Controla qual tela está visível:
 *  - "menu": tela em React
 *  - "game": o Phaser (perfil, fases, ranking...) começando em entryScene
 */
export default function App() {
  const [view, setView] = useState(MENU);

  // Quando uma cena do Phaser pede "voltar ao menu", mostramos a tela React
  useEffect(
    () => gameBridge.on(BRIDGE_EVENTS.MENU_REQUESTED, () => setView(MENU)),
    []
  );

  const openGame = useCallback(entryScene => {
    setView({ screen: "game", entryScene });
  }, []);

  return (
    <main id="app" aria-label="Rota Brasil: A Expedição de Aê">
      {view.screen === "menu" ? (
        <MenuScreen onNavigate={openGame} />
      ) : (
        <PhaserStage entryScene={view.entryScene} />
      )}
    </main>
  );
}