import { NextResponse } from "next/server";
import type { CryptoPrices } from "@/types/crypto";

/**
 * Avoid hammering upstreams: many clients poll every 60s; serverless shares one egress IP
 * so CoinGecko free tier hits 429 quickly without caching.
 */
const CACHE_MS = 50_000;

type CacheEntry = { expiresAt: number; body: CryptoPrices };

let memCache: CacheEntry | null = null;

const COINGECKO_PUBLIC =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd";

function hasAnyPrice(p: CryptoPrices): boolean {
  return p.btc != null || p.eth != null || p.sol != null;
}

async function fetchCoinGecko(): Promise<CryptoPrices | null> {
  const key = process.env.COINGECKO_API_KEY;
  const url = key
    ? "https://pro-api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd"
    : COINGECKO_PUBLIC;
  const headers: HeadersInit = { Accept: "application/json" };
  if (key) (headers as Record<string, string>)["x-cg-pro-api-key"] = key;

  const res = await fetch(url, { cache: "no-store", headers });
  if (!res.ok) return null;

  const raw = (await res.json()) as unknown;
  if (
    raw &&
    typeof raw === "object" &&
    "status" in raw &&
    (raw as { status?: { error_code?: number } }).status?.error_code
  ) {
    return null;
  }

  const data = raw as {
    bitcoin?: { usd?: number };
    ethereum?: { usd?: number };
    solana?: { usd?: number };
  };
  return {
    btc: data.bitcoin?.usd ?? null,
    eth: data.ethereum?.usd ?? null,
    sol: data.solana?.usd ?? null,
  };
}

/** Public spot tickers — separate rate limits; used when CoinGecko is 429 / down. */
async function fetchBinanceSpot(): Promise<CryptoPrices> {
  const pairs = [
    { sym: "BTCUSDT", key: "btc" as const },
    { sym: "ETHUSDT", key: "eth" as const },
    { sym: "SOLUSDT", key: "sol" as const },
  ];
  const out: CryptoPrices = { btc: null, eth: null, sol: null };

  await Promise.all(
    pairs.map(async ({ sym, key }) => {
      try {
        const r = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbol=${sym}`,
          { cache: "no-store", headers: { Accept: "application/json" } }
        );
        if (!r.ok) return;
        const j = (await r.json()) as { price?: string };
        const n = parseFloat(j.price ?? "");
        if (!Number.isFinite(n)) return;
        out[key] = n;
      } catch {
        /* ignore per-symbol failure */
      }
    })
  );

  return out;
}

function mergePrices(primary: CryptoPrices | null, fill: CryptoPrices): CryptoPrices {
  if (!primary) return fill;
  return {
    btc: primary.btc ?? fill.btc,
    eth: primary.eth ?? fill.eth,
    sol: primary.sol ?? fill.sol,
  };
}

export async function GET() {
  const now = Date.now();
  if (memCache && memCache.expiresAt > now) {
    return NextResponse.json(memCache.body);
  }

  try {
    const cg = await fetchCoinGecko();
    let merged: CryptoPrices;

    if (!cg || !hasAnyPrice(cg)) {
      merged = await fetchBinanceSpot();
    } else if (cg.btc == null || cg.eth == null || cg.sol == null) {
      merged = mergePrices(cg, await fetchBinanceSpot());
    } else {
      merged = cg;
    }

    if (!hasAnyPrice(merged)) {
      const body = {
        btc: null,
        eth: null,
        sol: null,
        error: "upstream",
      } satisfies CryptoPrices;
      return NextResponse.json(body, { status: 502 });
    }

    const body: CryptoPrices = { btc: merged.btc, eth: merged.eth, sol: merged.sol };
    memCache = { expiresAt: now + CACHE_MS, body };
    return NextResponse.json(body);
  } catch {
    return NextResponse.json(
      { btc: null, eth: null, sol: null, error: "fetch" } satisfies CryptoPrices,
      { status: 500 }
    );
  }
}
