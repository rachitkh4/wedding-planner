"use client";

import { deleteOwnBlessingAction } from "@/lib/actions/guest-blessing-actions";

export function RemoveBlessingButton({ id, label }: { id: string; label: string }) {
  return (
    <button
      type="button"
      onClick={() => deleteOwnBlessingAction(id)}
      className="mt-2 rounded-full border border-ink/15 px-3 py-1 text-sm text-ink/55 active:scale-95"
    >
      {label}
    </button>
  );
}
