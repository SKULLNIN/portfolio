"use client";

import { useCallback, useRef, useState } from "react";
import { NotepadChrome } from "@/components/Window/NotepadChrome";
import { useWindowManager } from "@/context/WindowContext";
import { OWNER } from "@/data/portfolio-content";

const DEFAULT_TEXT = `${OWNER.displayName}
${OWNER.title} — PX4 · ROS 2 · Jetson · SLAM
Email: ${OWNER.email}

(Edit freely — File → Save downloads your text as note.txt)
`;

export function Notepad() {
  const { closeApp } = useWindowManager();
  const [text, setText] = useState(DEFAULT_TEXT);
  const [wordWrap, setWordWrap] = useState(true);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFileNew = useCallback(() => {
    setText("");
    requestAnimationFrame(() => taRef.current?.focus());
  }, []);

  const onFileOpen = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const onFileSave = useCallback(() => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "note.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  }, [text]);

  const onFileExit = useCallback(() => {
    closeApp("notepad");
  }, [closeApp]);

  const onEditSelectAll = useCallback(() => {
    const el = taRef.current;
    if (!el) return;
    el.focus();
    el.select();
  }, []);

  const onFormatWordWrap = useCallback(() => {
    setWordWrap((w) => !w);
  }, []);

  const onOpenFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        setText(String(reader.result ?? ""));
        requestAnimationFrame(() => taRef.current?.focus());
      };
      reader.readAsText(f);
      e.target.value = "";
    },
    []
  );

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".txt,text/plain"
        className="hidden"
        aria-hidden
        onChange={onOpenFile}
      />
      <NotepadChrome
        onFileNew={onFileNew}
        onFileOpen={onFileOpen}
        onFileSave={onFileSave}
        onFileExit={onFileExit}
        onEditSelectAll={onEditSelectAll}
        onFormatWordWrap={onFormatWordWrap}
        wordWrap={wordWrap}
      >
        <textarea
          ref={taRef}
          className="xp-nt-textarea m-0 min-h-0 flex-1 resize-none border-0 bg-white p-2 font-mono text-[12px] leading-snug outline-none"
          style={{ whiteSpace: wordWrap ? "pre-wrap" : "pre" }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
        />
      </NotepadChrome>
    </>
  );
}
