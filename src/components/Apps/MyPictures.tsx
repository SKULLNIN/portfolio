"use client";

import { PICTURE_CAPTIONS, OWNER } from "@/data/portfolio-content";

export function MyPictures() {
  return (
    <div className="p-3 font-['Tahoma',sans-serif] text-[11px] text-black">
      <p className="xp-mc-section-title mb-2">My Pictures</p>
      <p className="mb-3 text-[12px] text-[#444]">
        Swap these placeholders under <code className="rounded bg-[#eee] px-1">public/</code> with drone
        shots, CAD renders, and competition photos for{" "}
        <strong>{OWNER.displayName}</strong>.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PICTURE_CAPTIONS.map((p, i) => (
          <figure
            key={`${p.caption}-${i}`}
            className="m-0 overflow-hidden rounded border border-[#aca899] bg-[#f5f5f5] p-1 shadow-[inset_1px_1px_0_#fff]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.src}
              alt=""
              className="h-36 w-full object-cover"
              width={320}
              height={144}
            />
            <figcaption className="px-1 py-1 text-[10px] leading-snug text-[#333]">
              {p.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
