"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PICTURE_CAPTIONS, PICTURE_VIDEOS, OWNER } from "@/data/portfolio-content";
import { PictureLightbox } from "@/components/media/PictureLightbox";
import { PictureTileButton } from "@/components/media/PictureTileButton";
import type { PictureLightboxItem } from "@/components/media/picture-types";
import {
  useExplorerToolbarOptional,
  type ExplorerViewMode,
} from "@/context/ExplorerToolbarContext";

export function MyPictures() {
  const setExplorerApi = useExplorerToolbarOptional()?.setApi;
  const [viewMode, setViewMode] = useState<ExplorerViewMode>("tiles");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [lightbox, setLightbox] = useState<PictureLightboxItem | null>(null);
  const close = useCallback(() => setLightbox(null), []);

  const addressPath = useMemo(() => {
    const u = OWNER.displayName.replace(/[<>:"/\\|?*]/g, "_");
    return `C:\\Documents and Settings\\${u}\\My Documents\\My Pictures`;
  }, []);

  useEffect(() => {
    if (!setExplorerApi) return;
    setExplorerApi({
      canBack: false,
      canForward: false,
      canUp: false,
      onBack: () => {},
      onForward: () => {},
      onUp: () => {},
      backHistory: [],
      forwardHistory: [],
      addressPath,
      searchOpen,
      onSearchToggle: () => setSearchOpen((v) => !v),
      searchQuery,
      onSearchQueryChange: setSearchQuery,
      viewMode,
      onViewModeChange: setViewMode,
    });
    return () => setExplorerApi(null);
  }, [
    setExplorerApi,
    addressPath,
    searchOpen,
    searchQuery,
    viewMode,
  ]);

  const q = searchQuery.trim().toLowerCase();
  const photos = useMemo(
    () =>
      PICTURE_CAPTIONS.filter(
        (p) =>
          !q ||
          p.caption.toLowerCase().includes(q) ||
          p.src.toLowerCase().includes(q),
      ),
    [q],
  );
  const videos = useMemo(
    () =>
      PICTURE_VIDEOS.filter(
        (v) =>
          !q ||
          v.title.toLowerCase().includes(q) ||
          (v.caption?.toLowerCase().includes(q) ?? false),
      ),
    [q],
  );

  const photoGridClass =
    viewMode === "list"
      ? "grid grid-cols-1 gap-2"
      : viewMode === "xlarge"
        ? "grid grid-cols-1 gap-4 sm:grid-cols-1"
        : "grid grid-cols-1 gap-3 sm:grid-cols-2";

  return (
    <div className="p-3 font-['Tahoma',sans-serif] text-[11px] text-black">
      <p className="xp-mc-section-title mb-3">My Pictures</p>

      <section className="mb-4" aria-labelledby="my-pictures-photos">
        <h3 id="my-pictures-photos" className="mb-2 text-[11px] font-bold text-[#333]">
          Photos
        </h3>
        <div className={photoGridClass}>
          {photos.map((p, i) => (
            <PictureTileButton
              key={`${p.caption}-${i}`}
              src={p.src}
              caption={p.caption}
              variant="grid"
              onOpen={setLightbox}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="my-pictures-videos">
        <h3 id="my-pictures-videos" className="mb-2 text-[11px] font-bold text-[#333]">
          Videos
        </h3>
        <div className="flex flex-col gap-4">
          {videos.map((v) => (
            <figure
              key={v.src}
              className="m-0 overflow-hidden rounded border border-[#aca899] bg-[#1a1a1a] p-1 shadow-[inset_1px_1px_0_#fff]"
            >
              <div className="overflow-hidden rounded-sm bg-black">
                <video
                  className="aspect-video max-h-[min(52vh,420px)] w-full object-contain"
                  controls
                  playsInline
                  preload="metadata"
                  poster="/media/drone/me-and-drone.png"
                >
                  <source src={v.src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <figcaption className="px-1 py-1.5 text-[10px] leading-snug text-[#eee]">
                <span className="font-bold text-white">{v.title}</span>
                {v.caption ? (
                  <span className="block text-[#ccc]">{v.caption}</span>
                ) : null}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <PictureLightbox item={lightbox} onClose={close} />
    </div>
  );
}
