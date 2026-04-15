"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { TASKBAR_HEIGHT_PX } from "@/lib/constants";

type TaskbarVisibilityValue = {
  /** Taskbar is fully visible (not slid off-screen). */
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  /** Pixels to subtract from viewport height for maximized windows (0 when hidden). */
  taskbarInsetPx: number;
};

const TaskbarVisibilityCtx = createContext<TaskbarVisibilityValue | null>(null);

export function TaskbarVisibilityProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpandedState] = useState(true);

  const setExpanded = useCallback((v: boolean) => {
    setExpandedState(v);
  }, []);

  const value = useMemo(
    () => ({
      expanded,
      setExpanded,
      taskbarInsetPx: expanded ? TASKBAR_HEIGHT_PX : 0,
    }),
    [expanded, setExpanded]
  );

  return (
    <TaskbarVisibilityCtx.Provider value={value}>{children}</TaskbarVisibilityCtx.Provider>
  );
}

export function useTaskbarVisibility() {
  const ctx = useContext(TaskbarVisibilityCtx);
  if (!ctx) {
    throw new Error("useTaskbarVisibility must be used within TaskbarVisibilityProvider");
  }
  return ctx;
}

/** Optional: default inset when provider is absent (should not happen in app shell). */
export function useTaskbarVisibilitySafe(): TaskbarVisibilityValue {
  const ctx = useContext(TaskbarVisibilityCtx);
  return (
    ctx ?? {
      expanded: true,
      setExpanded: () => {},
      taskbarInsetPx: TASKBAR_HEIGHT_PX,
    }
  );
}
