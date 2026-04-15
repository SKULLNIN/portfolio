import { APP_REGISTRY } from "@/data/apps";
import { WINDOW_Z_INDEX_CAP } from "@/lib/constants";
import { computeInitialWindowFromViewport } from "@/lib/window-layout";
import type { AppId, OpenViewportPayload, WindowAction, WindowState } from "@/types";

export type WindowsRecord = Record<AppId, WindowState>;

/**
 * When the max z-index exceeds this, we compact open windows to 1..N so
 * values stay small. Must stay below {@link TASKBAR_SHELL_Z_INDEX} (see constants).
 */
const Z_COMPACT_THRESHOLD = 9000;

function nextZIndex(windows: WindowsRecord): number {
  const max = Math.max(0, ...Object.values(windows).map((w) => w.zIndex));
  return Math.min(max + 1, WINDOW_Z_INDEX_CAP);
}

/** Re-number z-indexes 1..N preserving order (called when max exceeds threshold). */
function compactZIndexes(windows: WindowsRecord): WindowsRecord {
  const entries = Object.values(windows)
    .filter((w) => w.isOpen && !w.isMinimized)
    .sort((a, b) => a.zIndex - b.zIndex);
  const next = { ...windows };
  entries.forEach((w, i) => {
    next[w.id] = { ...next[w.id], zIndex: i + 1 };
  });
  // Closed / minimized windows get z 0
  for (const w of Object.values(next)) {
    if (!w.isOpen || w.isMinimized) {
      next[w.id] = { ...next[w.id], zIndex: 0 };
    }
  }
  return next;
}

/** Assign next z-index and compact if needed. */
function withNextZ(windows: WindowsRecord, id: AppId, patch: Partial<WindowState>): WindowsRecord {
  const z = nextZIndex(windows);
  let result: WindowsRecord = {
    ...windows,
    [id]: { ...windows[id], ...patch, zIndex: z },
  };
  if (z > Z_COMPACT_THRESHOLD) {
    result = compactZIndexes(result);
  }
  return result;
}

function createInitialWindow(
  id: AppId,
  viewport?: OpenViewportPayload
): WindowState {
  const def = APP_REGISTRY[id];
  const base = {
    id,
    title: def.title,
    icon: def.icon,
    isOpen: true,
    isMinimized: false,
    zIndex: 100,
  } as const;

  if (viewport) {
    const geo = computeInitialWindowFromViewport(def, viewport);
    return {
      ...base,
      isMaximized: geo.isMaximized,
      position: geo.position,
      size: geo.size,
      preMaximize: geo.preMaximize,
    };
  }

  return {
    ...base,
    isMaximized: false,
    position: { ...def.defaultPosition },
    size: { ...def.defaultSize },
    preMaximize: null,
  };
}

export function windowReducer(
  state: WindowsRecord,
  action: WindowAction
): WindowsRecord {
  switch (action.type) {
    case "OPEN": {
      const existing = state[action.id];
      if (existing?.isOpen) {
        return withNextZ(state, action.id, { isMinimized: false });
      }
      const fresh = createInitialWindow(action.id, action.viewport);
      const z = nextZIndex(state);
      let result: WindowsRecord = {
        ...state,
        [action.id]: { ...fresh, zIndex: z },
      };
      if (z > Z_COMPACT_THRESHOLD) {
        result = compactZIndexes(result);
      }
      return result;
    }
    case "CLOSE": {
      const w = state[action.id];
      if (!w) return state;
      return {
        ...state,
        [action.id]: {
          ...w,
          isOpen: false,
          isMinimized: false,
          isMaximized: false,
          preMaximize: null,
        },
      };
    }
    case "MINIMIZE": {
      const w = state[action.id];
      if (!w) return state;
      return {
        ...state,
        [action.id]: { ...w, isMinimized: true },
      };
    }
    case "RESTORE": {
      const w = state[action.id];
      if (!w) return state;
      return withNextZ(state, action.id, { isMinimized: false });
    }
    case "TOGGLE_MAXIMIZE": {
      const w = state[action.id];
      if (!w) return state;
      if (w.isMaximized) {
        const prev = w.preMaximize;
        return withNextZ(state, action.id, {
          isMaximized: false,
          preMaximize: null,
          position: prev?.position ?? w.position,
          size: prev?.size ?? w.size,
        });
      }
      return withNextZ(state, action.id, {
        isMaximized: true,
        preMaximize: {
          position: { ...w.position },
          size: { ...w.size },
        },
      });
    }
    case "FOCUS": {
      const w = state[action.id];
      if (!w || !w.isOpen || w.isMinimized) return state;
      return withNextZ(state, action.id, {});
    }
    case "MOVE": {
      const w = state[action.id];
      if (!w || w.isMaximized) return state;
      return {
        ...state,
        [action.id]: { ...w, position: action.position },
      };
    }
    case "RESIZE": {
      const w = state[action.id];
      if (!w || w.isMaximized) return state;
      return {
        ...state,
        [action.id]: {
          ...w,
          size: action.size,
          position: action.position,
        },
      };
    }
    case "TOGGLE_MINIMIZE_FROM_TASKBAR": {
      const w = state[action.id];
      if (!w || !w.isOpen) return state;
      if (w.isMinimized) {
        return withNextZ(state, action.id, { isMinimized: false });
      }
      return {
        ...state,
        [action.id]: { ...w, isMinimized: true },
      };
    }
    case "RESET_ALL":
      return createInitialWindowsState();
    default:
      return state;
  }
}

export function createInitialWindowsState(): WindowsRecord {
  const ids = Object.keys(APP_REGISTRY) as AppId[];
  return ids.reduce((acc, id) => {
    const def = APP_REGISTRY[id];
    acc[id] = {
      id,
      title: def.title,
      icon: def.icon,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 0,
      position: { ...def.defaultPosition },
      size: { ...def.defaultSize },
      preMaximize: null,
    };
    return acc;
  }, {} as WindowsRecord);
}
