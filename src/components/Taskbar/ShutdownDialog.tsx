"use client";

import { createPortal } from "react-dom";
import {
  SHUTDOWN_FADE_MS,
  SHUTDOWN_RESTORE_DELAY_MS,
} from "@/lib/constants";
import { playWindowsXpShutdownSound } from "@/lib/xp-shutdown-sound";
import { XP_ICONS } from "@/lib/xp-icons";

type Props = {
  open: boolean;
  onClose: () => void;
  /** After fade-out + blackout, before restoring opacity — e.g. return to login screen. */
  onAfterTurnOff?: () => void;
};

/**
 * Windows XP "Turn off computer" dialog — three big round buttons:
 * Stand By | Turn Off | Restart
 * Matching the real XP shutdown dialog with the green/red/yellow buttons.
 */
export function ShutdownDialog({ open, onClose, onAfterTurnOff }: Props) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="xp-shutdown-overlay"
      onClick={onClose}
    >
      <div
        className="xp-shutdown-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="xp-shutdown-header">
          <span className="xp-shutdown-title">Turn off computer</span>
        </div>
        <div className="xp-shutdown-body">
          <div className="xp-shutdown-question">
            What do you want the computer to do?
          </div>
          <div className="xp-shutdown-buttons">
            <button
              type="button"
              className="xp-shutdown-btn xp-shutdown-btn--standby"
              onClick={onClose}
              title="Stand By"
            >
              <div className="xp-shutdown-btn-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
                  <circle cx="16" cy="16" r="14" fill="#e8a02a" stroke="#c47c00" strokeWidth="1.5"/>
                  <path d="M10 20h12M10 16h12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="xp-shutdown-btn-label">Stand By</span>
            </button>
            <button
              type="button"
              className="xp-shutdown-btn xp-shutdown-btn--turnoff"
              onClick={() => {
                playWindowsXpShutdownSound();
                document.body.style.transition = `opacity ${SHUTDOWN_FADE_MS}ms ease`;
                document.body.style.opacity = "0";
                setTimeout(() => {
                  onAfterTurnOff?.();
                  document.body.style.opacity = "1";
                  document.body.style.transition = "";
                  onClose();
                }, SHUTDOWN_RESTORE_DELAY_MS);
              }}
              title="Turn Off"
            >
              <div className="xp-shutdown-btn-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
                  <circle cx="16" cy="16" r="14" fill="#d42020" stroke="#a01010" strokeWidth="1.5"/>
                  <circle cx="16" cy="17" r="7" stroke="#fff" strokeWidth="2" fill="none"/>
                  <rect x="15" y="6" width="2" height="10" rx="1" fill="#fff"/>
                </svg>
              </div>
              <span className="xp-shutdown-btn-label">Turn Off</span>
            </button>
            <button
              type="button"
              className="xp-shutdown-btn xp-shutdown-btn--restart"
              onClick={() => {
                window.location.reload();
              }}
              title="Restart"
            >
              <div className="xp-shutdown-btn-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
                  <circle cx="16" cy="16" r="14" fill="#24a024" stroke="#1a7a1a" strokeWidth="1.5"/>
                  <path d="M20 12a7 7 0 1 0 1 6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M18 8l4 4-4 4" fill="#fff"/>
                </svg>
              </div>
              <span className="xp-shutdown-btn-label">Restart</span>
            </button>
          </div>
        </div>
        <div className="xp-shutdown-footer">
          <button
            type="button"
            className="xp-shutdown-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Windows XP "Log Off Windows" dialog — two buttons: Switch User | Log Off
 */
export function LogoffDialog({ open, onClose }: Props) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="xp-shutdown-overlay"
      onClick={onClose}
    >
      <div
        className="xp-logoff-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="xp-logoff-header">
          <span className="xp-logoff-title">Log Off Windows</span>
        </div>
        <div className="xp-logoff-body">
          <div className="xp-logoff-question">
            Are you sure you want to log off?
          </div>
          <div className="xp-logoff-buttons">
            <button
              type="button"
              className="xp-logoff-btn xp-logoff-btn--switch"
              onClick={onClose}
              title="Switch User"
            >
              <div className="xp-logoff-btn-icon">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={XP_ICONS.userAccounts} alt="" width={32} height={32} />
              </div>
              <span className="xp-logoff-btn-label">Switch User</span>
            </button>
            <button
              type="button"
              className="xp-logoff-btn xp-logoff-btn--logoff"
              onClick={() => {
                window.location.reload();
              }}
              title="Log Off"
            >
              <div className="xp-logoff-btn-icon">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={XP_ICONS.logout} alt="" width={32} height={32} />
              </div>
              <span className="xp-logoff-btn-label">Log Off</span>
            </button>
          </div>
        </div>
        <div className="xp-logoff-footer">
          <button
            type="button"
            className="xp-shutdown-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
