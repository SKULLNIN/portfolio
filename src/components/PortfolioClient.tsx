"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WindowProvider } from "@/context/WindowContext";
import { TaskbarVisibilityProvider } from "@/context/TaskbarVisibilityContext";
import { SystemSettingsProvider } from "@/context/SystemSettingsContext";
import { useWindowManager } from "@/context/WindowContext";
import { Desktop } from "@/components/Desktop/Desktop";
import { Taskbar } from "@/components/Taskbar/Taskbar";
import { TaskbarAutoHide } from "@/components/Taskbar/TaskbarAutoHide";
import { XpBootSplash } from "@/components/XpBootSplash";

function ShellInner() {
  const { openApp } = useWindowManager();
  const [booted, setBooted] = useState(false);
  const openedIe = useRef(false);

  const onBootDone = useCallback(() => {
    setBooted(true);
  }, []);

  useEffect(() => {
    if (!booted || openedIe.current) return;
    openedIe.current = true;
    openApp("internet-explorer");
  }, [booted, openApp]);

  return (
    <>
      {!booted && <XpBootSplash onDone={onBootDone} />}
      <div className="relative flex h-dvh min-h-0 flex-col overflow-hidden">
        <Desktop />
        <TaskbarAutoHide>
          <Taskbar />
        </TaskbarAutoHide>
        <p className="pointer-events-none fixed bottom-10 left-0 right-0 z-[50] mx-auto max-w-sm rounded border border-[#aca899] bg-[#fff9e6] px-3 py-2 text-center text-[11px] text-[#333] shadow md:hidden">
          Best viewed on desktop — this XP UI is interactive on a large screen.
        </p>
      </div>
    </>
  );
}

export function PortfolioClient() {
  return (
    <WindowProvider>
      <TaskbarVisibilityProvider>
        <SystemSettingsProvider>
          <ShellInner />
        </SystemSettingsProvider>
      </TaskbarVisibilityProvider>
    </WindowProvider>
  );
}
