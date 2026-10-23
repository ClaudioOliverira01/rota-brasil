import { useCallback, useState } from "react";

import MenuScreen from "./screens/MenuScreen.jsx";
import ProfileScreen from "./screens/ProfileScreen.jsx";
import AvatarScreen from "./screens/AvatarScreen.jsx";
import CompassScreen from "./screens/CompassScreen.jsx";
import VictoryScreen from "./screens/VictoryScreen.jsx";
import BonusScreen from "./screens/BonusScreen.jsx";
import RankingScreen from "./screens/RankingScreen.jsx";
import PhaseScreen from "./screens/PhaseScreen.jsx";
import StoryScreen from "./screens/StoryScreen.jsx";
import { describeVictory } from "./services/ExpeditionService.js";
import { viewForEntry, viewForVictory } from "./services/FlowRouter.js";

const VIEWS = Object.freeze({
  MENU: { name: "menu" },
  PROFILE: { name: "profile" },
  AVATAR: { name: "avatar" },
  BONUS: { name: "bonus" },
  RANKING: { name: "ranking" }
});

/**
 * Controla qual tela está visível. Todo o jogo é React:
 *  menu, profile, avatar, story, phase (Fases 1 a 4), compass, victory,
 *  bonus e ranking.
 *
 * Caminho: menu -> profile -> avatar -> story -> fase 1 -> compass
 *          -> victory -> próxima fase ... -> ranking
 * O desafio bônus pula a bússola e vai direto para a vitória.
 */
export default function App() {
  const [view, setView] = useState(VIEWS.MENU);

  const goToMenu = useCallback(() => setView(VIEWS.MENU), []);
  const goToProfile = useCallback(() => setView(VIEWS.PROFILE), []);
  const goToAvatar = useCallback(() => setView(VIEWS.AVATAR), []);
  const goToRanking = useCallback(() => setView(VIEWS.RANKING), []);
  const goToBonus = useCallback(() => setView(VIEWS.BONUS), []);
  // Traduz o nome de cena usado pelo resto do jogo para a tela certa.
  const goToGame = useCallback(
    entryScene => setView(viewForEntry(entryScene)),
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
          onPlayBonus={goToBonus}
          onFinish={goToRanking}
          onMenu={goToMenu}
        />
      );
      break;

    case "bonus":
      content = (
        <BonusScreen
          onExit={goToMenu}
          onFinish={() =>
            setView({
              name: "victory",
              info: describeVictory({ phase: 4, bonus: true, final: true })
            })
          }
        />
      );
      break;

    case "ranking":
      content = <RankingScreen onBack={goToMenu} />;
      break;

    case "phase":
      content = (
        <PhaseScreen
          key={view.phase}
          phase={view.phase}
          onComplete={info => setView(viewForVictory(describeVictory(info)))}
          onMenu={goToMenu}
        />
      );
      break;

    case "story":
      content = (
        <StoryScreen
          onStart={() => setView({ name: "phase", phase: 1 })}
          onMenu={goToMenu}
        />
      );
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