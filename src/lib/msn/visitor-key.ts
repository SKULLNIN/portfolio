/** Stable per-browser id so bootstrap can reconnect the same MSN thread after reopen. */
const STORAGE_KEY = "msn-visitor-key-v1";

export function getOrCreateVisitorKey(): string {
  if (typeof window === "undefined") return "";
  try {
    let k = localStorage.getItem(STORAGE_KEY);
    if (!k || k.length < 16) {
      k = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, k);
    }
    return k;
  } catch {
    return crypto.randomUUID();
  }
}
