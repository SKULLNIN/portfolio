"use client";

import { FILE_CERTS, FILE_PUBLICATIONS, FILE_SKILLS, OWNER } from "@/data/portfolio-content";

/**
 * My Documents — skills, certs, publications (explorer body).
 */
export function MyDocuments() {
  return (
    <div className="p-3 font-['Tahoma',sans-serif] text-[11px] text-black">
      <p className="xp-mc-section-title mb-2">Welcome to My Documents</p>
      <p className="mb-3 text-[12px] leading-relaxed text-[#333]">
        Personal folder for <strong>{OWNER.displayName}</strong> — open a file below.
      </p>
      <div className="flex flex-col gap-1 border border-[#aca899] bg-white p-2">
        <DocRow name="skills.txt" desc="Languages, frameworks, hardware" href="#skills" />
        <DocRow name="certifications.txt" desc="Courses & programs" href="#certs" />
        <DocRow name="publications.txt" desc="Papers & posters" href="#pubs" />
      </div>
      <div id="skills" className="mt-4 scroll-mt-4">
        <p className="xp-mc-section-title mb-1">skills.txt</p>
        <pre className="m-0 max-h-[200px] overflow-auto whitespace-pre-wrap rounded border border-[#aca899] bg-[#fafafa] p-2 font-mono text-[11px] leading-relaxed">
          {FILE_SKILLS}
        </pre>
      </div>
      <div id="certs" className="mt-4 scroll-mt-4">
        <p className="xp-mc-section-title mb-1">certifications.txt</p>
        <pre className="m-0 max-h-[160px] overflow-auto whitespace-pre-wrap rounded border border-[#aca899] bg-[#fafafa] p-2 font-mono text-[11px] leading-relaxed">
          {FILE_CERTS}
        </pre>
      </div>
      <div id="pubs" className="mt-4 scroll-mt-4">
        <p className="xp-mc-section-title mb-1">publications.txt</p>
        <pre className="m-0 max-h-[160px] overflow-auto whitespace-pre-wrap rounded border border-[#aca899] bg-[#fafafa] p-2 font-mono text-[11px] leading-relaxed">
          {FILE_PUBLICATIONS}
        </pre>
      </div>
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
