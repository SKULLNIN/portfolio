"use client";

/**
 * Winamp — mounts [Webamp](https://github.com/captbaritone/webamp) directly on the desktop.
 *
 * Unlike other apps, Webamp renders its own draggable Main / EQ / Playlist windows, so we
 * bypass {@link WindowShell} entirely (no XP chrome around the player) and let Webamp own
 * its floating UI. The host container sits absolutely over the desktop with
 * `pointer-events: none`, and Webamp's own DOM children re-enable pointer events so the
 * rest of the desktop still accepts clicks around the player.
 */

import { useEffect, useRef, useState } from "react";
import { useWindowManager } from "@/context/WindowContext";

const TRACKS = [
  { artist: "Laxmesh", title: "my", url: "/music/whatsapp-2026-04-15-082437.mpeg" },
  { artist: "Laxmesh", title: "life", url: "/music/whatsapp-2026-04-15-082432.mpeg" },
  { artist: "Laxmesh", title: "sucks", url: "/music/whatsapp-2026-04-15-082431.mpeg" },
  { artist: "Frank Sinatra", title: "Strangers in the Night", url: "/music/stranger-in-the-night.mpeg" },
];

/** Minimal subset of the Webamp runtime we use (see `webamp` package typings). */
type WebampInstance = {
  renderWhenReady: (node: HTMLElement) => Promise<void>;
  dispose: () => void;
  onClose: (cb: () => void) => void;
  onMinimize?: (cb: () => void) => void;
  setVolume: (volume: number) => void;
  store: { getState: () => { media: { volume: number } } };
};
type WebampCtor = new (options: unknown) => WebampInstance;

type Props = {
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
};

export function Winamp({ isOpen, isMinimized, zIndex }: Props) {
  const { closeApp, minimizeApp, focusApp } = useWindowManager();
  const hostRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<WebampInstance | null>(null);
  /** Volume % before system tray mute — restored on unmute. */
  const volumeBeforeTrayMuteRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** Tray mute must call {@link WebampInstance.setVolume} — we no longer toggle `.muted` on Webamp's `<audio>`. */
  useEffect(() => {
    const onTrayMute = (ev: Event) => {
      const inst = instanceRef.current;
      if (!inst) return;
      const detail = (ev as CustomEvent<{ muted: boolean }>).detail;
      if (!detail) return;
      if (detail.muted) {
        volumeBeforeTrayMuteRef.current = inst.store.getState().media.volume;
        inst.setVolume(0);
      } else {
        const prev = volumeBeforeTrayMuteRef.current;
        volumeBeforeTrayMuteRef.current = null;
        if (prev != null) inst.setVolume(prev);
      }
    };
    window.addEventListener("xp-mute-change", onTrayMute);
    return () => window.removeEventListener("xp-mute-change", onTrayMute);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;

    (async () => {
      try {
        const mod = await import("webamp");
        if (cancelled) return;
        const Webamp = (mod.default ?? mod) as unknown as WebampCtor & {
          browserIsSupported?: () => boolean;
        };
        if (Webamp.browserIsSupported && !Webamp.browserIsSupported()) {
          setError("This browser can't run Webamp.");
          return;
        }
        const absTrack = (u: string) =>
          typeof window !== "undefined" ? new URL(u, window.location.origin).href : u;
        const instance = new Webamp({
          initialTracks: TRACKS.map((t) => ({
            metaData: { artist: t.artist, title: t.title },
            url: absTrack(t.url),
          })),
        });
        if (cancelled) {
          instance.dispose();
          return;
        }
        instanceRef.current = instance;
        instance.onClose(() => closeApp("winamp"));
        instance.onMinimize?.(() => minimizeApp("winamp"));
        await instance.renderWhenReady(host);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    })();

    return () => {
      cancelled = true;
      try {
        instanceRef.current?.dispose();
      } catch {
        /* ignore */
      }
      instanceRef.current = null;
    };
  }, [isOpen, closeApp, minimizeApp]);

  if (!isOpen) return null;

  return (
    <div
      ref={hostRef}
      className="webamp-host"
      onMouseDown={() => focusApp("winamp")}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex,
        display: isMinimized ? "none" : "block",
      }}
    >
      {error && (
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            padding: "6px 10px",
            background: "#b00",
            color: "#fff",
            font: "11px Tahoma, sans-serif",
            pointerEvents: "auto",
          }}
        >
          Winamp error: {error}
        </div>
      )}
    </div>
  );
}
