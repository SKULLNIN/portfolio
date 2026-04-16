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
import { useSystemSettings } from "@/context/SystemSettingsContext";
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
/** Contexts created while Pinball capture is on — used for routing + master gain. */
const pinballAudioContexts = new Set<BaseAudioContext>();
let audioCtxPatched = false;
let connectPatched = false;

/** Master gain per context (Web Audio has no HTMLMediaElement.volume). */
const pinballMasterGainByContext = new WeakMap<BaseAudioContext, GainNode>();
/** Gain nodes we inserted so their own `.connect(destination)` is not re-routed. */
const pinballMasterGainNodes = new WeakSet<GainNode>();

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/** Current master level for Pinball (0–1); updated from system volume + tray mute. */
let pinballMasterLevel = 1;
/** When true, every Pinball context is pinned to gain 0 regardless of system volume. */
let pinballForceSilent = false;

/** Effective gain = 0 if closed/minimized, else master level; use `cancelAndHoldAtTime`-like update. */
function applyPinballMasterGains() {
  const v = pinballForceSilent ? 0 : clamp01(pinballMasterLevel);
  for (const ctx of capturedAudioCtxs) {
    if (ctx.state === "closed") continue;
    const g = pinballMasterGainByContext.get(ctx);
    if (!g) continue;
    try {
      g.gain.cancelScheduledValues(ctx.currentTime);
    } catch {
      /* not all implementations expose this — fall back to setter */
    }
    g.gain.value = v;
  }
}

/**
 * Route `audioNode.connect(context.destination)` through a per-context GainNode so the
 * tray / Control Panel master volume applies to Pinball (SDL/Web Audio), not only
 * media elements.
 */
function ensurePinballDestinationGainPatch(): void {
  if (typeof window === "undefined" || connectPatched || typeof AudioNode === "undefined")
    return;
  connectPatched = true;

  const origConnect = AudioNode.prototype.connect;

  function ensureMasterGain(ctx: BaseAudioContext): GainNode {
    let g = pinballMasterGainByContext.get(ctx);
    if (!g && ctx.state !== "closed") {
      g = ctx.createGain();
      /** Starts silent if Pinball is currently closed — prevents blips from late-created nodes. */
      g.gain.value = pinballForceSilent ? 0 : clamp01(pinballMasterLevel);
      pinballMasterGainByContext.set(ctx, g);
      pinballMasterGainNodes.add(g);
      g.connect(ctx.destination);
    }
    return g as GainNode;
  }

  /** Forward all `connect` overloads; route table mix to master gain (Pinball Web Audio). */
  type ConnectLike = (...args: unknown[]) => unknown;
  const forward = origConnect as unknown as ConnectLike;
  (AudioNode.prototype as { connect: ConnectLike }).connect = function (
    this: AudioNode,
    ...args: unknown[]
  ): unknown {
    const destination = args[0];
    if (
      destination instanceof AudioNode &&
      destination === this.context.destination &&
      pinballAudioContexts.has(this.context) &&
      !pinballMasterGainNodes.has(this as GainNode)
    ) {
      const gain = ensureMasterGain(this.context);
      return forward.apply(this, [gain, ...args.slice(1)]);
    }
    return forward.apply(this, args);
  };
}

/**
 * Install a one-time `AudioContext` wrapper that records new instances into
 * {@link capturedAudioCtxs} *only* while `window.__pinballCaptureAudio` is true — so we
 * don't accidentally capture Webamp's audio contexts. Safe to call repeatedly.
 */
function ensurePinballAudioCapture(): void {
  if (typeof window === "undefined" || audioCtxPatched) return;

  ensurePinballDestinationGainPatch();

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
    if (w.__pinballCaptureAudio) {
      capturedAudioCtxs.push(inst);
      pinballAudioContexts.add(inst);
    }
    return inst;
  } as unknown as ACCtor;

  Wrapped.prototype = Orig.prototype;

  w.AudioContext = Wrapped;
  if (w.webkitAudioContext) w.webkitAudioContext = Wrapped;
  audioCtxPatched = true;
}

/**
 * Close / minimize / in-game "cancel": silence immediately (master gain = 0, synchronous),
 * then try to `suspend()` each AudioContext and pause the Emscripten main loop. The gain is
 * the important part — `suspend()` is async and some browsers ignore it for short windows.
 */
function suspendPinball(): void {
  if (typeof window === "undefined") return;
  pinballForceSilent = true;
  applyPinballMasterGains();
  /** Suspend every captured context — `running` check alone misses edge states in some browsers. */
  for (const ctx of capturedAudioCtxs) {
    void ctx.suspend().catch(() => {
      /* context may already be closing */
    });
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
  pinballForceSilent = false;
  applyPinballMasterGains();
  for (const ctx of capturedAudioCtxs) {
    if (ctx.state !== "running") {
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
  const { volume } = useSystemSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scriptInjected = useRef(false);
  /** Tray speaker mute (same event Webamp uses) — master volume slider still updates `volume`. */
  const trayMutedRef = useRef(false);
  const [loadingText, setLoadingText] = useState("Loading game engine…");
  const [showOverlay, setShowOverlay] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncPinballMasterFromSystem = useCallback(() => {
    pinballMasterLevel = trayMutedRef.current ? 0 : clamp01(volume / 100);
    applyPinballMasterGains();
  }, [volume]);

  useEffect(() => {
    syncPinballMasterFromSystem();
  }, [syncPinballMasterFromSystem]);

  useEffect(() => {
    const onTrayMute = (ev: Event) => {
      const detail = (ev as CustomEvent<{ muted: boolean }>).detail;
      if (!detail) return;
      trayMutedRef.current = detail.muted;
      syncPinballMasterFromSystem();
    };
    window.addEventListener("xp-mute-change", onTrayMute);
    return () => window.removeEventListener("xp-mute-change", onTrayMute);
  }, [syncPinballMasterFromSystem]);

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

    let captureOffTimer: number | undefined;

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
        /** SDL may create AudioContexts after load; stop capturing so Webamp isn't pulled in. */
        captureOffTimer = window.setTimeout(() => {
          w.__pinballCaptureAudio = false;
        }, 90_000);
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

    return () => {
      if (captureOffTimer !== undefined) window.clearTimeout(captureOffTimer);
    };
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (!scriptInjected.current) return;
    if (!isOpen || isMinimized) {
      suspendPinball();
    } else {
      resumePinball();
    }
    return () => {
      suspendPinball();
    };
  }, [isOpen, isMinimized]);

  /** Tab hidden: stop audio/CPU; visible again: rebind canvas (some engines lose WebGL after hide). */
  useEffect(() => {
    const onVis = () => {
      if (!scriptInjected.current) return;
      if (document.hidden) {
        suspendPinball();
        return;
      }
      if (isOpen && !isMinimized) resumePinball();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [isOpen, isMinimized]);

  /** When the window is shown again, point Emscripten at the live canvas and nudge a redraw. */
  useEffect(() => {
    if (!isOpen || isMinimized) return;
    if (!scriptInjected.current) return;
    const w = window as unknown as { Module?: EmscriptenStatic };
    const canvas = canvasRef.current;
    const mod = w.Module;
    if (mod && canvas) mod.canvas = canvas;
    const t = window.setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 0);
    return () => window.clearTimeout(t);
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

  /** After the engine script is queued, keep the same canvas mounted so Emscripten's
   *  Module.canvas stays valid; hiding beats unmount (reopen was a blank framebuffer). */
  if (!isOpen && !scriptInjected.current) return null;

  const visiblyOpen = isOpen && !isMinimized;

  const titleBarClass = `xp-luna-titlebar ${
    isActive ? "xp-luna-titlebar--active" : "xp-luna-titlebar--inactive"
  }`;
  const windowClass = `xp-luna-window ${isActive ? "xp-luna-window--active" : ""}`;

  /** Avoid `display:none` — Chromium/Edge often tear down WebGL/canvas backing when hidden that way (blank + audio only). */
  const rootStyle: CSSProperties = {
    zIndex,
    ...(visiblyOpen
      ? { visibility: "visible", opacity: 1, pointerEvents: "auto" }
      : {
          visibility: "hidden",
          opacity: 0,
          pointerEvents: "none",
        }),
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
      enableUserSelectHack={false}
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
                /** Silence + pause before React re-renders — no audio gap while state updates. */
                suspendPinball();
                minimizeApp("pinball");
              }}
            />
            <button
              type="button"
              className="xp-luna-btn xp-luna-btn--close"
              aria-label="Close"
              onClick={(e) => {
                e.stopPropagation();
                suspendPinball();
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
