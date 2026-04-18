"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getOrCreateVisitorKey } from "@/lib/msn/visitor-key";

export type ChatMessage = {
  id: string;
  sender: "me" | "owner";
  text: string;
  timestamp: number;
};

function mapRow(
  row: {
    id: string;
    sender_id: string | null;
    content: string;
    nudge?: boolean | null;
    created_at: string;
  },
  selfId: string,
  ownerId: string
): ChatMessage {
  const isMe = row.sender_id === selfId;
  let text = row.content;
  if (row.nudge && text.trim() === "") text = "🔔 Nudge!";
  return {
    id: row.id,
    sender: isMe ? "me" : "owner",
    text,
    timestamp: new Date(row.created_at).getTime(),
  };
}

export function useMsnLiveChat(enabled: boolean) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const ownerId = process.env.NEXT_PUBLIC_MSN_OWNER_USER_ID ?? "";
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    conversationIdRef.current = conversationId;
    userIdRef.current = userId;
  }, [conversationId, userId]);

  useEffect(() => {
    if (!enabled) {
      setMessages([]);
      setReady(false);
      setError(null);
      setConversationId(null);
      setUserId(null);
      userIdRef.current = null;
      conversationIdRef.current = null;
      setSendError(null);
      try {
        const supabase = getSupabaseBrowserClient();
        if (channelRef.current) {
          void supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      } catch {
        /* no supabase client */
      }
      return;
    }

    if (!ownerId) {
      setError("NEXT_PUBLIC_MSN_OWNER_USER_ID is missing");
      return;
    }

    let cancelled = false;

    async function init() {
      try {
        const supabase = getSupabaseBrowserClient();

        let {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          const { data, error: anonErr } = await supabase.auth.signInAnonymously();
          if (anonErr || !data.session) {
            setError(anonErr?.message ?? "Anonymous sign-in failed. Enable Anonymous auth in Supabase.");
            return;
          }
          session = data.session;
        }

        const visitorKey = getOrCreateVisitorKey();
        const res = await fetch("/api/msn/bootstrap", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ visitorKey }),
        });

        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(typeof payload.error === "string" ? payload.error : res.statusText);
          return;
        }

        const cid = payload.conversationId as string;
        const uid = payload.userId as string;
        if (cancelled) return;

        setConversationId(cid);
        setUserId(uid);
        userIdRef.current = uid;
        conversationIdRef.current = cid;

        const { data: rows, error: fetchErr } = await supabase
          .from("messages")
          .select("id, sender_id, content, nudge, created_at")
          .eq("conversation_id", cid)
          .order("created_at", { ascending: true });

        if (fetchErr) {
          setError(fetchErr.message);
          return;
        }

        setMessages((rows ?? []).map((r) => mapRow(r as Parameters<typeof mapRow>[0], uid, ownerId)));
        setReady(true);

        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }

        const channel = supabase
          .channel(`msn:${cid}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
              filter: `conversation_id=eq.${cid}`,
            },
            (chg) => {
              const row = chg.new as Parameters<typeof mapRow>[0];
              setMessages((prev) => {
                if (prev.some((m) => m.id === row.id)) return prev;
                const self = userIdRef.current ?? uid;
                return [...prev, mapRow(row, self, ownerId)];
              });
            }
          )
          .subscribe();

        channelRef.current = channel;
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    }

    void init();

    return () => {
      cancelled = true;
      try {
        const supabase = getSupabaseBrowserClient();
        if (channelRef.current) {
          void supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      } catch {
        /* env missing during teardown */
      }
    };
  }, [enabled, ownerId]);

  const sendText = useCallback(async (text: string) => {
    const cid = conversationIdRef.current;
    const uid = userIdRef.current;
    if (!cid || !uid) {
      const msg = "Chat is still connecting — wait a second and try again.";
      setSendError(msg);
      throw new Error(msg);
    }
    setSendError(null);
    const supabase = getSupabaseBrowserClient();
    const { error: insErr } = await supabase.from("messages").insert({
      conversation_id: cid,
      sender_id: uid,
      content: text,
      nudge: false,
    } as never);
    if (insErr) {
      setSendError(insErr.message);
      throw new Error(insErr.message);
    }
  }, []);

  const sendNudgeLive = useCallback(async () => {
    const cid = conversationIdRef.current;
    const uid = userIdRef.current;
    if (!cid || !uid) {
      throw new Error("Chat is still connecting.");
    }
    setSendError(null);
    const supabase = getSupabaseBrowserClient();
    const { error: insErr } = await supabase.from("messages").insert({
      conversation_id: cid,
      sender_id: uid,
      content: "🔔 You sent a nudge!",
      nudge: true,
    } as never);
    if (insErr) {
      setSendError(insErr.message);
      throw new Error(insErr.message);
    }
  }, []);

  const clearSendError = useCallback(() => setSendError(null), []);

  return {
    messages,
    ready,
    error,
    sendError,
    clearSendError,
    sendText,
    sendNudgeLive,
  };
}
