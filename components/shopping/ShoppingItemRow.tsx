"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  updateShoppingItemFieldAction,
  deleteShoppingItemAction,
  updateShoppingItemVisibilityAction,
} from "@/lib/actions/shopping-actions";
import { useDebouncedSave } from "@/lib/hooks/useDebouncedSave";
import { VisibilityControl } from "@/components/shared/VisibilityControl";
import type { SimpleUser } from "@/lib/visibility";
import type { Visibility } from "@/generated/prisma/enums";

export function ShoppingItemRow({
  item,
  members,
  currentUserId,
}: {
  item: {
    id: string;
    item: string;
    category: string | null;
    budgetEstimate: number | null;
    bought: boolean;
    ownerId: string;
    visibility: keyof typeof Visibility;
    sharedWith: { id: string }[];
  };
  members: SimpleUser[];
  currentUserId: string;
}) {
  const [name, setName] = useState(item.item);
  const [category, setCategory] = useState(item.category ?? "");
  const [estimate, setEstimate] = useState(item.budgetEstimate ?? "");
  const [bought, setBought] = useState(item.bought);

  const { trigger } = useDebouncedSave(
    (patch: Parameters<typeof updateShoppingItemFieldAction>[1]) =>
      updateShoppingItemFieldAction(item.id, patch),
  );

  return (
    <div className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-ink/[0.03]">
      <input
        type="checkbox"
        checked={bought}
        onChange={(e) => {
          setBought(e.target.checked);
          updateShoppingItemFieldAction(item.id, { bought: e.target.checked });
        }}
        className="h-4 w-4 accent-mehendi"
      />
      <input
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          trigger({ item: e.target.value });
        }}
        className={`min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white ${
          bought ? "text-ink/40 line-through" : "text-ink/90"
        }`}
      />
      <input
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          trigger({ category: e.target.value });
        }}
        placeholder="Category"
        className="w-28 shrink-0 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-xs text-ink/60 outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
      />
      <input
        type="number"
        min={0}
        value={estimate}
        onChange={(e) => {
          const value = e.target.value === "" ? "" : Number(e.target.value);
          setEstimate(value);
          trigger({ budgetEstimate: value === "" ? null : value });
        }}
        placeholder="₹"
        className="w-24 shrink-0 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-right text-sm text-ink outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
      />
      <VisibilityControl
        visibility={item.visibility}
        sharedWithIds={item.sharedWith.map((u) => u.id)}
        allUsers={members.filter((m) => m.id !== item.ownerId)}
        isOwner={item.ownerId === currentUserId}
        onChange={(v, ids) => updateShoppingItemVisibilityAction(item.id, v, ids)}
      />
      <button
        type="button"
        onClick={() => deleteShoppingItemAction(item.id)}
        className="shrink-0 rounded-md p-1 text-ink/30 hover:bg-red-50 hover:text-red-500"
        aria-label="Delete item"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
