"use client";

import { useEffect, useState } from "react";

function getRemaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    past: diff <= 0,
  };
}

export function CountdownTimer({ weddingDate }: { weddingDate: string }) {
  const target = new Date(weddingDate).getTime();
  const [remaining, setRemaining] = useState(() => getRemaining(target));

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (remaining.past) {
    return <p className="font-display text-2xl text-mehendi">You&apos;re married! 🎉</p>;
  }

  const units: [string, number][] = [
    ["days", remaining.days],
    ["hrs", remaining.hours],
    ["min", remaining.minutes],
    ["sec", remaining.seconds],
  ];

  return (
    <div className="flex gap-4 font-mono">
      {units.map(([label, value]) => (
        <div key={label} className="flex flex-col items-center">
          <span className="text-3xl font-semibold text-maroon md:text-4xl">
            {String(value).padStart(2, "0")}
          </span>
          <span className="text-xs uppercase tracking-wide text-ink/50">{label}</span>
        </div>
      ))}
    </div>
  );
}
