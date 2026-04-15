"use client";

import { useEffect, useState } from "react";

const BLISS = "/wallpapers/bliss.jpg";

type Props = {
  /** ms */
  duration?: number;
  onDone: () => void;
};

export function XpBootSplash({ duration = 2200, onDone }: Props) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    let finished = false;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setPct(Math.round(t * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else if (!finished) {
        finished = true;
        onDone();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, onDone]);

  return (
    <div
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-90"
        style={{ backgroundImage: `url(${BLISS})` }}
      />
      <div className="relative z-[1] w-full max-w-md px-8 text-center font-['Tahoma',sans-serif] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        <p className="mb-2 text-[13px] font-bold tracking-wide">Windows XP</p>
        <p className="mb-4 text-[11px] opacity-95">
          Portfolio desktop is starting…
        </p>
        <div className="h-3 w-full overflow-hidden rounded-sm border border-[#1a3a7a] bg-[#1a1a1a] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
          <div
            className="h-full bg-gradient-to-b from-[#6ab3ff] to-[#1c5fbf] transition-[width] duration-75"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-[10px] opacity-80">For the full experience, use a desktop browser.</p>
      </div>
    </div>
  );
}
