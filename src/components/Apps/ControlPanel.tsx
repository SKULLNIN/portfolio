"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CP_ACCENT_COLORS,
  CP_CATEGORY_ROWS,
  CP_CLASSIC_APPLETS,
  CP_PROGRAMS,
  CP_SKILLS,
  CP_SYSTEM,
  CP_WALLPAPERS,
  type CpAppletId,
} from "@/data/control-panel-content";
import { useSystemSettings } from "@/context/SystemSettingsContext";
import {
  CP_OPEN_APPLET_EVENT,
  clearPendingControlPanelAppletStorage,
  readPendingControlPanelApplet,
  type CpOpenAppletDetail,
} from "@/lib/control-panel-open";
import { XP_ICONS } from "@/lib/xp-icons";

type ViewMode = "category" | "classic";

export function ControlPanel() {
  const {
    wallpaperIndex: wpI,
    setWallpaperIndex: setWpI,
    accentIndex: accentI,
    setAccentIndex: setAccentI,
    volume: vol,
    setVolume: setVol,
  } = useSystemSettings();
  const [view, setView] = useState<ViewMode>("category");
  const [status, setStatus] = useState(
    "9 categories  |  Click a category to get started."
  );
  const [dialog, setDialog] = useState<{
    id: CpAppletId;
    tab: number;
  } | null>(null);
  const [classicSel, setClassicSel] = useState<number | null>(null);

  const openApplet = useCallback((id: CpAppletId, tab = 0) => {
    setDialog({ id, tab });
  }, []);

  const closeDialog = useCallback(() => setDialog(null), []);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDialog();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [closeDialog]);

  useEffect(() => {
    const apply = (d: CpOpenAppletDetail) => {
      setDialog({ id: d.id, tab: d.tab ?? 0 });
      clearPendingControlPanelAppletStorage();
    };
    const pending = readPendingControlPanelApplet();
    if (pending) apply(pending);

    const onEvt = (e: Event) => {
      const ce = e as CustomEvent<CpOpenAppletDetail>;
      if (ce.detail?.id) apply(ce.detail);
    };
    window.addEventListener(CP_OPEN_APPLET_EVENT, onEvt);
    return () => window.removeEventListener(CP_OPEN_APPLET_EVENT, onEvt);
  }, []);

  useEffect(() => {
    const t =
      view === "category"
        ? "9 categories  |  Click a category to get started."
        : `${CP_CLASSIC_APPLETS.length} items  |  Double-click an item to open it.`;
    setStatus(t);
  }, [view]);

  const dialogDef = useMemo(() => {
    if (!dialog) return null;
    return getDialogDef(dialog.id, {
      wpI,
      setWpI,
      accentI,
      setAccentI,
      vol,
      setVol,
    });
  }, [dialog, wpI, accentI, vol]);

  const activeTab =
    dialog && dialogDef
      ? Math.min(Math.max(0, dialog.tab), dialogDef.tabs.length - 1)
      : 0;

  return (
    <div className="xp-cp-root flex h-full min-h-0 flex-col bg-[#ece9d8] font-['Tahoma',sans-serif] text-[11px] text-black">
      <div className="xp-cp-shell flex min-h-0 flex-1">
        <aside className="xp-cp-sidebar">
          <div className="xp-cp-sb-banner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={XP_ICONS.controlPanel}
              alt=""
              width={18}
              height={18}
              className="xp-cp-sb-banner-ico"
            />
            Control Panel
          </div>
          <div className="xp-cp-sb-sect">Control Panel</div>
          <button
            type="button"
            className={`xp-cp-sb-link ${view === "category" ? "xp-cp-sb-link--active" : ""}`}
            onClick={() => setView("category")}
          >
            <span className="xp-cp-sb-ico">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={XP_ICONS.myDocuments}
                alt=""
                width={20}
                height={20}
                className="xp-cp-sb-ico-img"
              />
            </span>
            Category View
          </button>
          <button
            type="button"
            className={`xp-cp-sb-link ${view === "classic" ? "xp-cp-sb-link--active" : ""}`}
            onClick={() => setView("classic")}
          >
            <span className="xp-cp-sb-ico">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={XP_ICONS.myComputer}
                alt=""
                width={20}
                height={20}
                className="xp-cp-sb-ico-img"
              />
            </span>
            Classic View
          </button>
          <div className="xp-cp-sb-sect xp-cp-sb-sect--spaced">See Also</div>
          <button
            type="button"
            className="xp-cp-sb-link"
            onClick={() => openApplet("system")}
          >
            <span className="xp-cp-sb-ico">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={XP_ICONS.myComputer}
                alt=""
                width={20}
                height={20}
                className="xp-cp-sb-ico-img"
              />
            </span>
            System Info
          </button>
          <button
            type="button"
            className="xp-cp-sb-link"
            onClick={() => openApplet("network")}
          >
            <span className="xp-cp-sb-ico">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={XP_ICONS.internetExplorer}
                alt=""
                width={20}
                height={20}
                className="xp-cp-sb-ico-img"
              />
            </span>
            Network
          </button>
          <button
            type="button"
            className="xp-cp-sb-link"
            onClick={() => openApplet("addremove")}
          >
            <span className="xp-cp-sb-ico">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={XP_ICONS.myDocuments}
                alt=""
                width={20}
                height={20}
                className="xp-cp-sb-ico-img"
              />
            </span>
            Programs
          </button>
        </aside>

        <div className="xp-cp-main flex min-w-0 flex-1 flex-col">
          <div className="xp-cp-addr">
            <div className="xp-cp-bc">
              <span className="xp-cp-bc-part">Control Panel</span>
            </div>
            <div className="xp-cp-view-toggle">
              <button
                type="button"
                className={`xp-cp-vt ${view === "category" ? "xp-cp-vt--on" : ""}`}
                onClick={() => setView("category")}
              >
                Category
              </button>
              <button
                type="button"
                className={`xp-cp-vt ${view === "classic" ? "xp-cp-vt--on" : ""}`}
                onClick={() => setView("classic")}
              >
                Classic
              </button>
            </div>
          </div>

          <div className="xp-cp-content xp-cp-scrollbar min-h-0 flex-1 overflow-y-auto">
            {view === "category" ? (
              <div className="xp-cp-cat">
                <h1 className="xp-cp-pick-title">Pick a category</h1>
                <div className="xp-cp-cat-grid">
                  {CP_CATEGORY_ROWS.map((row) => (
                    <div key={row.title} className="xp-cp-cat-tile">
                      <button
                        type="button"
                        className="xp-cp-cat-ico"
                        onClick={() => openApplet(row.applet)}
                        aria-label={row.title}
                      >
                        {row.emoji}
                      </button>
                      <div className="xp-cp-cat-info">
                        <button
                          type="button"
                          className="xp-cp-cat-title"
                          onClick={() => openApplet(row.applet)}
                        >
                          {row.title}
                        </button>
                        <div className="xp-cp-cat-subs">
                          {row.subs.map((s) => (
                            <button
                              key={s.label}
                              type="button"
                              className="xp-cp-cat-sub"
                              onClick={() =>
                                openApplet(s.applet, s.tab ?? 0)
                              }
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="xp-cp-classic">
                {CP_CLASSIC_APPLETS.map((a, i) => (
                  <button
                    key={a.name}
                    type="button"
                    className={`xp-cp-applet ${classicSel === i ? "xp-cp-applet--sel" : ""}`}
                    onClick={() => {
                      setClassicSel(i);
                      setStatus(`${a.name} — Double-click to open`);
                    }}
                    onDoubleClick={() => openApplet(a.id)}
                  >
                    <span className="xp-cp-applet-ico" aria-hidden>
                      {a.ico}
                    </span>
                    <span>{a.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="xp-cp-status">{status}</div>
        </div>
      </div>

      {dialog && dialogDef && (
        <div
          className="xp-cp-overlay"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDialog();
          }}
        >
          <div
            className="xp-cp-dlg"
            role="dialog"
            aria-labelledby="xp-cp-dlg-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="xp-cp-dlg-titlebar">
              <span className="xp-cp-dlg-ico" aria-hidden>
                {dialogDef.icon}
              </span>
              <span id="xp-cp-dlg-title" className="xp-cp-dlg-title">
                {dialogDef.title}
              </span>
              <button
                type="button"
                className="xp-cp-dlg-close"
                aria-label="Close"
                onClick={closeDialog}
              >
                ×
              </button>
            </div>
            <div className="xp-cp-dlg-tabs">
              {dialogDef.tabs.map((t, i) => (
                <button
                  key={`${dialog.id}-${i}-${t.name}`}
                  type="button"
                  className={`xp-cp-dtab ${activeTab === i ? "xp-cp-dtab--active" : ""}`}
                  onClick={() => setDialog({ id: dialog.id, tab: i })}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <div className="xp-cp-dlg-body xp-cp-scrollbar">
              {dialogDef.tabs[activeTab]?.content}
            </div>
            <div className="xp-cp-dlg-foot">
              <button type="button" className="xp-cp-xpbtn" onClick={closeDialog}>
                Cancel
              </button>
              <button type="button" className="xp-cp-xpbtn xp-cp-xpbtn--primary" onClick={closeDialog}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type DlgCtx = {
  wpI: number;
  setWpI: (n: number) => void;
  accentI: number;
  setAccentI: (n: number) => void;
  vol: number;
  setVol: (n: number) => void;
};

function getDialogDef(id: CpAppletId, ctx: DlgCtx) {
  const S = CP_SYSTEM;
  switch (id) {
    case "system":
      return {
        icon: "💻",
        title: "System Properties",
        tabs: [
          {
            name: "General",
            content: (
              <div className="xp-cp-panel">
                <div className="xp-cp-sys-brand">
                  <span className="xp-cp-sys-logo" aria-hidden>
                    🖥
                  </span>
                  <div>
                    <div className="xp-cp-sys-ms">
                      Microsoft<sup>®</sup>
                    </div>
                    <div className="xp-cp-sys-xp">
                      Windows <span>XP</span>
                    </div>
                    <div className="xp-cp-sys-ed">Portfolio Edition</div>
                  </div>
                </div>
                <fieldset className="xp-cp-fieldset">
                  <legend>Registered to</legend>
                  <table className="xp-cp-table">
                    <tbody>
                      <tr>
                        <td className="xp-cp-tk">Name:</td>
                        <td>{S.name}</td>
                      </tr>
                      <tr>
                        <td className="xp-cp-tk">Organization:</td>
                        <td>{S.org}</td>
                      </tr>
                      <tr>
                        <td className="xp-cp-tk">Location:</td>
                        <td>{S.registered}</td>
                      </tr>
                    </tbody>
                  </table>
                </fieldset>
                <fieldset className="xp-cp-fieldset">
                  <legend>Computer</legend>
                  <table className="xp-cp-table">
                    <tbody>
                      <tr>
                        <td className="xp-cp-tk">Processor:</td>
                        <td>{S.processor}</td>
                      </tr>
                      <tr>
                        <td className="xp-cp-tk">RAM:</td>
                        <td>{S.ram}</td>
                      </tr>
                      <tr>
                        <td className="xp-cp-tk">GPU:</td>
                        <td>{S.gpu}</td>
                      </tr>
                      <tr>
                        <td className="xp-cp-tk">OS:</td>
                        <td>{S.os}</td>
                      </tr>
                    </tbody>
                  </table>
                </fieldset>
              </div>
            ),
          },
          {
            name: "Advanced",
            content: (
              <p className="xp-cp-muted">
                Visual effects and performance options are simulated for this portfolio
                shell.
              </p>
            ),
          },
        ],
      };
    case "skills": {
      const entries = Object.entries(CP_SKILLS);
      return {
        icon: "⭐",
        title: "Skills & Technologies",
        tabs: entries.map(([cat, items]) => ({
          name: cat.split(" ")[0].slice(0, 12),
          content: (
            <div className="xp-cp-panel">
              <h3 className="xp-cp-sk-cat">{cat}</h3>
              {items.map((s) => (
                <div key={s.name} className="xp-cp-sk-row">
                  <div className="xp-cp-sk-lbl">
                    <span>{s.name}</span>
                    <span>{s.pct}%</span>
                  </div>
                  <div className="xp-cp-sk-track">
                    <div
                      className="xp-cp-sk-fill"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ),
        })),
      };
    }
    case "addremove":
      return {
        icon: "📦",
        title: "Add or Remove Programs",
        tabs: [
          {
            name: "Currently Installed",
            content: (
              <ul className="xp-cp-prog">
                {CP_PROGRAMS.map((p, i) => (
                  <li key={i} className="xp-cp-prog-item">
                    <span>{p.ico}</span>
                    <div>
                      <div className="xp-cp-prog-name">{p.name}</div>
                      <div className="xp-cp-prog-meta">
                        {p.type} · {p.date}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ),
          },
          {
            name: "Add New Programs",
            content: (
              <p className="xp-cp-muted">
                Install new projects from GitHub — see Internet Explorer favorites.
              </p>
            ),
          },
          {
            name: "Windows Components",
            content: (
              <div className="xp-cp-panel">
                <p className="xp-cp-muted xp-cp-spaced-b">
                  Add or remove portfolio components (simulated).
                </p>
                <ul className="xp-cp-comp-list">
                  {(
                    [
                      ["Portfolio theme engine", true],
                      ["Live data widgets", true],
                      ["Analytics dashboard", false],
                    ] as const
                  ).map(([label, on]) => (
                    <li key={label} className="xp-cp-comp-row">
                      <span>{label}</span>
                      <span
                        className={`xp-cp-toggle ${on ? "xp-cp-toggle--on" : ""}`}
                        role="presentation"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ),
          },
        ],
      };
    case "display":
      return {
        icon: "🎨",
        title: "Display Properties",
        tabs: [
          {
            name: "Themes",
            content: (
              <div className="xp-cp-panel">
                <p className="xp-cp-muted">Wallpaper preview (portfolio demo)</p>
                <button
                  type="button"
                  className="xp-cp-preview"
                  style={{ background: CP_WALLPAPERS[ctx.wpI]?.css }}
                  onClick={() =>
                    ctx.setWpI((ctx.wpI + 1) % CP_WALLPAPERS.length)
                  }
                >
                  <span className="xp-cp-preview-lbl">Click to cycle</span>
                </button>
                <p className="xp-cp-muted">Current: {CP_WALLPAPERS[ctx.wpI]?.name}</p>
              </div>
            ),
          },
          {
            name: "Desktop",
            content: (
              <div className="xp-cp-wp-grid">
                {CP_WALLPAPERS.map((w, i) => (
                  <button
                    key={w.name}
                    type="button"
                    className={`xp-cp-wp-swatch ${i === ctx.wpI ? "xp-cp-wp-swatch--on" : ""}`}
                    style={{ background: w.css }}
                    onClick={() => ctx.setWpI(i)}
                  >
                    <span className="sr-only">{w.name}</span>
                  </button>
                ))}
              </div>
            ),
          },
          {
            name: "Appearance",
            content: (
              <div className="xp-cp-accent-row">
                {CP_ACCENT_COLORS.map((c, i) => (
                  <button
                    key={c}
                    type="button"
                    className={`xp-cp-ac-swatch ${i === ctx.accentI ? "xp-cp-ac-swatch--on" : ""}`}
                    style={{ background: c }}
                    onClick={() => ctx.setAccentI(i)}
                    aria-label={`Accent ${i + 1}`}
                  />
                ))}
              </div>
            ),
          },
        ],
      };
    case "sounds":
      return {
        icon: "🔊",
        title: "Sounds and Audio Devices",
        tabs: [
          {
            name: "Volume",
            content: (
              <div className="xp-cp-panel">
                <label className="xp-cp-vol">
                  <span>Volume</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={ctx.vol}
                    onChange={(e) => ctx.setVol(Number(e.target.value))}
                  />
                  <span>{ctx.vol}%</span>
                </label>
              </div>
            ),
          },
          { name: "Sounds", content: <p className="xp-cp-muted">Sound scheme: Windows Default (simulated).</p> },
        ],
      };
    case "network":
      return {
        icon: "🌐",
        title: "Network Connections",
        tabs: [
          {
            name: "Connections",
            content: (
              <div className="xp-cp-net">
                <div className="xp-cp-net-card">
                  <span aria-hidden>🌐</span>
                  <div>
                    <div className="xp-cp-net-name">Local Area Connection</div>
                    <div className="xp-cp-net-ok">Connected</div>
                  </div>
                </div>
                <p className="xp-cp-muted">
                  Real network status is your browser / OS — this is a themed mock.
                </p>
              </div>
            ),
          },
        ],
      };
    case "user":
      return {
        icon: "👤",
        title: "User Accounts",
        tabs: [
          {
            name: "Users",
            content: (
              <div className="xp-cp-user">
                <div className="xp-cp-user-ico" aria-hidden>
                  👤
                </div>
                <div className="xp-cp-user-name">{S.name}</div>
                <div className="xp-cp-muted">Computer Administrator (portfolio)</div>
              </div>
            ),
          },
          {
            name: "Log On",
            content: (
              <div className="xp-cp-panel">
                <label className="xp-cp-check">
                  <input type="checkbox" defaultChecked /> Use the Welcome screen
                </label>
                <label className="xp-cp-check">
                  <input type="checkbox" /> Use Fast User Switching
                </label>
              </div>
            ),
          },
        ],
      };
    case "datetime":
      return {
        icon: "🕐",
        title: "Date and Time",
        tabs: [
          {
            name: "Date & Time",
            content: <DateTimePanel />,
          },
        ],
      };
    case "access":
      return {
        icon: "♿",
        title: "Accessibility Options",
        tabs: [
          {
            name: "Keyboard",
            content: (
              <p className="xp-cp-muted">
                StickyKeys, FilterKeys — simulated toggles for the XP aesthetic.
              </p>
            ),
          },
        ],
      };
    case "printers":
      return {
        icon: "🖨️",
        title: "Printers and Faxes",
        tabs: [
          {
            name: "Printers",
            content: (
              <p className="xp-cp-muted">
                No printers installed in the browser shell — add a PDF printer in your OS to
                print this portfolio.
              </p>
            ),
          },
        ],
      };
    default:
      return stubDef("Control Panel", "⚙");
  }
}

function stubDef(title: string, icon: string) {
  return {
    icon,
    title,
    tabs: [{ name: "General", content: <p className="xp-cp-muted">Loading…</p> }],
  };
}

function DateTimePanel() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="xp-cp-dt">
      <div className="xp-cp-clock">
        {now.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </div>
      <p className="xp-cp-muted">Live clock</p>
    </div>
  );
}
