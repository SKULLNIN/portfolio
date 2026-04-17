"use client";

/**
 * [js-dos v8](https://github.com/caiiiycuk/js-dos) — DOS player using `window.Dos` from the
 * official browser bundle. Assets live under `public/js-dos/` from `postinstall`.
 *
 * The npm `dist/js-dos.js` file is **not** a Turbopack-friendly ES module (`import()` yields an
 * empty namespace); we load `/js-dos/js-dos.js` with a `<script>` tag instead.
 *
 * @see https://js-dos.com/dos-api.html
 * @see https://js-dos.com/player-api.html (`pathPrefix`, `stop()`)
 */

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { DosFn, DosPlayer } from "js-dos/dist/js-dos.js";
import { installJsDosFriendlyShims } from "@/lib/js-dos-shims";

const JS_DOS_STYLESHEET_ID = "js-dos-stylesheet";
const JS_DOS_STYLESHEET_HREF = "/js-dos/js-dos.css";
const RUNTIME_SCRIPT_ID = "js-dos-runtime-script";
const RUNTIME_SCRIPT_SRC = "/js-dos/js-dos.js";

const DEFAULT_BUNDLE_URL = "/pinball/bundles/digger.jsdos";

export type JsDosPlayerProps = {
  /** `.jsdos` bundle URL (https allowed — e.g. v8.js-dos.com shareware packs). */
  bundleUrl?: string;
  /**
   * When true, enable js-dos pointer lock / relative mouse (needed for FPS like DOOM).
   * When omitted, inferred from URL (e.g. paths containing `doom`).
   */
  mouseCapture?: boolean;
};

function inferMouseCapture(bundleUrl: string): boolean {
  return /doom/i.test(bundleUrl);
}

function getWindowDos(): DosFn | undefined {
  if (typeof window === "undefined") return undefined;
  const D = (window as unknown as { Dos?: unknown }).Dos;
  return typeof D === "function" ? (D as DosFn) : undefined;
}

let dosRuntimePromise: Promise<DosFn> | null = null;

function loadDosRuntime(): Promise<DosFn> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("[JsDosPlayer] no window"));
  }
  installJsDosFriendlyShims();

  const ready = getWindowDos();
  if (ready) return Promise.resolve(ready);

  dosRuntimePromise ??= new Promise<DosFn>((resolve, reject) => {
    const fail = (e: Error) => {
      dosRuntimePromise = null;
      reject(e);
    };

    const resolveIfDos = () => {
      const D = getWindowDos();
      if (D) resolve(D);
      else fail(new Error("[JsDosPlayer] window.Dos missing after script load"));
    };

    const doc = window.document;
    let script = doc.getElementById(RUNTIME_SCRIPT_ID) as HTMLScriptElement | null;

    if (script) {
      const D = getWindowDos();
      if (D) {
        resolve(D);
        return;
      }
      script.addEventListener("load", resolveIfDos, { once: true });
      script.addEventListener(
        "error",
        () => fail(new Error(`[JsDosPlayer] failed to load ${RUNTIME_SCRIPT_SRC}`)),
        { once: true },
      );
      return;
    }

    script = doc.createElement("script");
    script.id = RUNTIME_SCRIPT_ID;
    script.async = true;
    script.src = RUNTIME_SCRIPT_SRC;
    script.addEventListener("load", resolveIfDos, { once: true });
    script.addEventListener(
      "error",
      () => fail(new Error(`[JsDosPlayer] failed to load ${RUNTIME_SCRIPT_SRC}`)),
      { once: true },
    );
    doc.head.appendChild(script);
  });

  return dosRuntimePromise;
}

export function JsDosPlayer({
  bundleUrl = DEFAULT_BUNDLE_URL,
  mouseCapture: mouseCaptureProp,
}: JsDosPlayerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dosPropsRef = useRef<DosPlayer | null>(null);
  const captureRelative =
    mouseCaptureProp !== undefined ? mouseCaptureProp : inferMouseCapture(bundleUrl);

  const nudgePointerCapture = useCallback(() => {
    if (!captureRelative) return;
    const p = dosPropsRef.current;
    try {
      p?.setMouseCapture?.(true);
    } catch {
      /* pointer lock may require a full user gesture in some browsers */
    }
  }, [captureRelative]);

  useLayoutEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(JS_DOS_STYLESHEET_ID)) return;
    const link = document.createElement("link");
    link.id = JS_DOS_STYLESHEET_ID;
    link.rel = "stylesheet";
    link.href = JS_DOS_STYLESHEET_HREF;
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    let cancelled = false;

    void (async () => {
      try {
        const Dos = await loadDosRuntime();
        if (cancelled) return;
        const player = await Dos(el, {
          url: bundleUrl,
          pathPrefix: "/js-dos/emulators/",
          theme: "light",
          noNetworking: true,
          autoStart: true,
          /** Main thread: Web Locks / orientation rejections in workers bypass window shims. */
          workerThread: false,
          mouseCapture: captureRelative,
          backend: "dosbox",
        });
        if (cancelled) {
          void Promise.resolve(player.stop()).catch(() => {});
          return;
        }
        dosPropsRef.current = player;
      } catch (e) {
        console.error("[JsDosPlayer] failed to load js-dos", e);
      }
    })();

    return () => {
      cancelled = true;
      const player = dosPropsRef.current;
      const host = rootRef.current;
      dosPropsRef.current = null;

      void (async () => {
        try {
          player?.setMouseCapture?.(false);
        } catch {
          /* ignore */
        }
        try {
          if (typeof document !== "undefined" && document.pointerLockElement) {
            document.exitPointerLock();
          }
        } catch {
          /* ignore */
        }
        try {
          if (
            typeof document !== "undefined" &&
            host &&
            document.fullscreenElement === host
          ) {
            await document.exitFullscreen();
          }
        } catch {
          /* ignore */
        }
        try {
          if (player) await Promise.resolve(player.stop());
        } catch {
          /* teardown races (Emscripten asyncify) */
        }
      })();
    };
  }, [bundleUrl, captureRelative]);

  return (
    <div
      ref={rootRef}
      className="jsdos-host flex min-h-0 min-w-0 flex-1 flex-col"
      style={{
        minHeight: 360,
        touchAction: captureRelative ? "none" : undefined,
      }}
      onPointerDownCapture={nudgePointerCapture}
    />
  );
}
