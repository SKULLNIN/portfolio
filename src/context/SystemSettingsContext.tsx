"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  CP_ACCENT_COLORS,
  CP_WALLPAPERS,
  wallpaperPreviewStyle,
} from "@/data/control-panel-content";
import { isMediaOutsideWebampHost } from "@/lib/media-scope";

const LS = {
  wp: "xp-portfolio-wallpaper",
  accent: "xp-portfolio-accent",
  vol: "xp-portfolio-volume",
} as const;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function readStoredInt(key: string, def: number, max: number) {
  if (typeof window === "undefined") return def;
  const s = localStorage.getItem(key);
  const n = parseInt(s ?? "", 10);
  if (!Number.isFinite(n) || n < 0 || n > max) return def;
  return n;
}

type SystemSettingsValue = {
  wallpaperIndex: number;
  setWallpaperIndex: (n: number) => void;
  accentIndex: number;
  setAccentIndex: (n: number) => void;
  /** 0–100 — master volume for all audio and video elements */
  volume: number;
  setVolume: (n: number) => void;
  desktopBackgroundStyle: CSSProperties;
};

const SystemSettingsContext = createContext<SystemSettingsValue | null>(null);

function applyAccentCss(hex: string) {
  const root = document.documentElement;
  root.style.setProperty("--xp-accent", hex);
  root.style.setProperty("--xp-active-title", hex);
  root.style.setProperty("--xp-window-border-active", hex);
}

function applyVolumeToMedia(fraction: number) {
  const v = clamp(fraction, 0, 1);
  document.querySelectorAll("audio, video").forEach((el) => {
    if (!isMediaOutsideWebampHost(el)) return;
    try {
      (el as HTMLMediaElement).volume = v;
    } catch {
      /* ignore */
    }
  });
}

export function SystemSettingsProvider({ children }: { children: ReactNode }) {
  const [wallpaperIndex, setWp] = useState(0);
  const [accentIndex, setAc] = useState(0);
  const [volume, setVol] = useState(70);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setWp(readStoredInt(LS.wp, 0, CP_WALLPAPERS.length - 1));
    setAc(readStoredInt(LS.accent, 0, CP_ACCENT_COLORS.length - 1));
    setVol(readStoredInt(LS.vol, 70, 100));
    setReady(true);
  }, []);

  const setWallpaperIndex = useCallback((n: number) => {
    const x = clamp(n, 0, CP_WALLPAPERS.length - 1);
    setWp(x);
    localStorage.setItem(LS.wp, String(x));
  }, []);

  const setAccentIndex = useCallback((n: number) => {
    const x = clamp(n, 0, CP_ACCENT_COLORS.length - 1);
    setAc(x);
    localStorage.setItem(LS.accent, String(x));
  }, []);

  const setVolume = useCallback((n: number) => {
    const x = clamp(Math.round(n), 0, 100);
    setVol(x);
    localStorage.setItem(LS.vol, String(x));
  }, []);

  useEffect(() => {
    const hex = CP_ACCENT_COLORS[accentIndex] ?? CP_ACCENT_COLORS[0];
    applyAccentCss(hex);
  }, [accentIndex]);

  useEffect(() => {
    if (!ready) return;
    applyVolumeToMedia(volume / 100);
  }, [volume, ready]);

  useEffect(() => {
    if (!ready) return;
    const obs = new MutationObserver(() => {
      applyVolumeToMedia(volume / 100);
    });
    obs.observe(document.body, { childList: true, subtree: true });
    applyVolumeToMedia(volume / 100);
    return () => obs.disconnect();
  }, [volume, ready]);

  const desktopBackgroundStyle = useMemo((): CSSProperties => {
    const w = CP_WALLPAPERS[wallpaperIndex] ?? CP_WALLPAPERS[0];
    return {
      backgroundColor: "#4980c6",
      ...wallpaperPreviewStyle(w),
      backgroundRepeat: "no-repeat",
    };
  }, [wallpaperIndex]);

  const value = useMemo<SystemSettingsValue>(
    () => ({
      wallpaperIndex,
      setWallpaperIndex,
      accentIndex,
      setAccentIndex,
      volume,
      setVolume,
      desktopBackgroundStyle,
    }),
    [
      wallpaperIndex,
      setWallpaperIndex,
      accentIndex,
      setAccentIndex,
      volume,
      setVolume,
      desktopBackgroundStyle,
    ]
  );

  return (
    <SystemSettingsContext.Provider value={value}>
      {children}
    </SystemSettingsContext.Provider>
  );
}

export function useSystemSettings() {
  const ctx = useContext(SystemSettingsContext);
  if (!ctx) {
    throw new Error("useSystemSettings must be used within SystemSettingsProvider");
  }
  return ctx;
}
