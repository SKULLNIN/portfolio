"use client";

import type { WindowState } from "@/types";
import { useWindowManager } from "@/context/WindowContext";

type Props = {
  w: WindowState;
  isActive: boolean;
};

export function TaskbarTab({ w, isActive }: Props) {
  const { toggleTaskbar, focusApp } = useWindowManager();

  if (!w.isOpen) return null;

  const cls = [
    "xp-taskbar-item",
    isActive && !w.isMinimized ? "xp-taskbar-item--active" : "",
    w.isMinimized ? "xp-taskbar-item--minimized" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={cls}
      onClick={() => {
        if (w.isMinimized) {
          toggleTaskbar(w.id);
        } else if (!isActive) {
          focusApp(w.id);
        } else {
          toggleTaskbar(w.id);
        }
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="xp-taskbar-item-icon object-contain"
        src={w.icon}
        alt=""
        width={18}
        height={18}
      />
      <span className="xp-taskbar-item-label">{w.title}</span>
    </button>
  );
}
