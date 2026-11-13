"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { createAnnouncementAction } from "@/lib/actions/announcement-actions";

export function AnnouncementForm({ canPush }: { canPush: boolean }) {
  const [v, setV] = useState({ title: "", body: "", titleHi: "", bodyHi: "", date: "", time: "" });
  const [when, setWhen] = useState<"now" | "later">("now");
  const [showHindi, setShowHindi] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const set = (key: keyof typeof v, value: string) => setV((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const result = await createAnnouncementAction({ ...v, when });
    setPending(false);
    if (result.error) return setMessage({ ok: false, text: result.error });
    setMessage({
      ok: true,
      text:
        when === "later"
          ? "Scheduled. It goes out automatically at that time."
          : canPush
            ? `Sent to ${result.sent ?? 0} phone${result.sent === 1 ? "" : "s"}, and posted in the app's Updates.`
            : "Posted in the app's Updates (push notifications aren't set up yet).",
    });
    setV({ title: "", body: "", titleHi: "", bodyHi: "", date: "", time: "" });
  }

  const input =
    "w-full rounded-md border border-ink/10 bg-white px-2.5 py-1.5 text-sm text-ink outline-none focus:border-maroon";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        value={v.title}
        onChange={(e) => set("title", e.target.value)}
        placeholder="Title (e.g. Haldi moved to 11 am)"
        maxLength={100}
        className={input}
      />
      <textarea
        value={v.body}
        onChange={(e) => set("body", e.target.value)}
        placeholder="Message for all guests"
        rows={3}
        maxLength={1000}
        className={input}
      />

      <button
        type="button"
        onClick={() => setShowHindi(!showHindi)}
        className="w-fit text-xs font-medium text-maroon hover:underline"
      >
        {showHindi ? "Hide Hindi version" : "+ Add a Hindi version (optional)"}
      </button>
      {showHindi && (
        <div className="flex flex-col gap-3">
          <input value={v.titleHi} onChange={(e) => set("titleHi", e.target.value)} placeholder="शीर्षक (हिंदी)" maxLength={100} className={input} />
          <textarea value={v.bodyHi} onChange={(e) => set("bodyHi", e.target.value)} placeholder="संदेश (हिंदी)" rows={3} maxLength={1000} className={input} />
          <p className="text-xs text-ink/50">Guests using Hindi see this; everyone else sees the English version.</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-sm">
        {(["now", "later"] as const).map((opt) => (
          <label key={opt} className="flex items-center gap-1.5 text-ink/80">
            <input type="radio" name="when" checked={when === opt} onChange={() => setWhen(opt)} className="accent-maroon" />
            {opt === "now" ? "Send now" : "Schedule for later"}
          </label>
        ))}
        {when === "later" && (
          <>
            <input type="date" value={v.date} onChange={(e) => set("date", e.target.value)} className="rounded-md border border-ink/10 bg-white px-2 py-1" />
            <input type="time" value={v.time} onChange={(e) => set("time", e.target.value)} className="rounded-md border border-ink/10 bg-white px-2 py-1" />
            <span className="text-xs text-ink/50">India time</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-maroon px-4 py-2.5 text-sm font-medium text-ivory hover:bg-maroon/90 disabled:opacity-60"
        >
          <Send size={15} />
          {pending ? "Sending…" : when === "now" ? "Send to all guests" : "Schedule"}
        </button>
        {message && <p className={`text-sm ${message.ok ? "text-mehendi" : "text-red-600"}`}>{message.text}</p>}
      </div>
    </form>
  );
}
