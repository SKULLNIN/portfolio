/**
 * Webamp (Winamp) uses an internal `<audio>` node wired through the Web Audio API.
 * {@link SystemSettingsContext} and the tray mute helpers walk every `audio`/`video` on
 * the page — that fights Winamp's own volume / mute controls. Skip anything under the
 * Webamp mount root.
 */
export function isMediaOutsideWebampHost(el: Element): boolean {
  return el.closest(".webamp-host") === null;
}
