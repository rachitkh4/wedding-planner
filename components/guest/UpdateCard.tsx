import { BellRing, Megaphone } from "lucide-react";
import { pick, type Dict, type Locale } from "@/lib/i18n";
import { formatIstDate, formatIstTime } from "@/lib/time";

export type UpdateItem = {
  id: string;
  kind: "ANNOUNCEMENT" | "REMINDER" | "SURPRISE";
  title: string;
  titleHi: string | null;
  body: string;
  bodyHi: string | null;
  sentAt: Date;
};

export function UpdateCard({ item, locale, t, unread }: { item: UpdateItem; locale: Locale; t: Dict; unread?: boolean }) {
  const Icon = item.kind === "REMINDER" ? BellRing : Megaphone;
  return (
    <article
      className={`rounded-3xl border p-5 shadow-sm ${unread ? "border-marigold bg-marigold/10" : "border-ink/10 bg-white/85"}`}
    >
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-mehendi">
        <Icon size={18} />
        {item.kind === "REMINDER" ? t.updates.reminder : t.updates.announcement}
        <span className="ml-auto font-normal normal-case tracking-normal text-ink/50">
          {formatIstDate(item.sentAt, locale)} · {formatIstTime(item.sentAt, locale)}
        </span>
      </p>
      <h2 className="font-invite mt-2 text-2xl font-semibold leading-snug text-maroon">
        {pick(locale, item.title, item.titleHi)}
      </h2>
      <p className="mt-1 whitespace-pre-line text-lg text-ink/80">{pick(locale, item.body, item.bodyHi)}</p>
    </article>
  );
}
