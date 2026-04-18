import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
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

  let body: { conversationId?: string; content?: string; nudge?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const conversationId = body.conversationId;
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!conversationId || !content) {
    return NextResponse.json({ error: "conversationId and content are required" }, { status: 400 });
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 503 });
  }

  const { error } = await admin.from("messages").insert({
    conversation_id: conversationId,
    sender_id: ownerId,
    content,
    nudge: Boolean(body.nudge),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
