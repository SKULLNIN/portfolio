"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Must produce the same result on the server (Node) and client so /ie-go hydrates cleanly.
 * Do not branch on `typeof window` for absolute http(s) / mailto URLs.
 */
function resolveDestination(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (t.startsWith("mailto:")) return t;

  if (t.startsWith("/") && !t.startsWith("//")) {
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : serverOriginFallback();
    if (!base) return null;
    try {
      return new URL(t, base).href;
    } catch {
      return null;
    }
  }

  try {
    const u = new URL(t);
    if (u.protocol === "http:" || u.protocol === "https:") return u.href;
    return null;
  } catch {
    return null;
  }
}

function serverOriginFallback(): string | null {
  if (typeof process === "undefined") return null;
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  const v = process.env.VERCEL_URL;
  if (v) return v.startsWith("http") ? v : `https://${v}`;
  return null;
}

function isTopLevelWindow(): boolean {
  try {
    return typeof window !== "undefined" && window.self === window.top;
  } catch {
    return false;
  }
}

function IeGoContent() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("u") ?? "";
  const dest = useMemo(() => {
    if (!raw.trim()) return null;
    return resolveDestination(raw);
  }, [raw]);

  /**
   * Full-page /ie-go: same-tab redirect (no popup).
   * Inside the IE iframe: Brave/Comet block `window.open` without a user gesture — show a real link.
   */
  useEffect(() => {
    if (!dest) return;
    if (!isTopLevelWindow()) return;
    const t = window.setTimeout(() => {
      window.location.replace(dest);
    }, 280);
    return () => clearTimeout(t);
  }, [dest]);

  if (!raw.trim() || !dest) {
    return (
      <div className="ie-go">
        <p className="ie-go-title">Cannot open this address</p>
        <p className="ie-go-muted">The link was missing or not allowed.</p>
      </div>
    );
  }

  return (
    <div className="ie-go">
      <div className="ie-go-ie-ico" aria-hidden />
      <p className="ie-go-title">Leaving the desktop…</p>
      <p className="ie-go-muted">
        Browsers such as Brave and Comet only allow a new tab when you use a link or button — not
        automatic redirects. Use the button below if a new tab did not open.
      </p>
      <a
        className="ie-go-open-primary"
        href={dest}
        target="_blank"
        rel="noopener noreferrer"
      >
        Open link in new tab
      </a>
      <p className="ie-go-muted ie-go-muted--spaced">
        Full-page visits to this URL redirect automatically in the same tab.
      </p>
      <div className="ie-go-bar">
        <div className="ie-go-bar-fill" />
      </div>
    </div>
  );
}

export default function IeGoPage() {
  return (
    <Suspense
      fallback={
        <div className="ie-go">
          <p className="ie-go-title">Loading redirect…</p>
        </div>
      }
    >
      <IeGoContent />
    </Suspense>
  );
}
