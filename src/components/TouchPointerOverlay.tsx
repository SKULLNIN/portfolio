"use client";

import { useEffect, useState } from "react";

type Point = { x: number; y: number };

/**
 * On touch-only devices there is no OS cursor. Renders a classic arrow that
 * follows the active touch so tablet/phone users see a "mouse" position.
 * Hidden when a real mouse or stylus is used (Pointer Events).
 */
export function TouchPointerOverlay() {
  const [pos, setPos] = useState<Point | null>(null);
  const [hideForHardwarePointer, setHideForHardwarePointer] = useState(false);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || e.pointerType === "pen") {
        setHideForHardwarePointer(true);
        setPos(null);
      }
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, []);

  useEffect(() => {
    if (hideForHardwarePointer) return;

    const fromTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      setPos({ x: t.clientX, y: t.clientY });
    };

    const clear = () => setPos(null);

    window.addEventListener("touchstart", fromTouch, { passive: true });
    window.addEventListener("touchmove", fromTouch, { passive: true });
    window.addEventListener("touchend", clear);
    window.addEventListener("touchcancel", clear);

    return () => {
      window.removeEventListener("touchstart", fromTouch);
      window.removeEventListener("touchmove", fromTouch);
      window.removeEventListener("touchend", clear);
      window.removeEventListener("touchcancel", clear);
    };
  }, [hideForHardwarePointer]);

  if (hideForHardwarePointer || !pos) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[10050]"
      aria-hidden
    >
      <div
        className="absolute will-change-transform"
        style={{
          left: 0,
          top: 0,
          transform: `translate(${pos.x}px, ${pos.y}px)`,
        }}
      >
        {/* Classic arrow cursor silhouette (hotspot top-left ~0,0) */}
        <svg
          width={28}
          height={28}
          viewBox="0 0 24 24"
          className="drop-shadow-[1px_1px_1px_rgba(0,0,0,0.85)]"
        >
          <path
            d="M2 2 L2 18 L7 13 L10 21 L13 20 L10 12 L17 12 Z"
            fill="white"
            stroke="black"
            strokeWidth={1.25}
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
