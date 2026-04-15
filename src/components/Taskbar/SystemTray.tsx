"use client";

import { TaskbarClock } from "@/components/Taskbar/TaskbarClock";
import { BtcTicker } from "@/components/Taskbar/BtcTicker";

/** Right side of taskbar: crypto ticker + clock (Windows XP style). */
export function SystemTray() {
  return (
    <div className="xp-tray flex items-stretch">
      <BtcTicker />
      <TaskbarClock />
    </div>
  );
}
