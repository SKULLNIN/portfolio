"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import {
  createInitialWindowsState,
  windowReducer,
} from "@/context/windowReducer";
import { useTaskbarVisibility } from "@/context/TaskbarVisibilityContext";
import { getVisualViewportSize } from "@/lib/viewport-profile";
import type { AppId, WindowAction } from "@/types";
import type { WindowsRecord } from "@/context/windowReducer";

type Ctx = {
  windows: WindowsRecord;
  dispatch: (a: WindowAction) => void;
  openApp: (id: AppId) => void;
  closeApp: (id: AppId) => void;
  minimizeApp: (id: AppId) => void;
  restoreApp: (id: AppId) => void;
  toggleMaximize: (id: AppId) => void;
  focusApp: (id: AppId) => void;
  toggleTaskbar: (id: AppId) => void;
};

const WindowCtx = createContext<Ctx | null>(null);

export function WindowProvider({ children }: { children: ReactNode }) {
  const { taskbarInsetPx } = useTaskbarVisibility();
  const [windows, dispatch] = useReducer(
    windowReducer,
    undefined,
    createInitialWindowsState
  );

  const openApp = useCallback(
    (id: AppId) => {
      const vv = getVisualViewportSize();
      dispatch({
        type: "OPEN",
        id,
        viewport: {
          width: vv.width,
          height: vv.height,
          taskbarInset: taskbarInsetPx,
        },
      });
    },
    [taskbarInsetPx]
  );

  const closeApp = useCallback((id: AppId) => {
    dispatch({ type: "CLOSE", id });
  }, []);

  const minimizeApp = useCallback((id: AppId) => {
    dispatch({ type: "MINIMIZE", id });
  }, []);

  const restoreApp = useCallback((id: AppId) => {
    dispatch({ type: "RESTORE", id });
  }, []);

  const toggleMaximize = useCallback((id: AppId) => {
    dispatch({ type: "TOGGLE_MAXIMIZE", id });
  }, []);

  const focusApp = useCallback((id: AppId) => {
    dispatch({ type: "FOCUS", id });
  }, []);

  const toggleTaskbar = useCallback((id: AppId) => {
    dispatch({ type: "TOGGLE_MINIMIZE_FROM_TASKBAR", id });
  }, []);

  const value = useMemo(
    () => ({
      windows,
      dispatch,
      openApp,
      closeApp,
      minimizeApp,
      restoreApp,
      toggleMaximize,
      focusApp,
      toggleTaskbar,
    }),
    [
      windows,
      openApp,
      closeApp,
      minimizeApp,
      restoreApp,
      toggleMaximize,
      focusApp,
      toggleTaskbar,
    ]
  );

  return <WindowCtx.Provider value={value}>{children}</WindowCtx.Provider>;
}

export function useWindowManager() {
  const ctx = useContext(WindowCtx);
  if (!ctx) throw new Error("useWindowManager must be used within WindowProvider");
  return ctx;
}
