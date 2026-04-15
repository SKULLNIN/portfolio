"use client";

import { useEffect, useMemo, useState } from "react";
import { RECYCLE_ITEMS, OWNER } from "@/data/portfolio-content";
import {
  useExplorerToolbarOptional,
  type ExplorerViewMode,
} from "@/context/ExplorerToolbarContext";

export function RecycleBin() {
  const setExplorerApi = useExplorerToolbarOptional()?.setApi;
  const [viewMode, setViewMode] = useState<ExplorerViewMode>("tiles");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
      addressPath: "Recycle Bin",
      searchOpen,
      onSearchToggle: () => setSearchOpen((v) => !v),
      searchQuery,
      onSearchQueryChange: setSearchQuery,
      viewMode,
      onViewModeChange: setViewMode,
    });
    return () => setExplorerApi(null);
  }, [setExplorerApi, searchOpen, searchQuery, viewMode]);

  const q = searchQuery.trim().toLowerCase();
  const items = useMemo(
    () =>
      RECYCLE_ITEMS.filter(
        (item) =>
          !q ||
          item.name.toLowerCase().includes(q) ||
          item.blurb.toLowerCase().includes(q),
      ),
    [q],
  );

  const listClass =
    viewMode === "list"
      ? "m-0 list-none space-y-0 border border-[#aca899] bg-white p-1"
      : "m-0 list-none space-y-2 border border-[#aca899] bg-white p-2";

  return (
    <div className="p-3 font-['Tahoma',sans-serif] text-[11px] text-black">
      <p className="xp-mc-section-title mb-2">Recycle Bin</p>
      <p className="mb-3 text-[12px] leading-relaxed text-[#444]">
        Tongue-in-cheek archive for <strong>{OWNER.displayName}</strong> — older experiments that
        shaped the current portfolio.
      </p>
      <ul className={listClass}>
        {items.map((item) => (
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
