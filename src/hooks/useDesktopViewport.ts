"use client";

import { useEffect, useState } from "react";
import { useTaskbarVisibilitySafe } from "@/context/TaskbarVisibilityContext";

/**
 * Live size of the desktop client area (viewport minus taskbar inset).
 * Inset is 0 when the taskbar is auto-hidden, full height when it is shown.
 */
export function useDesktopViewport() {
  const { taskbarInsetPx } = useTaskbarVisibilitySafe();
  const [dims, setDims] = useState(() => readDims(taskbarInsetPx));

  useEffect(() => {
    const update = () => setDims(readDims(taskbarInsetPx));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [taskbarInsetPx]);

  return dims;
}

function readDims(taskbarInsetPx: number) {
  if (typeof window === "undefined") {
    return { width: 1024, height: 600 };
  }
  return {
    width: window.innerWidth,
    height: Math.max(160, window.innerHeight - taskbarInsetPx),
  };
}
