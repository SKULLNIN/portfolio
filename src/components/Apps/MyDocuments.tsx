"use client";

import { useEffect, useMemo, useState } from "react";
import { FILE_CERTS, FILE_PUBLICATIONS, FILE_SKILLS, OWNER } from "@/data/portfolio-content";
import {
  useExplorerToolbarOptional,
  type ExplorerViewMode,
} from "@/context/ExplorerToolbarContext";

/**
 * My Documents — skills, certs, publications (explorer body).
 */
export function MyDocuments() {
  const setExplorerApi = useExplorerToolbarOptional()?.setApi;
  const [viewMode, setViewMode] = useState<ExplorerViewMode>("tiles");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const addressPath = useMemo(() => {
    const u = OWNER.displayName.replace(/[<>:"/\\|?*]/g, "_");
    return `C:\\Documents and Settings\\${u}\\My Documents`;
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
  const matchDoc = (name: string, hint: string) =>
    !q || name.toLowerCase().includes(q) || hint.toLowerCase().includes(q);
  const showSkills = matchDoc("skills.txt", "languages frameworks hardware");
  const showCerts = matchDoc("certifications.txt", "cert courses");
  const showPubs = matchDoc("publications.txt", "papers posters");

  return (
    <div className="p-3 font-['Tahoma',sans-serif] text-[11px] text-black">
      <p className="xp-mc-section-title mb-2">Welcome to My Documents</p>
      <p className="mb-3 text-[12px] leading-relaxed text-[#333]">
        Personal folder for <strong>{OWNER.displayName}</strong> — open a file below.
      </p>
      <div className="flex flex-col gap-1 border border-[#aca899] bg-white p-2">
        {showSkills && (
          <DocRow name="skills.txt" desc="Languages, frameworks, hardware" href="#skills" />
        )}
        {showCerts && (
          <DocRow name="certifications.txt" desc="Coming soon" href="#certs" />
        )}
        {showPubs && (
          <DocRow name="publications.txt" desc="Coming soon" href="#pubs" />
        )}
      </div>
      {showSkills && (
      <div id="skills" className="mt-4 scroll-mt-4">
        <p className="xp-mc-section-title mb-1">skills.txt</p>
        <pre className="m-0 max-h-[200px] overflow-auto whitespace-pre-wrap rounded border border-[#aca899] bg-[#fafafa] p-2 font-mono text-[11px] leading-relaxed">
          {FILE_SKILLS}
        </pre>
      </div>
      )}
      {showCerts && (
      <div id="certs" className="mt-4 scroll-mt-4">
        <p className="xp-mc-section-title mb-1">certifications.txt</p>
        <pre className="m-0 max-h-[160px] overflow-auto whitespace-pre-wrap rounded border border-[#aca899] bg-[#fafafa] p-2 font-mono text-[11px] leading-relaxed">
          {FILE_CERTS}
        </pre>
      </div>
      )}
      {showPubs && (
      <div id="pubs" className="mt-4 scroll-mt-4">
        <p className="xp-mc-section-title mb-1">publications.txt</p>
        <pre className="m-0 max-h-[160px] overflow-auto whitespace-pre-wrap rounded border border-[#aca899] bg-[#fafafa] p-2 font-mono text-[11px] leading-relaxed">
          {FILE_PUBLICATIONS}
        </pre>
      </div>
      )}
    </div>
  );
}

function DocRow({
  name,
  desc,
  href,
}: {
  name: string;
  desc: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center justify-between gap-2 rounded px-2 py-1 hover:bg-[var(--xp-accent)] hover:text-white"
    >
      <span className="font-bold underline">{name}</span>
      <span className="text-[10px] opacity-90">{desc}</span>
    </a>
  );
}
