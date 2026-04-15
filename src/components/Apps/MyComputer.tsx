"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { XP_ICONS } from "@/lib/xp-icons";
import {
  FILE_CONTACT,
  FILE_RESUME,
  FILE_SKILLS,
  OWNER,
  PROJECTS,
  type PortfolioProject,
} from "@/data/portfolio-content";
import { BsodOverlay } from "@/components/Apps/BsodOverlay";
import { XpMessageBox } from "@/components/Apps/XpMessageBox";
import { useWindowManager } from "@/context/WindowContext";
import { PictureLightbox } from "@/components/media/PictureLightbox";
import { PictureTileButton } from "@/components/media/PictureTileButton";
import type { PictureLightboxItem } from "@/components/media/picture-types";
import {
  useExplorerToolbarOptional,
  type ExplorerViewMode,
} from "@/context/ExplorerToolbarContext";

type Location =
  | "root"
  | "c"
  | "documents"
  | "portfolio"
  | "projects"
  | "resume"
  | "contact"
  | "skills";

const PARENT_LOC: Partial<Record<Location, Location>> = {
  c: "root",
  documents: "root",
  portfolio: "documents",
  projects: "portfolio",
  resume: "portfolio",
  contact: "portfolio",
  skills: "portfolio",
};

/** Short title for toolbar history dropdowns (IE-style). */
function locationTitle(loc: Location): string {
  switch (loc) {
    case "root":
      return "My Computer";
    case "c":
      return "Local Disk (C:)";
    case "documents":
      return "My Documents";
    case "portfolio":
      return "Portfolio";
    case "projects":
      return "Projects";
    case "resume":
      return "Resume.txt";
    case "contact":
      return "Contact.txt";
    case "skills":
      return "Skills.txt";
    default:
      return "Folder";
  }
}

function locationToAddress(loc: Location): string {
  const u = OWNER.displayName.replace(/[<>:"/\\|?*]/g, "_");
  const base = `C:\\Documents and Settings\\${u}`;
  switch (loc) {
    case "root":
      return "My Computer";
    case "c":
      return "C:\\";
    case "documents":
      return `${base}\\My Documents`;
    case "portfolio":
      return `${base}\\My Documents\\Portfolio`;
    case "projects":
      return `${base}\\My Documents\\Portfolio\\Projects`;
    case "resume":
      return `${base}\\My Documents\\Portfolio\\Resume.txt`;
    case "contact":
      return `${base}\\My Documents\\Portfolio\\Contact.txt`;
    case "skills":
      return `${base}\\My Documents\\Portfolio\\Skills.txt`;
    default:
      return "My Computer";
  }
}

function matchesSearch(query: string, ...fields: string[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => f.toLowerCase().includes(q));
}

type NavState = { stack: Location[]; index: number };

export function MyComputer() {
  const { openApp } = useWindowManager();
  const [nav, setNav] = useState<NavState>({ stack: ["root"], index: 0 });
  const loc = nav.stack[nav.index] ?? "root";

  const [viewMode, setViewMode] = useState<ExplorerViewMode>("tiles");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tasksOpen, setTasksOpen] = useState(true);
  const [placesOpen, setPlacesOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [showBsod, setShowBsod] = useState(false);
  const [infoMsg, setInfoMsg] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const go = useCallback((l: Location) => {
    setNav(({ stack, index }) => ({
      stack: [...stack.slice(0, index + 1), l],
      index: index + 1,
    }));
  }, []);

  const back = useCallback(() => {
    setNav((n) => ({ ...n, index: Math.max(0, n.index - 1) }));
  }, []);

  const forward = useCallback(() => {
    setNav((n) => ({
      ...n,
      index: Math.min(n.stack.length - 1, n.index + 1),
    }));
  }, []);

  const up = useCallback(() => {
    setNav((n) => {
      const cur = n.stack[n.index];
      if (!cur) return n;
      const p = PARENT_LOC[cur];
      if (p === undefined) return n;
      return {
        stack: [...n.stack.slice(0, n.index + 1), p],
        index: n.index + 1,
      };
    });
  }, []);

  const openResumePdf = useCallback(() => {
    const href =
      typeof window !== "undefined"
        ? new URL(OWNER.resumePdf, window.location.origin).href
        : OWNER.resumePdf;
    window.open(href, "_blank", "noopener,noreferrer");
  }, []);

  const backHistory = useMemo(() => {
    const out: { label: string; onSelect: () => void }[] = [];
    for (let i = nav.index - 1; i >= 0; i--) {
      const slot = nav.stack[i];
      if (!slot) continue;
      const idx = i;
      out.push({
        label: locationTitle(slot),
        onSelect: () => setNav((n) => ({ ...n, index: idx })),
      });
    }
    return out;
  }, [nav.stack, nav.index]);

  const forwardHistory = useMemo(() => {
    const out: { label: string; onSelect: () => void }[] = [];
    for (let i = nav.index + 1; i < nav.stack.length; i++) {
      const slot = nav.stack[i];
      if (!slot) continue;
      const idx = i;
      out.push({
        label: locationTitle(slot),
        onSelect: () => setNav((n) => ({ ...n, index: idx })),
      });
    }
    return out;
  }, [nav.stack, nav.index]);

  const setExplorerApi = useExplorerToolbarOptional()?.setApi;

  useEffect(() => {
    if (!setExplorerApi) return;
    setExplorerApi({
      canBack: nav.index > 0,
      canForward: nav.index < nav.stack.length - 1,
      canUp: PARENT_LOC[loc] !== undefined,
      onBack: back,
      onForward: forward,
      onUp: up,
      backHistory,
      forwardHistory,
      addressPath: locationToAddress(loc),
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
    nav.index,
    nav.stack.length,
    loc,
    back,
    forward,
    up,
    searchOpen,
    searchQuery,
    viewMode,
    backHistory,
    forwardHistory,
  ]);

  useEffect(() => {
    setSearchQuery("");
  }, [loc]);

  return (
    <>
      {showBsod && <BsodOverlay onClose={() => setShowBsod(false)} />}
      {infoMsg && (
        <XpMessageBox
          title={infoMsg.title}
          message={infoMsg.message}
          onOk={() => setInfoMsg(null)}
        />
      )}
      <div className="xp-mc-root flex h-full min-h-0 font-['Tahoma',sans-serif] text-[11px]">
        <aside className="xp-mc-taskpane xp-mc-taskpane--luna shrink-0 overflow-auto p-1.5">
          <Accordion
            title="System Tasks"
            open={tasksOpen}
            onToggle={() => setTasksOpen((v) => !v)}
          >
            <ul className="xp-mc-taskpane-links space-y-1">
              <li>
                <button
                  type="button"
                  className="xp-mc-link"
                  onClick={() =>
                    setInfoMsg({
                      title: "System Properties",
                      message:
                        "This portfolio shell does not expose real hardware. Edit OWNER and project data in src/data/portfolio-content.ts.",
                    })
                  }
                >
                  View system information
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="xp-mc-link"
                  onClick={() =>
                    setInfoMsg({
                      title: "Add or Remove Programs",
                      message:
                        "Apps on this desktop are defined in src/data/apps.ts — add a window there to register a new program.",
                    })
                  }
                >
                  Add or remove programs
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="xp-mc-link"
                  onClick={() => openApp("control-panel")}
                >
                  Change a setting
                </button>
              </li>
              {loc === "resume" && (
                <li>
                  <button
                    type="button"
                    className="xp-mc-link"
                    onClick={openResumePdf}
                  >
                    Resume PDF
                  </button>
                </li>
              )}
            </ul>
          </Accordion>
          <Accordion
            title="Other Places"
            open={placesOpen}
            onToggle={() => setPlacesOpen((v) => !v)}
          >
            <ul className="xp-mc-taskpane-links space-y-1">
              <li>
                <button
                  type="button"
                  className="xp-mc-link"
                  onClick={() =>
                    setInfoMsg({
                      title: "My Network Places",
                      message:
                        "Network browsing is not available in the browser shell. Use the Links bar or open Internet Explorer for GitHub and LinkedIn.",
                    })
                  }
                >
                  My Network Places
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="xp-mc-link"
                  onClick={() => go("documents")}
                >
                  My Documents
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="xp-mc-link"
                  onClick={() =>
                    setInfoMsg({
                      title: "Shared Documents",
                      message:
                        "Shared Documents is a visual stand‑in — your portfolio files live under My Documents → Portfolio.",
                    })
                  }
                >
                  Shared Documents
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="xp-mc-link"
                  onClick={() => openApp("control-panel")}
                >
                  Control Panel
                </button>
              </li>
            </ul>
          </Accordion>
          <Accordion
            title="Details"
            open={detailsOpen}
            onToggle={() => setDetailsOpen((v) => !v)}
          >
            {loc === "root" ? (
              <div>
                <p className="xp-mc-details-name">My Computer</p>
                <p className="xp-mc-details-type">System Folder</p>
              </div>
            ) : (
              <p className="m-0 text-[11px] leading-snug text-[#444]">
                {loc === "c" && "Local Disk (C:) — system and portfolio files."}
                {loc === "documents" &&
                  "Contains your documents and shared files."}
                {loc === "portfolio" &&
                  "Portfolio folder with projects and text files."}
                {loc === "projects" && "Project folders with detail panes."}
                {loc === "resume" &&
                  "Text document. Use Resume PDF for the full résumé file."}
                {(loc === "contact" || loc === "skills") && "Text document."}
              </p>
            )}
          </Accordion>
        </aside>
        <div className="xp-mc-main flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
          {loc !== "root" && (
            <div className="xp-mc-toolbar shrink-0 border-b border-[#d4d0c8] bg-[#ece9d8] px-2 py-1 text-[11px] text-[#333]">
              <ToolbarPath loc={loc} go={go} />
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-auto p-3">
            {loc === "root" && (
              <MainRoot
                onOpen={go}
                onInfo={setInfoMsg}
                viewMode={viewMode}
                searchQuery={searchQuery}
              />
            )}
            {loc === "c" && (
              <ViewC onOpen={go} viewMode={viewMode} searchQuery={searchQuery} />
            )}
            {loc === "documents" && (
              <ViewDocuments
                onOpen={go}
                viewMode={viewMode}
                searchQuery={searchQuery}
              />
            )}
            {loc === "portfolio" && (
              <ViewPortfolio
                onOpen={go}
                onDontOpen={() => setShowBsod(true)}
                viewMode={viewMode}
                searchQuery={searchQuery}
              />
            )}
            {loc === "projects" && (
              <ViewProjects viewMode={viewMode} searchQuery={searchQuery} />
            )}
            {loc === "resume" && (
              <div className="flex min-h-0 flex-col gap-3 sm:flex-row sm:items-start">
                <pre className="m-0 min-w-0 flex-1 whitespace-pre-wrap font-mono text-[12px] leading-relaxed">
                  {FILE_RESUME}
                </pre>
                <div className="flex shrink-0 flex-col gap-1 border-[#d4d0c8] sm:border-l sm:pl-4">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#666]">
                    File tasks
                  </span>
                  <button
                    type="button"
                    className="rounded border border-[#003c74] bg-gradient-to-b from-white to-[#ece9d8] px-3 py-1.5 text-left text-[11px] text-black shadow-sm hover:border-[#0a246a]"
                    onClick={openResumePdf}
                  >
                    Resume PDF
                  </button>
                </div>
              </div>
            )}
            {loc === "contact" && (
              <pre className="m-0 whitespace-pre-wrap font-mono text-[12px] leading-relaxed">
                {FILE_CONTACT}
              </pre>
            )}
            {loc === "skills" && (
              <pre className="m-0 whitespace-pre-wrap font-mono text-[12px] leading-relaxed">
                {FILE_SKILLS}
              </pre>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="xp-mc-acc xp-mc-acc--luna">
      <button
        type="button"
        className="xp-mc-acc-head"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="xp-mc-acc-head-left">
          <span className="inline-block w-3 shrink-0 text-center">
            {open ? "▼" : "►"}
          </span>
          <span>{title}</span>
        </span>
        <span className="xp-mc-acc-chev" aria-hidden>
          ««
        </span>
      </button>
      {open && <div className="xp-mc-acc-body">{children}</div>}
    </div>
  );
}

function ToolbarPath({
  loc,
  go,
}: {
  loc: Location;
  go: (l: Location) => void;
}) {
  if (loc === "root") return <span>Folders</span>;
  return (
    <span className="flex flex-wrap items-center gap-0.5">
      <button
        type="button"
        className="xp-mc-crumb text-[#215dc6] underline"
        onClick={() => go("root")}
      >
        My Computer
      </button>
      {(loc === "c" ||
        loc === "documents" ||
        loc === "portfolio" ||
        loc === "projects" ||
        loc === "resume" ||
        loc === "contact" ||
        loc === "skills") && (
        <>
          <span className="text-[#666]">»</span>
          <button
            type="button"
            className="xp-mc-crumb text-[#215dc6] underline"
            onClick={() => go("c")}
          >
            Local Disk (C:)
          </button>
        </>
      )}
      {loc === "documents" && (
        <>
          <span className="text-[#666]">»</span>
          <span>My Documents</span>
        </>
      )}
      {(loc === "portfolio" ||
        loc === "projects" ||
        loc === "resume" ||
        loc === "contact" ||
        loc === "skills") && (
        <>
          <span className="text-[#666]">»</span>
          <button
            type="button"
            className="xp-mc-crumb text-[#215dc6] underline"
            onClick={() => go("portfolio")}
          >
            Portfolio
          </button>
        </>
      )}
      {loc === "projects" && (
        <>
          <span className="text-[#666]">»</span>
          <span>Projects</span>
        </>
      )}
      {loc === "resume" && (
        <>
          <span className="text-[#666]">»</span>
          <span>Resume.txt</span>
        </>
      )}
      {loc === "contact" && (
        <>
          <span className="text-[#666]">»</span>
          <span>Contact.txt</span>
        </>
      )}
      {loc === "skills" && (
        <>
          <span className="text-[#666]">»</span>
          <span>Skills.txt</span>
        </>
      )}
    </span>
  );
}

function mainIconSize(vm: ExplorerViewMode): number {
  switch (vm) {
    case "xlarge":
      return 64;
    case "tiles":
      return 48;
    case "icons":
      return 32;
    case "list":
      return 24;
    case "details":
      return 32;
    default:
      return 48;
  }
}

function MainRoot({
  onOpen,
  onInfo,
  viewMode,
  searchQuery,
}: {
  onOpen: (l: Location) => void;
  onInfo: (p: { title: string; message: string }) => void;
  viewMode: ExplorerViewMode;
  searchQuery: string;
}) {
  const docsLabel = `${OWNER.displayName}'s Documents`;
  const ico = mainIconSize(viewMode);
  const rowLike = viewMode === "list";
  const tileBtnClass = rowLike
    ? "xp-mc-tile xp-mc-tile--btn max-w-full flex-row items-center py-1"
    : "xp-mc-tile xp-mc-tile--btn text-left";

  const showShared = matchesSearch(
    searchQuery,
    "Shared Documents",
    "Shared files for all users",
  );
  const showMyDocs = matchesSearch(
    searchQuery,
    docsLabel,
    "Private documents for this user",
  );
  const showHdd = matchesSearch(
    searchQuery,
    "Local Disk",
    "C:",
    "12.3 GB",
  );
  const showFloppy = matchesSearch(searchQuery, "Floppy", "A:");
  const showD = matchesSearch(searchQuery, "WXPVOL", "D:", "CD-ROM");
  const showE = matchesSearch(searchQuery, "CD Drive", "E:", "Empty");

  return (
    <>
      <p className="xp-mc-section-title mb-2">Files Stored on This Computer</p>
      <div
        className={
          viewMode === "details"
            ? "xp-mc-tile-row xp-mc-tile-row--details"
            : "xp-mc-tile-row"
        }
      >
        {showShared && (
        <button
          type="button"
          className={tileBtnClass}
          onClick={() =>
            onInfo({
              title: "Shared Documents",
              message:
                "Shared Documents is a visual stand‑in — open My Documents for the Portfolio folder.",
            })
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={XP_ICONS.myDocuments}
            alt=""
            width={ico}
            height={ico}
            className="xp-mc-tile-ico xp-desktop-ico shrink-0"
          />
          <span className="flex min-w-0 flex-col">
            <span className="block font-bold text-[#215dc6] underline">
              Shared Documents
            </span>
            <span className="block text-[11px] text-[#444]">Shared files for all users</span>
          </span>
        </button>
        )}
        {showMyDocs && (
        <button
          type="button"
          className={tileBtnClass}
          onClick={() => onOpen("documents")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={XP_ICONS.myDocuments}
            alt=""
            width={ico}
            height={ico}
            className="xp-mc-tile-ico xp-desktop-ico shrink-0"
          />
          <span className="flex min-w-0 flex-col">
            <span className="block font-bold text-[#215dc6] underline">{docsLabel}</span>
            <span className="block text-[11px] text-[#444]">Private documents for this user</span>
          </span>
        </button>
        )}
      </div>

      <hr className="xp-mc-section-hr" />

      <p className="xp-mc-section-title mb-2">Hard Disk Drives</p>
      <div className="xp-mc-tile-row">
        {showHdd && (
        <button
          type="button"
          className={tileBtnClass}
          onClick={() => onOpen("c")}
        >
          <div className="xp-mc-hdd-tile-ico" aria-hidden />
          <span className="flex min-w-0 flex-col">
            <span className="block font-bold text-[#215dc6] underline">
              Local Disk (C:)
            </span>
            <span className="block text-[11px] text-[#444]">12.3 GB free of 39.2 GB</span>
          </span>
        </button>
        )}
      </div>

      <hr className="xp-mc-section-hr" />

      <p className="xp-mc-section-title mb-2">Devices with Removable Storage</p>
      <div className="xp-mc-tile-row">
        {showFloppy && (
        <div className="xp-mc-tile xp-mc-tile--ghost">
          <div className="xp-mc-floppy-ico" aria-hidden />
          <div>
            <div className="font-bold text-[#000]">3½ Floppy (A:)</div>
            <div className="text-[11px] text-[#444]">3½ Inch Floppy Drive</div>
          </div>
        </div>
        )}
        {showD && (
        <button
          type="button"
          className={tileBtnClass}
          onClick={() =>
            onInfo({
              title: "WXPVOL_EN (D:)",
              message: `No disc in drive D: — for a portfolio shortcut, visit GitHub:\n${OWNER.github}\n\n(Add a real autorun later, or replace this dialog.)`,
            })
          }
        >
          <div className="xp-mc-cd-ico shrink-0" aria-hidden />
          <span className="flex min-w-0 flex-col">
            <span className="block font-bold text-[#215dc6] underline">WXPVOL_EN (D:)</span>
            <span className="block text-[11px] text-[#444]">CD-ROM — click for a shortcut</span>
          </span>
        </button>
        )}
        {showE && (
        <button
          type="button"
          className={tileBtnClass}
          onClick={() =>
            onInfo({
              title: "CD Drive (E:)",
              message:
                "There is no disc in the drive. Insert a CD into drive E:, or use WXPVOL_EN (D:) for the portfolio GitHub link.",
            })
          }
        >
          <div className="xp-mc-cd-ico shrink-0 opacity-80" aria-hidden />
          <span className="flex min-w-0 flex-col">
            <span className="block font-bold text-[#215dc6] underline">CD Drive (E:)</span>
            <span className="block text-[11px] text-[#444]">Empty — click for a message</span>
          </span>
        </button>
        )}
      </div>
    </>
  );
}

function ViewC({
  onOpen,
  viewMode,
  searchQuery,
}: {
  onOpen: (l: Location) => void;
  viewMode: ExplorerViewMode;
  searchQuery: string;
}) {
  type Row = {
    icon: string;
    label: string;
    sub: string;
    onClick: () => void;
  };
  const rows: Row[] = [
    {
      icon: XP_ICONS.myComputer,
      label: "Portfolio",
      sub: "Folder",
      onClick: () => onOpen("portfolio"),
    },
    {
      icon: XP_ICONS.notepad,
      label: "Program Files",
      sub: "Installed software",
      onClick: () => {},
    },
    {
      icon: XP_ICONS.myComputer,
      label: "Windows",
      sub: "Operating system",
      onClick: () => {},
    },
  ];
  const filtered = rows.filter((r) =>
    matchesSearch(searchQuery, r.label, r.sub),
  );

  if (filtered.length === 0) {
    return (
      <p className="m-0 text-[12px] text-[#666]">No items match your search.</p>
    );
  }

  if (viewMode === "details") {
    return (
      <>
        <p className="xp-mc-section-title mb-2">Folders stored on this computer</p>
        <table className="xp-mc-details-table w-full border-collapse text-left text-[11px] text-black">
          <thead>
            <tr className="bg-[#ece9d8]">
              <th className="border border-[#aca899] px-2 py-1 font-bold">Name</th>
              <th className="border border-[#aca899] px-2 py-1 font-bold">Type</th>
              <th className="border border-[#aca899] px-2 py-1 font-bold">Comments</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.label} className="bg-white">
                <td className="border border-[#aca899] px-2 py-1">
                  <button
                    type="button"
                    className="text-left text-[#215dc6] underline"
                    onClick={r.onClick}
                  >
                    {r.label}
                  </button>
                </td>
                <td className="border border-[#aca899] px-2 py-1">{r.sub}</td>
                <td className="border border-[#aca899] px-2 py-1 text-[#666]">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }

  return (
    <>
      <p className="xp-mc-section-title mb-2">Folders stored on this computer</p>
      <div className={viewMode === "list" ? "flex flex-col gap-0" : "flex flex-col gap-1"}>
        {filtered.map((r) => (
          <McRow
            key={r.label}
            icon={r.icon}
            label={r.label}
            sub={r.sub}
            onClick={r.onClick}
            viewMode={viewMode}
          />
        ))}
      </div>
    </>
  );
}

function ViewDocuments({
  onOpen,
  viewMode,
  searchQuery,
}: {
  onOpen: (l: Location) => void;
  viewMode: ExplorerViewMode;
  searchQuery: string;
}) {
  if (!matchesSearch(searchQuery, "Portfolio", "Folder")) {
    return (
      <p className="m-0 text-[12px] text-[#666]">No items match your search.</p>
    );
  }
  return (
    <>
      <p className="xp-mc-section-title mb-2">My Documents</p>
      <McRow
        icon={XP_ICONS.myComputer}
        label="Portfolio"
        sub="Folder"
        onClick={() => onOpen("portfolio")}
        viewMode={viewMode}
      />
    </>
  );
}

function ViewPortfolio({
  onOpen,
  onDontOpen,
  viewMode,
  searchQuery,
}: {
  onOpen: (l: Location) => void;
  onDontOpen: () => void;
  viewMode: ExplorerViewMode;
  searchQuery: string;
}) {
  type Row = {
    icon: string;
    label: string;
    sub: string;
    onClick: () => void;
  };
  const rows: Row[] = [
    {
      icon: XP_ICONS.myComputer,
      label: "Projects",
      sub: "Folder",
      onClick: () => onOpen("projects"),
    },
    {
      icon: XP_ICONS.notepad,
      label: "Resume.txt",
      sub: "Text document",
      onClick: () => onOpen("resume"),
    },
    {
      icon: XP_ICONS.notepad,
      label: "Contact.txt",
      sub: "Text document",
      onClick: () => onOpen("contact"),
    },
    {
      icon: XP_ICONS.notepad,
      label: "Skills.txt",
      sub: "Text document",
      onClick: () => onOpen("skills"),
    },
    {
      icon: XP_ICONS.minesweeper,
      label: "dont_open.exe",
      sub: "Application",
      onClick: onDontOpen,
    },
  ];
  const filtered = rows.filter((r) =>
    matchesSearch(searchQuery, r.label, r.sub),
  );

  if (filtered.length === 0) {
    return (
      <p className="m-0 text-[12px] text-[#666]">No items match your search.</p>
    );
  }

  if (viewMode === "details") {
    return (
      <>
        <p className="xp-mc-section-title mb-2">Portfolio</p>
        <table className="xp-mc-details-table w-full border-collapse text-left text-[11px] text-black">
          <thead>
            <tr className="bg-[#ece9d8]">
              <th className="border border-[#aca899] px-2 py-1 font-bold">Name</th>
              <th className="border border-[#aca899] px-2 py-1 font-bold">Type</th>
              <th className="border border-[#aca899] px-2 py-1 font-bold">Size</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.label} className="bg-white">
                <td className="border border-[#aca899] px-2 py-1">
                  <button
                    type="button"
                    className="text-left text-[#215dc6] underline"
                    onClick={r.onClick}
                  >
                    {r.label}
                  </button>
                </td>
                <td className="border border-[#aca899] px-2 py-1">{r.sub}</td>
                <td className="border border-[#aca899] px-2 py-1 text-[#666]">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }

  return (
    <>
      <p className="xp-mc-section-title mb-2">Portfolio</p>
      <div className={viewMode === "list" ? "flex flex-col gap-0" : "flex flex-col gap-1"}>
        {filtered.map((r) => (
          <McRow
            key={r.label}
            icon={r.icon}
            label={r.label}
            sub={r.sub}
            onClick={r.onClick}
            viewMode={viewMode}
          />
        ))}
      </div>
    </>
  );
}

function ViewProjects({
  viewMode,
  searchQuery,
}: {
  viewMode: ExplorerViewMode;
  searchQuery: string;
}) {
  const [showUpcoming, setShowUpcoming] = useState(false);
  const baseProjects = useMemo(
    () =>
      showUpcoming
        ? PROJECTS
        : PROJECTS.filter((p) => p.status !== "Upcoming"),
    [showUpcoming],
  );

  const visibleProjects = useMemo(
    () =>
      baseProjects.filter((p) =>
        matchesSearch(searchQuery, p.title, p.short, p.description),
      ),
    [baseProjects, searchQuery],
  );

  const [selectedId, setSelectedId] = useState<string>(PROJECTS[0]?.id ?? "");

  const resolvedId = useMemo(() => {
    if (visibleProjects.some((p) => p.id === selectedId)) {
      return selectedId;
    }
    return visibleProjects[0]?.id ?? "";
  }, [visibleProjects, selectedId]);

  const current =
    visibleProjects.find((p) => p.id === resolvedId) ?? visibleProjects[0];

  if (baseProjects.length === 0) {
    return (
      <div>
        <p className="xp-mc-section-title mb-2">Projects</p>
        <p className="m-0 text-[12px] text-[#444]">No projects match this view.</p>
      </div>
    );
  }

  if (visibleProjects.length === 0) {
    return (
      <div>
        <p className="xp-mc-section-title mb-2">Projects</p>
        <p className="m-0 text-[12px] text-[#444]">
          No items match your search.
        </p>
      </div>
    );
  }

  const listGap =
    viewMode === "list"
      ? "space-y-0"
      : viewMode === "xlarge"
        ? "space-y-1.5"
        : "space-y-0.5";

  return (
    <div>
      <p className="xp-mc-section-title mb-2">Projects</p>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded border border-[#aca899] bg-[#ece9d8] px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
        <span className="text-[11px] font-bold text-[#333]">Portfolio</span>
        <button
          type="button"
          role="switch"
          aria-checked={showUpcoming}
          title={
            showUpcoming
              ? "Upcoming projects are shown — click to hide"
              : "Click to include upcoming projects in the list"
          }
          onClick={() => setShowUpcoming((v) => !v)}
          className={
            showUpcoming
              ? "cursor-pointer rounded border border-[#316ac5] bg-gradient-to-b from-[#d3e4fb] to-[#b9cce8] px-3 py-1.5 text-left text-[11px] font-bold leading-tight text-[#0a246a] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.15)] outline-none ring-[#316AC5] focus-visible:ring-2"
              : "cursor-pointer rounded border border-t-[#ffffff] border-l-[#ffffff] border-b-[#808080] border-r-[#808080] bg-gradient-to-b from-[#ffffff] to-[#ece9d8] px-3 py-1.5 text-left text-[11px] font-normal leading-tight text-black shadow-[1px_1px_0_rgba(0,0,0,0.12)] outline-none hover:from-[#fafafa] hover:to-[#e4e4e4] active:border-[#808080] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.12)] focus-visible:ring-2 focus-visible:ring-[#316AC5]"
          }
        >
          Show upcoming projects
        </button>
      </div>
      <div className="flex min-h-[280px] flex-col gap-3 lg:flex-row lg:items-stretch">
        <ul className={`m-0 w-full shrink-0 list-none p-0 lg:max-w-[232px] ${listGap}`}>
          {visibleProjects.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className={`xp-mc-project-btn ${
                  viewMode === "list" ? "py-1" : ""
                } ${resolvedId === p.id ? "xp-mc-project-btn--selected" : ""}`}
                onClick={() => setSelectedId(p.id)}
              >
                <span className="font-bold">{p.title}</span>
                <span
                  className={`xp-mc-project-sub block text-[10px] ${
                    viewMode === "list" ? "line-clamp-1" : ""
                  }`}
                >
                  {p.short}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {current && <ProjectDetail project={current} />}
      </div>
    </div>
  );
}

function projectVideoClips(project: PortfolioProject): { src: string; title: string }[] {
  if (project.videos?.length) return project.videos;
  if (project.videoSrc) {
    return [{ src: project.videoSrc, title: project.videoTitle ?? "Video" }];
  }
  return [];
}

function ProjectDetail({ project }: { project: PortfolioProject }) {
  const [lightbox, setLightbox] = useState<PictureLightboxItem | null>(null);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const extra =
    (project.galleryImages?.length ?? 0) + (project.moreImageCount ?? 0) > 0;
  const heroCaption = project.imageCaption ?? project.title;
  const videoClips = projectVideoClips(project);

  return (
    <div className="xp-mc-project-detail relative min-h-0 min-w-0 flex-1 overflow-auto rounded border border-[#aca899] bg-[#faf8f5] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <h2 className="m-0">{project.title}</h2>
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold ${
            project.status === "Completed"
              ? "bg-[#dfd] text-[#060]"
              : project.status === "Upcoming"
                ? "border border-[#8fa7d4] bg-[#e8eefc] text-[#1a3a7a]"
                : "bg-[#ffd] text-[#660]"
          }`}
        >
          {project.status}
        </span>
      </div>
      <p className="xp-mc-project-body mb-3">{project.description}</p>
      {project.timeline && project.timeline.length > 0 && (
        <div className="mb-3 rounded border border-[#c5d5ef] bg-[#f0f5ff] px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
          <p className="xp-mc-gallery-title mb-2">Schedule</p>
          <ul className="m-0 list-none space-y-2.5 p-0">
            {project.timeline.map((row, i) => (
              <li
                key={`${row.when}-${i}`}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 border-l-[3px] border-[#316ac5] pl-2.5"
              >
                <span className="min-w-[6.5rem] shrink-0 text-[12px] font-bold tabular-nums text-[#215dc6]">
                  {row.when}
                </span>
                <span className="min-w-0 flex-1 text-[12px] leading-snug text-[#333]">{row.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mb-1 text-[11px] font-bold text-[#444]">Tech stack</p>
      <p className="xp-mc-project-tech mb-3">{project.stack.join(" · ")}</p>
      {project.imageSrc && (
        <PictureTileButton
          className="mb-3"
          variant="detailHero"
          src={project.imageSrc}
          caption={heroCaption}
          onOpen={setLightbox}
        />
      )}
      {extra && (
        <div className="mb-3">
          <p className="xp-mc-gallery-title">More images</p>
          <div className="xp-mc-gallery-grid">
            {project.galleryImages?.map((g, i) => (
              <PictureTileButton
                key={`${g.src}-${i}`}
                variant="detailGallery"
                src={g.src}
                caption={g.caption ?? project.title}
                onOpen={setLightbox}
              />
            ))}
            {(project.moreImageCount ?? 0) > 0 && (
              <div className="xp-mc-gallery-more" title="Additional media will be added here">
                <span>+{project.moreImageCount}</span>
                <span>More photos &amp; renders soon</span>
              </div>
            )}
          </div>
        </div>
      )}
      {videoClips.length > 0 && (
        <div className="xp-mc-project-video mb-3 space-y-3">
          <p className="xp-mc-gallery-title">Videos</p>
          {videoClips.map((v) => (
            <div key={v.src}>
              <p className="mb-1 text-[12px] font-bold text-[#333]">{v.title}</p>
              <div className="xp-mc-project-video-inner">
                <video
                  className="xp-mc-project-video-el"
                  controls
                  playsInline
                  preload="metadata"
                  src={v.src}
                >
                  <a href={v.src}>Download video</a>
                </video>
              </div>
            </div>
          ))}
        </div>
      )}
      {project.githubUrl && (
        <p className="m-0 font-['Tahoma',sans-serif] text-[12px] leading-normal text-[#222]">
          <span className="font-bold">Repository: </span>
          <a
            className="text-[#215dc6] underline"
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {project.githubUrl}
          </a>
        </p>
      )}
      <PictureLightbox item={lightbox} onClose={closeLightbox} />
    </div>
  );
}

function McRow({
  icon,
  label,
  sub,
  onClick,
  viewMode = "tiles",
}: {
  icon: string;
  label: string;
  sub: string;
  onClick: () => void;
  viewMode?: ExplorerViewMode;
}) {
  const dim =
    viewMode === "xlarge"
      ? 48
      : viewMode === "tiles"
        ? 32
        : viewMode === "icons"
          ? 28
          : viewMode === "list"
            ? 16
            : 32;
  const listLike = viewMode === "list";
  const btnClass = listLike
    ? "xp-mc-tile xp-mc-tile--btn flex w-full max-w-md flex-row items-center gap-2 rounded-sm border border-transparent py-0.5 pl-1 text-left hover:border-[#aca899] hover:bg-[#f0f0ff]"
    : "xp-mc-tile xp-mc-tile--btn flex w-full max-w-md items-start gap-2 rounded-sm border border-transparent p-1 text-left hover:border-[#aca899] hover:bg-[#f0f0ff]";

  return (
    <button type="button" className={btnClass} onClick={onClick}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={icon}
        alt=""
        width={dim}
        height={dim}
        className="xp-desktop-ico shrink-0"
      />
      <span
        className={`flex min-w-0 flex-col ${listLike ? "justify-center" : ""}`}
      >
        <span className="block text-[#215dc6] underline">{label}</span>
        {!listLike && (
          <span className="block text-[11px] text-[#666]">{sub}</span>
        )}
      </span>
    </button>
  );
}
