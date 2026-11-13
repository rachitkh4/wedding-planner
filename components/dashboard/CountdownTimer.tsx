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

type Labels = { days: string; hours: string; minutes: string; seconds: string };

export function CountdownTimer({
  weddingDate,
  labels = { days: "days", hours: "hrs", minutes: "min", seconds: "sec" },
  doneMessage = "You're married! 🎉",
  className = "flex gap-4",
}: {
  weddingDate: string;
  labels?: Labels;
  doneMessage?: string;
  className?: string;
}) {
  const target = new Date(weddingDate).getTime();
  const [remaining, setRemaining] = useState(() => getRemaining(target));

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (remaining.past) {
    return <p className="font-display text-2xl text-mehendi">{doneMessage}</p>;
  }

  const units: [string, number][] = [
    [labels.days, remaining.days],
    [labels.hours, remaining.hours],
    [labels.minutes, remaining.minutes],
    [labels.seconds, remaining.seconds],
  ];

  return (
    <div className={`${className} font-mono`}>
      {units.map(([label, value]) => (
        <div key={label} className="flex flex-col items-center">
          <span className="text-3xl font-semibold text-maroon md:text-4xl" suppressHydrationWarning>
            {String(value).padStart(2, "0")}
          </span>
          <span className="font-sans text-xs uppercase tracking-wide text-ink/50">{label}</span>
        </div>
      ))}
    </div>
  );
}
