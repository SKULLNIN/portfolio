/** Served from `public/sounds/` */
const WINDOWS_XP_SHUTDOWN_MP3 = "/sounds/windows-xp-shutdown.mp3";
const WINDOWS_XP_START_MP3 = "/sounds/windows-xp-start.mp3";

/**
 * Plays the classic Windows XP shutdown sound (best-effort; may fail until user gesture if blocked).
 */
export function playWindowsXpShutdownSound(): void {
  if (typeof window === "undefined") return;
  try {
    const audio = new Audio(WINDOWS_XP_SHUTDOWN_MP3);
    audio.volume = 1;
    void audio.play().catch(() => {});
  } catch {
    /* ignore */
  }
}

/**
 * Windows XP logon / startup sound. Call from a click handler (e.g. Guest) so autoplay is allowed.
 */
export function playWindowsXpStartSound(): void {
  if (typeof window === "undefined") return;
  try {
    const audio = new Audio(WINDOWS_XP_START_MP3);
    audio.volume = 1;
    void audio.play().catch(() => {});
  } catch {
    /* ignore */
  }
}
