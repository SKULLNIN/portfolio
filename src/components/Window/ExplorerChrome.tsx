"use client";

import type { ReactNode } from "react";
import { OWNER } from "@/data/portfolio-content";

type Props = {
  windowTitle: string;
  /** Icon shown in title bar, address bar, and taskbar */
  windowIcon: string;
  /** Override address field (e.g. "My Computer" for the shell namespace). */
  addressValue?: string;
  children: ReactNode;
};

function addressPath(title: string): string {
  const safe = title.replace(/[<>:"/\\|?*]/g, "_");
  const user = OWNER.displayName.replace(/[<>:"/\\|?*]/g, "_");
  return `C:\\Documents and Settings\\${user}\\Desktop\\${safe}`;
}

/**
 * Windows XP Explorer / folder window chrome: menu strip, toolbar (Back / Forward / Search),
 * address bar — matches the vanilla `createWindowElement` structure.
 */
export function ExplorerChrome({
  windowTitle,
  windowIcon,
  addressValue,
  children,
}: Props) {
  const path = addressValue ?? addressPath(windowTitle);

  return (
    <div className="xp-explorer">
      <div className="xp-explorer-menu-top" aria-hidden="true">
        <div className="xp-explorer-menu-top-inner">
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Favorites</span>
          <span>Tools</span>
          <span>Help</span>
        </div>
        <svg
          className="xp-explorer-winflag"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          aria-hidden
        >
          <rect x="0" y="0" width="7" height="7" fill="#f25022" />
          <rect x="9" y="0" width="7" height="7" fill="#7fba00" />
          <rect x="0" y="9" width="7" height="7" fill="#00a4ef" />
          <rect x="9" y="9" width="7" height="7" fill="#ffb900" />
        </svg>
      </div>
      <div className="xp-explorer-toolbar">
        <div className="xp-explorer-toolbar-main">
          <button type="button" className="xp-explorer-toolbtn" title="Back">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/arrow-back.svg" alt="" width={24} height={24} />
            <span>Back</span>
          </button>
          <button type="button" className="xp-explorer-toolbtn xp-explorer-toolbtn--icon" title="Forward">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/arrow-forward.svg" alt="" width={24} height={24} />
          </button>
          <span className="xp-explorer-tbsep" aria-hidden />
          <button type="button" className="xp-explorer-toolbtn xp-explorer-toolbtn--icon" title="Up">
            <span className="xp-explorer-up-ico" aria-hidden />
          </button>
          <span className="xp-explorer-tbsep" aria-hidden />
          <button type="button" className="xp-explorer-toolbtn" title="Search">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/search.svg" alt="" width={24} height={24} />
            <span>Search</span>
          </button>
          <button type="button" className="xp-explorer-toolbtn" title="Folders">
            <span className="xp-explorer-folders-ico" aria-hidden />
            <span>Folders</span>
          </button>
          <button type="button" className="xp-explorer-toolbtn" title="View">
            <span className="xp-explorer-view-ico" aria-hidden />
            <span>View</span>
            <span className="xp-explorer-caret" aria-hidden>
              ▼
            </span>
          </button>
        </div>
      </div>
      <div className="xp-explorer-address">
        <span className="xp-explorer-address-label">Address</span>
        <div className="xp-explorer-address-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="xp-explorer-address-icon" src={windowIcon} alt="" width={16} height={16} />
          <input
            type="text"
            readOnly
            className="xp-explorer-address-input"
            value={path}
            aria-label="Address"
          />
        </div>
        <button type="button" className="xp-explorer-go" title="Go">
          Go
        </button>
      </div>
      <div className="xp-explorer-content">{children}</div>
    </div>
  );
}
