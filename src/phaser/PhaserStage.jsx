import { useEffect, useRef } from "react";

import { createGame } from "./createGame.js";

/**
 * Hospeda o jogo Phaser. Ao sair da tela, destrói o jogo
 * (libera memória, áudio e eventos).
 *
 * entryScene: cena do Phaser em que o jogo deve começar.
 */
export default function PhaserStage({ entryScene }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const game = createGame(containerRef.current, { entryScene });

    return () => {
      game.destroy(true);
    };
  }, [entryScene]);

  return <div id="game-container" ref={containerRef} />;
}