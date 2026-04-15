"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getViewportSegment,
  getVisualViewportSize,
  readTouchUiPreference,
  type ViewportSegment,
} from "@/lib/viewport-profile";

export type DeviceLayoutValue = {
  segment: ViewportSegment;
  width: number;
  height: number;
  /** Use larger tap targets and touch-first desktop interactions */
  isTouchUi: boolean;
  isAndroid: boolean;
};

const DeviceLayoutCtx = createContext<DeviceLayoutValue | null>(null);

function readLayout(): DeviceLayoutValue {
  if (typeof window === "undefined") {
    return {
      segment: "desktop",
      width: 1024,
      height: 768,
      isTouchUi: false,
      isAndroid: false,
    };
  }
  const { width, height } = getVisualViewportSize();
  return {
    segment: getViewportSegment(width),
    width,
    height,
    isTouchUi: readTouchUiPreference(),
    isAndroid: /Android/i.test(navigator.userAgent),
  };
}

const SSR_LAYOUT: DeviceLayoutValue = {
  segment: "desktop",
  width: 1024,
  height: 768,
  isTouchUi: false,
  isAndroid: false,
};

export function DeviceLayoutProvider({ children }: { children: ReactNode }) {
  /** Stable SSR + first client paint — real values applied in useEffect to avoid hydration mismatch. */
  const [layout, setLayout] = useState<DeviceLayoutValue>(SSR_LAYOUT);

  useEffect(() => {
    const update = () => setLayout(readLayout());
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    const mq = window.matchMedia("(pointer: coarse)");
    mq.addEventListener("change", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      mq.removeEventListener("change", update);
    };
  }, []);

  const value = useMemo(() => layout, [layout]);

  return (
    <DeviceLayoutCtx.Provider value={value}>{children}</DeviceLayoutCtx.Provider>
  );
}

export function useDeviceLayout(): DeviceLayoutValue {
  const ctx = useContext(DeviceLayoutCtx);
  if (!ctx) {
    throw new Error("useDeviceLayout must be used within DeviceLayoutProvider");
  }
  return ctx;
}

/** For optional UI outside the provider (should not happen in app shell). */
export function useDeviceLayoutSafe(): DeviceLayoutValue {
  const ctx = useContext(DeviceLayoutCtx);
  return (
    ctx ?? {
      segment: "desktop",
      width: 1024,
      height: 768,
      isTouchUi: false,
      isAndroid: false,
    }
  );
}
