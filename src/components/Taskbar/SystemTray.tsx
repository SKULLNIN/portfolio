"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { TaskbarClock } from "@/components/Taskbar/TaskbarClock";
import { BtcTicker } from "@/components/Taskbar/BtcTicker";
import { useSystemSettings } from "@/context/SystemSettingsContext";
import { TASKBAR_TRAY_POPOVER_Z_INDEX } from "@/lib/constants";
import { isMediaOutsideWebampHost } from "@/lib/media-scope";

/*
 * Windows XP system tray — crypto ticker, volume, clock.
 */

function applyMuteToMediaElements(muted: boolean) {
  document.querySelectorAll("audio, video").forEach((el) => {
    if (!isMediaOutsideWebampHost(el)) return;
    try {
      (el as HTMLMediaElement).muted = muted;
    } catch {
      /* ignore */
    }
  });
  // Webamp uses its own <audio> + gain graph — tray mute must go through its API too
  window.dispatchEvent(new CustomEvent("xp-mute-change", { detail: { muted } }));
}

/** Simple XP-style volume popup — synced to {@link SystemSettingsContext} (same as Media Player). */
function VolumeTray() {
  const { volume, setVolume } = useSystemSettings();
  const [muted, setMuted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(
    null
  );
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    applyMuteToMediaElements(muted);
    const obs = new MutationObserver(() => applyMuteToMediaElements(muted));
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [muted]);

  /** Defer attaching outside-close so the same pointer sequence that opened the menu does not immediately close it. */
  useEffect(() => {
    if (!showPopup) return;
    let detach: (() => void) | undefined;
    const t = window.setTimeout(() => {
      const close = (e: Event) => {
        const node = e.target;
        if (!(node instanceof Node)) return;
        if (popRef.current?.contains(node)) return;
        if (btnRef.current?.contains(node)) return;
        setShowPopup(false);
      };
      document.addEventListener("mousedown", close);
      document.addEventListener("touchstart", close, { passive: true });
      detach = () => {
        document.removeEventListener("mousedown", close);
        document.removeEventListener("touchstart", close);
      };
    }, 0);
    return () => {
      window.clearTimeout(t);
      detach?.();
    };
  }, [showPopup]);

  useLayoutEffect(() => {
    if (!showPopup || typeof window === "undefined") {
      setPopupPos(null);
      return;
    }
    const place = () => {
      const btn = btnRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const gap = 6;
      const estH = 138;
      setPopupPos({
        top: Math.max(8, r.top - estH - gap),
        left: Math.min(
          window.innerWidth - 78,
          Math.max(8, r.right - 70)
        ),
      });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [showPopup]);

  const syncVolumeFromInput = useCallback(
    (el: HTMLInputElement) => {
      const v = Number(el.value);
      if (!Number.isFinite(v)) return;
      setVolume(v);
      if (muted) setMuted(false);
    },
    [muted, setVolume]
  );

  const popupEl =
    showPopup && popupPos && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={popRef}
            className="xp-vol-popup xp-vol-popup--portal"
            style={{
              position: "fixed",
              top: popupPos.top,
              left: popupPos.left,
              zIndex: TASKBAR_TRAY_POPOVER_Z_INDEX,
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Volume"
          >
            <div className="xp-vol-popup-title">Volume</div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={volume}
              onChange={(e) => syncVolumeFromInput(e.currentTarget)}
              onInput={(e) => syncVolumeFromInput(e.currentTarget)}
              className={`xp-vol-slider ${muted ? "xp-vol-slider--muted" : ""}`}
              aria-label="Volume"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={volume}
            />
            <div className="xp-vol-mute-selectbox" role="group" aria-label="Mute">
              <label
                className={`xp-vol-mute-label ${muted ? "xp-vol-mute-label--selected" : ""}`}
              >
                <input
                  type="checkbox"
                  className="xp-vol-mute-checkbox"
                  checked={muted}
                  onChange={(e) => setMuted(e.target.checked)}
                />
                <span className="xp-vol-mute-text">Mute</span>
              </label>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        className="xp-tray-ico"
        title={muted ? "Volume: Muted" : "Volume"}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          setShowPopup((v) => !v);
        }}
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M8 2L4 6H1v4h3l4 4V2z"
            fill={muted ? "#888" : "#fff"}
            stroke={muted ? "#666" : "#ccc"}
            strokeWidth="0.5"
          />
          {!muted && (
            <>
              <path
                d="M10.5 5.5c.8.8 1.2 1.8 1.2 2.5s-.4 1.7-1.2 2.5"
                stroke="#fff"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M12.5 3.5c1.3 1.3 2 3 2 4.5s-.7 3.2-2 4.5"
                stroke="#ccc"
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
                opacity="0.5"
              />
            </>
          )}
          {muted && (
            <path
              d="M11 5l4 6M15 5l-4 6"
              stroke="#ff3333"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>
      {popupEl}
    </div>
  );
}

/** Right side of taskbar: crypto ticker + tray icons + clock (Windows XP style). */
export function SystemTray() {
  return (
    <div className="xp-tray flex items-stretch">
      <BtcTicker />
      <div className="xp-tray-notif-area">
        <VolumeTray />
      </div>
      <TaskbarClock />
    </div>
  );
}
