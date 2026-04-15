"use client";

import { useDeviceLayout } from "@/context/DeviceLayoutContext";
import { XP_ICONS } from "@/lib/xp-icons";

const ICON_PX = { sm: 28, md: 36, lg: 48 } as const;

type IconSize = "sm" | "md" | "lg";

type Props = {
  label: string;
  selected: boolean;
  onSelect: () => void;
  iconSize?: IconSize;
  onOpen: () => void;
};

/** User-created desktop folder (New Folder) — XP-style yellow folder icon. */
export function DesktopFolderIcon({
  label,
  selected,
  onSelect,
  iconSize = "md",
  onOpen,
}: Props) {
  const { isTouchUi } = useDeviceLayout();
  const px = ICON_PX[iconSize];
  const title = isTouchUi
    ? `${label} — tap to open`
    : `${label} — double-click to open`;

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
        onOpen();
      }}
      onDoubleClick={() => {
        if (!isTouchUi) onOpen();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="object-contain [image-rendering:auto]"
        style={{ width: px, height: px }}
        src={XP_ICONS.myDocuments}
        alt=""
        width={px}
        height={px}
      />
      <span className="cell-name">{label}</span>
    </div>
  );
}
