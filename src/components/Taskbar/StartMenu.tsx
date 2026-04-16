"use client";

import { useEffect, useRef, useState } from "react";
import { APP_ORDER, APP_REGISTRY } from "@/data/apps";
import { OWNER } from "@/data/portfolio-content";
import { useWindowManager } from "@/context/WindowContext";
import { XP_ICONS } from "@/lib/xp-icons";
import { ShutdownDialog, LogoffDialog } from "@/components/Taskbar/ShutdownDialog";
import { RunDialog } from "@/components/Taskbar/RunDialog";
import type { AppId } from "@/types";

type Props = {
  open: boolean;
  onClose: () => void;
  /** After Start → Turn Off blackout — return to login (welcome) screen. */
  onShutdownTurnOffComplete?: () => void;
};

/** Left column: all apps except IE (IE is pinned at top). */
const LEFT_COLUMN_APPS = APP_ORDER.filter((id) => id !== "internet-explorer");

/**
 * Windows XP Pro–style Start menu: orange header band, two columns (programs | system),
 * green "All Programs" strip, dark footer.
 */
export function StartMenu({ open, onClose, onShutdownTurnOffComplete }: Props) {
  const { openApp } = useWindowManager();
  const ref = useRef<HTMLDivElement>(null);
  const [showShutdown, setShowShutdown] = useState(false);
  const [showLogoff, setShowLogoff] = useState(false);
  const [showRun, setShowRun] = useState(false);

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

  if (!open && !showShutdown && !showLogoff && !showRun) return null;

  const ie = APP_REGISTRY["internet-explorer"];

  return (
    <>
      <ShutdownDialog
        open={showShutdown}
        onClose={() => setShowShutdown(false)}
        onAfterTurnOff={onShutdownTurnOffComplete}
      />
      <LogoffDialog
        open={showLogoff}
        onClose={() => setShowLogoff(false)}
      />
      <RunDialog
        open={showRun}
        onClose={() => setShowRun(false)}
      />

      {open && (
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={XP_ICONS.outlookExpress} alt="" width={32} height={32} />
                  <span className="xp-sm-pinned-text">
                    <span className="xp-sm-pinned-title">E-mail</span>
                    <span className="xp-sm-pinned-sub">Outlook Express</span>
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
                        openApp("internet-explorer");
                        onClose();
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={XP_ICONS.internetExplorer} alt="" width={16} height={16} className="xp-sm-sub-ico" />
                      Internet Explorer
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="xp-sm-sub-item"
                      onClick={() => {
                        openApp("winamp");
                        onClose();
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={XP_ICONS.winamp} alt="" width={16} height={16} className="xp-sm-sub-ico" />
                      Winamp
                    </button>
                  </li>
                  <li className="xp-sm-sub-sep" />
                  <li>
                    <button
                      type="button"
                      className="xp-sm-sub-item"
                      onClick={() => {
                        window.open(OWNER.github, "_blank", "noopener,noreferrer");
                        onClose();
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={XP_ICONS.internetExplorer} alt="" width={16} height={16} className="xp-sm-sub-ico" />
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
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={XP_ICONS.internetExplorer} alt="" width={16} height={16} className="xp-sm-sub-ico" />
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
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={XP_ICONS.txt} alt="" width={16} height={16} className="xp-sm-sub-ico" />
                      Résumé (PDF)
                    </button>
                  </li>
                  <li className="xp-sm-sub-sep" />
                  <li>
                    <button
                      type="button"
                      className="xp-sm-sub-item"
                      onClick={() => {
                        openApp("notepad");
                        onClose();
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={XP_ICONS.notepad} alt="" width={16} height={16} className="xp-sm-sub-ico" />
                      Notepad
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="xp-sm-sub-item"
                      onClick={() => {
                        openApp("minesweeper");
                        onClose();
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={XP_ICONS.minesweeper} alt="" width={16} height={16} className="xp-sm-sub-ico" />
                      Minesweeper
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="xp-sm-sub-item"
                      onClick={() => {
                        openApp("pinball");
                        onClose();
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={XP_ICONS.pinball} alt="" width={16} height={16} className="xp-sm-sub-ico" />
                      Pinball
                    </button>
                  </li>
                </ul>
              </details>
            </div>

            <aside className="xp-sm-col-right" aria-label="System shortcuts">
              <RightItem
                label="My Documents"
                icon={XP_ICONS.myDocuments}
                bold
                onClick={() => openAndClose("my-documents")}
              />
              <RightItem
                label="My Recent Documents"
                icon={XP_ICONS.recentDocs}
                onClick={() => openAndClose("my-documents")}
              />
              <RightItem
                label="My Pictures"
                icon={XP_ICONS.myPictures}
                bold
                onClick={() => openAndClose("my-pictures")}
              />
              <RightItem
                label="My Music"
                icon={XP_ICONS.myMusic}
                bold
                onClick={() => openAndClose("winamp")}
              />
              <RightItem
                label="My Computer"
                icon={XP_ICONS.myComputer}
                bold
                onClick={() => openAndClose("my-computer")}
              />
              <div className="xp-sm-r-sep" />
              <RightItem
                label="Control Panel"
                icon={XP_ICONS.controlPanel}
                onClick={() => {
                  openApp("control-panel");
                  onClose();
                }}
              />
              <RightItem
                label="Printers and Faxes"
                icon={XP_ICONS.printer}
                onClick={() => {
                  openApp("control-panel");
                  onClose();
                }}
              />
              <div className="xp-sm-r-sep" />
              <RightItem
                label="Help and Support"
                icon={XP_ICONS.helpSupport}
                onClick={() => {
                  openApp("internet-explorer");
                  onClose();
                }}
              />
              <RightItem
                label="Search"
                icon={XP_ICONS.search}
                onClick={() => {
                  window.open(
                    "https://www.google.com",
                    "_blank",
                    "noopener,noreferrer"
                  );
                  onClose();
                }}
              />
              <RightItem
                label="Run..."
                icon={XP_ICONS.run}
                onClick={() => {
                  onClose();
                  // Small delay so menu closes first
                  setTimeout(() => setShowRun(true), 100);
                }}
              />
            </aside>
          </div>

          <div className="xp-sm-bottom">
            <button
              type="button"
              className="xp-sm-foot-btn"
              onClick={() => {
                onClose();
                setTimeout(() => setShowLogoff(true), 100);
              }}
              title="Log Off"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={XP_ICONS.logout} alt="" width={24} height={24} className="xp-sm-foot-img" />
              Log Off
            </button>
            <button
              type="button"
              className="xp-sm-foot-btn"
              onClick={() => {
                onClose();
                setTimeout(() => setShowShutdown(true), 100);
              }}
              title="Turn Off Computer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={XP_ICONS.power} alt="" width={24} height={24} className="xp-sm-foot-img" />
              Turn Off Computer
            </button>
          </div>
        </div>
      )}
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
  bold,
  onClick,
}: {
  label: string;
  icon: string;
  bold?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className="xp-sm-r-item" onClick={onClick}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="xp-sm-r-ico-img" src={icon} alt="" width={24} height={24} />
      <span className={`xp-sm-r-label ${bold ? "xp-sm-r-label--bold" : ""}`}>{label}</span>
    </button>
  );
}
