"use client";

import { Eye, EyeOff, Trash2 } from "lucide-react";
import { deleteBlessingAction, setBlessingHiddenAction } from "@/lib/actions/content-actions";

type Item = { id: string; authorName: string; text: string; hidden: boolean; when: string };

export function BlessingModeration({ items }: { items: Item[] }) {
  if (items.length === 0) return <p className="text-sm text-ink/40">No blessings yet. Guests write them from the app.</p>;
  return (
    <ul className="divide-y divide-ink/5">
      {items.map((b) => (
        <li key={b.id} className={`flex items-start gap-3 py-2.5 ${b.hidden ? "opacity-50" : ""}`}>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-ink/90">{b.text}</p>
            <p className="text-xs text-ink/50">
              {b.authorName} · {b.when}
              {b.hidden && " · hidden from guests"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setBlessingHiddenAction(b.id, !b.hidden)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-ink/60 hover:bg-ink/5"
          >
            {b.hidden ? <Eye size={13} /> : <EyeOff size={13} />} {b.hidden ? "Show" : "Hide"}
          </button>
          <button
            type="button"
            onClick={() => confirm("Delete this blessing for good?") && deleteBlessingAction(b.id)}
            className="rounded-md p-1 text-ink/30 hover:bg-red-50 hover:text-red-500"
            aria-label="Delete blessing"
          >
            <Trash2 size={14} />
          </button>
        </li>
      ))}
    </ul>
  );
}
