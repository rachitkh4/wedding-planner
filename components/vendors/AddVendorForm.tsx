"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createVendorAction } from "@/lib/actions/vendor-actions";

const COMMON_CATEGORIES = [
  "Venue",
  "Caterer",
  "Photographer",
  "Decorator",
  "Mehendi Artist",
  "Makeup Artist",
  "Choreographer",
  "Priest/Pandit",
];

export function AddVendorForm() {
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category.trim() || !name.trim()) return;
    createVendorAction({ category: category.trim(), name: name.trim() });
    setCategory("");
    setName("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-ink/15 bg-white/40 px-4 py-3"
    >
      <Plus size={16} className="shrink-0 text-ink/40" />
      <input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Category (e.g. Venue)"
        list="vendor-categories"
        className="w-44 rounded-md border border-ink/10 bg-white px-2 py-1 text-sm text-ink outline-none focus:border-maroon"
      />
      <datalist id="vendor-categories">
        {COMMON_CATEGORIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Vendor name"
        className="min-w-40 flex-1 rounded-md border border-ink/10 bg-white px-2 py-1 text-sm text-ink outline-none focus:border-maroon"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-maroon/10 px-3 py-1.5 text-xs font-medium text-maroon hover:bg-maroon/15"
      >
        Add vendor
      </button>
    </form>
  );
}
