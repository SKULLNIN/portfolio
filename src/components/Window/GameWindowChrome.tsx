"use client";

import type { ReactNode } from "react";

type Props = { children: ReactNode };

/** Minesweeper: Game / Help menu strip and classic gray client area. */
export function GameWindowChrome({ children }: Props) {
  return (
    <div className="xp-game-frame">
      <div className="xp-game-menubar" aria-hidden="true">
        <span>Game</span>
        <span>Help</span>
      </div>
      <div className="xp-game-client">{children}</div>
    </div>
  );
}
