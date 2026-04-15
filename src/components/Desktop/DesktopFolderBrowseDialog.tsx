"use client";

import { useState } from "react";
import { XP_ICONS } from "@/lib/xp-icons";
import { XpMessageBox } from "@/components/Apps/XpMessageBox";

type FileEntry = { name: string; content: string };

type Props = {
  open: boolean;
  folderName: string;
  files: FileEntry[];
  onClose: () => void;
};

/** Minimal “open folder” window — lists virtual files (empty folders show a placeholder). */
export function DesktopFolderBrowseDialog({
  open,
  folderName,
  files,
  onClose,
}: Props) {
  const [preview, setPreview] = useState<FileEntry | null>(null);

  if (!open) return null;

  return (
    <>
      {preview && (
        <XpMessageBox
          title={preview.name}
          message={preview.content}
          onOk={() => setPreview(null)}
        />
      )}
      <div
        className="xp-dp-overlay pointer-events-auto fixed inset-0 z-[480] flex items-center justify-center bg-black/15 p-4"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="flex w-full max-w-[360px] flex-col overflow-hidden rounded-t border border-[#003c74] bg-[#ece9d8] shadow-[4px_4px_12px_rgba(0,0,0,0.4)]"
          role="dialog"
          aria-label={folderName}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 bg-gradient-to-b from-[#0a5bc4] to-[#083b8a] px-2 py-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={XP_ICONS.myDocuments} alt="" width={16} height={16} />
            <span className="flex-1 truncate text-[12px] font-bold text-white">
              {folderName}
            </span>
            <button
              type="button"
              className="xp-dp-titlebtn xp-dp-titlebtn--close text-white"
              aria-label="Close"
              onClick={onClose}
            >
              ×
            </button>
          </div>
          <div className="border-b border-[#aca899] bg-[#ece9d8] px-2 py-1 text-[10px] text-[#333]">
            File &nbsp; Edit &nbsp; View &nbsp; Favorites &nbsp; Tools &nbsp; Help
          </div>
          <div className="min-h-[140px] bg-white p-2">
            <p className="mb-1 text-[10px] font-bold text-[#333]">
              Files stored in this folder
            </p>
            <ul className="m-0 list-none border border-[#aca899] bg-white p-0">
              {files.length === 0 ? (
                <li className="px-2 py-6 text-center text-[11px] text-[#666]">
                  This folder is empty.
                </li>
              ) : (
                files.map((f) => (
                  <li key={f.name} className="border-b border-[#ece9d8] last:border-0">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-[11px] text-[#215dc6] hover:bg-[#316ac5] hover:text-white"
                      onDoubleClick={() => setPreview(f)}
                      onClick={() => setPreview(f)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={XP_ICONS.notepad}
                        alt=""
                        width={16}
                        height={16}
                        className="shrink-0"
                      />
                      <span className="underline">{f.name}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
            <p className="mt-1 text-[10px] text-[#666]">
              {files.length === 0
                ? "Add files is not available in this demo."
                : "Single-click or double-click a file to open."}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
