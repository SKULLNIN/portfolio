"use client";

import type { AppDefinition } from "@/types";
import { useWindowManager } from "@/context/WindowContext";

type Props = {
  app: AppDefinition;
  selected: boolean;
  onSelect: () => void;
};

export function DesktopIcon({ app, selected, onSelect }: Props) {
  const { openApp } = useWindowManager();

  return (
    <div
      role="button"
      tabIndex={0}
      title={`${app.desktopLabel} — double-click to open`}
      className={`cell ${selected ? "cell--selected" : ""}`}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={() => openApp(app.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openApp(app.id);
        }
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="h-9 w-9 object-contain [image-rendering:auto]"
        src={app.icon}
        alt=""
        width={36}
        height={36}
      />
      <span className="cell-name">{app.desktopLabel}</span>
    </div>
  );
}
