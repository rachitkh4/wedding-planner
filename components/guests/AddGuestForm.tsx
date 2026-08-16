"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createGuestAction } from "@/lib/actions/guest-actions";
import type { Side } from "@/generated/prisma/enums";

const SIDES: { value: keyof typeof Side; label: string }[] = [
  { value: "BRIDE", label: "Bride's side" },
  { value: "GROOM", label: "Groom's side" },
  { value: "BOTH", label: "Both" },
];

export function AddGuestForm() {
  const [name, setName] = useState("");
  const [side, setSide] = useState<keyof typeof Side>("BRIDE");
  const [headcount, setHeadcount] = useState("1");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createGuestAction({ name: name.trim(), side, headcount: Number(headcount) || 1 });
    setName("");
    setHeadcount("1");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-ink/15 bg-white/40 px-4 py-3"
    >
      <Plus size={16} className="shrink-0 text-ink/40" />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Guest / family name"
        className="min-w-40 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/40"
      />
      <select
        value={side}
        onChange={(e) => setSide(e.target.value as keyof typeof Side)}
        className="rounded-md border border-ink/10 bg-white px-2 py-1 text-sm text-ink outline-none focus:border-maroon"
      >
        {SIDES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <input
        type="number"
        min={1}
        value={headcount}
        onChange={(e) => setHeadcount(e.target.value)}
        className="w-20 rounded-md border border-ink/10 bg-white px-2 py-1 text-sm text-ink outline-none focus:border-maroon"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-maroon/10 px-3 py-1.5 text-xs font-medium text-maroon hover:bg-maroon/15"
      >
        Add guest
      </button>
    </form>
  );
}
