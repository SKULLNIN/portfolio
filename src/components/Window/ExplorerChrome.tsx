"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { OWNER } from "@/data/portfolio-content";
import {
  ExplorerToolbarProvider,
  useExplorerToolbarOptional,
  type ExplorerViewMode,
} from "@/context/ExplorerToolbarContext";
import { IeIconBack, IeIconForward } from "@/components/Apps/ie6/IeToolbarIcons";

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

const VIEW_OPTIONS: { mode: ExplorerViewMode; label: string }[] = [
  { mode: "xlarge", label: "Extra large icons" },
  { mode: "tiles", label: "Tiles" },
  { mode: "icons", label: "Icons" },
  { mode: "list", label: "List" },
  { mode: "details", label: "Details" },
];

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
  const defaultAddr = addressValue ?? addressPath(windowTitle);
  return (
    <ExplorerToolbarProvider defaultAddress={defaultAddr}>
      <ExplorerChromeInner windowIcon={windowIcon} defaultAddr={defaultAddr}>
        {children}
      </ExplorerChromeInner>
    </ExplorerToolbarProvider>
  );
}

function ExplorerChromeInner({
  windowIcon,
  defaultAddr,
  children,
}: {
  windowIcon: string;
  defaultAddr: string;
  children: ReactNode;
}) {
  const { api } = useExplorerToolbarOptional()!;

  const path = api.addressPath || defaultAddr;
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [backMenuOpen, setBackMenuOpen] = useState(false);
  const [forwardMenuOpen, setForwardMenuOpen] = useState(false);
  const viewWrapRef = useRef<HTMLDivElement>(null);
  const backClusterRef = useRef<HTMLDivElement>(null);
  const forwardClusterRef = useRef<HTMLDivElement>(null);

  const backHist = api.backHistory ?? [];
  const forwardHist = api.forwardHistory ?? [];

  useEffect(() => {
    if (!viewMenuOpen && !backMenuOpen && !forwardMenuOpen) return;
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (viewWrapRef.current?.contains(t)) return;
      if (backClusterRef.current?.contains(t)) return;
      if (forwardClusterRef.current?.contains(t)) return;
      setViewMenuOpen(false);
      setBackMenuOpen(false);
      setForwardMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [viewMenuOpen, backMenuOpen, forwardMenuOpen]);

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
          <div className="relative inline-flex" ref={backClusterRef}>
            <div className="xp-ie-toolbar-cluster">
              <button
                type="button"
                className="xp-ie-cluster-main"
                disabled={!api.canBack}
                title="Back"
                onClick={() => {
                  setBackMenuOpen(false);
                  setForwardMenuOpen(false);
                  api.onBack();
                }}
              >
                <span className="xp-ie-orb-wrap" aria-hidden>
                  <IeIconBack />
                </span>
                <span className="xp-ie-cluster-text">Back</span>
              </button>
              <button
                type="button"
                className="xp-ie-cluster-dd"
                disabled={!api.canBack || backHist.length === 0}
                aria-label="Back history"
                title="Back history"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!api.canBack || backHist.length === 0) return;
                  setViewMenuOpen(false);
                  setForwardMenuOpen(false);
                  setBackMenuOpen((o) => !o);
                }}
              >
                <span className="xp-ie-dd-tri">▼</span>
              </button>
            </div>
            {backMenuOpen && backHist.length > 0 && (
              <ul
                className="xp-explorer-history-menu"
                role="menu"
                aria-label="Back history"
              >
                {backHist.map((entry, i) => (
                  <li key={`b-${entry.label}-${i}`} role="none">
                    <button
                      type="button"
                      className="xp-explorer-history-menu-item"
                      role="menuitem"
                      onClick={() => {
                        entry.onSelect();
                        setBackMenuOpen(false);
                      }}
                    >
                      {entry.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative inline-flex" ref={forwardClusterRef}>
            <div className="xp-ie-toolbar-cluster xp-ie-toolbar-cluster-forward">
              <button
                type="button"
                className="xp-ie-cluster-main"
                disabled={!api.canForward}
                title="Forward"
                onClick={() => {
                  setBackMenuOpen(false);
                  setForwardMenuOpen(false);
                  api.onForward();
                }}
              >
                <span className="xp-ie-orb-wrap xp-ie-orb-wrap-sm" aria-hidden>
                  <IeIconForward muted={!api.canForward} />
                </span>
                <span className="xp-ie-cluster-text">Forward</span>
              </button>
              <button
                type="button"
                className="xp-ie-cluster-dd"
                disabled={!api.canForward || forwardHist.length === 0}
                aria-label="Forward history"
                title="Forward history"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!api.canForward || forwardHist.length === 0) return;
                  setViewMenuOpen(false);
                  setBackMenuOpen(false);
                  setForwardMenuOpen((o) => !o);
                }}
              >
                <span className="xp-ie-dd-tri">▼</span>
              </button>
            </div>
            {forwardMenuOpen && forwardHist.length > 0 && (
              <ul
                className="xp-explorer-history-menu"
                role="menu"
                aria-label="Forward history"
              >
                {forwardHist.map((entry, i) => (
                  <li key={`f-${entry.label}-${i}`} role="none">
                    <button
                      type="button"
                      className="xp-explorer-history-menu-item"
                      role="menuitem"
                      onClick={() => {
                        entry.onSelect();
                        setForwardMenuOpen(false);
                      }}
                    >
                      {entry.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <span className="xp-explorer-tbsep" aria-hidden />
          <button
            type="button"
            className="xp-explorer-toolbtn xp-explorer-toolbtn--icon"
            title="Up"
            disabled={!api.canUp}
            onClick={api.onUp}
          >
            <span className="xp-explorer-up-ico" aria-hidden />
          </button>
          <span className="xp-explorer-tbsep" aria-hidden />
          <button
            type="button"
            className="xp-explorer-toolbtn"
            title="Search"
            onClick={api.onSearchToggle}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/search.svg" alt="" width={24} height={24} />
            <span>Search</span>
          </button>
          <button
            type="button"
            className="xp-explorer-toolbtn"
            title="Folders"
            onClick={() => {}}
          >
            <span className="xp-explorer-folders-ico" aria-hidden />
            <span>Folders</span>
          </button>
          <div className="relative inline-block" ref={viewWrapRef}>
            <button
              type="button"
              className="xp-explorer-toolbtn"
              title="View"
              aria-expanded={viewMenuOpen}
              aria-haspopup="listbox"
              onClick={() => {
                setBackMenuOpen(false);
                setForwardMenuOpen(false);
                setViewMenuOpen((o) => !o);
              }}
            >
              <span className="xp-explorer-view-ico" aria-hidden />
              <span>View</span>
              <span className="xp-explorer-caret" aria-hidden>
                ▼
              </span>
            </button>
            {viewMenuOpen && (
              <ul
                className="xp-explorer-view-menu"
                role="listbox"
                aria-label="View mode"
              >
                {VIEW_OPTIONS.map(({ mode, label }) => (
                  <li key={mode} role="option" aria-selected={api.viewMode === mode}>
                    <button
                      type="button"
                      className={
                        api.viewMode === mode
                          ? "xp-explorer-view-menu-item xp-explorer-view-menu-item--active"
                          : "xp-explorer-view-menu-item"
                      }
                      onClick={() => {
                        api.onViewModeChange(mode);
                        setViewMenuOpen(false);
                      }}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
      {api.searchOpen && (
        <div className="xp-explorer-search-strip">
          <span className="xp-explorer-search-label">Search</span>
          <input
            type="search"
            className="xp-explorer-search-input"
            placeholder="Filter items in this folder…"
            value={api.searchQuery}
            onChange={(e) => api.onSearchQueryChange(e.target.value)}
            aria-label="Search in folder"
          />
        </div>
      )}
      <div className="xp-explorer-content">{children}</div>
    </div>
  );
}
