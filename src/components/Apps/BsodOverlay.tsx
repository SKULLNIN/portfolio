"use client";

import { BSOD_MESSAGE } from "@/data/portfolio-content";

type Props = {
  onClose: () => void;
};

export function BsodOverlay({ onClose }: Props) {
  return (
    <button
      type="button"
      className="fixed inset-0 z-[99999] cursor-default border-0 bg-[#003399] p-8 text-left font-mono text-[13px] leading-snug text-white outline-none"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape" || e.key === "Enter" || e.key === " ") onClose();
      }}
      autoFocus
    >
      <pre className="m-0 whitespace-pre-wrap">{BSOD_MESSAGE}</pre>
      <p className="mt-8 text-[12px] text-[#aaccff]">Click anywhere to continue…</p>
    </button>
  );
}
