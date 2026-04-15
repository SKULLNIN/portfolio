"use client";

import { useCallback, useRef, type ReactNode } from "react";
import { useTaskbarVisibility } from "@/context/TaskbarVisibilityContext";

const HIDE_DELAY_MS = 480;
/** Bottom hit strip height when taskbar is hidden (easy to aim). */
const PEEK_HIT_PX = 14;

type Props = {
  children: ReactNode;
};

/**
 * Slides the taskbar off-screen when the pointer leaves it; reveals a thin hit area
 * at the bottom edge to bring it back (Windows auto-hide style).
 */
export function TaskbarAutoHide({ children }: Props) {
  const { expanded, setExpanded } = useTaskbarVisibility();
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current != null) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const show = useCallback(() => {
    clearHideTimer();
    setExpanded(true);
  }, [clearHideTimer, setExpanded]);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimer.current = setTimeout(() => {
      hideTimer.current = null;
      setExpanded(false);
    }, HIDE_DELAY_MS);
  }, [clearHideTimer, setExpanded]);

  return (
    <>
      {!expanded && (
        <button
          type="button"
          className="pointer-events-auto fixed bottom-0 left-0 right-0 z-[103] cursor-default border-0 bg-transparent p-0 outline-none focus:outline-none"
          style={{ height: PEEK_HIT_PX }}
          onMouseEnter={show}
          onFocus={show}
          aria-label="Show taskbar"
        />
      )}
      <div
        className={`pointer-events-auto fixed bottom-0 left-0 right-0 z-[102] transition-transform duration-200 ease-out will-change-transform ${
          expanded ? "translate-y-0" : "translate-y-full"
        }`}
        onMouseEnter={show}
        onMouseLeave={scheduleHide}
      >
        {children}
      </div>
    </>
  );
}
