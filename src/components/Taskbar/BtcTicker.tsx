"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { CryptoPrices } from "@/types/crypto";

/** Poll interval — prices stay fixed until the next refresh (stable, no flicker). */
const POLL_MS = 60_000;

/** Scroll speed for marquee (px per second) */
const TICKER_PX_PER_SEC = 32;

function fmtUsd(n: number | null, fraction = 2) {
  if (n == null) return "—";
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction,
  })}`;
}

type TickerPhase = "boot" | "offline" | "live";

function getTickerPhase(data: CryptoPrices | null): TickerPhase {
  if (data == null) return "boot";
  const hasAny =
    data.btc != null || data.eth != null || data.sol != null;
  if (hasAny) return "live";
  return "offline";
}

function buildTickerLine(data: CryptoPrices | null, phase: TickerPhase): string {
  if (phase === "boot") return "Fetching live prices… · ";
  if (phase === "offline") {
    return "Prices unavailable — reconnecting… · ";
  }
  if (!data) return "Fetching live prices… · ";
  const parts: string[] = [];
  if (data.btc != null) parts.push(`BTC ${fmtUsd(data.btc, 2)}`);
  if (data.eth != null) parts.push(`ETH ${fmtUsd(data.eth, 2)}`);
  if (data.sol != null) parts.push(`SOL ${fmtUsd(data.sol, 2)}`);
  if (parts.length === 0) return "Prices unavailable — reconnecting… · ";
  return `${parts.join(" · ")} · `;
}

type Flash = "up" | "down" | null;

export function BtcTicker() {
  const [data, setData] = useState<CryptoPrices | null>(null);
  const [open, setOpen] = useState(false);
  const [marqueeSec, setMarqueeSec] = useState(24);
  const [flash, setFlash] = useState<{
    btc: Flash;
    eth: Flash;
    sol: Flash;
  }>({ btc: null, eth: null, sol: null });

  const popRef = useRef<HTMLDivElement>(null);
  const lineMeasureRef = useRef<HTMLSpanElement>(null);
  const prevDataRef = useRef<CryptoPrices | null>(null);
  const prevPhaseRef = useRef<TickerPhase>("boot");
  const flashClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [liveHighlight, setLiveHighlight] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/crypto?t=${Date.now()}`, { cache: "no-store" });
      const j = (await r.json()) as CryptoPrices;
      setData(j);
    } catch {
      setData({ btc: null, eth: null, sol: null, error: "err" });
    }
  }, []);

  useEffect(() => {
    if (data == null) return;
    const prev = prevDataRef.current;
    prevDataRef.current = data;
    if (!prev) return;

    const cmp = (
      a: number | null | undefined,
      b: number | null | undefined
    ): Flash => {
      if (a == null || b == null) return null;
      if (a > b) return "up";
      if (a < b) return "down";
      return null;
    };

    const next: { btc: Flash; eth: Flash; sol: Flash } = {
      btc: cmp(data.btc, prev.btc),
      eth: cmp(data.eth, prev.eth),
      sol: cmp(data.sol, prev.sol),
    };

    if (!next.btc && !next.eth && !next.sol) return;

    if (flashClearRef.current) clearTimeout(flashClearRef.current);
    setFlash(next);
    flashClearRef.current = setTimeout(() => {
      setFlash({ btc: null, eth: null, sol: null });
      flashClearRef.current = null;
    }, 900);
  }, [data]);

  useEffect(
    () => () => {
      if (flashClearRef.current) clearTimeout(flashClearRef.current);
    },
    []
  );

  const phase = getTickerPhase(data);

  useEffect(() => {
    const was = prevPhaseRef.current;
    prevPhaseRef.current = phase;
    if (was === "live" || phase !== "live") return undefined;
    let clearHighlight: number | undefined;
    const start = window.setTimeout(() => {
      setLiveHighlight(true);
      clearHighlight = window.setTimeout(() => {
        setLiveHighlight(false);
      }, 2200);
    }, 0);
    return () => {
      window.clearTimeout(start);
      if (clearHighlight) window.clearTimeout(clearHighlight);
    };
  }, [phase]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    const id = setInterval(() => void load(), POLL_MS);
    return () => {
      clearTimeout(t);
      clearInterval(id);
    };
  }, [load]);

  const line = buildTickerLine(data, phase);

  useLayoutEffect(() => {
    const el = lineMeasureRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    const sec = Math.max(14, w / TICKER_PX_PER_SEC);
    setMarqueeSec(sec);
  }, [line]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const rowClass = (sym: "btc" | "eth" | "sol") => {
    const f = flash[sym];
    if (f === "up") return "xp-crypto-flash-up";
    if (f === "down") return "xp-crypto-flash-down";
    return "";
  };

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        className="xp-tray-btc xp-tray-btc--live"
        title="Live crypto — click for details"
        onClick={() => setOpen((v) => !v)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/btc-pixel.svg"
          alt=""
          width={14}
          height={14}
          className="xp-pixel-icon shrink-0"
        />
        <div
          className={`xp-tray-ticker-viewport ${liveHighlight ? "xp-tray-ticker-viewport--went-live" : ""}`}
        >
          <div
            key={phase}
            className="xp-tray-ticker-track"
            style={{
              animationDuration: `${marqueeSec}s`,
            }}
          >
            <span ref={lineMeasureRef} className="xp-tray-ticker-line">
              {line}
            </span>
            {/* Duplicate line for seamless marquee — `inert` hides from a11y tree without aria-hidden-inside-button issues (see axe aria-hidden-focus). */}
            <span className="xp-tray-ticker-line" inert>
              {line}
            </span>
          </div>
        </div>
      </button>

      {open && (
        <div
          ref={popRef}
          className="xp-crypto-pop absolute bottom-full right-0 z-[300] mb-1 w-[220px] rounded border border-[#003c74] bg-[#ece9d8] shadow-[4px_4px_12px_rgba(0,0,0,0.35)]"
          role="dialog"
          aria-label="Cryptocurrency prices"
        >
          <div className="xp-crypto-pop-header border-b border-[#aca899] bg-gradient-to-b from-[#0a246a] to-[#0c2d8c] px-2 py-1">
            <span className="xp-crypto-pop-title text-[12px] font-bold text-white">
              Live prices (USD)
            </span>
            <button
              type="button"
              className="xp-crypto-pop-close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <p className="border-b border-[#d4d0c8] px-2 py-1 text-[10px] text-[#555]">
            CoinGecko · refreshes every minute
          </p>
          <table className="w-full border-collapse text-[11px]">
            <tbody>
              <tr className="border-b border-[#d4d0c8]">
                <td className="px-2 py-1.5 font-bold">BTC</td>
                <td
                  className={`xp-crypto-cell px-2 py-1.5 text-right tabular-nums ${rowClass("btc")}`}
                >
                  {fmtUsd(data?.btc ?? null)}
                </td>
              </tr>
              <tr className="border-b border-[#d4d0c8]">
                <td className="px-2 py-1.5 font-bold">ETH</td>
                <td
                  className={`xp-crypto-cell px-2 py-1.5 text-right tabular-nums ${rowClass("eth")}`}
                >
                  {fmtUsd(data?.eth ?? null)}
                </td>
              </tr>
              <tr>
                <td className="px-2 py-1.5 font-bold">SOL</td>
                <td
                  className={`xp-crypto-cell px-2 py-1.5 text-right tabular-nums ${rowClass("sol")}`}
                >
                  {fmtUsd(data?.sol ?? null)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
