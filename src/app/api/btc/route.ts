import { NextResponse } from "next/server";

/** Server-side fetch avoids browser CORS; revalidate every 60s. */
export async function GET() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
      { next: { revalidate: 60 } }
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: "upstream", usd: null },
        { status: 502 }
      );
    }
    const data = (await res.json()) as {
      bitcoin?: { usd?: number };
    };
    const usd = data.bitcoin?.usd ?? null;
    return NextResponse.json({ usd });
  } catch {
    return NextResponse.json({ error: "fetch", usd: null }, { status: 500 });
  }
}
