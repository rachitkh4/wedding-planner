"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { updateWeddingMetaAction } from "@/lib/actions/meta-actions";
import { useDebouncedSave } from "@/lib/hooks/useDebouncedSave";
import { formatDate, toDateInputValue } from "@/lib/format";

type MetaValues = {
  partner1Name: string;
  partner2Name: string;
  weddingDate: string;
  city: string;
};

export function MetaEditor({ initial, canEdit }: { initial: MetaValues; canEdit: boolean }) {
  const [values, setValues] = useState(initial);
  const { trigger, status } = useDebouncedSave(updateWeddingMetaAction);

  function set<K extends keyof MetaValues>(key: K, value: MetaValues[K]) {
    const next = { ...values, [key]: value };
    setValues(next);
    trigger({ [key]: value });
  }

  if (!canEdit) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-display text-2xl text-maroon md:text-3xl">
            {values.partner1Name || "Partner 1"}
          </span>
          <span className="font-display text-2xl text-marigold md:text-3xl">&amp;</span>
          <span className="font-display text-2xl text-maroon md:text-3xl">
            {values.partner2Name || "Partner 2"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-ink/60">
          <span>Wedding date: {formatDate(values.weddingDate)}</span>
          {values.city && <span>City: {values.city}</span>}
          <span className="inline-flex items-center gap-1 text-xs text-ink/35">
            <Lock size={11} />
            Only the couple can edit these details
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={values.partner1Name}
          onChange={(e) => set("partner1Name", e.target.value)}
          placeholder="Partner 1"
          className="w-full rounded-lg border border-transparent bg-transparent font-display text-2xl text-maroon outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white sm:min-w-0 sm:flex-1 md:text-3xl"
        />
        <span className="font-display text-2xl text-marigold sm:shrink-0 md:text-3xl">&amp;</span>
        <input
          value={values.partner2Name}
          onChange={(e) => set("partner2Name", e.target.value)}
          placeholder="Partner 2"
          className="w-full rounded-lg border border-transparent bg-transparent font-display text-2xl text-maroon outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white sm:min-w-0 sm:flex-1 md:text-3xl"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-ink/60">
        <label className="flex items-center gap-2">
          Wedding date
          <input
            type="date"
            value={toDateInputValue(values.weddingDate)}
            onChange={(e) => set("weddingDate", e.target.value)}
            className="rounded-lg border border-ink/15 bg-white px-2.5 py-1.5 text-ink outline-none focus:border-maroon"
          />
        </label>
        <label className="flex items-center gap-2">
          City
          <input
            value={values.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="e.g. Jaipur"
            className="w-32 rounded-lg border border-ink/15 bg-white px-2.5 py-1.5 text-ink outline-none focus:border-maroon"
          />
        </label>
        <span className="text-xs text-ink/30">
          {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : ""}
        </span>
      </div>
    </div>
  );
}
