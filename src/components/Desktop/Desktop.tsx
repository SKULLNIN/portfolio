"use client";

import { useEffect, useMemo, useState } from "react";
import { ALL_APP_IDS, APP_ORDER, APP_REGISTRY } from "@/data/apps";
import { WindowShell } from "@/components/Window/WindowShell";
import { DesktopIcon } from "@/components/Desktop/DesktopIcon";
import { useWindowManager } from "@/context/WindowContext";
import { MyComputer } from "@/components/Apps/MyComputer";
import { MyDocuments } from "@/components/Apps/MyDocuments";
import { MyPictures } from "@/components/Apps/MyPictures";
import { RecycleBin } from "@/components/Apps/RecycleBin";
import { Notepad } from "@/components/Apps/Notepad";
import { InternetExplorer } from "@/components/Apps/InternetExplorer";
import { Minesweeper } from "@/components/Apps/Minesweeper";
import { MediaPlayer } from "@/components/Apps/MediaPlayer";
import { ControlPanel } from "@/components/Apps/ControlPanel";
import { useSystemSettings } from "@/context/SystemSettingsContext";
import type { AppId } from "@/types";

const APP_CONTENT: Record<AppId, React.ReactNode> = {
  "my-computer": <MyComputer />,
  "my-documents": <MyDocuments />,
  "my-pictures": <MyPictures />,
  "recycle-bin": <RecycleBin />,
  notepad: <Notepad />,
  "internet-explorer": <InternetExplorer />,
  minesweeper: <Minesweeper />,
  "media-player": <MediaPlayer />,
  "control-panel": <ControlPanel />,
};

type DesktopIconSize = "sm" | "md" | "lg";

export function Desktop() {
  const { windows } = useWindowManager();
  const { desktopBackgroundStyle } = useSystemSettings();
  const [selectedId, setSelectedId] = useState<AppId | null>(null);
  const [ctx, setCtx] = useState<{ x: number; y: number } | null>(null);
  const [desktopIconSize, setDesktopIconSize] = useState<DesktopIconSize>("md");

  const focusedId = useMemo(() => {
    let max = -1;
    let id: AppId | null = null;
    for (const w of Object.values(windows)) {
      if (w.isOpen && !w.isMinimized && w.zIndex > max) {
        max = w.zIndex;
        id = w.id;
      }
    }
    return id;
  }, [windows]);

  useEffect(() => {
    if (!ctx) return;
    const close = () => setCtx(null);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [ctx]);

  return (
    <div
      className="relative min-h-0 flex-1 overflow-hidden bg-[#4980c6] bg-cover bg-center bg-no-repeat"
      style={desktopBackgroundStyle}
      onMouseDown={(e) => {
        const el = e.target as HTMLElement;
        if (!el.closest(".cell")) setSelectedId(null);
      }}
      onContextMenu={(e) => {
        const el = e.target as HTMLElement;
        if (el.closest(".cell") || el.closest(".xp-luna-window")) return;
        e.preventDefault();
        setCtx({ x: e.clientX, y: e.clientY });
      }}
    >
      {ctx && (
        <ul
          className="xp-desktop-ctx fixed z-[400] min-w-[180px] cursor-default border border-[#003c74] bg-[#ece9d8] py-0.5 text-[11px] text-black shadow-[4px_4px_12px_rgba(0,0,0,0.35)]"
          style={{ left: ctx.x, top: ctx.y }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <li>
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left hover:bg-[var(--xp-accent)] hover:text-white"
              onClick={() => setCtx(null)}
            >
              Arrange Icons By Name
            </button>
          </li>
          <li>
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left hover:bg-[var(--xp-accent)] hover:text-white"
              onClick={() => {
                setDesktopIconSize("lg");
                setCtx(null);
              }}
            >
              View → Large icons
            </button>
          </li>
          <li>
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left hover:bg-[var(--xp-accent)] hover:text-white"
              onClick={() => {
                setDesktopIconSize("md");
                setCtx(null);
              }}
            >
              View → Medium icons
            </button>
          </li>
          <li>
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left hover:bg-[var(--xp-accent)] hover:text-white"
              onClick={() => {
                setDesktopIconSize("sm");
                setCtx(null);
              }}
            >
              View → Small icons
            </button>
          </li>
          <li>
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left hover:bg-[var(--xp-accent)] hover:text-white"
              onClick={() => setCtx(null)}
            >
              Refresh
            </button>
          </li>
          <li className="my-0.5 border-t border-[#d4d0c8]" />
          <li>
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left hover:bg-[var(--xp-accent)] hover:text-white"
              onClick={() => setCtx(null)}
            >
              New Folder
            </button>
          </li>
          <li>
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left hover:bg-[var(--xp-accent)] hover:text-white"
              onClick={() => setCtx(null)}
            >
              Properties
            </button>
          </li>
        </ul>
      )}

      <div
        className="xp-desktop-grid wallpaper-grid"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {APP_ORDER.map((id) => (
          <DesktopIcon
            key={id}
            app={APP_REGISTRY[id]}
            selected={selectedId === id}
            onSelect={() => setSelectedId(id)}
            iconSize={desktopIconSize}
          />
        ))}
      </div>

      {ALL_APP_IDS.map((id) => {
        const w = windows[id];
        if (!w.isOpen || w.isMinimized) return null;
        return (
          <WindowShell key={id} w={w} isActive={focusedId === id}>
            {APP_CONTENT[id]}
          </WindowShell>
        );
      })}
    </div>
  );
}
