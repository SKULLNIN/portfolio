"use client";

type Props = {
  open: boolean;
  onToggle: () => void;
};

export function StartButton({ open, onToggle }: Props) {
  return (
    <button
      type="button"
      className={`xp-start-btn ${open ? "xp-start-btn--open" : ""}`}
      onClick={onToggle}
      aria-expanded={open}
      aria-haspopup="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="xp-start-btn-logo"
        src="/icons/windows-flag.svg"
        alt=""
        width={28}
        height={28}
      />
      <span className="xp-start-btn-text">start</span>
    </button>
  );
}
