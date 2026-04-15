"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WindowProvider } from "@/context/WindowContext";
import { TaskbarVisibilityProvider } from "@/context/TaskbarVisibilityContext";
import { DeviceLayoutProvider, useDeviceLayout } from "@/context/DeviceLayoutContext";
import { SystemSettingsProvider } from "@/context/SystemSettingsContext";
import { useWindowManager } from "@/context/WindowContext";
import { Desktop } from "@/components/Desktop/Desktop";
import { Taskbar } from "@/components/Taskbar/Taskbar";
import { TaskbarAutoHide } from "@/components/Taskbar/TaskbarAutoHide";
import { TouchPointerOverlay } from "@/components/TouchPointerOverlay";
import { XpBootSplash } from "@/components/XpBootSplash";

function ShellInner() {
  const { openApp } = useWindowManager();
  const { segment, isTouchUi } = useDeviceLayout();
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
      <div
        className="xp-shell relative box-border flex h-dvh min-h-0 min-w-0 flex-col overflow-hidden"
        data-segment={segment}
        {...(isTouchUi ? { "data-touch-ui": "" } : {})}
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingRight: "env(safe-area-inset-right, 0px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          paddingLeft: "env(safe-area-inset-left, 0px)",
        }}
      >
        <Desktop />
        <TaskbarAutoHide>
          <Taskbar />
        </TaskbarAutoHide>
        {isTouchUi ? <TouchPointerOverlay /> : null}
      </div>
    </>
  );
}

export function PortfolioClient() {
  return (
    <DeviceLayoutProvider>
      <TaskbarVisibilityProvider>
        <WindowProvider>
          <SystemSettingsProvider>
            <ShellInner />
          </SystemSettingsProvider>
        </WindowProvider>
      </TaskbarVisibilityProvider>
    </DeviceLayoutProvider>
  );
}
