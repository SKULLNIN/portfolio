"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ALL_APP_IDS, APP_ORDER, APP_REGISTRY } from "@/data/apps";
import { WindowShell } from "@/components/Window/WindowShell";
import { DesktopIcon } from "@/components/Desktop/DesktopIcon";
import { DesktopFolderIcon } from "@/components/Desktop/DesktopFolderIcon";
import { DisplayPropertiesDialog } from "@/components/Desktop/DisplayPropertiesDialog";
import { DesktopFolderBrowseDialog } from "@/components/Desktop/DesktopFolderBrowseDialog";
import { useWindowManager } from "@/context/WindowContext";
import { useSystemSettings } from "@/context/SystemSettingsContext";
import { MyComputer } from "@/components/Apps/MyComputer";
import { MyDocuments } from "@/components/Apps/MyDocuments";
import { MyPictures } from "@/components/Apps/MyPictures";
import { RecycleBin } from "@/components/Apps/RecycleBin";
import { Notepad } from "@/components/Apps/Notepad";
import { InternetExplorer } from "@/components/Apps/InternetExplorer";
import { Minesweeper } from "@/components/Apps/Minesweeper";
import { MediaPlayer } from "@/components/Apps/MediaPlayer";
import { ControlPanel } from "@/components/Apps/ControlPanel";
import type { AppId } from "@/types";

const APP_CONTENT: Record<AppId, ReactNode> = {
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

type VirtualFile = { name: string; content: string };

type DesktopFolder = {
  key: string;
  name: string;
  files: VirtualFile[];
};

type DesktopRow =
  | { kind: "app"; id: AppId }
  | { kind: "folder"; folder: DesktopFolder };

function defaultRows(): DesktopRow[] {
  return APP_ORDER.map((id) => ({ kind: "app" as const, id }));
}

export function Desktop() {
  const { windows } = useWindowManager();
  const { desktopBackgroundStyle } = useSystemSettings();

  const [rows, setRows] = useState<DesktopRow[]>(defaultRows);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [ctx, setCtx] = useState<{ x: number; y: number } | null>(null);
  const folderCounterRef = useRef(0);
  const ctxMenuRef = useRef<HTMLUListElement | null>(null);
  const [showDisplayProperties, setShowDisplayProperties] = useState(false);
  const [folderBrowse, setFolderBrowse] = useState<DesktopFolder | null>(null);

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
    const closeIfOutside = (e: PointerEvent) => {
      const menu = ctxMenuRef.current;
      const t = e.target as Node | null;
      if (menu && t && menu.contains(t)) return;
      setCtx(null);
    };
    document.addEventListener("pointerdown", closeIfOutside);
    return () => document.removeEventListener("pointerdown", closeIfOutside);
  }, [ctx]);

  const refreshPage = useCallback(() => {
    setCtx(null);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, []);

  const newFolder = useCallback(() => {
    folderCounterRef.current += 1;
    const c = folderCounterRef.current;
    const name = c === 1 ? "New Folder" : `New Folder (${c})`;
    const key = `folder-${Date.now()}-${c}`;
    setRows((prev) => [
      ...prev,
      {
        kind: "folder",
        folder: {
          key,
          name,
          files: [],
        },
      },
    ]);
    setCtx(null);
  }, []);

  const openFolder = useCallback((folder: DesktopFolder) => {
    setFolderBrowse(folder);
  }, []);

  return (
    <div
      className="relative min-h-0 flex-1 overflow-hidden bg-[#4980c6] bg-cover bg-center bg-no-repeat"
      style={desktopBackgroundStyle}
      onMouseDown={(e) => {
        const el = e.target as HTMLElement;
        if (!el.closest(".cell")) setSelectedKey(null);
      }}
      onContextMenu={(e) => {
        const el = e.target as HTMLElement;
        if (el.closest(".cell") || el.closest(".xp-luna-window")) return;
        e.preventDefault();
        setCtx({ x: e.clientX, y: e.clientY });
      }}
    >
      <DisplayPropertiesDialog
        open={showDisplayProperties}
        onClose={() => setShowDisplayProperties(false)}
      />

      {folderBrowse && (
        <DesktopFolderBrowseDialog
          open
          folderName={folderBrowse.name}
          files={folderBrowse.files}
          onClose={() => setFolderBrowse(null)}
        />
      )}

      {ctx && (
        <ul
          ref={ctxMenuRef}
          className="xp-desktop-ctx fixed z-[400] min-w-[180px] cursor-default border border-[#003c74] bg-[#ece9d8] py-0.5 text-[11px] text-black shadow-[4px_4px_12px_rgba(0,0,0,0.35)]"
          style={{ left: ctx.x, top: ctx.y }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <li>
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left hover:bg-[var(--xp-accent)] hover:text-white"
              onClick={refreshPage}
            >
              Refresh
            </button>
          </li>
          <li className="my-0.5 border-t border-[#d4d0c8]" />
          <li>
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left hover:bg-[var(--xp-accent)] hover:text-white"
              onClick={newFolder}
            >
              New Folder
            </button>
          </li>
          <li>
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left hover:bg-[var(--xp-accent)] hover:text-white"
              onClick={() => {
                setShowDisplayProperties(true);
                setCtx(null);
              }}
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
        {rows.map((row) =>
          row.kind === "app" ? (
            <DesktopIcon
              key={row.id}
              app={APP_REGISTRY[row.id]}
              selected={selectedKey === `app:${row.id}`}
              onSelect={() => setSelectedKey(`app:${row.id}`)}
              iconSize="md"
            />
          ) : (
            <DesktopFolderIcon
              key={row.folder.key}
              label={row.folder.name}
              selected={selectedKey === `folder:${row.folder.key}`}
              onSelect={() => setSelectedKey(`folder:${row.folder.key}`)}
              iconSize="md"
              onOpen={() => openFolder(row.folder)}
            />
          ),
        )}
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
