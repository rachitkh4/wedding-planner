"use client";

import { Minus, Plus } from "lucide-react";

/** Big − / + buttons around a number: far easier than a number box for older users. */
export function Stepper({
  name,
  value,
  min = 1,
  max,
  onChange,
  minusLabel,
  plusLabel,
}: {
  name: string;
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  minusLabel: string;
  plusLabel: string;
}) {
  const button =
    "flex h-14 w-14 items-center justify-center rounded-full border-2 border-maroon/30 bg-white text-maroon active:scale-95 disabled:opacity-30";
  return (
    <div className="flex items-center justify-center gap-6">
      <button type="button" aria-label={minusLabel} disabled={value <= min} onClick={() => onChange(value - 1)} className={button}>
        <Minus size={28} />
      </button>
      <input type="hidden" name={name} value={value} />
      <span className="font-invite w-16 text-center text-5xl font-semibold text-maroon" aria-live="polite">
        {value}
      </span>
      <button type="button" aria-label={plusLabel} disabled={value >= max} onClick={() => onChange(value + 1)} className={button}>
        <Plus size={28} />
      </button>
    </div>
  );
}
