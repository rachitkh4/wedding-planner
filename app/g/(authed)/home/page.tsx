import Link from "next/link";
import { ChevronRight, ClipboardList } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getDict } from "@/lib/i18n";
import { requireGuest } from "@/lib/guest-session";
import { getLatestUpdate, getWeddingInfo } from "@/lib/guest-data";
import { nowAndNext } from "@/lib/time";
import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import { Divider } from "@/components/guest/Ornaments";
import { GuestEventCard } from "@/components/guest/GuestEventCard";
import { PushSetup } from "@/components/guest/PushSetup";
import { ExploreTiles } from "@/components/guest/ExploreTiles";
import { UpdateCard } from "@/components/guest/UpdateCard";
import { vapidPublicKey } from "@/lib/push";

export default async function GuestHomePage() {
  const [guest, { locale, t }, { events, countdownTarget }] = await Promise.all([
    requireGuest(),
    getDict(),
    getWeddingInfo(),
  ]);
  const { current, next } = nowAndNext(events);
  const arrivalAdded =
    (await prisma.travelLeg.count({ where: { accountId: guest.id, direction: "ARRIVAL" } })) > 0;
  const todo =
    guest.attending === null ? t.trip.cardRsvp : guest.attending && !arrivalAdded ? t.trip.cardTravel : null;
  const firstName = guest.name.split(" ")[0];
  const latest = await getLatestUpdate();

  return (
    <div className="flex flex-col gap-6">
      <section className="text-center">
        <p className="font-invite text-4xl font-semibold text-maroon">
          🙏 {t.namaste} {firstName} {t.ji}
        </p>
        <p className="mt-2 text-lg text-ink/70">{t.welcome}</p>
        <Divider className="mx-auto mt-4 h-6 w-48" />
      </section>

      {latest && (
        <Link href="/g/updates" className="block active:scale-[0.99]">
          <UpdateCard t={t} locale={locale} unread item={latest} />
        </Link>
      )}

      <PushSetup publicKey={vapidPublicKey()} t={t} variant="card" />

      {todo && (
        <Link
          href="/g/trip"
          className="flex items-center gap-3 rounded-3xl border-2 border-marigold bg-marigold/15 px-5 py-4 text-xl font-semibold text-maroon shadow-sm active:scale-[0.98]"
        >
          <ClipboardList size={28} className="shrink-0" />
          <span className="flex-1">{todo}</span>
          <ChevronRight size={26} />
        </Link>
      )}

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

      <ExploreTiles t={t} />

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
