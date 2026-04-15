"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  onFileNew: () => void;
  onFileOpen: () => void;
  onFileSave: () => void;
  onFileExit: () => void;
  onEditSelectAll: () => void;
  onFormatWordWrap: () => void;
  wordWrap: boolean;
};

/** Notepad menu bar with working File / Edit / Format actions. */
export function NotepadChrome({
  children,
  onFileNew,
  onFileOpen,
  onFileSave,
  onFileExit,
  onEditSelectAll,
  onFormatWordWrap,
  wordWrap,
}: Props) {
  return (
    <div className="xp-nt-frame">
      <div className="xp-nt-menubar">
        <NotepadMenu label="File">
          <button type="button" className="xp-nt-mi" onClick={onFileNew}>
            New
          </button>
          <button type="button" className="xp-nt-mi" onClick={onFileOpen}>
            Open…
          </button>
          <button type="button" className="xp-nt-mi" onClick={onFileSave}>
            Save
          </button>
          <hr className="xp-nt-msep" />
          <button type="button" className="xp-nt-mi" onClick={onFileExit}>
            Exit
          </button>
        </NotepadMenu>
        <NotepadMenu label="Edit">
          <button type="button" className="xp-nt-mi" onClick={onEditSelectAll}>
            Select All
          </button>
        </NotepadMenu>
        <NotepadMenu label="Format">
          <button type="button" className="xp-nt-mi" onClick={onFormatWordWrap}>
            {wordWrap ? "✓ Word Wrap" : "Word Wrap"}
          </button>
        </NotepadMenu>
        <span className="xp-nt-mi-label">View</span>
        <span className="xp-nt-mi-label">Help</span>
      </div>
      <div className="xp-nt-client">{children}</div>
    </div>
  );
}

function NotepadMenu({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <details className="xp-nt-menu">
      <summary className="xp-nt-msum">{label}</summary>
      <div className="xp-nt-mpanel">{children}</div>
    </details>
  );
}
