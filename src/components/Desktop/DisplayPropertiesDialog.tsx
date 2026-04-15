"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { CP_ACCENT_COLORS, CP_WALLPAPERS } from "@/data/control-panel-content";
import { useSystemSettings } from "@/context/SystemSettingsContext";
import { XP_ICONS } from "@/lib/xp-icons";

const TABS = [
  "Themes",
  "Desktop",
  "Screen Saver",
  "Appearance",
  "Settings",
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
};

/** Windows XP “Display Properties” — Luna layout (Themes tab matches classic XP). */
export function DisplayPropertiesDialog({ open, onClose }: Props) {
  const {
    wallpaperIndex,
    setWallpaperIndex,
    accentIndex,
    setAccentIndex,
  } = useSystemSettings();

  const [tab, setTab] = useState(0);
  const [localWp, setLocalWp] = useState(wallpaperIndex);
  const [localAccent, setLocalAccent] = useState(accentIndex);

  useEffect(() => {
    if (open) {
      setLocalWp(wallpaperIndex);
      setLocalAccent(accentIndex);
      setTab(0);
    }
  }, [open, wallpaperIndex, accentIndex]);

  const dirty =
    localWp !== wallpaperIndex || localAccent !== accentIndex;

  const apply = useCallback(() => {
    setWallpaperIndex(localWp);
    setAccentIndex(localAccent);
  }, [localWp, localAccent, setWallpaperIndex, setAccentIndex]);

  const handleOk = () => {
    apply();
    onClose();
  };

  const handleApply = () => {
    apply();
  };

  const wp = CP_WALLPAPERS[localWp] ?? CP_WALLPAPERS[0];
  const accentHex = CP_ACCENT_COLORS[localAccent] ?? CP_ACCENT_COLORS[0];

  const sampleBg: CSSProperties =
    "imageUrl" in wp && wp.imageUrl
      ? {
          backgroundImage: `url('${wp.imageUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : { backgroundImage: wp.css, backgroundSize: "cover" };

  const sampleTitleBarStyle: CSSProperties = {
    backgroundImage: `linear-gradient(to bottom, ${accentHex}, color-mix(in srgb, ${accentHex} 55%, black))`,
  };

  /** Local --xp-accent so Control Panel–style swatch rings match the Appearance selection preview. */
  const previewChromeStyle: CSSProperties = {
    ["--xp-accent" as string]: accentHex,
  };

  if (!open) return null;

  return (
    <div
      className="xp-dp-overlay pointer-events-auto fixed inset-0 z-[500] flex items-center justify-center bg-black/20 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="xp-dp-window flex max-h-[92vh] w-full max-w-[420px] flex-col overflow-hidden rounded-t border border-[#003c74] bg-[#ece9d8] shadow-[4px_4px_14px_rgba(0,0,0,0.45)]"
        role="dialog"
        aria-labelledby="xp-dp-title"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="xp-dp-titlebar flex items-center justify-between gap-2 bg-gradient-to-b from-[#0a5bc4] to-[#083b8a] px-2 py-1">
          <div className="flex min-w-0 items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={XP_ICONS.myComputer}
              alt=""
              width={16}
              height={16}
              className="shrink-0"
            />
            <span id="xp-dp-title" className="truncate text-[13px] font-bold text-white">
              Display Properties
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              className="xp-dp-titlebtn"
              title="Help"
              aria-label="Help"
            >
              ?
            </button>
            <button
              type="button"
              className="xp-dp-titlebtn xp-dp-titlebtn--close"
              title="Close"
              aria-label="Close"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>

        <div className="xp-dp-tabs flex border-b border-[#aca899] bg-[#ece9d8] px-1 pt-1">
          {TABS.map((name, i) => (
            <button
              key={name}
              type="button"
              className={
                i === tab
                  ? "xp-dp-tab xp-dp-tab--active"
                  : "xp-dp-tab"
              }
              onClick={() => setTab(i)}
            >
              {name}
            </button>
          ))}
        </div>

        <div
          className="min-h-[280px] flex-1 overflow-auto bg-white p-3"
          style={previewChromeStyle}
        >
          {tab === 0 && (
            <div className="space-y-3 text-[11px] text-black">
              <p className="m-0 leading-snug">
                A theme is a background plus a set of sounds, icons, and other
                elements to help you personalize your computer with one click.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="xp-dp-theme" className="shrink-0 font-bold">
                  Theme:
                </label>
                <select
                  id="xp-dp-theme"
                  className="xp-dp-select min-w-[200px] flex-1 border border-[#7f9db9] bg-white py-0.5 pl-1 text-[11px]"
                  value={localWp}
                  onChange={(e) => setLocalWp(Number(e.target.value))}
                >
                  {CP_WALLPAPERS.map((w, i) => (
                    <option key={w.name} value={i}>
                      {i === 0 ? "Windows XP" : w.name}
                    </option>
                  ))}
                </select>
                <button type="button" className="xp-dp-mini-btn">
                  Save As...
                </button>
                <button
                  type="button"
                  className="xp-dp-mini-btn"
                  disabled
                  title="Delete current theme"
                >
                  Delete
                </button>
              </div>
              <div>
                <p className="mb-1 font-bold">Sample:</p>
                <div
                  className="xp-dp-sample relative h-[120px] overflow-hidden rounded border border-[#aca899] bg-[#4980c6]"
                  style={sampleBg}
                >
                  <div className="xp-dp-sample-win absolute left-2 top-2 w-[55%] overflow-hidden border border-[#aca899] bg-[#ece9d8] shadow-sm">
                    <div
                      className="flex items-center gap-1 px-1 py-0.5 text-[9px] font-bold text-white"
                      style={sampleTitleBarStyle}
                    >
                      <span className="truncate">Active Window</span>
                    </div>
                    <div className="border-t border-[#fff] bg-white p-1 text-[9px] text-black">
                      Window Text
                    </div>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={XP_ICONS.recycleBin}
                    alt=""
                    width={14}
                    height={14}
                    className="absolute bottom-1 right-1 opacity-90 drop-shadow"
                  />
                </div>
              </div>
            </div>
          )}

          {tab === 1 && (
            <div className="space-y-2">
              <p className="m-0 text-[11px] text-black">
                Select a background for your desktop.
              </p>
              <p className="m-0 text-[10px] text-[#666]">
                Same wallpapers as Control Panel → Display.
              </p>
              <div className="xp-cp-wp-grid">
                {CP_WALLPAPERS.map((w, i) => (
                  <button
                    key={w.name}
                    type="button"
                    title={w.name}
                    className={`xp-cp-wp-swatch ${i === localWp ? "xp-cp-wp-swatch--on" : ""}`}
                    style={{ background: w.css }}
                    onClick={() => setLocalWp(i)}
                  >
                    <span className="sr-only">{w.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 2 && (
            <div className="space-y-2 text-[11px] text-black">
              <div className="flex items-center gap-2">
                <label className="font-bold">Screen saver:</label>
                <select className="xp-dp-select flex-1 border border-[#7f9db9] bg-white py-0.5" disabled>
                  <option>(None)</option>
                </select>
              </div>
              <p className="m-0 text-[#666]">
                Screen savers are not simulated in this browser portfolio.
              </p>
            </div>
          )}

          {tab === 3 && (
            <div className="space-y-2">
              <p className="m-0 text-[11px] text-black">
                Select a color scheme for windows and buttons.
              </p>
              <p className="m-0 text-[10px] text-[#666]">
                Same palette as Control Panel → Display → Appearance. Click{" "}
                <strong>OK</strong> or <strong>Apply</strong> to use it on the desktop.
              </p>
              <div className="xp-cp-accent-row">
                {CP_ACCENT_COLORS.map((c, i) => (
                  <button
                    key={c}
                    type="button"
                    className={`xp-cp-ac-swatch ${i === localAccent ? "xp-cp-ac-swatch--on" : ""}`}
                    style={{ background: c }}
                    onClick={() => setLocalAccent(i)}
                    aria-label={`Accent color ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          {tab === 4 && (
            <div className="text-[11px] text-black">
              <p className="m-0 mb-2 font-bold">Screen resolution</p>
              <p className="m-0 whitespace-pre-line text-[#333]">
                {typeof window !== "undefined"
                  ? `Screen: ${window.screen.width} × ${window.screen.height} pixels\nBrowser viewport: ${window.innerWidth} × ${window.innerHeight} pixels`
                  : "—"}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#d4d0c8] bg-[#ece9d8] px-3 py-2">
          <button type="button" className="xp-dp-footer-btn" onClick={handleOk}>
            OK
          </button>
          <button type="button" className="xp-dp-footer-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="xp-dp-footer-btn"
            disabled={!dirty}
            onClick={handleApply}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
