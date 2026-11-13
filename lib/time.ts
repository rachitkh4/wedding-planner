/**
 * Everything guest-facing is shown in India time, regardless of where the
 * server runs. Event dates are stored as Postgres DATE (UTC midnight), with an
 * optional "HH:MM" start time that is India-local.
 */
import type { Locale } from "@/lib/i18n";

export const IST = "Asia/Kolkata";

const intlLocale = (locale: Locale) => (locale === "hi" ? "hi-IN" : "en-IN");

/** The stored DATE as "YYYY-MM-DD" (it's UTC midnight, so read it in UTC). */
export function ymd(date: Date | string): string {
  return new Date(date).toISOString().slice(0, 10);
}

/** Today's date in India as "YYYY-MM-DD". */
export function todayYmdIST(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: IST }).format(now);
}

/** The instant an event starts (midnight IST when no start time is set). */
export function eventStart(date: Date | string, startTime?: string | null): Date {
  const time = startTime && /^\d{2}:\d{2}$/.test(startTime) ? startTime : "00:00";
  return new Date(`${ymd(date)}T${time}:00+05:30`);
}

export function formatEventDate(date: Date | string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatShortDate(date: Date | string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

/** "18:30" → "6:30 pm" (en) / "6:30 pm" (hi, Latin digits are easier to read). */
export function formatStartTime(startTime: string | null | undefined, locale: Locale) {
  if (!startTime || !/^\d{2}:\d{2}$/.test(startTime)) return null;
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: "UTC",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    numberingSystem: "latn",
  }).format(new Date(`1970-01-01T${startTime}:00Z`));
}

type TimedEvent = { date: Date; startTime: string | null };

/**
 * What's on right now and what's coming next. "Now" is the latest event that
 * started today within the last 6 hours (or any all-day event today); "next"
 * is the first event that hasn't started yet.
 */
export function nowAndNext<T extends TimedEvent>(events: T[], now = new Date()) {
  const sorted = [...events].sort(
    (a, b) => eventStart(a.date, a.startTime).getTime() - eventStart(b.date, b.startTime).getTime(),
  );
  const today = todayYmdIST(now);
  const SIX_HOURS = 6 * 60 * 60 * 1000;

  let current: T | null = null;
  for (const e of sorted) {
    if (ymd(e.date) !== today) continue;
    const sinceStart = now.getTime() - eventStart(e.date, e.startTime).getTime();
    if (sinceStart < 0) continue;
    if (!e.startTime || sinceStart < SIX_HOURS) current = e;
  }
  const next = sorted.find((e) => {
    if (!e.startTime) return ymd(e.date) > today;
    return eventStart(e.date, e.startTime).getTime() > now.getTime();
  });
  return { current, next: next ?? null };
}

/** "2027-01-22" + "14:30" typed in India time → the absolute instant, or null if invalid. */
export function parseISTDateTime(date: string, time: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const d = new Date(`${date}T${time}:00+05:30`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** An instant's India-local calendar date as "YYYY-MM-DD". */
export function istYmd(instant: Date | string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: IST }).format(new Date(instant));
}

/** An instant's India-local time as "HH:MM" (24-hour, for form inputs). */
export function istHm(instant: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: IST,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(instant));
}

/** An instant's India-local time as "6:30 pm". */
export function formatIstTime(instant: Date | string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: IST,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    numberingSystem: "latn",
  }).format(new Date(instant));
}

/** An instant's India-local date as "Fri, 22 Jan". */
export function formatIstDate(instant: Date | string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: IST,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(instant));
}
