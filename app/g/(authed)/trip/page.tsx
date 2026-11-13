import Link from "next/link";
import { BedDouble, CircleCheck, CircleX, Plane, PlaneLanding, PlaneTakeoff, Users } from "lucide-react";
import { getDict, type Dict, type Locale } from "@/lib/i18n";
import { requireGuest } from "@/lib/guest-session";
import { prisma } from "@/lib/prisma";
import { formatIstDate, formatIstTime } from "@/lib/time";

export default async function TripPage() {
  const [guest, { locale, t }] = await Promise.all([requireGuest(), getDict()]);
  const [members, legs] = await Promise.all([
    prisma.guestMember.findMany({ where: { accountId: guest.id }, orderBy: { sortOrder: "asc" } }),
    prisma.travelLeg.findMany({ where: { accountId: guest.id } }),
  ]);
  const arrival = legs.find((l) => l.direction === "ARRIVAL");
  const departure = legs.find((l) => l.direction === "DEPARTURE");
  const hasRoom = !!(guest.stayPlace || guest.stayRoom || guest.stayNote);

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h1 className="font-invite text-4xl font-semibold text-maroon">{t.trip.title}</h1>
        <p className="mt-1 text-lg text-ink/70">{t.trip.subtitle}</p>
      </div>

      <Card title={t.trip.rsvp} icon={guest.attending === false ? <CircleX size={24} /> : <CircleCheck size={24} />} tone={guest.attending === null ? "todo" : "done"}>
        {guest.attending === null ? (
          <p className="text-xl font-semibold text-maroon">{t.trip.rsvpNotAnswered}</p>
        ) : guest.attending ? (
          <>
            <p className="text-xl font-semibold text-mehendi">{t.trip.rsvpYes}</p>
            <p className="mt-1 flex items-center gap-2 text-lg text-ink/80">
              <Users size={20} /> {guest.partySize} {t.trip.peopleComing}
            </p>
            {members.length > 0 && <p className="text-ink/60">{[guest.name, ...members.map((m) => m.name)].join(", ")}</p>}
          </>
        ) : (
          <p className="text-xl font-semibold text-ink/70">{t.trip.rsvpNo}</p>
        )}
        <ActionLink href="/g/trip/rsvp" primary={guest.attending === null}>
          {guest.attending === null ? t.trip.add : t.trip.edit}
        </ActionLink>
      </Card>

      {guest.attending !== false && (
        <>
          <LegCard title={t.trip.arrival} icon={<PlaneLanding size={24} />} leg={arrival} href="/g/trip/arrival" locale={locale} t={t} />
          <LegCard title={t.trip.departure} icon={<PlaneTakeoff size={24} />} leg={departure} href="/g/trip/departure" locale={locale} t={t} />
        </>
      )}

      {guest.attending !== false && (
        <Card title={t.trip.room} icon={<BedDouble size={24} />} tone={hasRoom ? "done" : "plain"}>
          {hasRoom ? (
            <>
              {guest.stayPlace && <p className="text-xl font-semibold text-ink">{guest.stayPlace}</p>}
              {guest.stayRoom && (
                <p className="text-lg text-ink/80">
                  {t.trip.roomNo}: <span className="font-semibold text-maroon">{guest.stayRoom}</span>
                </p>
              )}
              {guest.stayNote && <p className="mt-1 whitespace-pre-line text-ink/70">{guest.stayNote}</p>}
            </>
          ) : (
            <p className="text-ink/60">{t.trip.roomWaiting}</p>
          )}
        </Card>
      )}
    </div>
  );
}

function Card({
  title,
  icon,
  tone,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  tone: "todo" | "done" | "plain";
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-3xl border p-5 shadow-sm ${
        tone === "todo" ? "border-marigold bg-marigold/10" : "border-ink/10 bg-white/85"
      }`}
    >
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-mehendi">
        {icon} {title}
      </p>
      {children}
    </section>
  );
}

function ActionLink({ href, primary, children }: { href: string; primary?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`mt-4 flex items-center justify-center rounded-2xl px-4 py-3.5 text-lg font-semibold active:scale-[0.98] ${
        primary ? "bg-maroon text-ivory shadow-md" : "border-2 border-maroon/25 bg-white text-maroon"
      }`}
    >
      {children}
    </Link>
  );
}

function LegCard({
  title,
  icon,
  leg,
  href,
  locale,
  t,
}: {
  title: string;
  icon: React.ReactNode;
  leg: { mode: string; dateTime: Date; place: string | null; number: string | null; paxCount: number } | undefined;
  href: string;
  locale: Locale;
  t: Dict;
}) {
  const mode = leg ? t.travel.modes[leg.mode as keyof Dict["travel"]["modes"]] : null;
  return (
    <Card title={title} icon={icon ?? <Plane size={24} />} tone={leg ? "done" : "todo"}>
      {leg ? (
        <>
          <p className="text-xl font-semibold text-ink">
            {formatIstDate(leg.dateTime, locale)} · {formatIstTime(leg.dateTime, locale)}
          </p>
          <p className="text-lg text-ink/80">
            {[mode, leg.number, leg.place].filter(Boolean).join(" · ")}
          </p>
          <p className="text-ink/60">
            {leg.paxCount} {t.travel.summaryPeople}
          </p>
        </>
      ) : (
        <p className="text-xl font-semibold text-maroon">{t.trip.notAdded}</p>
      )}
      <ActionLink href={href} primary={!leg}>
        {leg ? t.trip.edit : t.trip.add}
      </ActionLink>
    </Card>
  );
}
