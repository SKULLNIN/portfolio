"use client";

import { XP_ICONS } from "@/lib/xp-icons";

type Props = {
  title?: string;
  message: string;
  onOk: () => void;
};

/** Classic XP-style alert (Luna blue title, gray body, OK button). */
export function XpMessageBox({
  title = "Internet Explorer",
  message,
  onOk,
}: Props) {
  return (
    <div
      className="xp-msg-overlay pointer-events-auto fixed inset-0 z-[200] flex items-center justify-center bg-black/25 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="xp-msg-title"
    >
      <div className="xp-msg-box flex w-full max-w-[380px] flex-col overflow-hidden rounded-t border border-[#003c74] bg-[#ece9d8] shadow-[4px_4px_10px_rgba(0,0,0,0.45)]">
        <div
          id="xp-msg-title"
          className="flex items-center gap-2 bg-gradient-to-b from-[#0a246a] to-[#0c2d8c] px-3 py-1.5 text-[13px] font-bold text-white"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={XP_ICONS.internetExplorer} alt="" width={16} height={16} />
          {title}
        </div>
        <div className="flex gap-3 p-4">
          <div className="xp-msg-icon h-8 w-8 shrink-0 bg-[#ffcc00] text-center text-[20px] leading-8">
            !
          </div>
          <p className="m-0 flex-1 text-[12px] leading-snug text-black">{message}</p>
        </div>
        <div className="flex justify-center border-t border-[#d4d0c8] bg-[#ece9d8] px-4 py-3">
          <button
            type="button"
            className="xp-msg-ok min-w-[72px] rounded border border-[#003c74] bg-[#ece9d8] px-4 py-1 text-[12px] font-normal text-black shadow-[inset_-1px_-1px_0_#fff,inset_1px_1px_0_#aca899]"
            onClick={onOk}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
