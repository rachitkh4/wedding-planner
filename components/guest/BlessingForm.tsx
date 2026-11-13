"use client";

import { useActionState, useState } from "react";
import { HandHeart } from "lucide-react";
import { submitBlessingAction } from "@/lib/actions/guest-blessing-actions";
import type { Dict } from "@/lib/i18n";

/** Remount (via key) after a successful send so the box clears. */
export function BlessingForm({ t }: { t: Dict }) {
  const [state, formAction, pending] = useActionState(submitBlessingAction, undefined);
  const [text, setText] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <textarea
        name="text"
        rows={4}
        maxLength={300}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.blessings.placeholder}
        className="w-full rounded-2xl border-2 border-ink/15 bg-white px-4 py-3.5 text-xl text-ink outline-none placeholder:text-ink/35 focus:border-maroon"
      />
      <p className="-mt-1 text-right text-sm text-ink/50">{text.length}/300</p>
      {state?.error && (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-lg text-red-700">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || text.trim().length < 2}
        className="flex items-center justify-center gap-2 rounded-2xl bg-maroon px-6 py-4 text-xl font-semibold text-ivory shadow-md active:scale-[0.98] disabled:opacity-50"
      >
        <HandHeart size={24} /> {pending ? t.blessings.sending : t.blessings.send}
      </button>
    </form>
  );
}
