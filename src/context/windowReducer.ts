import { APP_REGISTRY } from "@/data/apps";
import { computeInitialWindowFromViewport } from "@/lib/window-layout";
import type { AppId, OpenViewportPayload, WindowAction, WindowState } from "@/types";

export type WindowsRecord = Record<AppId, WindowState>;

function nextZIndex(windows: WindowsRecord): number {
  return (
    Math.max(0, ...Object.values(windows).map((w) => w.zIndex)) + 1
  );
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
      const z = nextZIndex(state);
      if (existing?.isOpen) {
        return {
          ...state,
          [action.id]: {
            ...existing,
            isMinimized: false,
            zIndex: z,
          },
        };
      }
      if (existing && !existing.isOpen) {
        const fresh = createInitialWindow(action.id, action.viewport);
        return {
          ...state,
          [action.id]: { ...fresh, zIndex: z },
        };
      }
      const fresh = createInitialWindow(action.id, action.viewport);
      return {
        ...state,
        [action.id]: { ...fresh, zIndex: z },
      };
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
      const z = nextZIndex(state);
      return {
        ...state,
        [action.id]: { ...w, isMinimized: false, zIndex: z },
      };
    }
    case "TOGGLE_MAXIMIZE": {
      const w = state[action.id];
      if (!w) return state;
      if (w.isMaximized) {
        const prev = w.preMaximize;
        return {
          ...state,
          [action.id]: {
            ...w,
            isMaximized: false,
            preMaximize: null,
            position: prev?.position ?? w.position,
            size: prev?.size ?? w.size,
            zIndex: nextZIndex(state),
          },
        };
      }
      return {
        ...state,
        [action.id]: {
          ...w,
          isMaximized: true,
          preMaximize: {
            position: { ...w.position },
            size: { ...w.size },
          },
          zIndex: nextZIndex(state),
        },
      };
    }
    case "FOCUS": {
      const w = state[action.id];
      if (!w || !w.isOpen || w.isMinimized) return state;
      const z = nextZIndex(state);
      return {
        ...state,
        [action.id]: { ...w, zIndex: z },
      };
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
        const z = nextZIndex(state);
        return {
          ...state,
          [action.id]: { ...w, isMinimized: false, zIndex: z },
        };
      }
      return {
        ...state,
        [action.id]: { ...w, isMinimized: true },
      };
    }
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
