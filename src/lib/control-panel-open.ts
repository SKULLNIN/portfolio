import type { CpAppletId } from "@/data/control-panel-content";

const STORAGE_KEY = "xp-cp-pending-applet";

export const CP_OPEN_APPLET_EVENT = "xp-open-cp-applet";

export function clearPendingControlPanelAppletStorage() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export type CpOpenAppletDetail = { id: CpAppletId; tab?: number };

/** Queue opening a Control Panel applet (Skills, System, etc.). Survives first paint; also dispatches an event for an already-mounted Control Panel. */
export function queueControlPanelApplet(id: CpAppletId, tab = 0) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ id, tab }));
  } catch {
    /* private mode */
  }
  window.dispatchEvent(
    new CustomEvent<CpOpenAppletDetail>(CP_OPEN_APPLET_EVENT, {
      detail: { id, tab },
    })
  );
}

export function readPendingControlPanelApplet(): CpOpenAppletDetail | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<CpOpenAppletDetail>;
    if (!p?.id) return null;
    clearPendingControlPanelAppletStorage();
    return { id: p.id, tab: p.tab ?? 0 };
  } catch {
    return null;
  }
}
