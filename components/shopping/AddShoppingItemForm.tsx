"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createShoppingItemAction } from "@/lib/actions/shopping-actions";

export function AddShoppingItemForm() {
  const [item, setItem] = useState("");
  const [category, setCategory] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item.trim()) return;
    createShoppingItemAction({ item: item.trim(), category: category.trim() });
    setItem("");
    setCategory("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-ink/15 bg-white/40 px-4 py-3"
    >
      <Plus size={16} className="shrink-0 text-ink/40" />
      <input
        value={item}
        onChange={(e) => setItem(e.target.value)}
        placeholder="Item (e.g. Wedding invitations)"
        className="min-w-40 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/40"
      />
      <input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Category"
        className="w-36 rounded-md border border-ink/10 bg-white px-2 py-1 text-sm text-ink outline-none focus:border-maroon"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-maroon/10 px-3 py-1.5 text-xs font-medium text-maroon hover:bg-maroon/15"
      >
        Add item
      </button>
    </form>
  );
}
