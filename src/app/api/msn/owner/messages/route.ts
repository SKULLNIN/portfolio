import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const secret = process.env.MSN_OWNER_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "MSN_OWNER_SECRET is not set" }, { status: 503 });
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId required" }, { status: 400 });
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 503 });
  }

  const { data, error } = await admin
    .from("messages")
    .select("id, conversation_id, sender_id, content, nudge, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: data ?? [] });
}
