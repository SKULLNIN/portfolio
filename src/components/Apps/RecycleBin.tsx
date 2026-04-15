"use client";

import { RECYCLE_ITEMS, OWNER } from "@/data/portfolio-content";

export function RecycleBin() {
  return (
    <div className="p-3 font-['Tahoma',sans-serif] text-[11px] text-black">
      <p className="xp-mc-section-title mb-2">Recycle Bin</p>
      <p className="mb-3 text-[12px] leading-relaxed text-[#444]">
        Tongue-in-cheek archive for <strong>{OWNER.displayName}</strong> — older experiments that
        shaped the current portfolio.
      </p>
      <ul className="m-0 list-none space-y-2 border border-[#aca899] bg-white p-2">
        {RECYCLE_ITEMS.map((item) => (
          <li
            key={item.name}
            className="flex flex-col gap-0.5 border-b border-dotted border-[#d4d0c8] pb-2 last:border-0 last:pb-0"
          >
            <span className="font-mono text-[11px] text-[#215dc6] line-through decoration-[#888]">
              {item.name}
            </span>
            <span className="text-[10px] text-[#666]">{item.blurb}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
