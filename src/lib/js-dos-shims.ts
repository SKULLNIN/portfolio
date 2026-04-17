/**
 * js-dos / emulators sometimes call browser lock APIs outside states browsers allow
 * (e.g. orientation lock without fullscreen, Web Locks while the document is inactive).
 * Those surface as `InvalidStateError: lock() request could not be registered` and can
 * become **unhandled promise rejections** (Emscripten asyncify in emulators.js may not attach
 * `.catch()`). Normal DOS `exit(0)` is reported as **`ExitStatus`** (“Program terminated with
 * exit(0)”) — also benign. A `beforeInteractive` script in `layout.tsx` registers the silencer
 * early so Next/Turbopack dev logging can `preventDefault()`.
 */
export const LOCK_REJECTION_SILENCER_KEY = "__portfolioLockRejectionSilencer";
const SHIM_KEY = "__portfolioJsDosShims";

function flattenReason(e: unknown, depth = 0): string {
  if (depth > 8 || e == null) return "";
  if (typeof e === "string") return e;
  if (typeof e === "number" || typeof e === "boolean") return String(e);
  if (e instanceof Error) {
    const parts = [e.name, e.message, e.stack ?? ""];
    const cause = (e as Error & { cause?: unknown }).cause;
    if (cause !== undefined) parts.push(flattenReason(cause, depth + 1));
    return parts.join("\n");
  }
  if (typeof e === "object") {
    const o = e as Record<string, unknown>;
    const parts: string[] = [];
    if (typeof o.name === "string") parts.push(o.name);
    if (typeof o.message === "string") parts.push(o.message);
    if (typeof o.description === "string") parts.push(o.description);
    if (typeof o.stack === "string") parts.push(o.stack);
    if (typeof o.code === "number" || typeof o.code === "string") parts.push(String(o.code));
    if (typeof o.status === "number" || typeof o.status === "string") {
      parts.push(`status:${String(o.status)}`);
    }
    if (typeof o.toString === "function") {
      try {
        parts.push(String((o as { toString: () => string }).toString.call(e)));
      } catch {
        /* ignore */
      }
    }
    if (Array.isArray(o.errors)) {
      for (const er of o.errors) parts.push(flattenReason(er, depth + 1));
    }
    if ("cause" in o) parts.push(flattenReason(o.cause, depth + 1));
    return parts.join("\n");
  }
  try {
    return String(e);
  } catch {
    return "";
  }
}

function reasonText(e: unknown): string {
  return flattenReason(e);
}

function lockFailureMessage(e: unknown): { name: string; lower: string } {
  if (e == null) return { name: "", lower: "" };
  const name =
    typeof e === "object" && e && "name" in e
      ? String((e as { name?: string }).name ?? "")
      : "";
  return { name, lower: reasonText(e).toLowerCase() };
}

function isBenignLockFailure(e: unknown): boolean {
  const { name, lower } = lockFailureMessage(e);
  return (
    name === "InvalidStateError" ||
    name === "SecurityError" ||
    name === "NotAllowedError" ||
    lower.includes("could not be registered") ||
    lower.includes("only allowed when in fullscreen") ||
    lower.includes("wake lock") ||
    lower.includes("document is not fully active")
  );
}

/** Emscripten throws `ExitStatus` for normal DOS `exit(0)` — not an application error. */
function isBenignEmscriptenExit(e: unknown): boolean {
  if (e != null && typeof e === "object") {
    const o = e as Record<string, unknown>;
    if (o.name === "ExitStatus") {
      const st = o.status;
      if (st === 0 || st === "0") return true;
    }
  }
  const lower = flattenReason(e).toLowerCase();
  if (/program terminated with exit\s*\(\s*0\s*\)/i.test(lower)) return true;
  if (lower.includes("exitstatus") && lower.includes("exit(0)")) return true;
  return false;
}

/** `unhandledrejection` — flatten WASM / DOMException / AggregateError shapes. */
export function isBenignUnhandledLockRejection(e: unknown): boolean {
  if (isBenignEmscriptenExit(e)) return true;
  const lower = flattenReason(e).toLowerCase();
  const { name } = lockFailureMessage(e);
  if (lower.includes("could not be registered")) return true;
  if (lower.includes("only allowed when in fullscreen")) return true;
  if (lower.includes("lock() request")) return true;
  if (name === "InvalidStateError" && lower.includes("lock")) return true;
  if (name === "SecurityError" && lower.includes("orientation")) return true;
  if (
    lower.includes("emulators.js") &&
    (/invalidstateerror/.test(lower) || lower.includes("lock"))
  ) {
    return true;
  }
  return false;
}

/** Idempotent — register as early as possible (see `layout.tsx` + bottom-of-file). */
export function installUnhandledLockSilencer(): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as Record<string, boolean>;
  if (w[LOCK_REJECTION_SILENCER_KEY]) return;
  w[LOCK_REJECTION_SILENCER_KEY] = true;

  const rejectionHandler = (ev: PromiseRejectionEvent) => {
    if (isBenignUnhandledLockRejection(ev.reason)) {
      ev.preventDefault();
      ev.stopImmediatePropagation?.();
    }
  };
  window.addEventListener("unhandledrejection", rejectionHandler, true);
  window.addEventListener("unhandledrejection", rejectionHandler, false);

  const errorHandler = (ev: ErrorEvent) => {
    if (isBenignUnhandledLockRejection(ev.error)) {
      ev.preventDefault();
      ev.stopImmediatePropagation?.();
    }
  };
  window.addEventListener("error", errorHandler, true);
}

function patchLockManagerPrototype(): void {
  try {
    const locks = navigator.locks;
    if (!locks || typeof locks.request !== "function") return;
    const proto = Object.getPrototypeOf(locks) as { request?: unknown };
    if (!proto || typeof proto.request !== "function") return;
    const p = proto as {
      __portfolioPatched?: boolean;
      request: (...a: unknown[]) => Promise<unknown>;
    };
    if (p.__portfolioPatched) return;
    const orig = p.request.bind(locks);
    p.__portfolioPatched = true;
    p.request = function requestPatched(...args: unknown[]) {
      return orig(...args).catch((e: unknown) => {
        if (isBenignLockFailure(e)) return undefined;
        throw e;
      });
    };
  } catch {
    /* prototype may be sealed */
  }
}

/** Idempotent — safe to call before every `Dos()` mount. */
export function installJsDosFriendlyShims(): void {
  if (typeof window === "undefined") return;
  installUnhandledLockSilencer();

  const w = window as unknown as Record<string, boolean>;
  if (w[SHIM_KEY]) return;
  w[SHIM_KEY] = true;

  patchLockManagerPrototype();

  try {
    const locks = navigator.locks;
    if (locks && typeof locks.request === "function") {
      const orig = locks.request.bind(locks);
      Object.defineProperty(locks, "request", {
        configurable: true,
        value(name: string, ...rest: unknown[]) {
          const out = (orig as (n: string, ...r: unknown[]) => Promise<unknown>)(
            name,
            ...rest,
          );
          return out.catch((e: unknown) => {
            if (isBenignLockFailure(e)) return undefined;
            throw e;
          });
        },
      });
    }
  } catch {
    /* non-configurable in some environments */
  }

  try {
    const o = window.screen?.orientation;
    if (!o) return;
    const proto = Object.getPrototypeOf(o) as ScreenOrientation & {
      lock?: (orientation: string) => Promise<void>;
    };
    if (typeof proto.lock !== "function") return;
    const origLock = proto.lock.bind(proto);
    Object.defineProperty(proto, "lock", {
      configurable: true,
      value(orientation: string) {
        return origLock(orientation).catch((e: unknown) => {
          if (isBenignLockFailure(e)) return undefined;
          throw e;
        });
      },
    });
  } catch {
    /* ignore */
  }
}

if (typeof window !== "undefined") {
  installUnhandledLockSilencer();
}
