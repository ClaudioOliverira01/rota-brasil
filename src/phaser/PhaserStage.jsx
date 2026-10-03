import { useEffect, useRef } from "react";

import { createGame } from "./createGame.js";

export default function PhaserStage() {
  const containerRef = useRef(null);

  useEffect(() => {
    const game = createGame(containerRef.current);

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div id="game-container" ref={containerRef} />;
}