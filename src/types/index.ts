export type AppId =
  | "my-computer"
  | "my-documents"
  | "my-pictures"
  | "recycle-bin"
  | "notepad"
  | "internet-explorer"
  | "minesweeper"
  | "media-player"
  | "control-panel";

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

export type WindowAction =
  | { type: "OPEN"; id: AppId }
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
  | { type: "TOGGLE_MINIMIZE_FROM_TASKBAR"; id: AppId };

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
}
