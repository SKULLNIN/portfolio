"use client";

import type { PictureLightboxItem } from "./picture-types";

/** Thumbnail frame + caption — matches My Pictures tiles; opens the shared lightbox via `onOpen`. */
export const XP_PICTURE_TILE_BTN =
  "m-0 block w-full cursor-pointer overflow-hidden rounded border border-[#aca899] bg-[#f5f5f5] p-1 text-left shadow-[inset_1px_1px_0_#fff] outline-none ring-[#316AC5] focus-visible:ring-2";

const captionClass =
  "pointer-events-none px-1 py-1 font-['Tahoma',sans-serif] text-[11px] leading-snug text-[#333]";

type Variant = "grid" | "detailHero" | "detailGallery";

const imgClass: Record<Exclude<Variant, "grid">, string> = {
  detailHero:
    "pointer-events-none max-h-[240px] w-full object-contain object-center bg-[#ececec]",
  detailGallery:
    "pointer-events-none h-[120px] w-full object-contain object-center bg-[#e8e8e8]",
};

export function PictureTileButton({
  src,
  caption,
  onOpen,
  variant = "grid",
  className = "",
}: {
  src: string;
  caption: string;
  onOpen: (item: PictureLightboxItem) => void;
  variant?: Variant;
  /** Extra classes on the outer button (e.g. margin) */
  className?: string;
}) {
  const item: PictureLightboxItem = { src, caption };

  return (
    <button
      type="button"
      className={`${XP_PICTURE_TILE_BTN} ${className}`.trim()}
      onClick={() => onOpen(item)}
    >
      {variant === "grid" ? (
        <span className="pointer-events-none flex w-full min-h-[168px] max-h-[min(52vh,440px)] items-center justify-center overflow-hidden bg-[#e8e8e8] py-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="h-auto max-h-[min(52vh,440px)] w-full max-w-full object-contain object-center"
            width={640}
            height={480}
            sizes="(min-width: 640px) 50vw, 100vw"
            decoding="async"
          />
        </span>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt=""
          className={imgClass[variant]}
          width={640}
          height={variant === "detailGallery" ? 120 : 240}
        />
      )}
      <span className={`${captionClass} block`}>{caption}</span>
    </button>
  );
}
