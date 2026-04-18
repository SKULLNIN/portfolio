"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OWNER } from "@/data/portfolio-content";
import { isMsnLiveConfigured } from "@/lib/msn/env";
import { useMsnLiveChat, type ChatMessage } from "@/hooks/useMsnLiveChat";

/* ─── emoji set (classic MSN emoticons) ─── */
const MSN_EMOJIS = [
  "😊", "😃", "😉", "😂", "😍", "😘", "😜", "😎",
  "😢", "😡", "😱", "🤔", "👍", "👎", "❤️", "💔",
  "🎉", "🌹", "☀️", "⭐", "🎵", "🎶", "🐱", "🐶",
  "🦆", "🎁", "☕", "🍕", "✉️", "📎",
];

/* ─── auto-reply pool ─── */
const AUTO_REPLIES = [
  `Hey! Thanks for your message 😊`,
  `I'm currently working on some drone stuff, but I saw your message!`,
  `Nice to hear from you! Check out My Computer for my projects 🚀`,
  `That's awesome! Feel free to browse around the desktop.`,
  `Thanks for visiting my portfolio! Want to see my S500 quad build?`,
  `I appreciate you reaching out! Email me at ${OWNER.email} if you want to chat more.`,
  `Cool! I'm building autonomous systems — PX4, ROS 2, Jetson, the works 🤖`,
  `Haha, yeah this MSN Messenger brings back memories right? 😂`,
];

const STORAGE_KEY = "msn-messenger-history";

/** Live Supabase chat removes the maintenance overlay when env is fully configured. */
const MSN_LIVE = isMsnLiveConfigured();
const MSN_UNDER_MAINTENANCE = !MSN_LIVE;
const MSN_MAINTENANCE_AVAILABLE_FROM = "20 April 2026";

function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages(msgs: ChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  } catch {
    /* quota exceeded — ignore */
  }
}

export function MsnMessenger() {
  const {
    messages: liveMessages,
    ready: liveReady,
    error: liveError,
    sendError,
    clearSendError,
    sendText,
    sendNudgeLive,
  } = useMsnLiveChat(MSN_LIVE);
  const liveActive = MSN_LIVE && liveReady && !liveError;
  const connectingLive = MSN_LIVE && !liveReady && !liveError;

  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(() => loadMessages());
  const displayMessages = liveActive ? liveMessages : localMessages;

  const [draft, setDraft] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [typing, setTyping] = useState(false);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  /* Scroll chat to bottom — avoid scrollIntoView (can steal focus / glitch IME in Edge). */
  useEffect(() => {
    const el = chatMessagesRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [displayMessages, typing]);

  /* persist offline thread only */
  useEffect(() => {
    if (liveActive) return;
    saveMessages(localMessages);
  }, [localMessages, liveActive]);

  /* close emoji picker on outside click */
  useEffect(() => {
    if (!showEmoji) return;
    const handler = (e: PointerEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [showEmoji]);

  const addMessage = useCallback(
    (sender: "me" | "owner", text: string) => {
      const msg: ChatMessage = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        sender,
        text,
        timestamp: Date.now(),
      };
      setLocalMessages((prev) => [...prev, msg]);
      return msg;
    },
    []
  );

  /* send handler */
  const sendMessage = useCallback(() => {
    const text = draft.trim();
    if (!text) return;

    if (liveActive) {
      void sendText(text)
        .then(() => {
          setDraft("");
          clearSendError();
          inputRef.current?.focus();
        })
        .catch(() => {
          /* sendError set inside hook */
        });
      return;
    }

    addMessage("me", text);
    setDraft("");
    inputRef.current?.focus();

    /* fake typing, then auto-reply */
    setTyping(true);
    const delay = 1500 + Math.random() * 2000;
    setTimeout(() => {
      setTyping(false);
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      addMessage("owner", reply);
    }, delay);
  }, [draft, addMessage, liveActive, sendText, clearSendError]);

  /* nudge */
  const sendNudge = useCallback(() => {
    if (isShaking) return;
    setIsShaking(true);

    if (liveActive) {
      void sendNudgeLive().finally(() => {
        setTimeout(() => setIsShaking(false), 600);
      });
      const audio = new Audio("/sounds/nudge.wav");
      audio.volume = 0.3;
      audio.play().catch(() => {});
      return;
    }

    addMessage("me", "🔔 You have sent a nudge!");
    const audio = new Audio("/sounds/nudge.wav");
    audio.volume = 0.3;
    audio.play().catch(() => {});
    setTimeout(() => setIsShaking(false), 600);
  }, [isShaking, addMessage, liveActive, sendNudgeLive]);

  /* insert emoji */
  const insertEmoji = useCallback(
    (emoji: string) => {
      setDraft((d) => d + emoji);
      setShowEmoji(false);
      inputRef.current?.focus();
    },
    []
  );

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={`msn-messenger-root ${isShaking ? "msn-shake" : ""}`}
    >
      {MSN_UNDER_MAINTENANCE && (
        <div
          className="msn-maintenance-overlay"
          aria-hidden="true"
        >
          <div className="msn-maintenance-panel" role="status">
            <p className="msn-maintenance-title">Under maintenance</p>
            <p className="msn-maintenance-body">
              MSN Messenger is offline until live chat is configured (Supabase env vars), or try again after{" "}
              <strong>{MSN_MAINTENANCE_AVAILABLE_FROM}</strong>. Open{" "}
              <code style={{ fontSize: 11 }}>/msn-inbox</code> as the owner to reply when live chat is enabled.
            </p>
          </div>
        </div>
      )}

      {/* ─── MSN Toolbar ─── */}
      <div className="msn-toolbar">
        <div className="msn-toolbar-buttons">
          <button type="button" className="msn-tb-btn" title="Invite">
            <span className="msn-tb-ico">👥</span>
            <span className="msn-tb-label">Invite</span>
          </button>
          <button type="button" className="msn-tb-btn" title="Send Files">
            <span className="msn-tb-ico">📁</span>
            <span className="msn-tb-label">Send Files</span>
          </button>
          <button type="button" className="msn-tb-btn" title="Voice">
            <span className="msn-tb-ico">🎙️</span>
            <span className="msn-tb-label">Voice</span>
          </button>
          <button type="button" className="msn-tb-btn" title="Activities">
            <span className="msn-tb-ico">🎯</span>
            <span className="msn-tb-label">Activities</span>
          </button>
          <button type="button" className="msn-tb-btn" title="Games">
            <span className="msn-tb-ico">🎮</span>
            <span className="msn-tb-label">Games</span>
          </button>
        </div>
        <div className="msn-toolbar-logo">
          {/* MSN butterfly text logo */}
          <span className="msn-butterfly">msn</span>
          <span className="msn-butterfly-dot">●</span>
        </div>
      </div>

      {/* ─── Chat area ─── */}
      <div className="msn-chat-container">
        {/* Chat history */}
        <div className="msn-chat-history">
          {/* "To:" header */}
          <div className="msn-chat-to">
            To: <strong>{OWNER.displayName}</strong>
          </div>

          <div className="msn-chat-messages" ref={chatMessagesRef}>
            {MSN_LIVE && liveError && (
              <div className="msn-live-banner" role="alert">
                Live chat error: {liveError}. Showing offline demo chat instead.
              </div>
            )}
            {liveActive && sendError && (
              <div className="msn-live-banner" role="alert">
                Could not send: {sendError}
                <button
                  type="button"
                  className="msn-live-banner-dismiss"
                  onClick={() => clearSendError()}
                >
                  Dismiss
                </button>
              </div>
            )}
            {connectingLive && (
              <div className="msn-live-banner msn-live-banner--info" role="status">
                Connecting to live chat…
              </div>
            )}
            {/* Welcome message (always shown) */}
            <div className="msn-system-msg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/hires/msn-messenger.png"
                alt=""
                width={20}
                height={20}
                className="msn-system-ico"
              />
              <span>
                {MSN_LIVE
                  ? "This window uses Supabase Realtime: messages sync to the database and appear on my inbox at /msn-inbox. Your guest session is anonymous (saved in this browser)."
                  : "This is a demo chat stored in your browser until live Supabase chat is enabled. When live, messages sync in real time and I can reply from my inbox."}{" "}
                When you return later, offline history stays in this browser unless you clear site data.
              </span>
            </div>

            {/* Messages */}
            {displayMessages.map((m) => (
              <div
                key={m.id}
                className={`msn-msg ${m.sender === "me" ? "msn-msg--me" : "msn-msg--other"}`}
              >
                <div className="msn-msg-sender">
                  {m.sender === "me" ? "Me" : OWNER.displayName}
                  <span className="msn-msg-time"> — {formatTime(m.timestamp)}</span>
                  :
                </div>
                <div className="msn-msg-text">{m.text}</div>
              </div>
            ))}

            {/* Typing indicator (offline auto-reply only) */}
            {!liveActive && typing && (
              <div className="msn-typing">
                {OWNER.displayName} is typing
                <span className="msn-typing-dots">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              </div>
            )}

          </div>
        </div>

        {/* Contact display picture (upper right) */}
        <div className="msn-contact-dp">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/media/msn/contact-photo.png"
            alt={OWNER.displayName}
            width={96}
            height={96}
          />
        </div>
      </div>

      {/* ─── Input area ─── */}
      <div className="msn-input-container">
        {/* Formatting toolbar */}
        <div className="msn-format-bar">
          <button type="button" className="msn-fmt-btn msn-fmt-font" title="Font">
            A
          </button>
          <button
            type="button"
            className="msn-fmt-btn msn-fmt-emoji"
            title="Emoticons"
            onClick={() => setShowEmoji((v) => !v)}
          >
            😊
            <span className="msn-fmt-arrow">▾</span>
          </button>

          {/* Emoji picker */}
          {showEmoji && (
            <div className="msn-emoji-picker" ref={emojiRef}>
              {MSN_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className="msn-emoji-btn"
                  onClick={() => insertEmoji(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          )}

          <button type="button" className="msn-fmt-btn" title="Voice Clip">
            🌐 <span className="msn-fmt-text">Voice Clip</span>
          </button>
          <button type="button" className="msn-fmt-btn" title="Winks">
            🖼️
          </button>
          <button type="button" className="msn-fmt-btn" title="Custom Emoticons">
            🐾
          </button>
          <button
            type="button"
            className="msn-fmt-btn msn-fmt-nudge"
            title="Send a Nudge"
            onClick={sendNudge}
          >
            💥
          </button>
        </div>

        {/* Input + send */}
        <div className="msn-input-row">
          <div className="msn-input-wrap">
            <textarea
              ref={inputRef}
              className="msn-input"
              placeholder="Type your message here..."
              value={draft}
              name="msn-message"
              autoComplete="off"
              spellCheck
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              rows={3}
            />
            <button
              type="button"
              className="msn-send-btn"
              onClick={sendMessage}
              disabled={!draft.trim() || connectingLive}
            >
              Send
            </button>
          </div>

          {/* My display picture (rubber duck) */}
          <div className="msn-my-dp">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/media/msn/rubber-duck.png"
              alt="My display picture"
              width={80}
              height={80}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
