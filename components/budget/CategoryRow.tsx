"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { updateCategoryAction, deleteCategoryAction } from "@/lib/actions/budget-actions";
import { useDebouncedSave } from "@/lib/hooks/useDebouncedSave";
import { formatINR } from "@/lib/format";
import { ProgressBar } from "@/components/shared/ProgressBar";

export function CategoryRow({
  category,
  spent,
}: {
  category: { id: string; name: string; estimatedAmount: number };
  spent: number;
}) {
  const [name, setName] = useState(category.name);
  const [estimate, setEstimate] = useState(category.estimatedAmount);
  const { trigger } = useDebouncedSave((patch: { name?: string; estimatedAmount?: number }) =>
    updateCategoryAction(category.id, patch),
  );

  async function handleDelete() {
    if (!confirm(`Delete "${category.name}"?`)) return;
    try {
      await deleteCategoryAction(category.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not delete category.");
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg px-2 py-2.5 hover:bg-ink/[0.03]">
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            trigger({ name: e.target.value });
          }}
          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm font-medium text-ink outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
        />
        <span className="text-xs text-ink/50">Est.</span>
        <input
          type="number"
          min={0}
          value={estimate}
          onChange={(e) => {
            const value = Number(e.target.value);
            setEstimate(value);
            trigger({ estimatedAmount: value });
          }}
          className="w-28 rounded-md border border-ink/10 bg-white px-1.5 py-1 text-right text-sm text-ink outline-none focus:border-maroon"
        />
        <button
          type="button"
          onClick={handleDelete}
          className="shrink-0 rounded-md p-1 text-ink/30 hover:bg-red-50 hover:text-red-500"
          aria-label="Delete category"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar ratio={estimate > 0 ? spent / estimate : spent > 0 ? 1 : 0} />
        </div>
        <span className="w-40 shrink-0 text-right text-xs text-ink/50">
          {formatINR(spent)} spent
        </span>
      </div>
    </div>
  );
}
