"use client";

import { useCallback, useState } from "react";
import {
  SHUTDOWN_FADE_MS,
  SHUTDOWN_RESTORE_DELAY_MS,
  WELCOME_SCREEN_Z_INDEX,
} from "@/lib/constants";
import { requestAppFullscreen } from "@/lib/fullscreen";
import {
  playWindowsXpShutdownSound,
  playWindowsXpStartSound,
} from "@/lib/xp-shutdown-sound";

type Props = {
  onLogin: () => void;
  /** After welcome “Turn off computer” blackout — replay boot (quick refresh). */
  onTurnOffBlackoutComplete?: () => void;
};

/**
 * Windows XP Welcome / Login screen — shown after the boot splash.
 * Matches the classic blue-gradient layout:
 *   - Left: Windows XP logo + instruction
 *   - Right: Guest account card (single click to continue)
 *   - Bottom-left: "Turn off computer"
 *   - Bottom-right: Hint text about user accounts
 */
export function XpWelcomeScreen({
  onLogin,
  onTurnOffBlackoutComplete,
}: Props) {
  const [phase, setPhase] = useState<"welcome" | "logging-in">("welcome");

  const handleGuestClick = useCallback(() => {
    void requestAppFullscreen().catch(() => {});
    playWindowsXpStartSound();
    setPhase("logging-in");
    setTimeout(() => {
      onLogin();
    }, 1200);
  }, [onLogin]);

  return (
    <div
      className="xp-welcome-screen"
      style={{ zIndex: WELCOME_SCREEN_Z_INDEX }}
    >
      {/* Top dark blue strip */}
      <div className="xp-welcome-top-strip" />

      {/* Main content area */}
      <div className="xp-welcome-content">
        {/* Left side: Windows XP branding */}
        <div className="xp-welcome-left">
          <div className="xp-welcome-logo">
            <div className="xp-welcome-flag">
              <div className="xp-boot-flag-pane xp-boot-flag-red" />
              <div className="xp-boot-flag-pane xp-boot-flag-green" />
              <div className="xp-boot-flag-pane xp-boot-flag-blue" />
              <div className="xp-boot-flag-pane xp-boot-flag-yellow" />
            </div>
            <div className="xp-welcome-brand">
              <span className="xp-welcome-windows-text">Windows</span>
              <span className="xp-welcome-xp-text">xp</span>
            </div>
          </div>
          <p className="xp-welcome-instruction">
            To begin, click Guest
          </p>
        </div>

        {/* Right side: User card */}
        <div className="xp-welcome-right">
          {phase === "logging-in" ? (
            <div className="xp-welcome-loading">
              <p className="xp-welcome-loading-text">Loading your personal settings...</p>
            </div>
          ) : (
            <button
              type="button"
              className="xp-welcome-user-card"
              onClick={handleGuestClick}
              aria-label="Log on as Guest"
            >
              <div className="xp-welcome-user-avatar">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/user-profile.svg"
                  alt=""
                  width={64}
                  height={64}
                  className="xp-welcome-avatar-img"
                />
              </div>
              <div className="xp-welcome-user-info">
                <span className="xp-welcome-user-name">Guest</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="xp-welcome-bottom">
        <button
          type="button"
          className="xp-welcome-turnoff"
          onClick={() => {
            playWindowsXpShutdownSound();
            document.body.style.transition = `opacity ${SHUTDOWN_FADE_MS}ms ease`;
            document.body.style.opacity = "0";
            setTimeout(() => {
              onTurnOffBlackoutComplete?.();
              document.body.style.opacity = "1";
              document.body.style.transition = "";
            }, SHUTDOWN_RESTORE_DELAY_MS);
          }}
        >
          <span className="xp-welcome-turnoff-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle cx="8" cy="8" r="7" fill="#d42020" stroke="#a01010" strokeWidth="1"/>
              <circle cx="8" cy="9" r="3.5" stroke="#fff" strokeWidth="1.5" fill="none"/>
              <rect x="7.25" y="3" width="1.5" height="5" rx="0.75" fill="#fff"/>
            </svg>
          </span>
          Turn off computer
        </button>
        <p className="xp-welcome-bottom-hint">
          After you log on, you can add or change accounts.<br />
          Just go to Control Panel and click User Accounts.
        </p>
      </div>
    </div>
  );
}
