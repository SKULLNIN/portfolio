"use client";

/**
 * 3D Pinball for Windows — Space Cadet (SpaceCadetPinball WASM port, `public/pinball/`).
 *
 * Rendered outside {@link WindowShell} (same pattern as Winamp): a draggable floating
 * window on the desktop with authentic Windows XP Luna chrome — so it matches the real
 * "3D Pinball for Windows" title bar rather than a generic box around the canvas.
 *
 * Why not WindowShell: the WASM engine binds to a single long-lived <canvas> by id, and
 * Emscripten modules can't be cleanly re-instantiated once loaded, so we keep the host
 * canvas mounted for the page's lifetime and just show/hide the Rnd.
 *
 * Audio teardown: Emscripten SDL creates an {@link AudioContext} that keeps playing after
 * the React wrapper unmounts. We patch `window.AudioContext` once and capture any contexts
 * created during Pinball's engine init, so we can {@link AudioContext.suspend}/`resume`
 * them when the window is closed / minimized / restored. We also toggle the Emscripten
 * main loop so the game stops burning CPU while hidden.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Rnd } from "react-rnd";
import { useWindowManager } from "@/context/WindowContext";
import { XP_ICONS } from "@/lib/xp-icons";

/** Canvas size = real 3D Pinball table; window height = title bar + canvas. */
const GAME_WIDTH = 600;
const GAME_HEIGHT = 440;
const TITLEBAR_HEIGHT = 40;

type Props = {
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  isActive: boolean;
};

type EmscriptenStatic = {
  canvas: HTMLCanvasElement | null;
  locateFile: (filename: string) => string;
  onRuntimeInitialized: () => void;
  setStatus: (text: string) => void;
  printErr: (text: string) => void;
  print: (text: string) => void;
  pauseMainLoop?: () => void;
  resumeMainLoop?: () => void;
};

/** Module-scoped so the AudioContext capture persists across React re-renders. */
const capturedAudioCtxs: AudioContext[] = [];
let audioCtxPatched = false;

/**
 * Install a one-time `AudioContext` wrapper that records new instances into
 * {@link capturedAudioCtxs} *only* while `window.__pinballCaptureAudio` is true — so we
 * don't accidentally capture Webamp's audio contexts. Safe to call repeatedly.
 */
function ensurePinballAudioCapture(): void {
  if (typeof window === "undefined" || audioCtxPatched) return;

  type ACCtor = {
    new (contextOptions?: AudioContextOptions): AudioContext;
    prototype: AudioContext;
  };

  const w = window as unknown as {
    AudioContext?: ACCtor;
    webkitAudioContext?: ACCtor;
    __pinballCaptureAudio?: boolean;
  };

  const Orig = w.AudioContext ?? w.webkitAudioContext;
  if (!Orig) return;

  const Wrapped = function (
    this: unknown,
    opts?: AudioContextOptions,
  ): AudioContext {
    const inst = new Orig(opts);
    if (w.__pinballCaptureAudio) capturedAudioCtxs.push(inst);
    return inst;
  } as unknown as ACCtor;

  Wrapped.prototype = Orig.prototype;

  w.AudioContext = Wrapped;
  if (w.webkitAudioContext) w.webkitAudioContext = Wrapped;
  audioCtxPatched = true;
}

function suspendPinball(): void {
  if (typeof window === "undefined") return;
  for (const ctx of capturedAudioCtxs) {
    if (ctx.state === "running") {
      ctx.suspend().catch(() => {
        /* context may already be closing */
      });
    }
  }
  const mod = (window as unknown as { Module?: EmscriptenStatic }).Module;
  try {
    mod?.pauseMainLoop?.();
  } catch {
    /* ignore */
  }
}

function resumePinball(): void {
  if (typeof window === "undefined") return;
  for (const ctx of capturedAudioCtxs) {
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {
        /* ignore — requires user gesture on some browsers */
      });
    }
  }
  const mod = (window as unknown as { Module?: EmscriptenStatic }).Module;
  try {
    mod?.resumeMainLoop?.();
  } catch {
    /* ignore */
  }
}

export function Pinball({ isOpen, isMinimized, zIndex, isActive }: Props) {
  const { closeApp, minimizeApp, focusApp } = useWindowManager();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scriptInjected = useRef(false);
  const [loadingText, setLoadingText] = useState("Loading game engine…");
  const [showOverlay, setShowOverlay] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (scriptInjected.current) {
      if (!isMinimized) resumePinball();
      return;
    }
    scriptInjected.current = true;

    ensurePinballAudioCapture();
    const w = window as unknown as {
      __pinballCaptureAudio?: boolean;
      Module?: EmscriptenStatic;
    };
    w.__pinballCaptureAudio = true;

    const mod: EmscriptenStatic = {
      canvas: canvasRef.current,
      /**
       * Emscripten asks for `SpaceCadetPinball.wasm` and `SpaceCadetPinball.data`
       * (preloaded assets bundle) — both live next to each other under `/public/pinball/`.
       */
      locateFile(filename) {
        return "/pinball/" + filename;
      },
      onRuntimeInitialized() {
        setLoadingText("Starting game…");
        setTimeout(() => setShowOverlay(false), 600);
      },
      setStatus(text) {
        if (text) setLoadingText(text);
      },
      printErr(text) {
        console.warn("[SpaceCadet]", text);
      },
      print(text) {
        console.log("[SpaceCadet]", text);
      },
    };
    w.Module = mod;

    const script = document.createElement("script");
    script.src = "/pinball/SpaceCadetPinball.js";
    script.onerror = () => {
      setError("Failed to load engine script.");
      setShowOverlay(false);
    };
    document.body.appendChild(script);

    /** SDL audio is created shortly after runtime init. Keep the capture window open
     *  for a bit, then close it so unrelated AudioContexts (Webamp, etc.) aren't caught. */
    const stopCaptureTimer = window.setTimeout(() => {
      w.__pinballCaptureAudio = false;
    }, 10_000);
    return () => window.clearTimeout(stopCaptureTimer);
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (!scriptInjected.current) return;
    if (!isOpen || isMinimized) {
      suspendPinball();
    } else {
      resumePinball();
    }
  }, [isOpen, isMinimized]);

  const defaultPos = useMemo(() => {
    if (typeof window === "undefined") return { x: 120, y: 80 };
    return {
      x: Math.max(16, Math.round(window.innerWidth / 2 - GAME_WIDTH / 2)),
      y: Math.max(
        16,
        Math.round(
          window.innerHeight / 2 - (GAME_HEIGHT + TITLEBAR_HEIGHT) / 2 - 20,
        ),
      ),
    };
  }, []);

  const onFocus = useCallback(() => focusApp("pinball"), [focusApp]);

  if (!isOpen) return null;

  const titleBarClass = `xp-luna-titlebar ${
    isActive ? "xp-luna-titlebar--active" : "xp-luna-titlebar--inactive"
  }`;
  const windowClass = `xp-luna-window ${isActive ? "xp-luna-window--active" : ""}`;

  const rootStyle: CSSProperties = {
    zIndex,
    display: isMinimized ? "none" : "block",
  };

  return (
    <Rnd
      className="pointer-events-auto"
      default={{
        x: defaultPos.x,
        y: defaultPos.y,
        width: GAME_WIDTH,
        height: GAME_HEIGHT + TITLEBAR_HEIGHT,
      }}
      size={{ width: GAME_WIDTH, height: GAME_HEIGHT + TITLEBAR_HEIGHT }}
      minWidth={GAME_WIDTH}
      minHeight={GAME_HEIGHT + TITLEBAR_HEIGHT}
      maxWidth={GAME_WIDTH}
      maxHeight={GAME_HEIGHT + TITLEBAR_HEIGHT}
      enableResizing={false}
      bounds="parent"
      dragHandleClassName="xp-luna-titlebar"
      cancel=".xp-luna-controls, .xp-luna-controls button"
      onMouseDown={onFocus}
      style={rootStyle}
    >
      <div className={`${windowClass} h-full w-full`}>
        <div className={titleBarClass} onMouseDown={onFocus}>
          <div className="xp-luna-label">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={XP_ICONS.pinball} alt="" width={20} height={20} />
            <span>3D Pinball for Windows - Space Cadet</span>
          </div>
          <div className="xp-luna-controls">
            <button
              type="button"
              className="xp-luna-btn xp-luna-btn--minimize"
              aria-label="Minimize"
              onClick={(e) => {
                e.stopPropagation();
                minimizeApp("pinball");
              }}
            />
            <button
              type="button"
              className="xp-luna-btn xp-luna-btn--close"
              aria-label="Close"
              onClick={(e) => {
                e.stopPropagation();
                closeApp("pinball");
              }}
            />
          </div>
        </div>

        <div
          style={{
            position: "relative",
            width: GAME_WIDTH,
            height: GAME_HEIGHT,
            background: "#000",
          }}
        >
          <canvas
            ref={canvasRef}
            id="canvas"
            onContextMenu={(e) => e.preventDefault()}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            style={{
              display: "block",
              width: GAME_WIDTH,
              height: GAME_HEIGHT,
              background: "#000",
              cursor: "pointer",
            }}
          />

          {showOverlay && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0, 0, 0, 0.9)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#ddd",
                font: "12px Tahoma, sans-serif",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: "3px solid #333",
                  borderTopColor: "#6cbfff",
                  borderRadius: "50%",
                  animation: "xp-pinball-spin 0.8s linear infinite",
                }}
              />
              <div>{loadingText}</div>
              <style>{`@keyframes xp-pinball-spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {error && (
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                right: 12,
                padding: "6px 10px",
                background: "#b00",
                color: "#fff",
                font: "11px Tahoma, sans-serif",
                border: "1px solid #600",
              }}
            >
              Pinball error: {error}
            </div>
          )}
        </div>
      </div>
    </Rnd>
  );
}
