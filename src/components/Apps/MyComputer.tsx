"use client";

import { useCallback, useState, type ReactNode } from "react";
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

type Location =
  | "root"
  | "c"
  | "documents"
  | "portfolio"
  | "projects"
  | "resume"
  | "contact"
  | "skills";

export function MyComputer() {
  const { openApp } = useWindowManager();
  const [loc, setLoc] = useState<Location>("root");
  const [tasksOpen, setTasksOpen] = useState(true);
  const [placesOpen, setPlacesOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [showBsod, setShowBsod] = useState(false);
  const [infoMsg, setInfoMsg] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const go = useCallback((l: Location) => setLoc(l), []);

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
                        "Shared Documents is a visual stand‑in — your portfolio files live under My Documents → portfolio.",
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
                {(loc === "resume" || loc === "contact" || loc === "skills") &&
                  "Text document."}
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
              <MainRoot onOpen={go} onInfo={setInfoMsg} />
            )}
            {loc === "c" && <ViewC onOpen={go} />}
            {loc === "documents" && <ViewDocuments onOpen={go} />}
            {loc === "portfolio" && (
              <ViewPortfolio
                onOpen={go}
                onDontOpen={() => setShowBsod(true)}
              />
            )}
            {loc === "projects" && <ViewProjects />}
            {loc === "resume" && (
              <pre className="m-0 whitespace-pre-wrap font-mono text-[12px] leading-relaxed">
                {FILE_RESUME}
              </pre>
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
      <button type="button" className="xp-mc-acc-head" onClick={onToggle}>
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
            portfolio
          </button>
        </>
      )}
      {loc === "projects" && (
        <>
          <span className="text-[#666]">»</span>
          <span>projects</span>
        </>
      )}
      {loc === "resume" && (
        <>
          <span className="text-[#666]">»</span>
          <span>resume.txt</span>
        </>
      )}
      {loc === "contact" && (
        <>
          <span className="text-[#666]">»</span>
          <span>contact.txt</span>
        </>
      )}
      {loc === "skills" && (
        <>
          <span className="text-[#666]">»</span>
          <span>skills.txt</span>
        </>
      )}
    </span>
  );
}

function MainRoot({
  onOpen,
  onInfo,
}: {
  onOpen: (l: Location) => void;
  onInfo: (p: { title: string; message: string }) => void;
}) {
  const docsLabel = `${OWNER.displayName}'s Documents`;

  return (
    <>
      <p className="xp-mc-section-title mb-2">Files Stored on This Computer</p>
      <div className="xp-mc-tile-row">
        <button
          type="button"
          className="xp-mc-tile xp-mc-tile--btn text-left"
          onClick={() =>
            onInfo({
              title: "Shared Documents",
              message:
                "Shared Documents is a visual stand‑in — open My Documents for the portfolio folder.",
            })
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={XP_ICONS.myDocuments}
            alt=""
            width={48}
            height={48}
            className="xp-mc-tile-ico xp-desktop-ico"
          />
          <div>
            <div className="font-bold text-[#215dc6] underline">
              Shared Documents
            </div>
            <div className="text-[11px] text-[#444]">Shared files for all users</div>
          </div>
        </button>
        <button
          type="button"
          className="xp-mc-tile xp-mc-tile--btn text-left"
          onClick={() => onOpen("documents")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={XP_ICONS.myDocuments}
            alt=""
            width={48}
            height={48}
            className="xp-mc-tile-ico xp-desktop-ico"
          />
          <div>
            <div className="font-bold text-[#215dc6] underline">{docsLabel}</div>
            <div className="text-[11px] text-[#444]">Private documents for this user</div>
          </div>
        </button>
      </div>

      <hr className="xp-mc-section-hr" />

      <p className="xp-mc-section-title mb-2">Hard Disk Drives</p>
      <div className="xp-mc-tile-row">
        <button
          type="button"
          className="xp-mc-tile xp-mc-tile--btn text-left"
          onClick={() => onOpen("c")}
        >
          <div className="xp-mc-hdd-tile-ico" aria-hidden />
          <div>
            <div className="font-bold text-[#215dc6] underline">
              Local Disk (C:)
            </div>
            <div className="text-[11px] text-[#444]">12.3 GB free of 39.2 GB</div>
          </div>
        </button>
      </div>

      <hr className="xp-mc-section-hr" />

      <p className="xp-mc-section-title mb-2">Devices with Removable Storage</p>
      <div className="xp-mc-tile-row">
        <div className="xp-mc-tile xp-mc-tile--ghost">
          <div className="xp-mc-floppy-ico" aria-hidden />
          <div>
            <div className="font-bold text-[#000]">3½ Floppy (A:)</div>
            <div className="text-[11px] text-[#444]">3½ Inch Floppy Drive</div>
          </div>
        </div>
        <button
          type="button"
          className="xp-mc-tile xp-mc-tile--btn text-left"
          onClick={() =>
            onInfo({
              title: "WXPVOL_EN (D:)",
              message: `No disc in drive D: — for a portfolio shortcut, visit GitHub:\n${OWNER.github}\n\n(Add a real autorun later, or replace this dialog.)`,
            })
          }
        >
          <div className="xp-mc-cd-ico shrink-0" aria-hidden />
          <div>
            <div className="font-bold text-[#215dc6] underline">WXPVOL_EN (D:)</div>
            <div className="text-[11px] text-[#444]">CD-ROM — click for a shortcut</div>
          </div>
        </button>
        <button
          type="button"
          className="xp-mc-tile xp-mc-tile--btn text-left"
          onClick={() =>
            onInfo({
              title: "CD Drive (E:)",
              message:
                "There is no disc in the drive. Insert a CD into drive E:, or use WXPVOL_EN (D:) for the portfolio GitHub link.",
            })
          }
        >
          <div className="xp-mc-cd-ico shrink-0 opacity-80" aria-hidden />
          <div>
            <div className="font-bold text-[#215dc6] underline">CD Drive (E:)</div>
            <div className="text-[11px] text-[#444]">Empty — click for a message</div>
          </div>
        </button>
      </div>
    </>
  );
}

function ViewC({ onOpen }: { onOpen: (l: Location) => void }) {
  return (
    <>
      <p className="xp-mc-section-title mb-2">Folders stored on this computer</p>
      <div className="flex flex-col gap-1">
        <McRow
          icon={XP_ICONS.myComputer}
          label="portfolio"
          sub="Folder"
          onClick={() => onOpen("portfolio")}
        />
        <McRow
          icon={XP_ICONS.notepad}
          label="Program Files"
          sub="Installed software"
          onClick={() => {}}
        />
        <McRow
          icon={XP_ICONS.myComputer}
          label="Windows"
          sub="Operating system"
          onClick={() => {}}
        />
      </div>
    </>
  );
}

function ViewDocuments({ onOpen }: { onOpen: (l: Location) => void }) {
  return (
    <>
      <p className="xp-mc-section-title mb-2">My Documents</p>
      <McRow
        icon={XP_ICONS.myComputer}
        label="portfolio"
        sub="Folder"
        onClick={() => onOpen("portfolio")}
      />
    </>
  );
}

function ViewPortfolio({
  onOpen,
  onDontOpen,
}: {
  onOpen: (l: Location) => void;
  onDontOpen: () => void;
}) {
  return (
    <>
      <p className="xp-mc-section-title mb-2">portfolio</p>
      <div className="flex flex-col gap-1">
        <McRow
          icon={XP_ICONS.myComputer}
          label="projects"
          sub="Folder"
          onClick={() => onOpen("projects")}
        />
        <McRow
          icon={XP_ICONS.notepad}
          label="resume.txt"
          sub="Text document"
          onClick={() => onOpen("resume")}
        />
        <McRow
          icon={XP_ICONS.notepad}
          label="contact.txt"
          sub="Text document"
          onClick={() => onOpen("contact")}
        />
        <McRow
          icon={XP_ICONS.notepad}
          label="skills.txt"
          sub="Text document"
          onClick={() => onOpen("skills")}
        />
        <McRow
          icon={XP_ICONS.minesweeper}
          label="dont_open.exe"
          sub="Application"
          onClick={onDontOpen}
        />
      </div>
    </>
  );
}

function ViewProjects() {
  const [sel, setSel] = useState<string>(PROJECTS[0]?.id ?? "");

  const current = PROJECTS.find((p) => p.id === sel) ?? PROJECTS[0];
  return (
    <div>
      <p className="xp-mc-section-title mb-2">projects</p>
      <div className="flex min-h-[280px] flex-col gap-3 lg:flex-row">
        <ul className="m-0 w-full shrink-0 list-none space-y-0.5 p-0 lg:max-w-[220px]">
          {PROJECTS.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className={`w-full rounded border px-2 py-1.5 text-left text-[11px] ${
                  sel === p.id
                    ? "border-[var(--xp-accent)] bg-[var(--xp-accent)] text-white"
                    : "border-transparent hover:border-[#aca899] hover:bg-[#eef4ff]"
                }`}
                onClick={() => setSel(p.id)}
              >
                <span className="font-bold">{p.title}</span>
                <span className="block text-[10px] opacity-90">{p.short}</span>
              </button>
            </li>
          ))}
        </ul>
        {current && <ProjectDetail project={current} />}
      </div>
    </div>
  );
}

function ProjectDetail({ project }: { project: PortfolioProject }) {
  return (
    <div className="min-h-0 min-w-0 flex-1 overflow-auto rounded border border-[#aca899] bg-[#fafafa] p-3">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <h2 className="m-0 text-[13px] font-bold text-[#0a246a]">{project.title}</h2>
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
            project.status === "Completed"
              ? "bg-[#dfd] text-[#060]"
              : "bg-[#ffd] text-[#660]"
          }`}
        >
          {project.status}
        </span>
      </div>
      <p className="mb-3 text-[12px] leading-relaxed text-[#333]">{project.description}</p>
      <p className="mb-1 text-[11px] font-bold text-[#444]">Tech stack</p>
      <p className="mb-3 font-mono text-[11px] text-[#222]">{project.stack.join(" · ")}</p>
      {project.imageSrc && (
        <div className="mb-3 overflow-hidden rounded border border-[#d4d0c8] bg-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.imageSrc}
            alt=""
            className="max-h-[140px] w-full object-cover object-center"
            width={400}
            height={140}
          />
          <p className="m-0 px-2 py-1 text-[10px] text-[#555]">
            Placeholder image — drop screenshots under{" "}
            <code className="rounded bg-[#eee] px-0.5">public/</code>
          </p>
        </div>
      )}
      {project.githubUrl && (
        <p className="m-0 text-[11px]">
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
    </div>
  );
}

function McRow({
  icon,
  label,
  sub,
  onClick,
}: {
  icon: string;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="xp-mc-tile xp-mc-tile--btn flex w-full max-w-md items-start gap-2 rounded-sm border border-transparent p-1 text-left hover:border-[#aca899] hover:bg-[#f0f0ff]"
      onClick={onClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={icon} alt="" width={32} height={32} className="xp-desktop-ico shrink-0" />
      <div>
        <div className="text-[#215dc6] underline">{label}</div>
        <div className="text-[11px] text-[#666]">{sub}</div>
      </div>
    </button>
  );
}
