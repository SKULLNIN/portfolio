import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabasePublicKey } from "@/lib/supabase/public-key";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = getSupabasePublicKey();
  const ownerId = process.env.NEXT_PUBLIC_MSN_OWNER_USER_ID;

  if (!url || !anonKey || !ownerId) {
    return NextResponse.json({ error: "MSN live chat is not configured" }, { status: 503 });
  }

  let visitorKey: string | null = null;
  try {
    const rawText = await request.text();
    if (rawText.trim()) {
      const raw = JSON.parse(rawText) as { visitorKey?: unknown };
      if (typeof raw?.visitorKey === "string") {
        const k = raw.visitorKey.trim();
        if (k.length >= 16 && k.length <= 128) visitorKey = k;
      }
    }
  } catch {
    visitorKey = null;
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
  }

  const anon = createClient(url, anonKey);
  const {
    data: { user },
    error: userErr,
  } = await anon.auth.getUser(token);

  if (userErr || !user) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ error: "Server missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 503 });
  }

  const short = user.id.replace(/-/g, "").slice(0, 8);
  const { error: upsertErr } = await admin.from("users").upsert(
    {
      id: user.id,
      username: `guest_${short}`,
      display_name: "Guest",
    },
    { onConflict: "id" }
  );

  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  const { data: ownerAuth, error: ownerAuthErr } = await admin.auth.admin.getUserById(ownerId);
  if (ownerAuthErr || !ownerAuth?.user) {
    return NextResponse.json(
      {
        error:
          `Owner profile UUID not found in Supabase Auth. Copy your user id from Authentication → Users into NEXT_PUBLIC_MSN_OWNER_USER_ID (got ${ownerId}).`,
      },
      { status: 400 }
    );
  }

  const meta = ownerAuth.user.user_metadata as Record<string, unknown> | undefined;
  const fromMeta =
    typeof meta?.full_name === "string"
      ? meta.full_name
      : typeof meta?.display_name === "string"
        ? meta.display_name
        : typeof meta?.name === "string"
          ? meta.name
          : null;
  const display =
    typeof fromMeta === "string" && fromMeta.trim()
      ? fromMeta.trim().slice(0, 120)
      : ownerAuth.user.email?.split("@")[0]?.trim() || "Portfolio owner";

  const ownerUsername = `owner_${ownerId.replace(/-/g, "")}`;
  const { error: ownerUpsertErr } = await admin.from("users").upsert(
    {
      id: ownerId,
      username: ownerUsername,
      display_name: display,
    },
    { onConflict: "id" }
  );

  if (ownerUpsertErr) {
    return NextResponse.json({ error: ownerUpsertErr.message }, { status: 500 });
  }

  /* Reconnect same browser to the same DM (see scripts/msn-visitor-peers.sql) */
  if (visitorKey) {
    const { data: peer, error: peerSelErr } = await admin
      .from("msn_visitor_peers")
      .select("user_id, conversation_id")
      .eq("visitor_key", visitorKey)
      .maybeSingle();

    if (peerSelErr) {
      return NextResponse.json(
        {
          error: `${peerSelErr.message}. If this mentions a missing table, run scripts/msn-visitor-peers.sql in Supabase.`,
        },
        { status: 500 }
      );
    }

    if (peer) {
      if (peer.user_id === user.id) {
        const { data: guestMem } = await admin
          .from("conversation_members")
          .select("conversation_id")
          .eq("conversation_id", peer.conversation_id)
          .eq("user_id", user.id)
          .maybeSingle();
        const { data: ownerMem } = await admin
          .from("conversation_members")
          .select("user_id")
          .eq("conversation_id", peer.conversation_id)
          .eq("user_id", ownerId)
          .maybeSingle();
        if (guestMem && ownerMem) {
          await admin.from("msn_visitor_peers").upsert(
            {
              visitor_key: visitorKey,
              user_id: user.id,
              conversation_id: peer.conversation_id,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "visitor_key" }
          );
          return NextResponse.json({ conversationId: peer.conversation_id, userId: user.id });
        }
        await admin.from("msn_visitor_peers").delete().eq("visitor_key", visitorKey);
      } else {
        const convId = peer.conversation_id;
        const oldUid = peer.user_id;

        await admin.from("conversation_members").delete().eq("conversation_id", convId).eq("user_id", oldUid);

        const { error: joinErr } = await admin.from("conversation_members").insert({
          conversation_id: convId,
          user_id: user.id,
        });
        if (joinErr) {
          return NextResponse.json({ error: joinErr.message }, { status: 500 });
        }

        await admin.from("msn_visitor_peers").upsert(
          {
            visitor_key: visitorKey,
            user_id: user.id,
            conversation_id: convId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "visitor_key" }
        );

        try {
          await admin.auth.admin.deleteUser(oldUid);
        } catch {
          /* orphaned anon user — ignore */
        }

        return NextResponse.json({ conversationId: convId, userId: user.id });
      }
    }
  }

  const { data: guestRows, error: grErr } = await admin
    .from("conversation_members")
    .select("conversation_id")
    .eq("user_id", user.id);

  if (grErr) {
    return NextResponse.json({ error: grErr.message }, { status: 500 });
  }

  const convIds = guestRows?.map((r) => r.conversation_id) ?? [];
  for (const cid of convIds) {
    const { data: ownerRow } = await admin
      .from("conversation_members")
      .select("user_id")
      .eq("conversation_id", cid)
      .eq("user_id", ownerId)
      .maybeSingle();

    if (ownerRow) {
      if (visitorKey) {
        await admin.from("msn_visitor_peers").upsert(
          {
            visitor_key: visitorKey,
            user_id: user.id,
            conversation_id: cid,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "visitor_key" }
        );
      }
      return NextResponse.json({ conversationId: cid, userId: user.id });
    }
  }

  const { data: conv, error: convErr } = await admin.from("conversations").insert({}).select("id").single();

  if (convErr || !conv) {
    return NextResponse.json({ error: convErr?.message ?? "Failed to create conversation" }, { status: 500 });
  }

  const { error: memErr } = await admin.from("conversation_members").insert([
    { conversation_id: conv.id, user_id: user.id },
    { conversation_id: conv.id, user_id: ownerId },
  ]);

  if (memErr) {
    await admin.from("conversations").delete().eq("id", conv.id);
    return NextResponse.json({ error: memErr.message }, { status: 500 });
  }

  if (visitorKey) {
    await admin.from("msn_visitor_peers").upsert(
      {
        visitor_key: visitorKey,
        user_id: user.id,
        conversation_id: conv.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "visitor_key" }
    );
  }

  return NextResponse.json({ conversationId: conv.id, userId: user.id });
}
