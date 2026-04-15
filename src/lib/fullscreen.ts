/** True when the document is in fullscreen (vendor-prefixed where needed). */
export function isDocumentFullscreen(): boolean {
  if (typeof document === "undefined") return false;
  const d = document as Document & {
    webkitFullscreenElement?: Element | null;
    msFullscreenElement?: Element | null;
  };
  return Boolean(
    document.fullscreenElement ?? d.webkitFullscreenElement ?? d.msFullscreenElement
  );
}

/**
 * Enter browser fullscreen (F11-style). Must be called synchronously from a click/tap handler.
 *
 * **Chrome:** User activation is consumed by the first `requestFullscreen()` call. A pattern like
 * `body.requestFullscreen().catch(() => documentElement.requestFullscreen())` **fails** because the
 * fallback runs asynchronously after the gesture is gone. We only call **once** on
 * `document.documentElement`.
 */
export function requestAppFullscreen(): Promise<void> {
  if (typeof document === "undefined") {
    return Promise.reject(new Error("no document"));
  }

  if (typeof window !== "undefined" && window.top !== window.self) {
    return Promise.reject(
      new Error("fullscreen is blocked while the page is embedded in a frame")
    );
  }

  const el = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
  };

  if (typeof el.requestFullscreen === "function") {
    return Promise.resolve(
      el.requestFullscreen({ navigationUI: "hide" })
    ).then(() => undefined);
  }
  if (typeof el.webkitRequestFullscreen === "function") {
    return Promise.resolve(el.webkitRequestFullscreen()).then(() => undefined);
  }
  if (typeof el.msRequestFullscreen === "function") {
    return Promise.resolve(el.msRequestFullscreen()).then(() => undefined);
  }

  return Promise.reject(new Error("fullscreen not supported"));
}

export function exitAppFullscreen(): Promise<void> {
  if (typeof document === "undefined") {
    return Promise.reject(new Error("no document"));
  }
  const d = document as Document & {
    webkitExitFullscreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
  };
  const exit =
    document.exitFullscreen?.bind(document) ??
    d.webkitExitFullscreen?.bind(document) ??
    d.msExitFullscreen?.bind(document);
  if (!exit) {
    return Promise.reject(new Error("exit fullscreen not supported"));
  }
  return Promise.resolve(exit()).then(() => undefined);
}
