export type AppId =
  | "my-computer"
  | "my-documents"
  | "my-pictures"
  | "recycle-bin"
  | "notepad"
  | "internet-explorer"
  | "minesweeper"
  | "pinball"
  | "winamp"
  | "games"
  | "control-panel"
  | "msn-messenger"
  | "js-dos"
  /** DOOM (1993) shareware episode — bundle hosted on v8.js-dos.com for js-dos 8. */
  | "doom";

/** Which inner chrome sits below the Luna title bar (matches real Windows XP). */
export type WindowChromeKind =
  | "explorer"
  | "game"
  /** Title bar + Luna body only — app renders full inner chrome (Notepad, IE6, …). */
  | "bare";

export interface WindowState {
  id: AppId;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  /** Snapshot before maximize for restore */
  preMaximize: { position: { x: number; y: number }; size: { width: number; height: number } } | null;
}

/** Passed on OPEN so new windows fit phone/tablet visual viewport. */
export type OpenViewportPayload = {
  width: number;
  height: number;
  taskbarInset: number;
};

export type WindowAction =
  | { type: "OPEN"; id: AppId; viewport?: OpenViewportPayload }
  | { type: "CLOSE"; id: AppId }
  | { type: "MINIMIZE"; id: AppId }
  | { type: "RESTORE"; id: AppId }
  | { type: "TOGGLE_MAXIMIZE"; id: AppId }
  | { type: "FOCUS"; id: AppId }
  | { type: "MOVE"; id: AppId; position: { x: number; y: number } }
  | {
      type: "RESIZE";
      id: AppId;
      size: { width: number; height: number };
      position: { x: number; y: number };
    }
  | { type: "TOGGLE_MINIMIZE_FROM_TASKBAR"; id: AppId }
  /** Close all apps and reset window state (e.g. after fake shutdown → login). */
  | { type: "RESET_ALL" };

export interface AppDefinition {
  id: AppId;
  title: string;
  icon: string;
  desktopLabel: string;
  defaultSize: { width: number; height: number };
  defaultPosition: { x: number; y: number };
  chrome: WindowChromeKind;
  /** Explorer address bar text (only used when chrome === "explorer") */
  explorerAddress?: string;
  /** Game menu strip labels when chrome === "game" (default: Game, Help) */
  gameMenus?: readonly string[];
  /**
   * When true, the window keeps {@link defaultSize} and cannot be resized (e.g. embedded
   * games that expect a fixed iframe pixel size).
   */
  lockWindowSize?: boolean;
}
