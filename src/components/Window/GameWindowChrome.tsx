"use client";

import type { ReactNode } from "react";

const DEFAULT_MENUS = ["Game", "Help"] as const;

type Props = {
  children: ReactNode;
  menus?: readonly string[];
};

/** Game / Help (or Game / Options / Help) strip + gray client area. */
export function GameWindowChrome({
  children,
  menus = DEFAULT_MENUS,
}: Props) {
  return (
    <div className="xp-game-frame">
      <div className="xp-game-menubar" aria-hidden="true">
        {menus.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
      <div className="xp-game-client">{children}</div>
    </div>
  );
}
