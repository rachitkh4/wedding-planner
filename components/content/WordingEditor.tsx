"use client";

import { useState } from "react";
import { updateWordingAction } from "@/lib/actions/content-actions";

const DEFAULT_EN = "With the blessings of our elders, we invite you to the wedding of";
const DEFAULT_HI = "बड़ों के आशीर्वाद से, आपको सादर आमंत्रित करते हैं शुभ विवाह में";

export function WordingEditor({
  initial,
}: {
  initial: { hashtag: string; invitationText: string; invitationTextHi: string };
}) {
  const [v, setV] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const input =
    "w-full rounded-md border border-ink/10 bg-white px-2.5 py-1.5 text-sm text-ink outline-none focus:border-maroon";

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    await updateWordingAction(v);
    setState("saved");
    setTimeout(() => setState("idle"), 2000);
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs font-medium text-ink/60">
        Words above your names on the invitation (English)
        <textarea
          rows={2}
          value={v.invitationText}
          onChange={(e) => setV({ ...v, invitationText: e.target.value })}
          placeholder={DEFAULT_EN}
          className={input}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-ink/60">
        Same in Hindi (optional)
        <textarea
          rows={2}
          value={v.invitationTextHi}
          onChange={(e) => setV({ ...v, invitationTextHi: e.target.value })}
          placeholder={DEFAULT_HI}
          className={input}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-ink/60">
        Wedding hashtag (optional)
        <input
          value={v.hashtag}
          onChange={(e) => setV({ ...v, hashtag: e.target.value })}
          placeholder="#RohanWedsAsha"
          className={`${input} sm:max-w-xs`}
        />
      </label>
      <p className="text-xs text-ink/50">Leave a box empty to use the standard wording shown in grey.</p>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={state === "saving"}
          className="rounded-lg bg-maroon px-4 py-2 text-sm font-medium text-ivory hover:bg-maroon/90 disabled:opacity-60"
        >
          {state === "saving" ? "Saving…" : "Save wording"}
        </button>
        {state === "saved" && <span className="text-sm text-mehendi">Saved ✓</span>}
      </div>
    </form>
  );
}
