"use client";

import type { MouseEvent } from "react";
import { Rnd } from "react-rnd";
import { useWindowManager } from "@/context/WindowContext";
import type { WindowState } from "@/types";
import { APP_REGISTRY } from "@/data/apps";
import { useDesktopViewport } from "@/hooks/useDesktopViewport";
import { ExplorerChrome } from "@/components/Window/ExplorerChrome";
import { GameWindowChrome } from "@/components/Window/GameWindowChrome";

type Props = {
  w: WindowState;
  isActive: boolean;
  children: React.ReactNode;
};

export function WindowShell({ w, isActive, children }: Props) {
  const { dispatch, focusApp, minimizeApp, toggleMaximize, closeApp } =
    useWindowManager();
  const vp = useDesktopViewport();

  if (!w.isOpen || w.isMinimized) return null;

  const maximizedPos = { x: 0, y: 0 };
  const maximizedSize = { width: vp.width, height: vp.height };
  const rndPosition = w.isMaximized ? maximizedPos : w.position;
  const rndSize = w.isMaximized ? maximizedSize : w.size;

  const onFocus = () => focusApp(w.id);

  const titleBar = (
    <div
      className={`xp-luna-titlebar ${isActive ? "xp-luna-titlebar--active" : "xp-luna-titlebar--inactive"}`}
      onMouseDown={onFocus}
    >
      <div className="xp-luna-label">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={w.icon} alt="" width={20} height={20} />
        <span>{w.title}</span>
      </div>
      <div className="xp-luna-controls">
        <button
          type="button"
          className="xp-luna-btn xp-luna-btn--minimize"
          aria-label="Minimize"
          onClick={(e) => {
            e.stopPropagation();
            minimizeApp(w.id);
          }}
        />
        <button
          type="button"
          className="xp-luna-btn xp-luna-btn--maximize"
          aria-label={w.isMaximized ? "Restore" : "Maximize"}
          onClick={(e) => {
            e.stopPropagation();
            toggleMaximize(w.id);
          }}
        />
        <button
          type="button"
          className="xp-luna-btn xp-luna-btn--close"
          aria-label="Close"
          onClick={(e) => {
            e.stopPropagation();
            closeApp(w.id);
          }}
        />
      </div>
    </div>
  );

  const def = APP_REGISTRY[w.id];

  const inner =
    def.chrome === "explorer" ? (
      <ExplorerChrome
        windowTitle={w.title}
        windowIcon={w.icon}
        addressValue={def.explorerAddress}
      >
        {children}
      </ExplorerChrome>
    ) : def.chrome === "bare" ? (
      <div className="xp-bare-body">{children}</div>
    ) : (
      <GameWindowChrome menus={def.gameMenus}>{children}</GameWindowChrome>
    );

  const bodyMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement | null;
    if (t?.closest("textarea, input, select, [contenteditable='true'], [contenteditable='']"))
      return;
    onFocus();
  };

  const body = (
    <div
      className={`xp-luna-body ${isActive ? "" : "opacity-[0.97]"}`}
      onMouseDown={bodyMouseDown}
    >
      {inner}
    </div>
  );

  const windowInnerClass = [
    "xp-luna-window",
    isActive ? "xp-luna-window--active" : "",
    w.isMaximized ? "xp-luna-maximized" : "",
  ]
    .filter(Boolean)
    .join(" ");

  /** Never force a window wider than the desktop client area (fixes narrow phones). */
  const minWinW = Math.max(120, Math.min(280, vp.width));
  const lockSize = def.lockWindowSize ?? false;

  return (
    <Rnd
      className="pointer-events-auto max-w-full"
      style={{ zIndex: w.zIndex }}
      size={rndSize}
      position={rndPosition}
      minWidth={lockSize ? rndSize.width : minWinW}
      minHeight={lockSize ? rndSize.height : 160}
      maxWidth={w.isMaximized ? vp.width : lockSize ? rndSize.width : undefined}
      maxHeight={w.isMaximized ? vp.height : lockSize ? rndSize.height : undefined}
      disableDragging={w.isMaximized}
      enableResizing={!w.isMaximized && !lockSize}
      dragHandleClassName="xp-luna-titlebar"
      bounds="parent"
      enableUserSelectHack={false}
      cancel=".xp-luna-controls, .xp-luna-controls button, input, textarea, select, iframe, [contenteditable], .msn-input, .msn-input-wrap, .msn-input-container, .msn-emoji-picker, .msn-format-bar"
      onDrag={(_e, d) => {
        if (w.isMaximized) return;
        dispatch({
          type: "MOVE",
          id: w.id,
          position: { x: d.x, y: d.y },
        });
      }}
      onDragStop={(_e, d) => {
        if (w.isMaximized) return;
        dispatch({
          type: "MOVE",
          id: w.id,
          position: { x: d.x, y: d.y },
        });
      }}
      onResizeStop={(_e, _dir, ref, _delta, pos) => {
        if (w.isMaximized) return;
        dispatch({
          type: "RESIZE",
          id: w.id,
          size: {
            width: ref.offsetWidth,
            height: ref.offsetHeight,
          },
          position: { x: pos.x, y: pos.y },
        });
      }}
      onMouseDown={onFocus}
    >
      <div className={`${windowInnerClass} h-full w-full`}>
        {titleBar}
        {body}
      </div>
    </Rnd>
  );
}
