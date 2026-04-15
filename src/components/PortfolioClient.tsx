"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WindowProvider } from "@/context/WindowContext";
import { TaskbarVisibilityProvider } from "@/context/TaskbarVisibilityContext";
import { DeviceLayoutProvider, useDeviceLayout } from "@/context/DeviceLayoutContext";
import { SystemSettingsProvider } from "@/context/SystemSettingsContext";
import { useWindowManager } from "@/context/WindowContext";
import { Desktop } from "@/components/Desktop/Desktop";
import { Taskbar } from "@/components/Taskbar/Taskbar";
import { TouchPointerOverlay } from "@/components/TouchPointerOverlay";
import { XpBootSplash } from "@/components/XpBootSplash";
import { XpWelcomeScreen } from "@/components/XpWelcomeScreen";
import { TASKBAR_HEIGHT_PX, TASKBAR_SHELL_Z_INDEX } from "@/lib/constants";

/**
 * Boot phases:
 *   1. "boot"    — Shows the black boot splash with progress bar
 *   2. "welcome" — Shows the XP Welcome/Login screen (blue gradient)
 *   3. "desktop" — Shows the full desktop + taskbar
 */
type BootPhase = "boot" | "welcome" | "desktop";

function ShellInner() {
  const { openApp } = useWindowManager();
  const { segment, isTouchUi } = useDeviceLayout();
  const [phase, setPhase] = useState<BootPhase>("boot");
  const openedIe = useRef(false);

  const onBootDone = useCallback(() => {
    setPhase("welcome");
  }, []);

  const onLoginDone = useCallback(() => {
    setPhase("desktop");
  }, []);

  /** Reset document scroll after boot / viewport changes (mobile URL bar, rotation). */
  useEffect(() => {
    if (phase !== "desktop") return;
    const scrollTopLeft = () => {
      window.scrollTo({ left: 0, top: 0, behavior: "auto" });
      document.documentElement.scrollLeft = 0;
      document.documentElement.scrollTop = 0;
      document.body.scrollLeft = 0;
      document.body.scrollTop = 0;
    };
    scrollTopLeft();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", scrollTopLeft);
    window.addEventListener("orientationchange", scrollTopLeft);
    return () => {
      vv?.removeEventListener("resize", scrollTopLeft);
      window.removeEventListener("orientationchange", scrollTopLeft);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "desktop" || openedIe.current) return;
    openedIe.current = true;
    openApp("internet-explorer");
  }, [phase, openApp]);

  const booted = phase === "desktop";

  return (
    <>
      {phase === "boot" && <XpBootSplash onDone={onBootDone} />}
      {phase === "welcome" && <XpWelcomeScreen onLogin={onLoginDone} />}
      <div
        className="xp-shell relative box-border flex h-dvh w-full min-h-0 min-w-0 max-w-[100vw] flex-col overflow-x-hidden overflow-y-hidden"
        data-segment={segment}
        {...(isTouchUi ? { "data-touch-ui": "" } : {})}
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingRight: "env(safe-area-inset-right, 0px)",
          /* Match taskbar height; no inset until boot (taskbar off). */
          paddingBottom:
            booted
              ? `calc(${TASKBAR_HEIGHT_PX}px + env(safe-area-inset-bottom, 0px))`
              : `env(safe-area-inset-bottom, 0px)`,
          paddingLeft: "env(safe-area-inset-left, 0px)",
        }}
      >
        <Desktop />
        {booted ? (
          <div
            className="pointer-events-auto fixed bottom-[-1px] left-0 right-0 overflow-visible"
            style={{ zIndex: TASKBAR_SHELL_Z_INDEX }}
          >
            <Taskbar />
          </div>
        ) : null}
        {isTouchUi && booted ? <TouchPointerOverlay /> : null}
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
