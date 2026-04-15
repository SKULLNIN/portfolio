/**
 * IE6 Luna–style toolbar glyphs (original artwork — not Microsoft bitmaps).
 * Sized for ~24–26px toolbar height.
 */

export function IeIconBack() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <defs>
        <radialGradient id="gback" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#7ecf72" />
          <stop offset="55%" stopColor="#3d9a38" />
          <stop offset="100%" stopColor="#2a7028" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="url(#gback)" stroke="#1a5018" strokeWidth="1" />
      <path
        fill="#fff"
        d="M13.5 7.5 L8 12 L13.5 16.5 L13.5 13.5 L16.5 13.5 L16.5 10.5 L13.5 10.5 Z"
      />
    </svg>
  );
}

export function IeIconForward({ muted }: { muted?: boolean }) {
  const fill = muted ? "url(#gfwdm)" : "url(#gfwd)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <defs>
        <radialGradient id="gfwd" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#8fdf84" />
          <stop offset="100%" stopColor="#448a3e" />
        </radialGradient>
        <radialGradient id="gfwdm" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#d8d8d8" />
          <stop offset="100%" stopColor="#a8a8a8" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill={fill} stroke={muted ? "#999" : "#2a6028"} strokeWidth="1" />
      <path
        fill={muted ? "#eee" : "#fff"}
        d="M10.5 7.5 L16 12 L10.5 16.5 L10.5 13.5 L7.5 13.5 L7.5 10.5 L10.5 10.5 Z"
      />
    </svg>
  );
}

/** IE6: red X in a square with light blue border (not a round “stop” orb). */
export function IeIconStop() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="1"
        fill="#fbfbf7"
        stroke="#7eb3e8"
        strokeWidth="1.25"
      />
      <path
        stroke="#c00000"
        strokeWidth="2.4"
        strokeLinecap="round"
        d="M8 8 L16 16 M16 8 L8 16"
      />
    </svg>
  );
}

/** IE6: green refresh arrows in a square (not a blue circle). */
export function IeIconRefresh() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="1"
        fill="#fafaf6"
        stroke="#8db6d8"
        strokeWidth="1"
      />
      <g fill="none" stroke="#2a8a2a" strokeWidth="2" strokeLinecap="round">
        <path d="M15.5 9.5 A5 5 0 1 0 16 13.5" />
        <path d="M8.5 14.5 A5 5 0 1 1 8 10.5" />
      </g>
      <path fill="#2a8a2a" d="M17.2 8.2 L17.2 12 L13.8 10 Z" />
      <path fill="#2a8a2a" d="M6.8 15.8 L6.8 12 L10.2 14 Z" />
    </svg>
  );
}

/** Orange roof, blue wall — compact “home” glyph. */
export function IeIconHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#d86818"
        stroke="#a04008"
        strokeWidth="0.75"
        d="M4 12 L12 5 L20 12 V19 H15 V14 H9 V19 H4 Z"
      />
      <rect x="9" y="14" width="6" height="5" fill="#4a8ecf" stroke="#1a5080" strokeWidth="0.6" />
      <rect x="10.5" y="15.5" width="3" height="3.5" fill="#6ab0f0" opacity="0.5" />
    </svg>
  );
}

/** Magnifier over a white document (IE6 Search toolbar). */
export function IeIconSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="5" width="11" height="14" rx="0.5" fill="#fff" stroke="#888" strokeWidth="0.75" />
      <line x1="5" y1="8" x2="12" y2="8" stroke="#ccc" strokeWidth="0.8" />
      <line x1="5" y1="10.5" x2="11" y2="10.5" stroke="#ccc" strokeWidth="0.8" />
      <circle cx="15.5" cy="15" r="4" fill="none" stroke="#333" strokeWidth="1.6" />
      <path stroke="#1a5fc0" strokeWidth="2.2" strokeLinecap="round" d="M18.5 18 L21 20.5" />
    </svg>
  );
}

export function IeIconFavorites() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#ffd700"
        stroke="#c9a000"
        strokeWidth="0.5"
        d="M12 4 L14.5 9.5 L20 10.2 L16 14 L17 19.5 L12 16.8 L7 19.5 L8 14 L4 10.2 L9.5 9.5 Z"
      />
    </svg>
  );
}

/** Blue globe + green “media” strip (IE6-style). */
export function IeIconMedia() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <circle cx="9.5" cy="12" r="7.5" fill="#4a90d8" stroke="#1a5080" strokeWidth="1" />
      <path
        fill="none"
        stroke="#c8e4ff"
        strokeWidth="0.85"
        d="M2.5 12h14 M9.5 6c1.6 2.8 1.6 7.2 0 10 M9.5 6c-1.6 2.8-1.6 7.2 0 10"
      />
      <rect
        x="14.5"
        y="5.5"
        width="5.5"
        height="13"
        rx="1"
        fill="#2d8a28"
        stroke="#164818"
        strokeWidth="0.65"
      />
      <rect x="15.7" y="7.2" width="1.1" height="2" fill="#fff" opacity="0.9" />
      <rect x="17.3" y="7.2" width="1.1" height="2" fill="#fff" opacity="0.9" />
      <rect x="15.7" y="10.3" width="1.1" height="2" fill="#fff" opacity="0.9" />
      <rect x="17.3" y="10.3" width="1.1" height="2" fill="#fff" opacity="0.9" />
      <path fill="#fff" d="M15.3 14.5 L15.3 17.8 L18.5 16.1 Z" opacity="0.95" />
    </svg>
  );
}

/** Green clock + counterclockwise arrow (History). */
export function IeIconHistory() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="#6cc070" stroke="#2a8038" strokeWidth="1" />
      <circle cx="12" cy="12" r="6.2" fill="#e8f8e8" stroke="#3a9040" strokeWidth="0.8" />
      <path
        stroke="#1a5018"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M12 9 V12 L14.5 13.5"
      />
      <path
        fill="none"
        stroke="#205a22"
        strokeWidth="1.4"
        strokeLinecap="round"
        d="M7.5 14.5 A5.5 5.5 0 0 1 9 9"
      />
      <path fill="#205a22" d="M6.2 12.5 L7.8 15.2 L9 13 Z" />
    </svg>
  );
}

/** White envelope + small ▼ (Mail). */
export function IeIconMail() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <rect x="2" y="8" width="15" height="10" rx="1" fill="#fff" stroke="#707070" strokeWidth="1" />
      <path fill="none" stroke="#505050" strokeWidth="1" d="M2 8.5 L9.5 14 L17 8.5" />
      <path fill="#222" d="M17.5 5 L20 5 L18.75 7.2 Z" />
    </svg>
  );
}

export function IeIconPrint() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <rect x="6" y="3" width="12" height="7" fill="#e8e8e8" stroke="#888" strokeWidth="1" />
      <rect x="4" y="10" width="16" height="8" fill="#c0c0c0" stroke="#666" strokeWidth="1" />
      <rect x="7" y="14" width="10" height="3" fill="#fff" stroke="#888" strokeWidth="0.5" />
      <rect x="7" y="7" width="10" height="2" fill="#333" />
    </svg>
  );
}

export function IeIconEdit() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <rect x="4" y="5" width="14" height="14" rx="1" fill="#fffacd" stroke="#c9b020" strokeWidth="1" />
      <path
        stroke="#c04020"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M14 6 L18 10 L10 18 L6 18 L6 14 Z"
        fill="#f5e6a0"
      />
    </svg>
  );
}

export function IeIconGoArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      <path fill="#fff" d="M3 3 V13 L12 8 Z" />
    </svg>
  );
}

export function IeIconWindowsLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden className="shrink-0">
      <path fill="#f25022" d="M1 2h6.5v6.5H1V2z" />
      <path fill="#7fba00" d="M8.5 2H15v6.5H8.5V2z" />
      <path fill="#00a4ef" d="M1 8.5h6.5V15H1V8.5z" />
      <path fill="#ffb900" d="M8.5 8.5H15V15H8.5V8.5z" />
    </svg>
  );
}

export function IeIconStatusGlobe() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      <circle cx="8" cy="8" r="6" fill="#4a9fe8" stroke="#1a5aa8" strokeWidth="1" />
      <path fill="none" stroke="#fff" strokeWidth="0.8" d="M2 8h12 M8 2c2 3 2 9 0 12 M8 2c-2 3-2 9 0 12" />
    </svg>
  );
}
