import { NextResponse } from "next/server";
import type { CryptoPrices } from "@/types/crypto";

/** Fresh prices on each request — client polls about once per minute. */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd",
      { cache: "no-store" }
    );
    if (!res.ok) {
      return NextResponse.json(
        { btc: null, eth: null, sol: null, error: "upstream" } satisfies CryptoPrices,
        { status: 502 }
      );
    }
    const data = (await res.json()) as {
      bitcoin?: { usd?: number };
      ethereum?: { usd?: number };
      solana?: { usd?: number };
    };
    const body: CryptoPrices = {
      btc: data.bitcoin?.usd ?? null,
      eth: data.ethereum?.usd ?? null,
      sol: data.solana?.usd ?? null,
    };
    return NextResponse.json(body);
  } catch {
    return NextResponse.json(
      { btc: null, eth: null, sol: null, error: "fetch" } satisfies CryptoPrices,
      { status: 500 }
    );
  }
}
