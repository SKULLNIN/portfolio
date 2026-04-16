import type { AppDefinition, WindowState } from "@/types";
import { getViewportSegment } from "@/lib/viewport-profile";

export type ViewportForWindows = {
  width: number;
  height: number;
  taskbarInset: number;
};

/**
 * Maps registry defaults to a size/position that fits the current visual viewport.
 * Phones: start maximized (minus taskbar) for readable portfolio windows.
 * Tablet: centered, clamped. Desktop: registry defaults.
 */
export function computeInitialWindowFromViewport(
  def: AppDefinition,
  vp: ViewportForWindows
): Pick<WindowState, "position" | "size" | "isMaximized" | "preMaximize"> {
  const seg = getViewportSegment(vp.width);
  const preMaximize = {
    position: { ...def.defaultPosition },
    size: { ...def.defaultSize },
  };

  /** Phones always; narrow tablets / portrait get full-area windows to avoid clipped chrome. */
  const useFullBleed =
    !def.lockWindowSize &&
    (seg === "compact" || (seg === "tablet" && vp.width < 768));

  if (def.lockWindowSize) {
    const margin = seg === "tablet" ? 10 : 16;
    const w = def.defaultSize.width;
    const h = def.defaultSize.height;
    const availW = vp.width - margin * 2;
    const availH = vp.height - vp.taskbarInset - margin * 2;
    const maxX = Math.max(0, vp.width - w);
    const maxY = Math.max(0, vp.height - vp.taskbarInset - h);
    const x = Math.round(
      Math.min(maxX, Math.max(0, margin + (availW - w) / 2))
    );
    const y = Math.round(
      Math.min(maxY, Math.max(0, margin + Math.max(0, (availH - h) / 3)))
    );
    return {
      position: { x, y },
      size: { width: w, height: h },
      isMaximized: false,
      preMaximize: null,
    };
  }

  if (useFullBleed) {
    const h = Math.max(160, vp.height - vp.taskbarInset);
    const w = vp.width;
    return {
      position: { x: 0, y: 0 },
      size: { width: w, height: h },
      isMaximized: true,
      preMaximize,
    };
  }

  const margin = seg === "tablet" ? 10 : 16;
  const availW = vp.width - margin * 2;
  const availH = vp.height - vp.taskbarInset - margin * 2;
  const w = Math.min(def.defaultSize.width, Math.max(280, availW));
  const h = Math.min(def.defaultSize.height, Math.max(160, availH));
  const x = Math.round(margin + (availW - w) / 2);
  const y = Math.round(margin + Math.max(0, (availH - h) / 3));

  return {
    position: { x, y },
    size: { width: w, height: h },
    isMaximized: false,
    preMaximize: null,
  };
}
