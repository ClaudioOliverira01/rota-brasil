import { useCallback, useEffect, useState } from "react";

import MenuScreen from "./screens/MenuScreen.jsx";
import ProfileScreen from "./screens/ProfileScreen.jsx";
import AvatarScreen from "./screens/AvatarScreen.jsx";
import RankingScreen from "./screens/RankingScreen.jsx";
import PhaserStage from "./phaser/PhaserStage.jsx";
import { gameBridge, BRIDGE_EVENTS } from "./bridge/gameBridge.js";

const VIEWS = Object.freeze({
  MENU: { name: "menu" },
  PROFILE: { name: "profile" },
  AVATAR: { name: "avatar" },
  RANKING: { name: "ranking" }
});

/**
 * Controla qual tela está visível:
 *  - menu, profile, avatar, ranking: telas em React
 *  - game: o Phaser (história e fases), começando em entryScene
 *
 * Caminho: menu -> profile -> avatar -> game
 */
export default function App() {
  const [view, setView] = useState(VIEWS.MENU);

  // Cenas do Phaser pedem "voltar ao menu" ou "abrir o ranking"
  // (ex.: ao terminar o jogo): mostramos a tela React correspondente.
  useEffect(() => {
    const offMenu = gameBridge.on(BRIDGE_EVENTS.MENU_REQUESTED, () =>
      setView(VIEWS.MENU)
    );

    const offRanking = gameBridge.on(BRIDGE_EVENTS.RANKING_REQUESTED, () =>
      setView(VIEWS.RANKING)
    );

    return () => {
      offMenu();
      offRanking();
    };
  }, []);

  const goToMenu = useCallback(() => setView(VIEWS.MENU), []);
  const goToProfile = useCallback(() => setView(VIEWS.PROFILE), []);
  const goToAvatar = useCallback(() => setView(VIEWS.AVATAR), []);
  const goToRanking = useCallback(() => setView(VIEWS.RANKING), []);
  const goToGame = useCallback(
    entryScene => setView({ name: "game", entryScene }),
    []
  );

  let content;

  switch (view.name) {
    case "profile":
      content = <ProfileScreen onBack={goToMenu} onReady={goToAvatar} />;
      break;

    case "avatar":
      content = <AvatarScreen onBack={goToProfile} onReady={goToGame} />;
      break;

    case "ranking":
      content = <RankingScreen onBack={goToMenu} />;
      break;

    case "game":
      content = <PhaserStage entryScene={view.entryScene} />;
      break;

    default:
      content = <MenuScreen onStart={goToProfile} onOpenRanking={goToRanking} />;
  }

  return (
    <main id="app" aria-label="Rota Brasil: A Expedição de Aê">
      {content}
    </main>
  );
}