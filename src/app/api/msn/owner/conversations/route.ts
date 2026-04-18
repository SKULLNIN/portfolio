import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

type ConvRow = {
  id: string;
  guestUserId: string;
  guestDisplayName: string;
  guestUsername: string | null;
  lastMessage: string | null;
  updatedAt: string | null;
};

export async function GET(request: Request) {
  const secret = process.env.MSN_OWNER_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "MSN_OWNER_SECRET is not set" }, { status: 503 });
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token || token !== secret) {
    return unauthorized();
  }

  const ownerId = process.env.NEXT_PUBLIC_MSN_OWNER_USER_ID;
  if (!ownerId) {
    return NextResponse.json({ error: "NEXT_PUBLIC_MSN_OWNER_USER_ID is not set" }, { status: 503 });
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 503 });
  }

  const { data: memberships, error: memErr } = await admin
    .from("conversation_members")
    .select("conversation_id")
    .eq("user_id", ownerId);

  if (memErr) {
    return NextResponse.json({ error: memErr.message }, { status: 500 });
  }

  const convIds = memberships?.map((m) => m.conversation_id) ?? [];
  const items: ConvRow[] = [];

  for (const cid of convIds) {
    const { data: members } = await admin.from("conversation_members").select("user_id").eq("conversation_id", cid);

    const otherId = members?.find((m) => m.user_id !== ownerId)?.user_id;
    if (!otherId) continue;

    const { data: profile } = await admin
      .from("users")
      .select("display_name, username")
      .eq("id", otherId)
      .maybeSingle();

    const { data: last } = await admin
      .from("messages")
      .select("content, created_at")
      .eq("conversation_id", cid)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    items.push({
      id: cid,
      guestUserId: otherId,
      guestDisplayName: profile?.display_name ?? "Guest",
      guestUsername: profile?.username ?? null,
      lastMessage: last?.content ?? null,
      updatedAt: last?.created_at ?? null,
    });
  }

  items.sort((a, b) => {
    const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return tb - ta;
  });

  /** One inbox row per guest profile (multiple convos → keep most recently active). */
  const seenGuest = new Set<string>();
  const deduped: Omit<ConvRow, "guestUserId">[] = [];
  for (const row of items) {
    if (seenGuest.has(row.guestUserId)) continue;
    seenGuest.add(row.guestUserId);
    deduped.push({
      id: row.id,
      guestDisplayName: row.guestDisplayName,
      guestUsername: row.guestUsername,
      lastMessage: row.lastMessage,
      updatedAt: row.updatedAt,
    });
  }

  return NextResponse.json({ conversations: deduped });
}
