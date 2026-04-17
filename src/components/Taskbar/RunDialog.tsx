"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWindowManager } from "@/context/WindowContext";
import { XP_ICONS } from "@/lib/xp-icons";
import type { AppId } from "@/types";

type Props = {
  open: boolean;
  onClose: () => void;
};

/**
 * The classic "Run" command matches:
 *   notepad → open Notepad
 *   minesweeper / mine → open Minesweeper
 *   iexplore / ie → open IE
 *   control → open Control Panel
 *   calc / calculator → open My Computer (we don't have calc)
 *   explorer → opens My Computer
 *   winamp / webamp → open Winamp
 */
const CMD_MAP: Record<string, AppId> = {
  notepad: "notepad",
  "notepad.exe": "notepad",
  minesweeper: "minesweeper",
  "minesweeper.exe": "minesweeper",
  mine: "minesweeper",
  winmine: "minesweeper",
  "winmine.exe": "minesweeper",
  pinball: "pinball",
  "pinball.exe": "pinball",
  "space cadet": "pinball",
  iexplore: "internet-explorer",
  "iexplore.exe": "internet-explorer",
  ie: "internet-explorer",
  "internet explorer": "internet-explorer",
  control: "control-panel",
  "control.exe": "control-panel",
  "control panel": "control-panel",
  explorer: "my-computer",
  "explorer.exe": "my-computer",
  "my computer": "my-computer",
  winamp: "winamp",
  "winamp.exe": "winamp",
  webamp: "winamp",
  "js-dos": "js-dos",
  jsdos: "js-dos",
  dos: "js-dos",
  digger: "js-dos",
  doom: "doom",
  "doom.exe": "doom",
  "my documents": "my-documents",
  "my pictures": "my-pictures",
  "recycle bin": "recycle-bin",
};

export function RunDialog({ open, onClose }: Props) {
  const { openApp } = useWindowManager();
  const [cmd, setCmd] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setCmd("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleRun = useCallback(() => {
    const key = cmd.trim().toLowerCase();
    const appId = CMD_MAP[key];
    if (appId) {
      openApp(appId);
      onClose();
    } else if (key.includes(".") || key.startsWith("http")) {
      // Try opening as URL
      window.open(
        key.startsWith("http") ? key : `https://${key}`,
        "_blank",
        "noopener,noreferrer"
      );
      onClose();
    } else {
      // Show "not found" briefly
      alert(`Windows cannot find '${cmd}'. Make sure you typed the name correctly, and then try again.`);
    }
  }, [cmd, openApp, onClose]);

  if (!open) return null;

  return (
    <div className="xp-run-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="xp-run-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="xp-run-titlebar">
          <span className="xp-run-titlebar-text">Run</span>
          <button
            type="button"
            className="xp-run-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="xp-run-body">
          <div className="xp-run-icon-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={XP_ICONS.run} alt="" width={32} height={32} />
            <p className="xp-run-desc">
              Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.
            </p>
          </div>
          <div className="xp-run-input-row">
            <label className="xp-run-label" htmlFor="xp-run-input">
              Open:
            </label>
            <input
              ref={inputRef}
              id="xp-run-input"
              type="text"
              className="xp-run-input"
              value={cmd}
              onChange={(e) => setCmd(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRun();
              }}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>
        <div className="xp-run-footer">
          <button
            type="button"
            className="xp-run-btn xp-run-btn--ok"
            onClick={handleRun}
          >
            OK
          </button>
          <button
            type="button"
            className="xp-run-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="xp-run-btn"
            onClick={() => {
              // Browse does nothing meaningful here
              onClose();
            }}
          >
            Browse...
          </button>
        </div>
      </div>
    </div>
  );
}
