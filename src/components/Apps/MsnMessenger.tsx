"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OWNER } from "@/data/portfolio-content";

/* ─── types ─── */
type ChatMessage = {
  id: string;
  sender: "me" | "owner";
  text: string;
  timestamp: number;
};

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
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
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
  }, [messages, typing]);

  /* persist */
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

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

  /** Pinball leaves the canvas focused / capturing input; restore MSN typing after it closes. */
  useEffect(() => {
    const onPinballClosed = () => {
      requestAnimationFrame(() => {
        inputRef.current?.focus({ preventScroll: true });
      });
    };
    window.addEventListener("xp-pinball-closed", onPinballClosed);
    return () => window.removeEventListener("xp-pinball-closed", onPinballClosed);
  }, []);

  const addMessage = useCallback(
    (sender: "me" | "owner", text: string) => {
      const msg: ChatMessage = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        sender,
        text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, msg]);
      return msg;
    },
    []
  );

  /* send handler */
  const sendMessage = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
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
  }, [draft, addMessage]);

  /* nudge */
  const sendNudge = useCallback(() => {
    if (isShaking) return;
    setIsShaking(true);
    addMessage("me", "🔔 You have sent a nudge!");
    const audio = new Audio("/sounds/nudge.wav");
    audio.volume = 0.3;
    audio.play().catch(() => {});
    setTimeout(() => setIsShaking(false), 600);
  }, [isShaking, addMessage]);

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
                This is a live chat window. Your messages will be delivered to me
                just like in a real chat application. I will reply to you as much
                as I can (please forgive me if I reply late). When you return to
                the site later, you can see your message history. If you delete
                the data stored in your browser for this site, you won&apos;t be
                able to access this conversation again.
              </span>
            </div>

            {/* Messages */}
            {messages.map((m) => (
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

            {/* Typing indicator */}
            {typing && (
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
              disabled={!draft.trim()}
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
