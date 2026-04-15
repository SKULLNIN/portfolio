"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  FULLSCREEN_CHIP_Z_INDEX,
  FULLSCREEN_PROMPT_Z_INDEX,
} from "@/lib/constants";
import {
  isDocumentFullscreen,
  requestAppFullscreen,
} from "@/lib/fullscreen";

/** Bump if users need the dialog again after clicking “Not now” in an older build. */
const SESSION_DISMISS_KEY = "xp-fullscreen-prompt-dismissed-v2";

type BootPhase = "boot" | "welcome" | "desktop";

type Props = {
  phase: BootPhase;
};

function listenFullscreenChange(sync: () => void) {
  document.addEventListener("fullscreenchange", sync);
  document.addEventListener("webkitfullscreenchange", sync as EventListener);
  document.addEventListener("mozfullscreenchange", sync as EventListener);
  document.addEventListener("MSFullscreenChange", sync as EventListener);
}

function unlistenFullscreenChange(sync: () => void) {
  document.removeEventListener("fullscreenchange", sync);
  document.removeEventListener("webkitfullscreenchange", sync as EventListener);
  document.removeEventListener("mozfullscreenchange", sync as EventListener);
  document.removeEventListener("MSFullscreenChange", sync as EventListener);
}

/**
 * Browsers do not allow automatic F11-style fullscreen on page load — it must follow a user gesture.
 * Guest login also calls {@link requestAppFullscreen}. This UI shows if fullscreen is still off,
 * plus a persistent chip so fullscreen is always one click away on the desktop.
 */
export function FullscreenPrompt({ phase }: Props) {
  const [mounted, setMounted] = useState(false);
  const [inFs, setInFs] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  /** Wait briefly after desktop so Guest-click fullscreen can apply before the modal. */
  const [delayOk, setDelayOk] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (sessionStorage.getItem(SESSION_DISMISS_KEY) === "1") {
        setDismissed(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (phase !== "desktop") {
      setDelayOk(false);
      return;
    }
    const t = window.setTimeout(() => setDelayOk(true), 400);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    const sync = () => setInFs(isDocumentFullscreen());
    sync();
    listenFullscreenChange(sync);
    return () => unlistenFullscreenChange(sync);
  }, []);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }, []);

  const onEnter = useCallback(() => {
    void requestAppFullscreen()
      .then(() => {
        setInFs(true);
        dismiss();
      })
      .catch(() => {});
  }, [dismiss]);

  const onChipClick = useCallback(() => {
    void requestAppFullscreen().catch(() => {});
  }, []);

  const showModal =
    mounted &&
    typeof document !== "undefined" &&
    phase === "desktop" &&
    delayOk &&
    !inFs &&
    !dismissed;

  const showChip =
    mounted &&
    typeof document !== "undefined" &&
    phase === "desktop" &&
    !inFs;

  return (
    <>
      {showModal
        ? createPortal(
            <div
              className="xp-shutdown-overlay"
              style={{ zIndex: FULLSCREEN_PROMPT_Z_INDEX }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="xp-fullscreen-prompt-title"
            >
              <div
                className="xp-shutdown-dialog"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="xp-shutdown-header">
                  <span id="xp-fullscreen-prompt-title" className="xp-shutdown-title">
                    Fullscreen
                  </span>
                </div>
                <div className="xp-shutdown-body">
                  <p className="xp-shutdown-question" style={{ marginBottom: 12 }}>
                    View this site in fullscreen (like F11) for the best experience. Browsers only
                    allow this after you click a button — it cannot start automatically when the page
                    loads.
                  </p>
                </div>
                <div
                  className="xp-shutdown-footer"
                  style={{ gap: 10, flexWrap: "wrap" }}
                >
                  <button
                    type="button"
                    className="xp-shutdown-cancel xp-fullscreen-prompt-enter"
                    onClick={onEnter}
                  >
                    Enter fullscreen
                  </button>
                  <button type="button" className="xp-shutdown-cancel" onClick={dismiss}>
                    Not now
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
      {showChip
        ? createPortal(
            <button
              type="button"
              className="xp-fullscreen-chip"
              style={{ zIndex: FULLSCREEN_CHIP_Z_INDEX }}
              onClick={onChipClick}
              title="Enter fullscreen (like F11)"
            >
              Full screen
            </button>,
            document.body
          )
        : null}
    </>
  );
}
