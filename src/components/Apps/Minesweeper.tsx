"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const ROWS = 9;
const COLS = 9;
const MINE_COUNT = 10;

type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

type Mood = "idle" | "press" | "won" | "lost";

function emptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborMines: 0,
    }))
  );
}

function neighbors(r: number, c: number): [number, number][] {
  const out: [number, number][] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) out.push([nr, nc]);
    }
  }
  return out;
}

function placeMines(board: Cell[][], safeR: number, safeC: number) {
  let placed = 0;
  while (placed < MINE_COUNT) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (board[r][c].isMine) continue;
    if (r === safeR && c === safeC) continue;
    if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
    board[r][c].isMine = true;
    placed++;
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].isMine) continue;
      let n = 0;
      for (const [nr, nc] of neighbors(r, c)) {
        if (board[nr][nc].isMine) n++;
      }
      board[r][c].neighborMines = n;
    }
  }
}

type GameStatus = "playing" | "won" | "lost";

const NUM_CLASS: Record<number, string> = {
  1: "xp-ms-n1",
  2: "xp-ms-n2",
  3: "xp-ms-n3",
  4: "xp-ms-n4",
  5: "xp-ms-n5",
  6: "xp-ms-n6",
  7: "xp-ms-n7",
  8: "xp-ms-n8",
};

export function Minesweeper() {
  const [board, setBoard] = useState<Cell[][]>(() => emptyBoard());
  const [status, setStatus] = useState<GameStatus>("playing");
  const [mood, setMood] = useState<Mood>("idle");
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const flagCount = useMemo(
    () => board.flat().filter((cell) => cell.isFlagged).length,
    [board]
  );

  useEffect(() => {
    if (!started || status !== "playing") return;
    const id = window.setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [started, status]);

  const reset = useCallback(() => {
    setBoard(emptyBoard());
    setStatus("playing");
    setMood("idle");
    setStarted(false);
    setElapsed(0);
  }, []);

  const reveal = useCallback(
    (r: number, c: number) => {
      if (status !== "playing") return;
      if (!started) setStarted(true);
      setBoard((prev) => {
        const cell = prev[r][c];
        if (cell.isRevealed || cell.isFlagged) return prev;

        const next = prev.map((row) => row.map((x) => ({ ...x })));
        const minesAlready = next.some((row2) => row2.some((x) => x.isMine));
        if (!minesAlready) {
          placeMines(next, r, c);
        }

        const stack: [number, number][] = [[r, c]];
        let hitMine = false;

        while (stack.length) {
          const [cr, cc] = stack.pop()!;
          const cur = next[cr][cc];
          if (cur.isRevealed || cur.isFlagged) continue;
          cur.isRevealed = true;
          if (cur.isMine) {
            hitMine = true;
            break;
          }
          if (cur.neighborMines === 0) {
            for (const [nr, nc] of neighbors(cr, cc)) {
              if (!next[nr][nc].isRevealed && !next[nr][nc].isFlagged) {
                stack.push([nr, nc]);
              }
            }
          }
        }

        if (hitMine) {
          for (let i = 0; i < ROWS; i++) {
            for (let j = 0; j < COLS; j++) {
              if (next[i][j].isMine) next[i][j].isRevealed = true;
            }
          }
          setStatus("lost");
          setMood("lost");
          return next;
        }

        let revealedSafe = 0;
        for (let i = 0; i < ROWS; i++) {
          for (let j = 0; j < COLS; j++) {
            if (next[i][j].isRevealed && !next[i][j].isMine) revealedSafe++;
          }
        }
        if (revealedSafe === ROWS * COLS - MINE_COUNT) {
          setStatus("won");
          setMood("won");
        }

        return next;
      });
    },
    [status, started]
  );

  const toggleFlag = useCallback(
    (r: number, c: number, e: React.MouseEvent) => {
      e.preventDefault();
      if (status !== "playing") return;
      if (!started) setStarted(true);
      setBoard((prev) => {
        const cell = prev[r][c];
        if (cell.isRevealed) return prev;
        const next = prev.map((row) => row.map((x) => ({ ...x })));
        next[r][c].isFlagged = !next[r][c].isFlagged;
        return next;
      });
    },
    [status, started]
  );

  const faceMood: Mood =
    status === "won" ? "won" : status === "lost" ? "lost" : mood;

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-2 p-2">
      <div className="xp-mine-panel flex w-full max-w-[280px] items-center justify-between">
        <span className="xp-ms-lcd font-mono text-[13px] tabular-nums leading-none text-[#f00]">
          {String(MINE_COUNT - flagCount).padStart(3, "0")}
        </span>
        <button
          type="button"
          className="xp-ms-face focus:outline-none"
          title="New game"
          onClick={reset}
          onMouseDown={() => status === "playing" && setMood("press")}
          onMouseUp={() => status === "playing" && setMood("idle")}
          onMouseLeave={() => setMood("idle")}
        >
          <MineFace mood={faceMood} />
        </button>
        <span className="xp-ms-lcd font-mono text-[13px] tabular-nums leading-none text-[#f00]">
          {String(Math.min(elapsed, 999)).padStart(3, "0")}
        </span>
      </div>
      <div
        className="xp-ms-grid inline-grid gap-0 border border-[#808080]"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 16px)`,
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const hidden = !cell.isRevealed;
            const cls = [
              "xp-ms-cell",
              hidden ? "xp-ms-cell--hidden" : "xp-ms-cell--flat",
              cell.isRevealed && cell.isMine ? "xp-ms-cell--mine" : "",
            ]
              .filter(Boolean)
              .join(" ");
            const n = cell.neighborMines;
            const numCls = n >= 1 && n <= 8 ? NUM_CLASS[n] : "";
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                className={cls}
                onClick={() => reveal(r, c)}
                onContextMenu={(e) => toggleFlag(r, c, e)}
              >
                {cell.isFlagged && !cell.isRevealed ? (
                  <FlagGlyph />
                ) : cell.isRevealed ? (
                  cell.isMine ? (
                    <MineGlyph />
                  ) : n > 0 ? (
                    <span className={`xp-ms-num ${numCls}`}>{n}</span>
                  ) : null
                ) : null}
              </button>
            );
          })
        )}
      </div>
      <p className="text-center text-[10px] text-[#222]">
        Left-click: reveal · Right-click: flag · Beginner {ROWS}×{COLS}
      </p>
    </div>
  );
}

function MineFace({ mood }: { mood: Mood }) {
  return (
    <svg
      width={26}
      height={26}
      viewBox="0 0 24 24"
      className="xp-ms-face-svg block"
      aria-hidden
    >
      <rect x="1" y="1" width="22" height="22" rx="2" fill="#c0c0c0" />
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="1"
        fill="#c0c0c0"
        stroke="#808080"
      />
      <circle cx="12" cy="12" r="9" fill="#fc0" stroke="#a80" strokeWidth="1" />
      {mood === "lost" ? (
        <>
          <path
            d="M8 8l2 2M10 8l-2 2"
            stroke="#000"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M14 8l2 2M16 8l-2 2"
            stroke="#000"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle cx="9" cy="9" r="1.3" fill="#000" />
          <circle cx="15" cy="9" r="1.3" fill="#000" />
        </>
      )}
      <path
        d={
          mood === "won"
            ? "M7 14 Q12 18 17 14"
            : mood === "lost"
              ? "M7 17 Q12 14 17 17"
              : mood === "press"
                ? "M8 15h8"
                : "M7 15 Q12 17 17 15"
        }
        fill="none"
        stroke="#000"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MineGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" className="m-auto block" aria-hidden>
      <circle cx="8" cy="8" r="6" fill="#000" />
      <path
        d="M8 2v12M2 8h12"
        stroke="#fff"
        strokeOpacity="0.25"
        strokeWidth="1"
      />
    </svg>
  );
}

function FlagGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" className="m-auto block" aria-hidden>
      <path d="M3 2v12" stroke="#000" strokeWidth="1" />
      <path d="M3 3h8l-2 2 2 2H3" fill="#e00" stroke="#800" strokeWidth="0.5" />
    </svg>
  );
}
