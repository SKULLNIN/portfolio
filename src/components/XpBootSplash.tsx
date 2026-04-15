"use client";

import { useEffect } from "react";
import { BOOT_SPLASH_Z_INDEX } from "@/lib/constants";

type Props = {
  /** ms before the portfolio shell is shown */
  duration?: number;
  onDone: () => void;
};

/**
 * Windows XP Professional–style boot screen — pure HTML/CSS (logo, bar, footer)
 * matching the classic layout and sliding progress blocks.
 */
export function XpBootSplash({ duration = 2800, onDone }: Props) {
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    let finished = false;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      if (t < 1) raf = requestAnimationFrame(tick);
      else if (!finished) {
        finished = true;
        onDone();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, onDone]);

  return (
    <div
      className="xp-boot-splash fixed inset-0 bg-black"
      style={{ zIndex: BOOT_SPLASH_Z_INDEX }}
      role="progressbar"
      aria-busy="true"
      aria-label="Starting Windows"
      aria-valuetext="Loading"
    >
      <div className="xp-boot-screen-container">
        <div className="xp-boot-logo-section">
          <div className="xp-boot-windows-flag">
            <div className="xp-boot-flag-pane xp-boot-flag-red" />
            <div className="xp-boot-flag-pane xp-boot-flag-green" />
            <div className="xp-boot-flag-pane xp-boot-flag-blue" />
            <div className="xp-boot-flag-pane xp-boot-flag-yellow" />
          </div>
          <div className="xp-boot-brand-text">
            <div className="xp-boot-microsoft-text">
              Microsoft<sup>®</sup>
            </div>
            <div className="xp-boot-windows-text-line">
              <span className="xp-boot-windows-text">Windows</span>
              <span className="xp-boot-xp-text">xp</span>
            </div>
            <div className="xp-boot-professional-text">Professional</div>
          </div>
        </div>

        <div className="xp-boot-progress-section">
          <div className="xp-boot-progress-bar-container">
            <div className="xp-boot-progress-bar-track">
              <div className="xp-boot-progress-blocks">
                <div className="xp-boot-progress-block" />
                <div className="xp-boot-progress-block" />
                <div className="xp-boot-progress-block" />
              </div>
            </div>
          </div>
        </div>

        <div className="xp-boot-footer">
          <div className="xp-boot-copyright-text">
            Copyright © 1985-2001
            <br />
            Microsoft Corporation
          </div>
          <div className="xp-boot-microsoft-logo">Microsoft</div>
        </div>
      </div>
    </div>
  );
}
