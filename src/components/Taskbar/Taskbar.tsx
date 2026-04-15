"use client";

import { useMemo, useState } from "react";
import { ALL_APP_IDS } from "@/data/apps";
import { useWindowManager } from "@/context/WindowContext";
import { StartButton } from "@/components/Taskbar/StartButton";
import { StartMenu } from "@/components/Taskbar/StartMenu";
import { TaskbarTab } from "@/components/Taskbar/TaskbarTab";
import { SystemTray } from "@/components/Taskbar/SystemTray";
import type { AppId } from "@/types";

export function Taskbar() {
  const { windows } = useWindowManager();
  const [startOpen, setStartOpen] = useState(false);

  const focusedId = useMemo(() => {
    let max = -1;
    let id: AppId | null = null;
    for (const w of Object.values(windows)) {
      if (w.isOpen && !w.isMinimized && w.zIndex > max) {
        max = w.zIndex;
        id = w.id;
      }
    }
    return id;
  }, [windows]);

  return (
    <div className="xp-taskbar relative">
      <StartMenu open={startOpen} onClose={() => setStartOpen(false)} />
      <StartButton
        open={startOpen}
        onToggle={() => setStartOpen((v) => !v)}
      />
      <ul className="xp-taskbar-items">
        {ALL_APP_IDS.map((id) => {
          const w = windows[id];
          if (!w.isOpen) return null;
          return (
            <li key={id}>
              <TaskbarTab w={w} isActive={focusedId === id} />
            </li>
          );
        })}
      </ul>
      <SystemTray />
    </div>
  );
}
