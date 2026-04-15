/** Height of bottom taskbar in px — Windows XP Luna default (~30px @ 96 DPI). */
export const TASKBAR_HEIGHT_PX = 30;

/**
 * Fixed stacking for the taskbar shell — must stay above every app window
 * ({@link WINDOW_Z_INDEX_CAP}).
 */
export const TASKBAR_SHELL_Z_INDEX = 100_000;

/**
 * App windows ({@link WindowShell} / react-rnd) must never exceed this so the taskbar
 * stays clickable. Keep well below {@link TASKBAR_SHELL_Z_INDEX}.
 */
export const WINDOW_Z_INDEX_CAP = 50_000;

/**
 * Boot / welcome screen — must sit above {@link TASKBAR_SHELL_Z_INDEX} and other shell UI
 * so nothing from the desktop leaks through during “Starting Windows”.
 */
export const BOOT_SPLASH_Z_INDEX = 200_000;

/** Welcome / login screen — above taskbar but below boot splash. */
export const WELCOME_SCREEN_Z_INDEX = 190_000;

/**
 * Small “Full screen” control on the desktop — above app windows, below the modal prompt.
 */
export const FULLSCREEN_CHIP_Z_INDEX = 205_000;

/**
 * Fullscreen modal — above {@link BOOT_SPLASH_Z_INDEX} so it is never hidden behind shell UI.
 */
export const FULLSCREEN_PROMPT_Z_INDEX = 210_000;

/**
 * Tray flyouts (volume, etc.) — well above {@link TASKBAR_SHELL_Z_INDEX} so portaled UI
 * paints over the taskbar and app windows; below {@link BOOT_SPLASH_Z_INDEX}.
 */
export const TASKBAR_TRAY_POPOVER_Z_INDEX = 150_000;

