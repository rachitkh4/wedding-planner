"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createCategoryAction } from "@/lib/actions/budget-actions";

export function AddCategoryForm() {
  const [name, setName] = useState("");
  const [estimate, setEstimate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createCategoryAction(name.trim(), Number(estimate) || 0);
    setName("");
    setEstimate("");
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
        placeholder="New category (e.g. Honeymoon)"
        className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/40"
      />
      <input
        type="number"
        min={0}
        value={estimate}
        onChange={(e) => setEstimate(e.target.value)}
        placeholder="Estimated ₹"
        className="w-32 rounded-md border border-ink/10 bg-white px-2 py-1 text-sm text-ink outline-none focus:border-maroon"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-maroon/10 px-3 py-1.5 text-xs font-medium text-maroon hover:bg-maroon/15"
      >
        Add
      </button>
    </form>
  );
}
