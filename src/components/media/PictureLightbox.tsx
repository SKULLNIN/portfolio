"use client";

import { useEffect, useRef } from "react";
import type { PictureLightboxItem } from "./picture-types";

/** Same full-screen viewer as My Pictures — use for any portfolio photo opened from the shell. */
export function PictureLightbox({
  item,
  onClose,
}: {
  item: PictureLightboxItem | null;
  onClose: () => void;
}) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [item]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[60000] flex flex-col items-center justify-center bg-black/75 p-3 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="Full size photo"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[min(92dvh,92vh)] w-full max-w-[min(96vw,1200px)] flex-col rounded border border-[#aca899] bg-[#ece9d8] p-2 shadow-[4px_4px_16px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between gap-2 border-b border-[#d4d0c8] pb-1">
          <p className="m-0 flex-1 truncate text-left text-[11px] font-bold text-[#222]">
            {item.caption}
          </p>
          <button
            type="button"
            className="shrink-0 rounded border border-[#aca899] bg-[#ece9d8] px-2 py-0.5 text-[11px] text-[#222] hover:bg-[#d8e4f8] active:bg-[#c5d6ef]"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.src}
            alt=""
            width={1200}
            height={900}
            className="mx-auto block max-h-[min(85dvh,85vh)] w-auto max-w-full object-contain"
          />
        </div>
        <p className="mt-1 text-center text-[10px] text-[#666]">
          Click outside or press Esc to close
        </p>
      </div>
    </div>
  );
}
