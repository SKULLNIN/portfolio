"use client";

import { useEffect, useState } from "react";

function formatTime(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TaskbarClock() {
  const [time, setTime] = useState(formatTime);

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="xp-clock">
      <span>{time}</span>
    </div>
  );
}
