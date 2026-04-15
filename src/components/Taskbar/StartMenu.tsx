"use client";

import { useEffect, useRef, useState } from "react";
import { APP_ORDER, APP_REGISTRY } from "@/data/apps";
import { OWNER } from "@/data/portfolio-content";
import { useWindowManager } from "@/context/WindowContext";
import { queueControlPanelApplet } from "@/lib/control-panel-open";
import { XP_ICONS } from "@/lib/xp-icons";
import type { AppId } from "@/types";

type Props = {
  open: boolean;
  onClose: () => void;
};

/** Left column: all apps except IE (IE is pinned at top). */
const LEFT_COLUMN_APPS = APP_ORDER.filter((id) => id !== "internet-explorer");

/**
 * Windows XP Pro–style Start menu: orange header band, two columns (programs | system),
 * green “All Programs” strip, dark footer.
 */
export function StartMenu({ open, onClose }: Props) {
  const { openApp } = useWindowManager();
  const ref = useRef<HTMLDivElement>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onClose]);

  if (!open) return null;

  const ie = APP_REGISTRY["internet-explorer"];

  return (
    <>
      {info && (
        <div
          className="pointer-events-auto fixed inset-0 z-[80] flex items-center justify-center bg-black/20 p-4"
          role="dialog"
        >
          <div className="max-w-sm rounded border border-[#003c74] bg-[#ece9d8] p-4 text-[12px] text-black shadow-lg">
            <p className="m-0">{info}</p>
            <button
              type="button"
              className="mt-3 rounded border border-[#003c74] bg-[#ece9d8] px-3 py-1 text-[11px]"
              onClick={() => setInfo(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}
      <div ref={ref} className="xp-slide-open">
        <header className="xp-sm-top">
          <div className="xp-sm-user-bubble">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="xp-sm-avatar"
              src="/user-profile.svg"
              alt=""
              width={48}
              height={48}
            />
          </div>
          <div className="xp-sm-user-name">
            <h1>{OWNER.displayName}</h1>
          </div>
        </header>
        <div className="xp-sm-header-rule" aria-hidden />

        <div className="xp-sm-menu">
          <div className="xp-sm-col-left">
            <div className="xp-sm-pinned">
              <button
                type="button"
                className="xp-sm-pinned-btn"
                onClick={() => {
                  openApp("internet-explorer");
                  onClose();
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ie.icon} alt="" width={32} height={32} />
                <span className="xp-sm-pinned-text">
                  <span className="xp-sm-pinned-title">Internet</span>
                  <span className="xp-sm-pinned-sub">Internet Explorer</span>
                </span>
              </button>
              <button
                type="button"
                className="xp-sm-pinned-btn"
                onClick={() => {
                  window.location.href = `mailto:${OWNER.email}`;
                  onClose();
                }}
              >
                <span className="xp-sm-pinned-mail" aria-hidden />
                <span className="xp-sm-pinned-text">
                  <span className="xp-sm-pinned-title">E-mail</span>
                  <span className="xp-sm-pinned-sub">Outlook Express</span>
                </span>
              </button>
              <button
                type="button"
                className="xp-sm-pinned-btn"
                onClick={() => {
                  openApp("control-panel");
                  queueControlPanelApplet("skills", 0);
                  onClose();
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={XP_ICONS.notepad} alt="" width={32} height={32} />
                <span className="xp-sm-pinned-text">
                  <span className="xp-sm-pinned-title">Skills</span>
                  <span className="xp-sm-pinned-sub">Control Panel</span>
                </span>
              </button>
            </div>

            <div className="xp-sm-sep" />

            <ul className="xp-sm-programs-list">
              {LEFT_COLUMN_APPS.map((id) => {
                const app = APP_REGISTRY[id];
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className="xp-sm-item"
                      onClick={() => {
                        openApp(id);
                        onClose();
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={app.icon} alt="" width={32} height={32} />
                      <span className="xp-sm-item-label">{app.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <details className="xp-sm-allprograms-wrap">
              <summary className="xp-sm-allprograms xp-sm-allprograms--clickable list-none">
                <span className="xp-sm-allprograms-orb" aria-hidden>
                  ▶
                </span>
                <span>All Programs</span>
              </summary>
              <ul className="xp-sm-sub">
                <li>
                  <button
                    type="button"
                    className="xp-sm-sub-item"
                    onClick={() => {
                      window.open(OWNER.github, "_blank", "noopener,noreferrer");
                      onClose();
                    }}
                  >
                    GitHub
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="xp-sm-sub-item"
                    onClick={() => {
                      window.open(OWNER.linkedin, "_blank", "noopener,noreferrer");
                      onClose();
                    }}
                  >
                    LinkedIn
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="xp-sm-sub-item"
                    onClick={() => {
                      window.open(OWNER.resumePdf, "_blank", "noopener,noreferrer");
                      onClose();
                    }}
                  >
                    Résumé (PDF)
                  </button>
                </li>
              </ul>
            </details>
          </div>

          <aside className="xp-sm-col-right" aria-label="System shortcuts">
            <RightItem
              label="My Documents"
              icon="docs"
              onClick={() => openAndClose("my-documents")}
            />
            <RightItem
              label="My Pictures"
              icon="pics"
              onClick={() => openAndClose("my-pictures")}
            />
            <RightItem
              label="My Computer"
              icon="pc"
              onClick={() => openAndClose("my-computer")}
            />
            <div className="xp-sm-r-sep" />
            <RightItem
              label="Control Panel"
              icon="cp"
              onClick={() => {
                openApp("control-panel");
                onClose();
              }}
            />
            <RightItem
              label="Help and Support"
              icon="help"
              onClick={() => {
                openApp("internet-explorer");
                onClose();
              }}
            />
            <RightItem
              label="Search"
              icon="search"
              onClick={() => {
                window.open(
                  "https://www.google.com",
                  "_blank",
                  "noopener,noreferrer"
                );
                onClose();
              }}
            />
          </aside>
        </div>

        <div className="xp-sm-bottom">
          <button
            type="button"
            className="xp-sm-foot-btn"
            onClick={onClose}
            title="Close start menu"
          >
            <span className="xp-sm-foot-ico xp-sm-foot-ico--logoff" aria-hidden />
            Log Off
          </button>
          <button
            type="button"
            className="xp-sm-foot-btn"
            onClick={onClose}
            title="Close start menu"
          >
            <span className="xp-sm-foot-ico xp-sm-foot-ico--shutdown" aria-hidden />
            Turn Off Computer
          </button>
        </div>
      </div>
    </>
  );

  function openAndClose(id: AppId) {
    openApp(id);
    onClose();
  }
}

function RightItem({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: "docs" | "pics" | "pc" | "cp" | "help" | "search";
  onClick: () => void;
}) {
  return (
    <button type="button" className="xp-sm-r-item" onClick={onClick}>
      <span className={`xp-sm-r-ico xp-sm-r-ico--${icon}`} aria-hidden />
      <span className="xp-sm-r-label">{label}</span>
    </button>
  );
}
