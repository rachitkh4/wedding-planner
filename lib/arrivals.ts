import { prisma } from "@/lib/prisma";
import { istYmd } from "@/lib/time";
import type { TravelDirection } from "@/generated/prisma/enums";

export const MODE_LABELS = {
  TRAIN: "Train",
  FLIGHT: "Flight",
  BUS: "Bus",
  CAR: "Car",
  OTHER: "Other",
} as const;

export const SLOTS = [
  { key: "early", label: "Early morning (12 am – 6 am)", from: 0, to: 6 },
  { key: "morning", label: "Morning (6 am – 12 pm)", from: 6, to: 12 },
  { key: "afternoon", label: "Afternoon (12 pm – 5 pm)", from: 12, to: 17 },
  { key: "evening", label: "Evening (5 pm – 9 pm)", from: 17, to: 21 },
  { key: "night", label: "Night (9 pm – 12 am)", from: 21, to: 24 },
] as const;

// Everyone who hasn't said no (guests who haven't answered but added travel still count).
const NOT_DECLINED = { OR: [{ attending: null }, { attending: true }] };

export function parseDirection(value: string | undefined): TravelDirection {
  return value === "departure" ? "DEPARTURE" : "ARRIVAL";
}

export async function getTravelOverview(direction: TravelDirection) {
  const [legs, accounts] = await Promise.all([
    prisma.travelLeg.findMany({
      where: { direction, account: NOT_DECLINED },
      include: { account: { include: { members: { orderBy: { sortOrder: "asc" } } } } },
      orderBy: { dateTime: "asc" },
    }),
    prisma.guestAccount.findMany({
      where: { attending: true },
      include: { travel: { where: { direction }, select: { id: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const missing = accounts.filter((a) => a.travel.length === 0);

  // day -> slot -> legs, in time order
  const days: { date: string; people: number; slots: { key: string; label: string; legs: typeof legs }[] }[] = [];
  for (const leg of legs) {
    const date = istYmd(leg.dateTime);
    let day = days.find((d) => d.date === date);
    if (!day) days.push((day = { date, people: 0, slots: [] }));
    day.people += leg.paxCount;

    const hour = Number(
      new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", hour12: false }).format(
        leg.dateTime,
      ),
    ) % 24;
    const slot = SLOTS.find((s) => hour >= s.from && hour < s.to) ?? SLOTS[0];
    let bucket = day.slots.find((s) => s.key === slot.key);
    if (!bucket) {
      bucket = { key: slot.key, label: slot.label, legs: [] };
      day.slots.push(bucket);
    }
    bucket.legs.push(leg);
  }

  const byMode: Record<string, number> = {};
  for (const leg of legs) byMode[leg.mode] = (byMode[leg.mode] ?? 0) + leg.paxCount;

  return {
    legs,
    days,
    missing,
    byMode,
    totalPeople: legs.reduce((sum, l) => sum + l.paxCount, 0),
  };
}

export type TravelOverview = Awaited<ReturnType<typeof getTravelOverview>>;

/** Free text typed by guests must not turn into spreadsheet formulas. */
function csvCell(value: string | number | null | undefined) {
  let s = value == null ? "" : String(value);
  // Plain numbers (including our +91… phone numbers) are safe; anything else that
  // starts with a formula character gets a leading apostrophe.
  if (/^[=+\-@\t\r]/.test(s) && !/^\+?\d+$/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: (string | number | null | undefined)[][]) {
  return rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
}
