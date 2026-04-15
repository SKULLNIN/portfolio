"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useSystemSettings } from "@/context/SystemSettingsContext";

/** Local files in `public/music/` */
const TRACKS: { title: string; src: string }[] = [
  {
    title: "my",
    src: "/music/whatsapp-2026-04-15-082437.mpeg",
  },
  {
    title: "life",
    src: "/music/whatsapp-2026-04-15-082432.mpeg",
  },
  {
    title: "sucks",
    src: "/music/whatsapp-2026-04-15-082431.mpeg",
  },
  {
    title: "But",
    src: "/music/stranger-in-the-night.mpeg",
  },
];

export function MediaPlayer() {
  const { volume: masterVol, setVolume: setMasterVolume } = useSystemSettings();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  const track = TRACKS[idx]!;

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = masterVol / 100;
  }, [masterVol]);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      void a.play().then(
        () => {
          setPlaying(true);
          setErr(null);
        },
        () => setErr("Could not play audio (network or browser policy).")
      );
    }
  }, [playing]);

  const prev = useCallback(() => {
    setIdx((i) => {
      const n = i <= 0 ? TRACKS.length - 1 : i - 1;
      return n;
    });
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setErr(null);
  }, []);

  const next = useCallback(() => {
    setIdx((i) => (i >= TRACKS.length - 1 ? 0 : i + 1));
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setErr(null);
  }, []);

  const onTimeUpdate = useCallback(() => {
    const a = audioRef.current;
    if (a) setCurrentTime(a.currentTime);
  }, []);

  const onLoaded = useCallback(() => {
    const a = audioRef.current;
    if (a) setDuration(a.duration || 0);
  }, []);

  const seek = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const t = (Number(e.target.value) / 100) * duration;
    a.currentTime = t;
    setCurrentTime(t);
  }, [duration]);

  const fmt = (s: number) => {
    if (!Number.isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#ece9d8] font-['Tahoma',sans-serif] text-[11px] text-black">
      <div className="border-b border-[#fff] bg-[#ece9d8] px-2 py-1 shadow-[inset_0_-1px_0_#aca899]">
        <span className="text-[12px] font-bold text-[#0a246a]">Now Playing</span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        <p className="mb-2 text-[#333]">
          Audio files live in <code className="rounded bg-[#ddd] px-0.5">public/music/</code>{" "}
          (replace the <code className="rounded bg-[#ddd] px-0.5">.mpeg</code> files to update
          the playlist).
        </p>
        {err && (
          <p className="mb-2 rounded border border-[#800] bg-[#fdd] px-2 py-1 text-[11px] text-[#800]">
            {err}
          </p>
        )}
        <audio
          key={track.src}
          ref={audioRef}
          src={track.src}
          preload="metadata"
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoaded}
          onEnded={() => {
            setPlaying(false);
            setCurrentTime(0);
            setErr(null);
            setIdx((i) => (i >= TRACKS.length - 1 ? 0 : i + 1));
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="hidden"
        />
        <div className="mb-3 rounded border border-[#aca899] bg-[#f5f4ef] p-3 shadow-[inset_1px_1px_0_#fff]">
          <div className="mb-1 font-bold">{track.title}</div>
          <div className="mb-2 truncate text-[#666]">
            {track.src.replace(/^.*\//, "")}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded border border-[#aca899] bg-gradient-to-b from-[#fff] to-[#ece9d8] px-2 py-0.5"
              onClick={prev}
            >
              |◀
            </button>
            <button
              type="button"
              className="min-w-[72px] rounded border border-[#aca899] bg-gradient-to-b from-[#fff] to-[#ece9d8] px-3 py-0.5 font-bold"
              onClick={togglePlay}
            >
              {playing ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              className="rounded border border-[#aca899] bg-gradient-to-b from-[#fff] to-[#ece9d8] px-2 py-0.5"
              onClick={next}
            >
              ▶|
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="tabular-nums text-[#444]">{fmt(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={pct}
              onChange={seek}
              className="h-1 flex-1 accent-[#0a246a]"
              aria-label="Seek"
            />
            <span className="tabular-nums text-[#444]">{fmt(duration)}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span>Volume</span>
            <input
              type="range"
              min={0}
              max={100}
              value={masterVol}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              className="h-1 w-40 accent-[var(--xp-accent)]"
              aria-label="Volume"
            />
          </div>
        </div>
        <div className="text-[11px] font-bold text-[#0a246a]">Playlist</div>
        <ul className="m-0 mt-1 list-none space-y-0.5 border border-[#aca899] bg-white p-0.5">
          {TRACKS.map((tr, i) => (
            <li key={tr.src}>
              <button
                type="button"
                className={`xp-mc-project-btn ${
                  i === idx ? "xp-mc-project-btn--selected" : ""
                }`}
                onClick={() => {
                  setPlaying(false);
                  setCurrentTime(0);
                  setDuration(0);
                  setErr(null);
                  setIdx(i);
                }}
              >
                <span className="font-bold">{tr.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
