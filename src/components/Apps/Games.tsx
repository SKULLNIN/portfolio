"use client";

/**
 * Games folder — a simple Explorer-style window listing the installed games (Pinball,
 * Minesweeper). Lives behind the desktop "Games" icon; clicking a tile launches the
 * matching app via {@link useWindowManager.openApp}.
 */

import { XP_ICONS } from "@/lib/xp-icons";
import { APP_REGISTRY } from "@/data/apps";
import { useWindowManager } from "@/context/WindowContext";
import type { AppId } from "@/types";

type GameEntry = {
  id: AppId;
  label: string;
  description: string;
  icon: string;
};

const GAMES: readonly GameEntry[] = [
  {
    id: "pinball",
    label: "3D Pinball — Space Cadet",
    description: "Classic Windows pinball. WASD/Z/« for flippers, Space to launch.",
    icon: APP_REGISTRY.pinball.icon,
  },
  {
    id: "minesweeper",
    label: "Minesweeper",
    description: "Flag the mines without detonating any. Left-click to dig.",
    icon: XP_ICONS.minesweeper,
  },
];

export function Games() {
  const { openApp } = useWindowManager();

  return (
    <div className="xp-mc-root flex h-full min-h-0 font-['Tahoma',sans-serif] text-[11px]">
      <aside className="xp-mc-taskpane xp-mc-taskpane--luna shrink-0 overflow-auto p-1.5">
        <div className="xp-mc-acc xp-mc-acc--luna">
          <div className="xp-mc-acc-head">
            <span className="xp-mc-acc-head-left">
              <span className="inline-block w-3 shrink-0 text-center">▼</span>
              <span>File and Folder Tasks</span>
            </span>
          </div>
          <div className="xp-mc-acc-body">
            <ul className="xp-mc-taskpane-links space-y-1">
              <li>
                <button
                  type="button"
                  className="xp-mc-link"
                  onClick={() => openApp("pinball")}
                >
                  Play Pinball
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="xp-mc-link"
                  onClick={() => openApp("minesweeper")}
                >
                  Play Minesweeper
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="xp-mc-acc xp-mc-acc--luna">
          <div className="xp-mc-acc-head">
            <span className="xp-mc-acc-head-left">
              <span className="inline-block w-3 shrink-0 text-center">▼</span>
              <span>Details</span>
            </span>
          </div>
          <div className="xp-mc-acc-body">
            <p className="xp-mc-details-name">Games</p>
            <p className="xp-mc-details-type">File Folder</p>
            <p className="m-0 mt-1 text-[11px] text-[#444]">
              Installed games on this computer.
            </p>
          </div>
        </div>
      </aside>

      <div className="xp-mc-main flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
        <div className="min-h-0 flex-1 overflow-auto p-3">
          <p className="xp-mc-section-title mb-2">Games</p>
          <div className="xp-mc-tile-row">
            {GAMES.map((g) => (
              <button
                key={g.id}
                type="button"
                className="xp-mc-tile xp-mc-tile--btn text-left"
                onDoubleClick={() => openApp(g.id)}
                onClick={() => openApp(g.id)}
                title={`Open ${g.label}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.icon}
                  alt=""
                  width={48}
                  height={48}
                  className="xp-mc-tile-ico xp-desktop-ico shrink-0"
                />
                <span className="flex min-w-0 flex-col">
                  <span className="block font-bold text-[#215dc6] underline">
                    {g.label}
                  </span>
                  <span className="block text-[11px] text-[#444]">
                    {g.description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
