/** Layout bucket from CSS width — used for responsive XP chrome. */
export type ViewportSegment = "compact" | "tablet" | "desktop";

export function getViewportSegment(width: number): ViewportSegment {
  if (width < 640) return "compact";
  if (width < 1024) return "tablet";
  return "desktop";
}

/** Prefer visual viewport on mobile (Chrome address bar, notches). */
export function getVisualViewportSize(): { width: number; height: number } {
  if (typeof window === "undefined") {
    return { width: 1024, height: 768 };
  }
  const vv = window.visualViewport;
  if (vv) {
    return {
      width: Math.max(1, Math.round(vv.width)),
      height: Math.max(1, Math.round(vv.height)),
    };
  }
  return {
    width: Math.max(1, window.innerWidth),
    height: Math.max(1, window.innerHeight),
  };
}

/**
 * True when we should use large tap targets and touch-first patterns
 * (phones, tablets, Android, coarse pointer).
 */
export function readTouchUiPreference(): boolean {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (coarse) return true;
  const seg = getViewportSegment(window.innerWidth);
  const touchPoints = navigator.maxTouchPoints ?? 0;
  if (touchPoints > 0 && seg !== "desktop") return true;
  if (/Android/i.test(navigator.userAgent)) return true;
  return false;
}
