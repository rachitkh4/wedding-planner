import { getDict } from "@/lib/i18n";
import { getWeddingInfo } from "@/lib/guest-data";
import { nowAndNext, todayYmdIST, ymd } from "@/lib/time";
import { GuestEventCard } from "@/components/guest/GuestEventCard";

export default async function GuestEventsPage() {
  const [{ locale, t }, { events }] = await Promise.all([getDict(), getWeddingInfo()]);
  const { current } = nowAndNext(events);
  const today = todayYmdIST();

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-invite text-center text-4xl font-semibold text-maroon">{t.tabs.events}</h1>
      {events.length === 0 && (
        <p className="rounded-3xl bg-white/70 px-5 py-4 text-center text-ink/60">{t.noEvents}</p>
      )}
      {events.map((e) => (
        <GuestEventCard
          key={e.id}
          event={e}
          locale={locale}
          t={t}
          highlight={
            current?.id === e.id ? `● ${t.happeningNow}` : ymd(e.date) === today ? t.today : undefined
          }
        />
      ))}
    </div>
  );
}
