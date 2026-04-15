"use client";

import { useEffect, useState } from "react";
import { useTaskbarVisibilitySafe } from "@/context/TaskbarVisibilityContext";
import { getVisualViewportSize } from "@/lib/viewport-profile";

/**
 * Live size of the desktop client area (visual viewport minus taskbar inset).
 * Uses VisualViewport when available so Android/tablet chrome matches window sizing.
 */
export function useDesktopViewport() {
  const { taskbarInsetPx } = useTaskbarVisibilitySafe();
  const [dims, setDims] = useState(() => readDims(taskbarInsetPx));

  useEffect(() => {
    const update = () => setDims(readDims(taskbarInsetPx));
    update();
    window.addEventListener("resize", update);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
    };
  }, [taskbarInsetPx]);

  return dims;
}

function readDims(taskbarInsetPx: number) {
  if (typeof window === "undefined") {
    return { width: 1024, height: 600 };
  }
  const { width, height } = getVisualViewportSize();
  return {
    width,
    height: Math.max(160, height - taskbarInsetPx),
  };
}
