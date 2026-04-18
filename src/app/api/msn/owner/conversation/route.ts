import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function DELETE(request: Request) {
  const secret = process.env.MSN_OWNER_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "MSN_OWNER_SECRET is not set" }, { status: 503 });
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ownerId = process.env.NEXT_PUBLIC_MSN_OWNER_USER_ID;
  if (!ownerId) {
    return NextResponse.json({ error: "NEXT_PUBLIC_MSN_OWNER_USER_ID is not set" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId")?.trim();
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId query parameter required" }, { status: 400 });
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 503 });
  }

  const { data: ownerMembership, error: memErr } = await admin
    .from("conversation_members")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", ownerId)
    .maybeSingle();

  if (memErr) {
    return NextResponse.json({ error: memErr.message }, { status: 500 });
  }

  if (!ownerMembership) {
    return NextResponse.json({ error: "Conversation not found or access denied" }, { status: 403 });
  }

  const { error: delErr } = await admin.from("conversations").delete().eq("id", conversationId);

  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
