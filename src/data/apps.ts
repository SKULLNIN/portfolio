import type { AppDefinition, AppId } from "@/types";
import { XP_ICONS } from "@/lib/xp-icons";

/**
 * Icons: see `src/lib/xp-icons.ts` (`public/icons/hires/`).
 */
export const APP_REGISTRY: Record<AppDefinition["id"], AppDefinition> = {
  "my-computer": {
    id: "my-computer",
    title: "My Computer",
    desktopLabel: "My Computer",
    icon: XP_ICONS.myComputer,
    defaultSize: { width: 560, height: 440 },
    defaultPosition: { x: 80, y: 60 },
    chrome: "explorer",
    explorerAddress: "My Computer",
  },
  "my-documents": {
    id: "my-documents",
    title: "My Documents",
    desktopLabel: "My Documents",
    icon: XP_ICONS.myDocuments,
    defaultSize: { width: 520, height: 420 },
    defaultPosition: { x: 90, y: 70 },
    chrome: "explorer",
    explorerAddress: "My Documents",
  },
  "my-pictures": {
    id: "my-pictures",
    title: "My Pictures",
    desktopLabel: "My Pictures",
    icon: XP_ICONS.myPictures,
    defaultSize: { width: 520, height: 400 },
    defaultPosition: { x: 100, y: 80 },
    chrome: "explorer",
    explorerAddress: "My Pictures",
  },
  "recycle-bin": {
    id: "recycle-bin",
    title: "Recycle Bin",
    desktopLabel: "Recycle Bin",
    icon: XP_ICONS.recycleBin,
    defaultSize: { width: 440, height: 360 },
    defaultPosition: { x: 110, y: 90 },
    chrome: "explorer",
    explorerAddress: "Recycle Bin",
  },
  notepad: {
    id: "notepad",
    title: "Notepad",
    desktopLabel: "Notepad",
    icon: XP_ICONS.notepad,
    defaultSize: { width: 480, height: 440 },
    defaultPosition: { x: 120, y: 80 },
    chrome: "bare",
  },
  "internet-explorer": {
    id: "internet-explorer",
    title: "Internet Explorer",
    desktopLabel: "Internet Explorer",
    icon: XP_ICONS.internetExplorer,
    defaultSize: { width: 640, height: 500 },
    defaultPosition: { x: 100, y: 40 },
    chrome: "bare",
  },
  minesweeper: {
    id: "minesweeper",
    title: "Mines",
    desktopLabel: "Mines",
    icon: XP_ICONS.minesweeper,
    defaultSize: { width: 320, height: 420 },
    defaultPosition: { x: 200, y: 100 },
    chrome: "game",
  },
  "media-player": {
    id: "media-player",
    title: "Windows Media Player",
    desktopLabel: "Media Player",
    icon: XP_ICONS.mediaPlayer,
    defaultSize: { width: 480, height: 360 },
    defaultPosition: { x: 140, y: 120 },
    chrome: "bare",
  },
  "control-panel": {
    id: "control-panel",
    title: "Control Panel",
    desktopLabel: "Control Panel",
    icon: XP_ICONS.controlPanel,
    defaultSize: { width: 720, height: 520 },
    defaultPosition: { x: 72, y: 48 },
    chrome: "bare",
  },
};

/** Every app in the registry — windows and taskbar tabs must iterate this, not only {@link APP_ORDER}. */
export const ALL_APP_IDS: AppId[] = Object.keys(APP_REGISTRY) as AppId[];

export const APP_ORDER: AppDefinition["id"][] = [
  "my-computer",
  "my-documents",
  "my-pictures",
  "recycle-bin",
  "notepad",
  "internet-explorer",
  "minesweeper",
  "media-player",
];
