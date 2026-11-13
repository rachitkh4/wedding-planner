import { CalendarDays, Clock, MapPin, Navigation, Shirt } from "lucide-react";
import { pick, type Dict, type Locale } from "@/lib/i18n";
import { directionsUrl, type GuestEvent } from "@/lib/guest-data";
import { formatEventDate, formatStartTime } from "@/lib/time";

export function GuestEventCard({
  event,
  locale,
  t,
  highlight,
  showSchedule = true,
}: {
  event: GuestEvent;
  locale: Locale;
  t: Dict;
  highlight?: string;
  showSchedule?: boolean;
}) {
  const time = formatStartTime(event.startTime, locale);
  const maps = directionsUrl(event);
  const title = pick(locale, event.name, event.nameHi);
  const subtitle = locale === "hi" ? (event.nameHi ? event.name : null) : event.nameHi;

  return (
    <article className="overflow-hidden rounded-3xl border border-marigold/40 bg-white/85 shadow-sm">
      {highlight && (
        <p className="bg-maroon px-5 py-1.5 text-sm font-semibold uppercase tracking-wider text-ivory">
          {highlight}
        </p>
      )}
      <div className="p-5">
        {subtitle && <p className="text-lg text-marigold">{subtitle}</p>}
        <h2 className="font-invite text-3xl font-semibold leading-tight text-maroon">{title}</h2>

        <dl className="mt-4 flex flex-col gap-2.5 text-lg">
          <Row icon={<CalendarDays size={22} />} label={t.date}>
            {formatEventDate(event.date, locale)}
          </Row>
          <Row icon={<Clock size={22} />} label={t.time}>
            {time ?? <span className="text-ink/50">{t.timeTba}</span>}
          </Row>
          {event.venue && (
            <Row icon={<MapPin size={22} />} label={t.venue}>
              {event.venue}
            </Row>
          )}
          {event.dressCode && (
            <Row icon={<Shirt size={22} />} label={t.dressCode}>
              {event.dressCode}
            </Row>
          )}
        </dl>

        {event.description && <p className="mt-4 whitespace-pre-line text-ink/75">{event.description}</p>}

        {showSchedule && event.scheduleEntries.length > 0 && (
          <div className="mt-5 rounded-2xl bg-ivory px-4 py-3">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-mehendi">{t.schedule}</p>
            <ul className="flex flex-col gap-1.5">
              {event.scheduleEntries.map((s) => (
                <li key={s.id} className="flex gap-3">
                  <span className="w-24 shrink-0 font-semibold text-maroon">{s.time}</span>
                  <span className="text-ink/80">{s.activity}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {maps && (
          <a
            href={maps}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center justify-center gap-2 rounded-2xl border-2 border-maroon/25 bg-white px-4 py-3 text-lg font-semibold text-maroon active:scale-[0.98]"
          >
            <Navigation size={20} /> {t.directions}
          </a>
        )}
      </div>
    </article>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <dt className="mt-0.5 shrink-0 text-marigold" aria-label={label}>
        {icon}
      </dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}
