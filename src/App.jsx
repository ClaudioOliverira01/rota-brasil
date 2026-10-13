import { useCallback, useEffect, useState } from "react";

import MenuScreen from "./screens/MenuScreen.jsx";
import ProfileScreen from "./screens/ProfileScreen.jsx";
import AvatarScreen from "./screens/AvatarScreen.jsx";
import CompassScreen from "./screens/CompassScreen.jsx";
import VictoryScreen from "./screens/VictoryScreen.jsx";
import RankingScreen from "./screens/RankingScreen.jsx";
import PhaserStage from "./phaser/PhaserStage.jsx";
import { gameBridge, BRIDGE_EVENTS } from "./bridge/gameBridge.js";
import { describeVictory } from "./services/ExpeditionService.js";

const VIEWS = Object.freeze({
  MENU: { name: "menu" },
  PROFILE: { name: "profile" },
  AVATAR: { name: "avatar" },
  RANKING: { name: "ranking" }
});

/**
 * Controla qual tela está visível:
 *  - menu, profile, avatar, compass, victory, ranking: telas em React
 *  - game: o Phaser (história, fases e bônus), começando em entryScene
 *
 * Caminho: menu -> profile -> avatar -> game -> (fim da fase) compass
 *          -> victory -> próxima fase (game) ... -> ranking
 * O desafio bônus pula a bússola e vai direto para a vitória.
 */
export default function App() {
  const [view, setView] = useState(VIEWS.MENU);

  // O Phaser avisa: voltar ao menu, abrir o ranking ou "terminei a fase".
  useEffect(() => {
    const offMenu = gameBridge.on(BRIDGE_EVENTS.MENU_REQUESTED, () =>
      setView(VIEWS.MENU)
    );

    const offRanking = gameBridge.on(BRIDGE_EVENTS.RANKING_REQUESTED, () =>
      setView(VIEWS.RANKING)
    );

    const offVictory = gameBridge.on(BRIDGE_EVENTS.VICTORY_REQUESTED, data => {
      const info = describeVictory(data);

      setView(
        info.bonus
          ? { name: "victory", info }
          : { name: "compass", info }
      );
    });

    return () => {
      offMenu();
      offRanking();
      offVictory();
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

    case "compass":
      content = (
        <CompassScreen
          phase={view.info.phase}
          onContinue={() => setView({ name: "victory", info: view.info })}
        />
      );
      break;

    case "victory":
      content = (
        <VictoryScreen
          info={view.info}
          onNextPhase={nextPhase => goToGame(`Phase${nextPhase}Scene`)}
          onPlayBonus={() => goToGame("BonusScene")}
          onFinish={goToRanking}
          onMenu={goToMenu}
        />
      );
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