"use client";

import { useCallback, useRef, useState, type MouseEvent } from "react";
import { APP_REGISTRY } from "@/data/apps";
import { useWindowManager } from "@/context/WindowContext";
import { queueControlPanelApplet } from "@/lib/control-panel-open";
import { XP_ICONS } from "@/lib/xp-icons";
import { resolveAddressBarInput } from "@/lib/navigate-url";
import { XpMessageBox } from "@/components/Apps/XpMessageBox";
import {
  IeIconBack,
  IeIconEdit,
  IeIconFavorites,
  IeIconForward,
  IeIconGoArrow,
  IeIconHistory,
  IeIconHome,
  IeIconMail,
  IeIconMedia,
  IeIconPrint,
  IeIconRefresh,
  IeIconSearch,
  IeIconStatusGlobe,
  IeIconStop,
  IeIconWindowsLogo,
} from "@/components/Apps/ie6/IeToolbarIcons";
import { buildIeHomeSrcDoc } from "@/components/Apps/ie/buildIeHomeSrcDoc";
import { OWNER } from "@/data/portfolio-content";

type Nav = { urls: string[]; idx: number };

const HOME_LOADING_DOC = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:16px;font:12px Tahoma,sans-serif;background:#fff">Loading…</body></html>`;

export function InternetExplorer() {
  const { openApp } = useWindowManager();
  const icon = APP_REGISTRY["internet-explorer"].icon;
  const [nav, setNav] = useState<Nav>({ urls: ["about:home"], idx: 0 });
  const [addressInput, setAddressInput] = useState("about:home");
  const [status, setStatus] = useState("Done");
  const [msg, setMsg] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";

  const currentUrl = nav.urls[nav.idx] ?? "about:home";
  const isHome = currentUrl === "about:home";
  const canBack = nav.idx > 0;
  const canForward = nav.idx < nav.urls.length - 1;

  const pushUrl = useCallback((url: string) => {
    setNav((n) => ({
      urls: [...n.urls.slice(0, n.idx + 1), url],
      idx: n.idx + 1,
    }));
  }, []);

  const go = useCallback(
    (e?: MouseEvent<HTMLButtonElement>) => {
      const openNewTab = Boolean(e && (e.ctrlKey || e.metaKey));
      const n = resolveAddressBarInput(
        addressInput,
        typeof window !== "undefined" ? window.location.origin : undefined
      );
      if (!n.ok) {
        setMsg(
          "That address could not be understood. Try a domain, site name, or https:// URL."
        );
        return;
      }
      if (openNewTab && n.url !== "about:home") {
        window.open(n.url, "_blank", "noopener,noreferrer");
        return;
      }

      const navUrl = n.url;
      if (navUrl !== "about:home" && origin) {
        try {
          const u = new URL(navUrl);
          const site = new URL(origin);
          const isHttp = u.protocol === "http:" || u.protocol === "https:";
          const isSameSiteIeGo =
            u.origin === site.origin &&
            u.pathname === "/ie-go" &&
            u.searchParams.has("u");
          if (isHttp && u.origin !== site.origin && !isSameSiteIeGo) {
            window.open(u.href, "_blank", "noopener,noreferrer");
            setAddressInput(navUrl);
            setStatus("Opened in new tab");
            return;
          }
        } catch {
          /* fall through to iframe */
        }
      }

      pushUrl(navUrl);
      setAddressInput(navUrl === "about:home" ? "about:blank" : navUrl);
      setIframeKey((k) => k + 1);
    },
    [addressInput, origin, pushUrl]
  );

  const home = useCallback(() => {
    pushUrl("about:home");
    setAddressInput("about:blank");
    setIframeKey((k) => k + 1);
  }, [pushUrl]);

  const back = useCallback(() => {
    if (!canBack) return;
    const newIdx = nav.idx - 1;
    const next = nav.urls[newIdx] ?? "about:home";
    setAddressInput(next === "about:home" ? "about:blank" : next);
    setNav((n) => ({ ...n, idx: newIdx }));
    setStatus("Done");
  }, [canBack, nav.idx, nav.urls]);

  const forward = useCallback(() => {
    if (!canForward) return;
    const newIdx = nav.idx + 1;
    const next = nav.urls[newIdx] ?? "about:home";
    setAddressInput(next === "about:home" ? "about:blank" : next);
    setNav((n) => ({ ...n, idx: newIdx }));
    setStatus("Done");
  }, [canForward, nav.idx, nav.urls]);

  const stop = useCallback(() => {
    try {
      iframeRef.current?.contentWindow?.stop?.();
    } catch {
      /* cross-origin */
    }
    setStatus("Stopped");
  }, []);

  const refresh = useCallback(() => {
    setIframeKey((k) => k + 1);
    setStatus("Refreshing...");
  }, []);

  const openSearch = useCallback(() => {
    window.open("https://www.google.com", "_blank", "noopener,noreferrer");
  }, []);

  const onIframeLoad = useCallback(() => {
    setStatus("Done");
  }, []);

  return (
    <div className="xp-ie-app flex h-full min-h-0 flex-col">
      {msg && (
        <XpMessageBox message={msg} onOk={() => setMsg(null)} />
      )}
      <div className="xp-ie-menubar shrink-0">
        <div className="xp-ie-menubar-items">
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Favorites</span>
          <span>Tools</span>
          <span>Help</span>
        </div>
        <div className="xp-ie-menubar-flag" title="">
          <IeIconWindowsLogo />
        </div>
      </div>

      <div className="xp-ie-navstrip shrink-0">
        <div className="xp-ie-toolbar-cluster">
          <button
            type="button"
            className="xp-ie-cluster-main"
            disabled={!canBack}
            onClick={back}
            title="Back"
          >
            <span className="xp-ie-orb-wrap" aria-hidden>
              <IeIconBack />
            </span>
            <span className="xp-ie-cluster-text">Back</span>
          </button>
          <button
            type="button"
            className="xp-ie-cluster-dd"
            disabled={!canBack}
            aria-label="Back history"
            title="Back history"
          >
            <span className="xp-ie-dd-tri">▼</span>
          </button>
        </div>

        <div className="xp-ie-toolbar-cluster xp-ie-toolbar-cluster-forward">
          <button
            type="button"
            className="xp-ie-cluster-main"
            disabled={!canForward}
            onClick={forward}
            title="Forward"
          >
            <span className="xp-ie-orb-wrap xp-ie-orb-wrap-sm" aria-hidden>
              <IeIconForward muted={!canForward} />
            </span>
            <span className="xp-ie-cluster-text">Forward</span>
          </button>
          <button
            type="button"
            className="xp-ie-cluster-dd"
            disabled={!canForward}
            aria-label="Forward history"
            title="Forward history"
          >
            <span className="xp-ie-dd-tri">▼</span>
          </button>
        </div>

        <button type="button" className="xp-ie-squarebtn" onClick={stop} title="Stop">
          <IeIconStop />
        </button>
        <button type="button" className="xp-ie-squarebtn" onClick={refresh} title="Refresh">
          <IeIconRefresh />
        </button>
        <button type="button" className="xp-ie-squarebtn" onClick={home} title="Home">
          <IeIconHome />
        </button>

        <div className="xp-ie-tool-div" aria-hidden />

        <button
          type="button"
          className="xp-ie-labeledbtn"
          onClick={openSearch}
          title="Search the Web"
        >
          <IeIconSearch />
          <span>Search</span>
        </button>
        <button type="button" className="xp-ie-labeledbtn" title="Favorites">
          <IeIconFavorites />
          <span>Favorites</span>
        </button>
        <button type="button" className="xp-ie-labeledbtn" title="Media">
          <IeIconMedia />
          <span>Media</span>
        </button>
        <button type="button" className="xp-ie-iconbtn" title="History">
          <IeIconHistory />
        </button>
        <button type="button" className="xp-ie-iconbtn" title="Mail">
          <IeIconMail />
        </button>
        <button
          type="button"
          className="xp-ie-iconbtn"
          title="Skills — open in Control Panel"
          onClick={() => {
            openApp("control-panel");
            queueControlPanelApplet("skills", 0);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={XP_ICONS.notepad}
            alt=""
            width={20}
            height={20}
            className="xp-ie-skills-ico"
          />
        </button>
        <button
          type="button"
          className="xp-ie-iconbtn"
          title="Print"
          onClick={() => {
            try {
              iframeRef.current?.contentWindow?.print?.();
            } catch {
              /* cross-origin */
            }
          }}
        >
          <IeIconPrint />
        </button>
        <button type="button" className="xp-ie-iconbtn" title="Edit">
          <IeIconEdit />
        </button>
      </div>

      <div className="xp-ie-addressrow shrink-0">
        <span className="xp-ie-address-label">Address</span>
        <div className="xp-ie-address-combo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={icon} alt="" width={16} height={16} className="xp-ie-address-ico" />
          <input
            className="xp-ie-address-input"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") go();
            }}
            aria-label="Address"
            spellCheck={false}
          />
          <button type="button" className="xp-ie-combo-chev" aria-label="Addresses" title="Addresses">
            <span className="xp-ie-dd-tri">▼</span>
          </button>
        </div>
        <button type="button" className="xp-ie-go-btn" onClick={(e) => go(e)} title="Go (Ctrl+click: new tab)">
          <span className="xp-ie-go-arrow" aria-hidden>
            <IeIconGoArrow />
          </span>
          <span className="xp-ie-go-label">Go</span>
        </button>
        <button type="button" className="xp-ie-links" title="Links">
          Links <span className="xp-ie-links-gt">&gt;&gt;</span>
        </button>
      </div>

      <div className="xp-ie-favrow shrink-0 border-b border-[#aca899] bg-[#ece9d8] px-1 py-0.5">
        <span className="inline-block px-1 text-[10px] font-bold text-[#003399]">
          Favorites
        </span>
        <button
          type="button"
          className="xp-ie-favlink"
          onClick={() => {
            window.open(OWNER.github, "_blank", "noopener,noreferrer");
            setStatus("Opened in new tab");
          }}
        >
          GitHub
        </button>
        <button
          type="button"
          className="xp-ie-favlink"
          onClick={() => {
            window.open(OWNER.linkedin, "_blank", "noopener,noreferrer");
            setStatus("Opened in new tab");
          }}
        >
          LinkedIn
        </button>
        <button
          type="button"
          className="xp-ie-favlink"
          onClick={() => {
            const pdf =
              typeof window !== "undefined"
                ? new URL(OWNER.resumePdf, window.location.origin).href
                : OWNER.resumePdf;
            window.open(pdf, "_blank", "noopener,noreferrer");
            setStatus("Opened in new tab");
          }}
        >
          Résumé (PDF)
        </button>
        <button
          type="button"
          className="xp-ie-favlink"
          onClick={() => {
            window.open(`mailto:${OWNER.email}`);
            setStatus("Opening mail…");
          }}
        >
          Email
        </button>
      </div>

      <div className="xp-ie-iframe-wrap xp-ie-scrollbar min-h-0 flex-1 bg-white">
        {isHome ? (
          <iframe
            key={`home-${iframeKey}`}
            ref={iframeRef}
            title="Home"
            className="xp-ie-iframe block h-full w-full border-0"
            srcDoc={origin ? buildIeHomeSrcDoc() : HOME_LOADING_DOC}
            onLoad={onIframeLoad}
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
        ) : (
          <iframe
            key={`web-${iframeKey}-${currentUrl}`}
            ref={iframeRef}
            title="Web"
            className="xp-ie-iframe block h-full w-full border-0"
            src={currentUrl}
            onLoad={onIframeLoad}
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      <div className="xp-ie-statusbar shrink-0">
        <div className="xp-ie-status-seg xp-ie-status-done">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={icon} alt="" width={14} height={14} className="xp-ie-status-ie" />
          <span>{status}</span>
        </div>
        <div className="xp-ie-status-seg xp-ie-status-mid" aria-hidden />
        <div className="xp-ie-status-seg xp-ie-status-zone">
          <span className="xp-ie-status-internet">
            <IeIconStatusGlobe /> Internet
          </span>
          <span className="xp-ie-status-grip" aria-hidden />
        </div>
      </div>
    </div>
  );
}
