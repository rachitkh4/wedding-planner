import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getDict } from "@/lib/i18n";
import { requireGuest } from "@/lib/guest-session";
import { getWeddingInfo } from "@/lib/guest-data";
import { nowAndNext } from "@/lib/time";
import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import { Divider } from "@/components/guest/Ornaments";
import { GuestEventCard } from "@/components/guest/GuestEventCard";

export default async function GuestHomePage() {
  const [guest, { locale, t }, { events, countdownTarget }] = await Promise.all([
    requireGuest(),
    getDict(),
    getWeddingInfo(),
  ]);
  const { current, next } = nowAndNext(events);
  const firstName = guest.name.split(" ")[0];

  return (
    <div className="flex flex-col gap-6">
      <section className="text-center">
        <p className="font-invite text-4xl font-semibold text-maroon">
          🙏 {t.namaste} {firstName} {t.ji}
        </p>
        <p className="mt-2 text-lg text-ink/70">{t.welcome}</p>
        <Divider className="mx-auto mt-4 h-6 w-48" />
      </section>

      {countdownTarget && (
        <section className="rounded-3xl border border-marigold/40 bg-white/80 px-3 py-5 shadow-sm">
          <CountdownTimer
            weddingDate={countdownTarget}
            labels={t.countdown}
            doneMessage={t.countdownDone}
            className="flex justify-around"
          />
        </section>
      )}

      {current && (
        <GuestEventCard event={current} locale={locale} t={t} highlight={`● ${t.happeningNow}`} />
      )}
      {next && (
        <GuestEventCard event={next} locale={locale} t={t} highlight={t.upNext} showSchedule={!current} />
      )}
      {events.length === 0 && (
        <p className="rounded-3xl bg-white/70 px-5 py-4 text-center text-ink/60">{t.noEvents}</p>
      )}

      {events.length > 0 && (
        <Link
          href="/g/events"
          className="flex items-center justify-between rounded-2xl bg-maroon px-5 py-4 text-xl font-semibold text-ivory shadow-md active:scale-[0.98]"
        >
          {t.allEvents}
          <ChevronRight size={26} />
        </Link>
      )}
    </div>
  );
}
