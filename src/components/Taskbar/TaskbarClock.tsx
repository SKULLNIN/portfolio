"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function formatTime(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Windows XP system tray clock — shows time and date tooltip on hover.
 * Clicking opens the "Date and Time Properties" tooltip (just like real XP).
 */
export function TaskbarClock() {
  /** Empty until mount — avoids SSR/client time mismatch (hydration errors break clicks). */
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const tick = () => {
      setTime(formatTime());
      setDate(formatDate());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setShowTooltip(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    hideTimer.current = setTimeout(() => {
      setShowTooltip(false);
    }, 300);
  }, []);

  return (
    <div
      className="xp-clock"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={date}
    >
      <span className="inline-block min-w-[3.35rem] tabular-nums">{time}</span>
      {showTooltip && (
        <div ref={tooltipRef} className="xp-clock-tooltip">
          {date}
        </div>
      )}
    </div>
  );
}
