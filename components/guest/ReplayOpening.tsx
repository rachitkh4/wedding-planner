"use client";

import { OPENED_KEY, REVEALED_KEY, setFlag } from "@/lib/invite-flags";

export function ReplayOpening({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        setFlag(REVEALED_KEY, false);
        setFlag(OPENED_KEY, false);
        window.scrollTo({ top: 0 });
      }}
      className="text-base text-ink/55 underline underline-offset-4"
    >
      {label}
    </button>
  );
}
