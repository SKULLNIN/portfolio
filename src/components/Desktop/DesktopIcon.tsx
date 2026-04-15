"use client";

import { useEffect, useState } from "react";
import type { AppDefinition } from "@/types";
import { useDeviceLayout } from "@/context/DeviceLayoutContext";
import { useWindowManager } from "@/context/WindowContext";

type Props = {
  app: AppDefinition;
  selected: boolean;
  onSelect: () => void;
  /** Wallpaper icon size — right-click desktop View (XP-style). */
  iconSize?: "sm" | "md" | "lg";
};

const ICON_PX = { sm: 28, md: 36, lg: 48 } as const;

export function DesktopIcon({ app, selected, onSelect, iconSize = "md" }: Props) {
  const { openApp } = useWindowManager();
  const { isTouchUi } = useDeviceLayout();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const title =
    mounted && isTouchUi
      ? `${app.desktopLabel} — tap to open`
      : `${app.desktopLabel} — double-click to open`;

  const px = ICON_PX[iconSize];

  return (
    <div
      role="button"
      tabIndex={0}
      title={title}
      className={`cell ${selected ? "cell--selected" : ""}`}
      onMouseDown={(e) => {
        e.stopPropagation();
        if (!isTouchUi) onSelect();
      }}
      onClick={(e) => {
        if (!isTouchUi) return;
        e.stopPropagation();
        openApp(app.id);
      }}
      onDoubleClick={() => {
        if (!isTouchUi) openApp(app.id);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openApp(app.id);
        }
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="object-contain [image-rendering:auto]"
        style={{ width: px, height: px }}
        src={app.icon}
        alt=""
        width={px}
        height={px}
      />
      <span className="cell-name">{app.desktopLabel}</span>
    </div>
  );
}
