import Link from "next/link";
import { Bus, Car, Ellipsis, FileDown, Plane, TrainFront } from "lucide-react";
import { getTravelOverview, MODE_LABELS, parseDirection } from "@/lib/arrivals";
import { formatIstDate, formatIstTime } from "@/lib/time";
import { formatPhone, telHref } from "@/lib/phone";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/shared/Card";
import { EmptyState } from "@/components/shared/EmptyState";
import { PrintButton } from "@/components/arrivals/PrintButton";

const MODE_ICONS = { TRAIN: TrainFront, FLIGHT: Plane, BUS: Bus, CAR: Car, OTHER: Ellipsis } as const;

export default async function ArrivalsPage({
  searchParams,
}: {
  searchParams: Promise<{ dir?: string }>;
}) {
  const { dir } = await searchParams;
  const direction = parseDirection(dir);
  const arriving = direction === "ARRIVAL";
  const { legs, days, missing, byMode, totalPeople } = await getTravelOverview(direction);
  const word = arriving ? "Arrivals" : "Departures";

  return (
    <div>
      <PageHeader
        title={word}
        subtitle={`Who is ${arriving ? "arriving" : "leaving"}, when, and by what — as entered by guests in the app.`}
        action={
          <div className="flex items-center gap-2 print:hidden">
            <PrintButton />
            <a
              href={`/arrivals/export?dir=${arriving ? "arrival" : "departure"}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm font-medium text-ink/70 hover:bg-ink/5"
            >
              <FileDown size={15} /> Export CSV
            </a>
          </div>
        }
      />

      <div className="mb-5 flex gap-2 print:hidden">
        {(["arrival", "departure"] as const).map((d) => {
          const active = (d === "arrival") === arriving;
          return (
            <Link
              key={d}
              href={`/arrivals?dir=${d}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                active ? "bg-maroon text-ivory" : "bg-white text-ink/60 hover:bg-maroon/10 hover:text-maroon"
              }`}
            >
              {d === "arrival" ? "Arrivals" : "Departures"}
            </Link>
          );
        })}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="People" value={String(totalPeople)} sub={`${arriving ? "arriving" : "leaving"} in total`} />
        <StatCard label="Journeys" value={String(legs.length)} sub="added by guests" />
        <StatCard label="Not added yet" value={String(missing.length)} sub="families who said yes" />
        <StatCard label="Days" value={String(days.length)} sub={arriving ? "of arrivals" : "of departures"} />
      </div>

      {Object.keys(byMode).length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {Object.entries(byMode).map(([mode, people]) => {
            const Icon = MODE_ICONS[mode as keyof typeof MODE_ICONS];
            return (
              <span key={mode} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-ink/80 shadow-sm">
                <Icon size={15} className="text-marigold" />
                {MODE_LABELS[mode as keyof typeof MODE_LABELS]}
                <b className="text-maroon">{people}</b>
              </span>
            );
          })}
        </div>
      )}

      {days.length === 0 ? (
        <EmptyState
          title={`No ${word.toLowerCase()} yet`}
          hint="Guests add their travel from the My Trip tab in the app."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {days.map((day) => {
            const first = day.slots[0].legs[0];
            return (
              <section key={day.date} className="break-inside-avoid">
                <h2 className="mb-2 flex items-baseline gap-3 font-display text-lg text-ink">
                  {formatIstDate(first.dateTime, "en")}
                  <span className="font-sans text-sm text-ink/50">{day.people} people</span>
                </h2>
                <Card className="overflow-x-auto p-0">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
                        <th className="px-3 py-2.5">Time</th>
                        <th className="px-3 py-2.5">Guest</th>
                        <th className="px-3 py-2.5">Mode</th>
                        <th className="px-3 py-2.5">{arriving ? "Arriving at" : "Leaving from"}</th>
                        <th className="px-3 py-2.5">Number / PNR</th>
                        <th className="px-3 py-2.5 text-right">People</th>
                      </tr>
                    </thead>
                    <tbody>
                      {day.slots.map((slot) => (
                        <SlotRows key={slot.key} slot={slot} />
                      ))}
                    </tbody>
                  </table>
                </Card>
              </section>
            );
          })}
        </div>
      )}

      {missing.length > 0 && (
        <section className="mt-8 break-inside-avoid">
          <h2 className="mb-2 font-display text-lg text-ink">Said yes, but no {arriving ? "arrival" : "departure"} added ({missing.length})</h2>
          <Card className="p-0">
            <ul className="divide-y divide-ink/5">
              {missing.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 text-sm">
                  <span className="text-ink/90">{a.name}</span>
                  <span className="text-ink/50">{a.partySize ?? 1} people</span>
                  <a href={telHref(a.phone)} className="ml-auto text-maroon hover:underline">
                    {formatPhone(a.phone)}
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}
    </div>
  );
}

function SlotRows({
  slot,
}: {
  slot: Awaited<ReturnType<typeof getTravelOverview>>["days"][number]["slots"][number];
}) {
  const people = slot.legs.reduce((sum, l) => sum + l.paxCount, 0);
  return (
    <>
      <tr className="bg-ivory/80">
        <td colSpan={5} className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-mehendi">
          {slot.label}
        </td>
        <td className="px-3 py-1.5 text-right text-xs font-semibold text-mehendi">{people}</td>
      </tr>
      {slot.legs.map((l) => {
        const Icon = MODE_ICONS[l.mode];
        const others = l.account.members.map((m) => m.name);
        return (
          <tr key={l.id} className="border-b border-ink/5 align-top last:border-0">
            <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-ink/80">{formatIstTime(l.dateTime, "en")}</td>
            <td className="px-3 py-2.5">
              <p className="text-ink/90">{l.account.name}</p>
              <a href={telHref(l.account.phone)} className="text-xs text-ink/50 hover:text-maroon">
                {formatPhone(l.account.phone)}
              </a>
              {others.length > 0 && <p className="text-xs text-ink/50">+ {others.join(", ")}</p>}
              {l.note && <p className="mt-0.5 text-xs italic text-ink/60">“{l.note}”</p>}
            </td>
            <td className="px-3 py-2.5">
              <span className="inline-flex items-center gap-1.5 text-ink/80">
                <Icon size={14} className="text-marigold" /> {MODE_LABELS[l.mode]}
              </span>
            </td>
            <td className="px-3 py-2.5 text-ink/80">{l.place ?? "—"}</td>
            <td className="px-3 py-2.5">
              <p className="text-ink/80">{l.number ?? "—"}</p>
              {l.pnr && <p className="font-mono text-xs text-ink/50">PNR {l.pnr}</p>}
            </td>
            <td className="px-3 py-2.5 text-right font-medium text-ink/90">{l.paxCount}</td>
          </tr>
        );
      })}
    </>
  );
}
