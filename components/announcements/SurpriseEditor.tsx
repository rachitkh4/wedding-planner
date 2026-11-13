"use client";

import { useState } from "react";
import { Gift } from "lucide-react";
import { saveSurpriseAction } from "@/lib/actions/announcement-actions";
import { PhotoUpload } from "@/components/content/PhotoUpload";

export type SurpriseDay = {
  date: string;
  label: string;
  daysToGo: number;
  past: boolean;
  sent: boolean;
  idea: string;
  value: { title: string; body: string; titleHi: string; bodyHi: string; imageId: string | null };
};

export function SurpriseEditor({ days }: { days: SurpriseDay[] }) {
  return (
    <div className="flex flex-col gap-3">
      {days.map((d) => (
        <DayRow key={d.date} day={d} />
      ))}
    </div>
  );
}

function DayRow({ day }: { day: SurpriseDay }) {
  const [v, setV] = useState(day.value);
  const [hindi, setHindi] = useState(!!(day.value.titleHi || day.value.bodyHi));
  const [state, setState] = useState<{ kind: "idle" | "saving" | "saved" | "error"; text?: string }>({ kind: "idle" });
  const locked = day.sent || day.past;
  const input =
    "w-full rounded-md border border-ink/10 bg-white px-2.5 py-1.5 text-sm text-ink outline-none focus:border-maroon disabled:bg-ink/5 disabled:text-ink/50";

  async function save(next = v) {
    setState({ kind: "saving" });
    const result = await saveSurpriseAction({ date: day.date, ...next });
    setState(result.error ? { kind: "error", text: result.error } : { kind: "saved" });
  }

  return (
    <div className="rounded-xl border border-ink/10 bg-white/60 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
        <Gift size={15} className="text-marigold" />
        <span className="font-medium text-ink/80">{day.label}</span>
        <span className="text-ink/50">
          · {day.daysToGo === 1 ? "the day before" : `${day.daysToGo} days to go`} · goes out at 9 am
        </span>
        {day.sent && <span className="ml-auto rounded-full bg-mehendi/15 px-2 py-0.5 text-xs font-medium text-mehendi">Sent</span>}
        {!day.sent && day.past && <span className="ml-auto rounded-full bg-ink/10 px-2 py-0.5 text-xs text-ink/50">Passed</span>}
        {!locked && !v.title && !v.body && <span className="ml-auto text-xs text-ink/40">Empty</span>}
        {!locked && (v.title || v.body) && state.kind === "idle" && day.value.title === v.title && day.value.body === v.body && (
          <span className="ml-auto rounded-full bg-marigold/20 px-2 py-0.5 text-xs font-medium text-ink/60">Scheduled</span>
        )}
      </div>
      <input
        value={v.title}
        disabled={locked}
        onChange={(e) => setV({ ...v, title: e.target.value })}
        placeholder={`Title, e.g. ${day.idea}`}
        className={input}
      />
      <textarea
        value={v.body}
        disabled={locked}
        onChange={(e) => setV({ ...v, body: e.target.value })}
        rows={2}
        placeholder="Message"
        className={`${input} mt-2`}
      />
      {hindi ? (
        <div className="mt-2 flex flex-col gap-2">
          <input value={v.titleHi} disabled={locked} onChange={(e) => setV({ ...v, titleHi: e.target.value })} placeholder="शीर्षक (हिंदी)" className={input} />
          <textarea value={v.bodyHi} disabled={locked} onChange={(e) => setV({ ...v, bodyHi: e.target.value })} rows={2} placeholder="संदेश (हिंदी)" className={input} />
        </div>
      ) : (
        !locked && (
          <button type="button" onClick={() => setHindi(true)} className="mt-2 text-xs font-medium text-maroon hover:underline">
            + Hindi version
          </button>
        )
      )}
      {!locked && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <PhotoUpload value={v.imageId} onChange={(imageId) => setV((p) => ({ ...p, imageId }))} />
          <button
            type="button"
            onClick={() => save()}
            disabled={state.kind === "saving"}
            className="ml-auto rounded-lg bg-maroon px-3.5 py-2 text-sm font-medium text-ivory hover:bg-maroon/90 disabled:opacity-60"
          >
            {state.kind === "saving" ? "Saving…" : v.title || v.body ? "Save surprise" : "Save"}
          </button>
          {state.kind === "saved" && <span className="text-sm text-mehendi">Saved ✓</span>}
          {state.kind === "error" && <span className="text-sm text-red-600">{state.text}</span>}
        </div>
      )}
    </div>
  );
}
