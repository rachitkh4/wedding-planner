import { prisma } from "@/lib/prisma";
import { eventStart, ymd } from "@/lib/time";

/** Everything the guest app shows, filtered to what the couple marked as public. */
export async function getWeddingInfo() {
  const [meta, events, helpContacts] = await Promise.all([
    prisma.weddingMeta.findFirst(),
    prisma.eventItem.findMany({
      where: { showToGuests: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }, { sortOrder: "asc" }],
      include: { scheduleEntries: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.helpContact.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  // Count down to the first timed event on the wedding day, else midnight IST.
  let countdownTarget: string | null = null;
  if (meta) {
    const weddingDay = ymd(meta.weddingDate);
    const firstOnDay = events.find((e) => ymd(e.date) === weddingDay && e.startTime);
    countdownTarget = eventStart(meta.weddingDate, firstOnDay?.startTime).toISOString();
  }

  return { meta, events, helpContacts, countdownTarget };
}

export type GuestEvent = Awaited<ReturnType<typeof getWeddingInfo>>["events"][number];

export function directionsUrl(event: { mapUrl: string | null; venue: string | null }) {
  if (event.mapUrl) return event.mapUrl;
  if (event.venue) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`;
  }
  return null;
}
