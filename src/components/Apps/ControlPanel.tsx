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
                src={XP_ICONS.controlPanel}
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
                src={XP_ICONS.systemProperties}
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
                src={XP_ICONS.networkConnection}
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
                src={XP_ICONS.programs}
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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={row.icon} alt="" width={48} height={48} className="xp-cp-cat-ico-img" />
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
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.ico} alt="" width={32} height={32} />
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dialogDef.icon} alt="" width={16} height={16} />
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
        icon: XP_ICONS.systemProperties,
        title: "System Properties",
        tabs: [
          {
            name: "General",
            content: (
              <div className="xp-cp-panel">
                <div className="xp-cp-sys-brand">
                  <div className="xp-cp-sys-logo-area">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={XP_ICONS.myComputer}
                      alt=""
                      width={64}
                      height={64}
                      className="xp-cp-sys-logo-img"
                    />
                  </div>
                  <div>
                    <div className="xp-cp-sys-ms">
                      Microsoft<sup>®</sup>
                    </div>
                    <div className="xp-cp-sys-xp">
                      Windows <span>XP</span>
                    </div>
                    <div className="xp-cp-sys-ed">Professional</div>
                    <div className="xp-cp-sys-ver">Version 2002</div>
                    <div className="xp-cp-sys-sp">Service Pack 3</div>
                  </div>
                </div>
                <fieldset className="xp-cp-fieldset">
                  <legend>Registered to:</legend>
                  <table className="xp-cp-table">
                    <tbody>
                      <tr>
                        <td colSpan={2} style={{fontWeight:'bold'}}>{S.name}</td>
                      </tr>
                      <tr>
                        <td colSpan={2}>{S.org}</td>
                      </tr>
                      <tr>
                        <td colSpan={2}>55274-640-1011036-23299</td>
                      </tr>
                    </tbody>
                  </table>
                </fieldset>
                <fieldset className="xp-cp-fieldset">
                  <legend>Computer:</legend>
                  <table className="xp-cp-table">
                    <tbody>
                      <tr>
                        <td colSpan={2}>{S.processor}</td>
                      </tr>
                      <tr>
                        <td colSpan={2}>2.40 GHz</td>
                      </tr>
                      <tr>
                        <td colSpan={2}>{S.ram} of RAM</td>
                      </tr>
                    </tbody>
                  </table>
                </fieldset>
              </div>
            ),
          },
          {
            name: "Computer Name",
            content: (
              <div className="xp-cp-panel">
                <p className="xp-cp-muted" style={{marginBottom:12}}>
                  Windows uses the following information to identify your computer on the network.
                </p>
                <fieldset className="xp-cp-fieldset">
                  <legend>Computer description:</legend>
                  <table className="xp-cp-table">
                    <tbody>
                      <tr>
                        <td className="xp-cp-tk">Description:</td>
                        <td>{S.name}&apos;s Portfolio PC</td>
                      </tr>
                      <tr>
                        <td className="xp-cp-tk">Full computer name:</td>
                        <td>PORTFOLIO-XP</td>
                      </tr>
                      <tr>
                        <td className="xp-cp-tk">Workgroup:</td>
                        <td>WORKGROUP</td>
                      </tr>
                    </tbody>
                  </table>
                </fieldset>
                <p className="xp-cp-muted" style={{marginTop:8}}>
                  To use the Network Identification Wizard to join a domain and create a local user account, click Network ID.
                </p>
                <div style={{display:'flex',gap:6,marginTop:8}}>
                  <button type="button" className="xp-cp-xpbtn">Network ID...</button>
                  <button type="button" className="xp-cp-xpbtn">Change...</button>
                </div>
              </div>
            ),
          },
          {
            name: "Hardware",
            content: (
              <div className="xp-cp-panel">
                <fieldset className="xp-cp-fieldset">
                  <legend>Add Hardware Wizard</legend>
                  <p className="xp-cp-muted">The Add Hardware Wizard helps you install hardware.</p>
                  <button type="button" className="xp-cp-xpbtn" style={{marginTop:4}}>Add Hardware Wizard</button>
                </fieldset>
                <fieldset className="xp-cp-fieldset" style={{marginTop:8}}>
                  <legend>Device Manager</legend>
                  <p className="xp-cp-muted">The Device Manager lists all the hardware devices installed on your computer. Use the Device Manager to change the properties of any device.</p>
                  <button type="button" className="xp-cp-xpbtn" style={{marginTop:4}}>Device Manager</button>
                </fieldset>
                <fieldset className="xp-cp-fieldset" style={{marginTop:8}}>
                  <legend>Hardware Profiles</legend>
                  <p className="xp-cp-muted">Hardware profiles provide a way for you to set up and store different hardware configurations.</p>
                  <button type="button" className="xp-cp-xpbtn" style={{marginTop:4}}>Hardware Profiles</button>
                </fieldset>
              </div>
            ),
          },
          {
            name: "Advanced",
            content: (
              <div className="xp-cp-panel">
                <p className="xp-cp-muted" style={{marginBottom:8}}>
                  You must be logged on as an Administrator to make most of these changes.
                </p>
                <fieldset className="xp-cp-fieldset">
                  <legend>Performance</legend>
                  <p className="xp-cp-muted">Visual effects, processor scheduling, memory usage, and virtual memory</p>
                  <button type="button" className="xp-cp-xpbtn" style={{marginTop:4}}>Settings...</button>
                </fieldset>
                <fieldset className="xp-cp-fieldset" style={{marginTop:8}}>
                  <legend>User Profiles</legend>
                  <p className="xp-cp-muted">Desktop settings related to your logon</p>
                  <button type="button" className="xp-cp-xpbtn" style={{marginTop:4}}>Settings...</button>
                </fieldset>
                <fieldset className="xp-cp-fieldset" style={{marginTop:8}}>
                  <legend>Startup and Recovery</legend>
                  <p className="xp-cp-muted">System startup, system failure, and debugging information</p>
                  <button type="button" className="xp-cp-xpbtn" style={{marginTop:4}}>Settings...</button>
                </fieldset>
                <div style={{marginTop:8}}>
                  <button type="button" className="xp-cp-xpbtn">Environment Variables</button>
                  <button type="button" className="xp-cp-xpbtn" style={{marginLeft:6}}>Error Reporting</button>
                </div>
              </div>
            ),
          },
          {
            name: "System Restore",
            content: (
              <div className="xp-cp-panel">
                <label className="xp-cp-check">
                  <input type="checkbox" /> Turn off System Restore on all drives
                </label>
                <p className="xp-cp-muted" style={{marginTop:12}}>
                  To change the status of System Restore or adjust the maximum amount of disk space available to System Restore, select a drive, and then click Settings.
                </p>
                <fieldset className="xp-cp-fieldset" style={{marginTop:8}}>
                  <legend>Drive settings</legend>
                  <table className="xp-cp-table xp-cp-table--bordered">
                    <thead>
                      <tr>
                        <th style={{textAlign:'left',padding:'2px 8px',borderBottom:'1px solid #999'}}>Drive</th>
                        <th style={{textAlign:'left',padding:'2px 8px',borderBottom:'1px solid #999'}}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{padding:'2px 8px'}}>C: (PORTFOLIO)</td>
                        <td style={{padding:'2px 8px'}}>Monitoring</td>
                      </tr>
                    </tbody>
                  </table>
                </fieldset>
              </div>
            ),
          },
          {
            name: "Remote",
            content: (
              <div className="xp-cp-panel">
                <fieldset className="xp-cp-fieldset">
                  <legend>Remote Assistance</legend>
                  <label className="xp-cp-check">
                    <input type="checkbox" defaultChecked /> Allow Remote Assistance invitations to be sent from this computer
                  </label>
                  <button type="button" className="xp-cp-xpbtn" style={{marginTop:4}}>Advanced...</button>
                </fieldset>
                <fieldset className="xp-cp-fieldset" style={{marginTop:8}}>
                  <legend>Remote Desktop</legend>
                  <label className="xp-cp-check">
                    <input type="checkbox" /> Allow users to connect remotely to this computer
                  </label>
                  <p className="xp-cp-muted" style={{marginTop:4}}>
                    Full computer name: PORTFOLIO-XP
                  </p>
                  <button type="button" className="xp-cp-xpbtn" style={{marginTop:4}}>Select Remote Users...</button>
                </fieldset>
              </div>
            ),
          },
        ],
      };
    case "skills": {
      const entries = Object.entries(CP_SKILLS);
      return {
        icon: XP_ICONS.performance,
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
        icon: XP_ICONS.programs,
        title: "Add or Remove Programs",
        tabs: [
          {
            name: "Currently Installed",
            content: (
              <ul className="xp-cp-prog">
                {CP_PROGRAMS.map((p, i) => (
                  <li key={i} className="xp-cp-prog-item">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.ico} alt="" width={24} height={24} />
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
        icon: XP_ICONS.displayProperties,
        title: "Display Properties",
        tabs: [
          {
            name: "Themes",
            content: (
              <div className="xp-cp-panel">
                <p className="xp-cp-muted">A theme is a background plus a set of sounds, icons, and other elements to help you personalize your computer with one click.</p>
                <fieldset className="xp-cp-fieldset" style={{marginTop:8}}>
                  <legend>Theme:</legend>
                  <select className="xp-cp-select" style={{width:'100%',marginBottom:8}} defaultValue="xp">
                    <option value="xp">Windows XP</option>
                    <option value="classic">Windows Classic</option>
                  </select>
                </fieldset>
                <p className="xp-cp-muted" style={{marginTop:4}}>Sample:</p>
                <button
                  type="button"
                  className="xp-cp-preview"
                  style={{ background: CP_WALLPAPERS[ctx.wpI]?.css }}
                  onClick={() =>
                    ctx.setWpI((ctx.wpI + 1) % CP_WALLPAPERS.length)
                  }
                >
                  <span className="xp-cp-preview-lbl">Click to cycle wallpaper</span>
                </button>
              </div>
            ),
          },
          {
            name: "Desktop",
            content: (
              <div className="xp-cp-panel">
                <p className="xp-cp-muted" style={{marginBottom:8}}>Select a wallpaper or click Browse to look for one.</p>
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
                <p className="xp-cp-muted" style={{marginTop:6}}>Current: {CP_WALLPAPERS[ctx.wpI]?.name}</p>
                <fieldset className="xp-cp-fieldset" style={{marginTop:8}}>
                  <legend>Position:</legend>
                  <select className="xp-cp-select" defaultValue="stretch">
                    <option value="center">Center</option>
                    <option value="tile">Tile</option>
                    <option value="stretch">Stretch</option>
                  </select>
                </fieldset>
              </div>
            ),
          },
          {
            name: "Screen Saver",
            content: (
              <div className="xp-cp-panel">
                <fieldset className="xp-cp-fieldset">
                  <legend>Screen saver</legend>
                  <select className="xp-cp-select" style={{width:'100%',marginBottom:8}} defaultValue="none">
                    <option value="none">(None)</option>
                    <option value="3dtext">3D Text</option>
                    <option value="starfield">Starfield</option>
                    <option value="pipes">3D Pipes</option>
                    <option value="mystify">Mystify</option>
                  </select>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    <span>Wait:</span>
                    <input type="number" className="xp-cp-select" style={{width:60}} defaultValue={10} min={1} />
                    <span>minutes</span>
                  </div>
                </fieldset>
                <fieldset className="xp-cp-fieldset" style={{marginTop:8}}>
                  <legend>Monitor power</legend>
                  <p className="xp-cp-muted">To adjust monitor power settings, click Power.</p>
                  <button type="button" className="xp-cp-xpbtn" style={{marginTop:4}}>Power...</button>
                </fieldset>
              </div>
            ),
          },
          {
            name: "Appearance",
            content: (
              <div className="xp-cp-panel">
                <fieldset className="xp-cp-fieldset">
                  <legend>Windows and buttons:</legend>
                  <select className="xp-cp-select" style={{width:'100%',marginBottom:6}} defaultValue="xp">
                    <option value="xp">Windows XP style</option>
                    <option value="classic">Windows Classic style</option>
                  </select>
                </fieldset>
                <fieldset className="xp-cp-fieldset" style={{marginTop:8}}>
                  <legend>Color scheme:</legend>
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
                </fieldset>
                <fieldset className="xp-cp-fieldset" style={{marginTop:8}}>
                  <legend>Font size:</legend>
                  <select className="xp-cp-select" defaultValue="normal">
                    <option value="normal">Normal</option>
                    <option value="large">Large Fonts</option>
                    <option value="xlarge">Extra Large Fonts</option>
                  </select>
                </fieldset>
              </div>
            ),
          },
          {
            name: "Settings",
            content: (
              <div className="xp-cp-panel">
                <p className="xp-cp-muted" style={{marginBottom:8}}>Drag the monitor icons to match the physical arrangement of your monitors.</p>
                <div className="xp-cp-monitor-preview">
                  <div className="xp-cp-monitor">1</div>
                </div>
                <fieldset className="xp-cp-fieldset" style={{marginTop:8}}>
                  <legend>Screen resolution:</legend>
                  <input type="range" min={800} max={1920} step={1} defaultValue={1024} style={{width:'100%'}} />
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#666'}}>
                    <span>Less</span>
                    <span>1024 by 768 pixels</span>
                    <span>More</span>
                  </div>
                </fieldset>
                <fieldset className="xp-cp-fieldset" style={{marginTop:8}}>
                  <legend>Color quality:</legend>
                  <select className="xp-cp-select" style={{width:'100%'}} defaultValue="32">
                    <option value="16">Medium (16 bit)</option>
                    <option value="32">Highest (32 bit)</option>
                  </select>
                </fieldset>
              </div>
            ),
          },
        ],
      };
    case "sounds":
      return {
        icon: XP_ICONS.volume,
        title: "Sounds and Audio Devices Properties",
        tabs: [
          {
            name: "Volume",
            content: (
              <div className="xp-cp-panel">
                <fieldset className="xp-cp-fieldset">
                  <legend>Device volume</legend>
                  <label className="xp-cp-vol">
                    <span>Low</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={ctx.vol}
                      onChange={(e) => ctx.setVol(Number(e.target.value))}
                    />
                    <span>High</span>
                  </label>
                  <label className="xp-cp-check" style={{marginTop:4}}>
                    <input type="checkbox" /> Mute
                  </label>
                  <label className="xp-cp-check">
                    <input type="checkbox" defaultChecked /> Place volume icon in the taskbar
                  </label>
                  <button type="button" className="xp-cp-xpbtn" style={{marginTop:6}}>Advanced...</button>
                </fieldset>
                <fieldset className="xp-cp-fieldset" style={{marginTop:8}}>
                  <legend>Speaker settings</legend>
                  <button type="button" className="xp-cp-xpbtn">Speaker Volume...</button>
                  <button type="button" className="xp-cp-xpbtn" style={{marginLeft:6}}>Advanced...</button>
                </fieldset>
              </div>
            ),
          },
          {
            name: "Sounds",
            content: (
              <div className="xp-cp-panel">
                <fieldset className="xp-cp-fieldset">
                  <legend>Sound scheme:</legend>
                  <select className="xp-cp-select" style={{width:'100%'}} defaultValue="default">
                    <option value="default">Windows Default</option>
                    <option value="none">No Sounds</option>
                  </select>
                </fieldset>
                <p className="xp-cp-muted" style={{marginTop:8}}>
                  To change sounds, click a program event in the following list and then select a sound to apply.
                </p>
              </div>
            ),
          },
          {
            name: "Audio",
            content: (
              <div className="xp-cp-panel">
                <fieldset className="xp-cp-fieldset">
                  <legend>Sound playback</legend>
                  <p className="xp-cp-muted">Default device: Realtek HD Audio (simulated)</p>
                  <button type="button" className="xp-cp-xpbtn" style={{marginTop:4}}>Volume...</button>
                </fieldset>
                <fieldset className="xp-cp-fieldset" style={{marginTop:8}}>
                  <legend>Sound recording</legend>
                  <p className="xp-cp-muted">Default device: Realtek HD Audio (simulated)</p>
                </fieldset>
              </div>
            ),
          },
        ],
      };
    case "network":
      return {
        icon: XP_ICONS.networkConnection,
        title: "Network Connections",
        tabs: [
          {
            name: "Connections",
            content: (
              <div className="xp-cp-net">
                <div className="xp-cp-net-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={XP_ICONS.networkConnection} alt="" width={32} height={32} />
                  <div>
                    <div className="xp-cp-net-name">Local Area Connection</div>
                    <div className="xp-cp-net-ok">Connected</div>
                  </div>
                </div>
                <p className="xp-cp-muted" style={{marginTop:8}}>
                  Real network status is your browser / OS — this is a themed mock.
                </p>
              </div>
            ),
          },
        ],
      };
    case "user":
      return {
        icon: XP_ICONS.userAccounts,
        title: "User Accounts",
        tabs: [
          {
            name: "Users",
            content: (
              <div className="xp-cp-user">
                <div className="xp-cp-user-ico" aria-hidden>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={XP_ICONS.userAccounts} alt="" width={48} height={48} />
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
        icon: XP_ICONS.dateTime,
        title: "Date and Time Properties",
        tabs: [
          {
            name: "Date & Time",
            content: <DateTimePanel />,
          },
          {
            name: "Time Zone",
            content: (
              <div className="xp-cp-panel">
                <fieldset className="xp-cp-fieldset">
                  <legend>Time zone</legend>
                  <select className="xp-cp-select" style={{width:'100%'}} defaultValue="ist">
                    <option value="ist">(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
                    <option value="pst">(GMT-08:00) Pacific Time (US & Canada)</option>
                    <option value="est">(GMT-05:00) Eastern Time (US & Canada)</option>
                  </select>
                  <label className="xp-cp-check" style={{marginTop:6}}>
                    <input type="checkbox" defaultChecked /> Automatically adjust clock for daylight saving changes
                  </label>
                </fieldset>
              </div>
            ),
          },
          {
            name: "Internet Time",
            content: (
              <div className="xp-cp-panel">
                <label className="xp-cp-check">
                  <input type="checkbox" defaultChecked /> Automatically synchronize with an Internet time server
                </label>
                <fieldset className="xp-cp-fieldset" style={{marginTop:8}}>
                  <legend>Server:</legend>
                  <select className="xp-cp-select" style={{width:'100%'}} defaultValue="time">
                    <option value="time">time.windows.com</option>
                    <option value="nist">time.nist.gov</option>
                  </select>
                  <button type="button" className="xp-cp-xpbtn" style={{marginTop:6}}>Update Now</button>
                </fieldset>
              </div>
            ),
          },
        ],
      };
    case "access":
      return {
        icon: XP_ICONS.accessibility,
        title: "Accessibility Options",
        tabs: [
          {
            name: "Keyboard",
            content: (
              <div className="xp-cp-panel">
                <fieldset className="xp-cp-fieldset">
                  <legend>StickyKeys</legend>
                  <label className="xp-cp-check">
                    <input type="checkbox" /> Use StickyKeys
                  </label>
                  <p className="xp-cp-muted">StickyKeys allows you to press key combinations one key at a time.</p>
                  <button type="button" className="xp-cp-xpbtn" style={{marginTop:4}}>Settings...</button>
                </fieldset>
                <fieldset className="xp-cp-fieldset" style={{marginTop:8}}>
                  <legend>FilterKeys</legend>
                  <label className="xp-cp-check">
                    <input type="checkbox" /> Use FilterKeys
                  </label>
                  <p className="xp-cp-muted">FilterKeys ignores repeated keystrokes and slows the repeat rate.</p>
                  <button type="button" className="xp-cp-xpbtn" style={{marginTop:4}}>Settings...</button>
                </fieldset>
                <fieldset className="xp-cp-fieldset" style={{marginTop:8}}>
                  <legend>ToggleKeys</legend>
                  <label className="xp-cp-check">
                    <input type="checkbox" /> Use ToggleKeys
                  </label>
                  <p className="xp-cp-muted">ToggleKeys plays a tone when you press Caps Lock, Num Lock, or Scroll Lock.</p>
                </fieldset>
              </div>
            ),
          },
          {
            name: "Sound",
            content: (
              <div className="xp-cp-panel">
                <fieldset className="xp-cp-fieldset">
                  <legend>SoundSentry</legend>
                  <label className="xp-cp-check">
                    <input type="checkbox" /> Use SoundSentry
                  </label>
                  <p className="xp-cp-muted">SoundSentry generates visual warnings when your computer makes a sound.</p>
                </fieldset>
                <fieldset className="xp-cp-fieldset" style={{marginTop:8}}>
                  <legend>ShowSounds</legend>
                  <label className="xp-cp-check">
                    <input type="checkbox" /> Use ShowSounds
                  </label>
                  <p className="xp-cp-muted">ShowSounds tells programs to display captions for speech and sounds.</p>
                </fieldset>
              </div>
            ),
          },
          {
            name: "Display",
            content: (
              <div className="xp-cp-panel">
                <fieldset className="xp-cp-fieldset">
                  <legend>High Contrast</legend>
                  <label className="xp-cp-check">
                    <input type="checkbox" /> Use High Contrast
                  </label>
                  <p className="xp-cp-muted">High Contrast improves readability for vision-impaired users.</p>
                  <button type="button" className="xp-cp-xpbtn" style={{marginTop:4}}>Settings...</button>
                </fieldset>
              </div>
            ),
          },
        ],
      };
    case "printers":
      return {
        icon: XP_ICONS.printer,
        title: "Printers and Faxes",
        tabs: [
          {
            name: "Printers",
            content: (
              <div className="xp-cp-panel">
                <p className="xp-cp-muted">
                  No printers installed in the browser shell — add a PDF printer in your OS to
                  print this portfolio.
                </p>
                <div style={{marginTop:12,display:'flex',gap:8,alignItems:'center'}}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={XP_ICONS.printer} alt="" width={32} height={32} />
                  <div>
                    <div style={{fontWeight:'bold'}}>Add Printer</div>
                    <div className="xp-cp-muted">Click to add a new printer</div>
                  </div>
                </div>
              </div>
            ),
          },
        ],
      };
    default:
      return stubDef("Control Panel", XP_ICONS.controlPanel);
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

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
  const blanks = Array.from({length: firstDayOfWeek}, (_, i) => i);

  return (
    <div className="xp-cp-dt">
      <div style={{display:'flex',gap:16,alignItems:'flex-start',flexWrap:'wrap'}}>
        <fieldset className="xp-cp-fieldset" style={{flex:'1 1 auto'}}>
          <legend>Date</legend>
          <div style={{display:'flex',gap:4,marginBottom:6}}>
            <select className="xp-cp-select" style={{flex:1}} value={month}>
              {months.map((m,i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <input type="number" className="xp-cp-select" style={{width:60}} value={year} readOnly />
          </div>
          <table className="xp-cp-cal-table">
            <thead>
              <tr>
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
                  <th key={d} className="xp-cp-cal-th">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const rows = [];
                let cells = [...blanks.map(() => null), ...days];
                while (cells.length % 7 !== 0) cells.push(null);
                for (let r = 0; r < cells.length / 7; r++) {
                  rows.push(
                    <tr key={r}>
                      {cells.slice(r * 7, r * 7 + 7).map((d, ci) => (
                        <td
                          key={ci}
                          className={`xp-cp-cal-td ${d === day ? 'xp-cp-cal-td--today' : ''}`}
                        >
                          {d ?? ''}
                        </td>
                      ))}
                    </tr>
                  );
                }
                return rows;
              })()}
            </tbody>
          </table>
        </fieldset>
        <fieldset className="xp-cp-fieldset" style={{flex:'0 0 auto',textAlign:'center'}}>
          <legend>Time</legend>
          <div className="xp-cp-clock" style={{fontSize:24,fontWeight:'bold',letterSpacing:1}}>
            {now.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
          <div className="xp-cp-analog-clock" style={{margin:'8px auto',width:80,height:80,borderRadius:'50%',border:'2px solid #666',background:'#fff',position:'relative'}}>
            {/* Hour hand */}
            <div style={{
              position:'absolute',left:'50%',bottom:'50%',width:2,height:20,background:'#000',transformOrigin:'bottom center',
              transform:`translateX(-50%) rotate(${(now.getHours() % 12) * 30 + now.getMinutes() * 0.5}deg)`
            }} />
            {/* Minute hand */}
            <div style={{
              position:'absolute',left:'50%',bottom:'50%',width:1.5,height:28,background:'#333',transformOrigin:'bottom center',
              transform:`translateX(-50%) rotate(${now.getMinutes() * 6}deg)`
            }} />
            {/* Second hand */}
            <div style={{
              position:'absolute',left:'50%',bottom:'50%',width:1,height:30,background:'red',transformOrigin:'bottom center',
              transform:`translateX(-50%) rotate(${now.getSeconds() * 6}deg)`
            }} />
            {/* Center dot */}
            <div style={{
              position:'absolute',left:'50%',top:'50%',width:4,height:4,borderRadius:'50%',background:'#333',transform:'translate(-50%,-50%)'
            }} />
          </div>
        </fieldset>
      </div>
    </div>
  );
}
