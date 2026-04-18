"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { OWNER } from "@/data/portfolio-content";

type Conv = {
  id: string;
  guestDisplayName: string;
  guestUsername: string | null;
  lastMessage: string | null;
  updatedAt: string | null;
};

type Msg = {
  id: string;
  sender_id: string | null;
  content: string;
  nudge: boolean | null;
  created_at: string;
};

const STORAGE_KEY = "msn-inbox-secret";

export default function MsnInboxPage() {
  const [secret, setSecret] = useState("");
  const [stored, setStored] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conv[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [listLoading, setListLoading] = useState(false);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const msgLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const s = sessionStorage.getItem(STORAGE_KEY);
      if (s) setStored(s);
    } catch {
      /* ignore */
    }
  }, []);

  const authHeader = stored ?? secret;

  const fetchConversations = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;
    if (!authHeader.trim()) return;
    if (!silent) setListLoading(true);
    if (!silent) setError(null);
    try {
      const res = await fetch("/api/msn/owner/conversations", {
        headers: { Authorization: `Bearer ${authHeader.trim()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : res.statusText);
      setConversations(data.conversations ?? []);
    } catch (e) {
      if (!silent) setError((e as Error).message);
    } finally {
      if (!silent) setListLoading(false);
    }
  }, [authHeader]);

  useEffect(() => {
    if (stored) void fetchConversations();
  }, [stored, fetchConversations]);

  const fetchMessages = useCallback(
    async (conversationId: string, opts?: { silent?: boolean }) => {
      const silent = opts?.silent ?? false;
      if (!authHeader.trim()) return;
      if (!silent) setThreadLoading(true);
      if (!silent) setError(null);
      try {
        const res = await fetch(
          `/api/msn/owner/messages?conversationId=${encodeURIComponent(conversationId)}`,
          { headers: { Authorization: `Bearer ${authHeader.trim()}` } }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : res.statusText);
        setMessages(data.messages ?? []);
      } catch (e) {
        if (!silent) setError((e as Error).message);
      } finally {
        if (!silent) setThreadLoading(false);
      }
    },
    [authHeader]
  );

  useEffect(() => {
    if (selectedId) void fetchMessages(selectedId);
  }, [selectedId, fetchMessages]);

  /* Background refresh every 10s — silent so the UI does not flash “Loading…” */
  useEffect(() => {
    if (!selectedId || !stored) return;
    const t = window.setInterval(() => {
      void fetchMessages(selectedId, { silent: true });
      void fetchConversations({ silent: true });
    }, 10000);
    return () => clearInterval(t);
  }, [selectedId, stored, fetchMessages, fetchConversations]);

  useEffect(() => {
    const el = msgLogRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const saveSecret = () => {
    const t = secret.trim();
    if (!t) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
    setStored(t);
    void fetchConversations();
  };

  const clearSecret = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setStored(null);
    setSecret("");
    setConversations([]);
    setSelectedId(null);
    setMessages([]);
  };

  const sendReply = async () => {
    const text = draft.trim();
    if (!selectedId || !text || !authHeader.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/msn/owner/reply", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authHeader.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conversationId: selectedId, content: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : res.statusText);
      setDraft("");
      await fetchMessages(selectedId);
      await fetchConversations();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const ownerId = process.env.NEXT_PUBLIC_MSN_OWNER_USER_ID ?? "";

  const selectedConv = conversations.find((c) => c.id === selectedId);

  return (
    <div className="msn-inbox-shell">
      <div className="msn-inbox-window">
        <header className="msn-inbox-titlebar">
          <div className="msn-inbox-titlebar-text">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/hires/msn-messenger.png" alt="" width={18} height={18} />
            <span>
              MSN Inbox — {OWNER.displayName}
            </span>
          </div>
          <div className="msn-inbox-toolbar">
            <Link href="/" className="msn-tb-btn" style={{ textDecoration: "none" }}>
              <span className="msn-tb-ico">🏠</span>
              <span className="msn-tb-label">Desktop</span>
            </Link>
            {stored && (
              <>
                <button type="button" className="msn-tb-btn" onClick={() => void fetchConversations()}>
                  <span className="msn-tb-ico">🔄</span>
                  <span className="msn-tb-label">Refresh</span>
                </button>
                <button type="button" className="msn-tb-btn" onClick={clearSecret}>
                  <span className="msn-tb-ico">🔒</span>
                  <span className="msn-tb-label">Lock</span>
                </button>
              </>
            )}
          </div>
        </header>

        {!stored ? (
          <div className="msn-inbox-login">
            <p className="msn-inbox-login-hint">
              Enter the same secret as <code>MSN_OWNER_SECRET</code> in your server
              env. It is stored in <code>sessionStorage</code> for this tab only.
            </p>
            <div className="msn-inbox-login-row">
              <input
                type="password"
                className="msn-inbox-input"
                style={{ flex: 1, minWidth: 200, maxWidth: 420 }}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="MSN_OWNER_SECRET"
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveSecret();
                }}
              />
              <button type="button" className="msn-send-btn" onClick={saveSecret}>
                Unlock
              </button>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="msn-inbox-status msn-inbox-status--error" role="alert">
                {error}
              </div>
            )}
            {!error && (listLoading || threadLoading) && (
              <div className="msn-inbox-status">
                {listLoading ? "Loading conversations…" : "Updating thread…"}
              </div>
            )}

            <div className="msn-inbox-body">
              <aside className="msn-inbox-sidebar">
                <div className="msn-inbox-sidebar-head">Contacts ({conversations.length})</div>
                <ul className="msn-inbox-conv-list">
                  {conversations.length === 0 && !listLoading && (
                    <li className="msn-inbox-empty">No conversations yet — open MSN on the portfolio as a visitor.</li>
                  )}
                  {conversations.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        className={`msn-inbox-conv-btn ${selectedId === c.id ? "msn-inbox-conv-btn--active" : ""}`}
                        onClick={() => setSelectedId(c.id)}
                      >
                        <div className="msn-inbox-conv-name">{c.guestDisplayName}</div>
                        <div className="msn-inbox-conv-preview">{c.lastMessage ?? "—"}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              </aside>

              <section className="msn-inbox-main">
                <div className="msn-inbox-main-head">
                  {selectedConv ? (
                    <>
                      To: <strong>{selectedConv.guestDisplayName}</strong>
                      {selectedConv.guestUsername && (
                        <span style={{ color: "#666", fontWeight: "normal" }}> ({selectedConv.guestUsername})</span>
                      )}
                    </>
                  ) : (
                    "Select a conversation"
                  )}
                </div>

                <div className="msn-inbox-msg-log" ref={msgLogRef}>
                  {!selectedId && (
                    <div className="msn-inbox-empty">Choose someone from the list to read and reply.</div>
                  )}
                  {selectedId && messages.length === 0 && !threadLoading && (
                    <div className="msn-inbox-empty">No messages in this thread yet.</div>
                  )}
                  {messages.map((m) => {
                    const fromOwner = Boolean(ownerId && m.sender_id === ownerId);
                    return (
                      <div
                        key={m.id}
                        className={`msn-inbox-msg ${fromOwner ? "msn-inbox-msg--owner" : "msn-inbox-msg--guest"}`}
                      >
                        <div className="msn-inbox-msg-meta">
                          <strong>{fromOwner ? "You" : "Guest"}</strong>
                          {" · "}
                          {new Date(m.created_at).toLocaleString()}
                        </div>
                        <div className="msn-inbox-msg-body">{m.content}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="msn-inbox-compose">
                  <div className="msn-inbox-field">
                    <label htmlFor="msn-inbox-reply">Your reply</label>
                    <input
                      id="msn-inbox-reply"
                      type="text"
                      className="msn-inbox-input"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder={selectedId ? "Type a message and press Send…" : "Select a conversation first"}
                      disabled={!selectedId}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void sendReply();
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="msn-send-btn"
                    style={{ margin: 0 }}
                    disabled={!selectedId || !draft.trim() || sending}
                    onClick={() => void sendReply()}
                  >
                    {sending ? "Sending…" : "Send"}
                  </button>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
