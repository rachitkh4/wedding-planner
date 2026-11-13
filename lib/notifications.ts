import { prisma } from "@/lib/prisma";
import { pushConfigured, sendPush } from "@/lib/push";
import { eventStart, formatStartTime, ymd } from "@/lib/time";

const HOUR = 60 * 60 * 1000;

type Reminder = {
  title: string;
  titleHi: string;
  body: string;
  bodyHi: string;
  sendAt: Date;
  eventId: string;
  reminderKey: string;
};

type Pushable = { id: string; title: string; titleHi: string | null; body: string; bodyHi: string | null };

/** Sends every announcement that is due and not yet sent. Safe to run concurrently. */
export async function sendDueAnnouncements(now = new Date()) {
  const due = await prisma.announcement.findMany({
    where: { sentAt: null, sendAt: { lte: now } },
    orderBy: { sendAt: "asc" },
  });

  const results: { id: string; title: string; sent: number; failed: number }[] = [];
  for (const a of due) {
    const result = await deliver(a);
    if (result) results.push(result);
  }
  return results;
}

/** Sends one announcement right now without touching its scheduled time. Returns null if it was already sent. */
export async function sendAnnouncementNow(id: string) {
  const a = await prisma.announcement.findUnique({ where: { id } });
  return a ? deliver(a) : null;
}

async function deliver(a: Pushable) {
  // Whoever flips sentAt first owns the send, so a double run never sends twice.
  const claim = await prisma.announcement.updateMany({
    where: { id: a.id, sentAt: null },
    data: { sentAt: new Date() },
  });
  if (claim.count === 0) return null;

  const { sent, failed } = await pushAnnouncement(a);
  await prisma.announcement.update({ where: { id: a.id }, data: { sentCount: sent, failedCount: failed } });
  return { id: a.id, title: a.title, sent, failed };
}

async function pushAnnouncement(a: Pushable) {
  if (!pushConfigured()) return { sent: 0, failed: 0 };

  const subs = await prisma.pushSubscription.findMany({
    include: { account: { select: { locale: true } } },
  });
  const locale = new Map(subs.map((s) => [s.id, s.account.locale]));

  const { sent, failed, gone } = await sendPush(
    subs,
    (t) => {
      const hi = locale.get(t.id) === "hi";
      const title = hi && a.titleHi ? a.titleHi : a.title;
      const body = hi && a.bodyHi ? a.bodyHi : a.body;
      return { title, body: body.slice(0, 180), url: "/g/updates", tag: a.id };
    },
    { ttlSeconds: 6 * 60 * 60 },
  );

  if (gone.length) await prisma.pushSubscription.deleteMany({ where: { id: { in: gone } } });
  return { sent, failed };
}

/**
 * Keeps the automatic reminders in step with the Itinerary: an evening-before
 * note (6 pm India time) and a "starts in 1 hour" note for every event that has
 * a start time and is shown to guests. Unsent reminders for events that changed
 * or were hidden are removed; sent ones are never touched.
 */
export async function syncEventReminders(now = new Date()) {
  const [meta, events, unsent] = await Promise.all([
    prisma.weddingMeta.findFirst({ select: { autoReminders: true } }),
    prisma.eventItem.findMany({ where: { showToGuests: true, startTime: { not: null } } }),
    prisma.announcement.findMany({
      where: { sentAt: null, reminderKey: { not: null } },
      select: { id: true, reminderKey: true },
    }),
  ]);

  const desired = new Map<string, Reminder>();
  if (meta?.autoReminders ?? true) {
    const oldest = now.getTime() - 30 * 60 * 1000; // don't send stale reminders
    for (const e of events) {
      const start = eventStart(e.date, e.startTime);
      const base = `${e.id}:${ymd(e.date)}T${e.startTime}`;
      const timeEn = formatStartTime(e.startTime, "en");
      const timeHi = formatStartTime(e.startTime, "hi");
      const nameHi = e.nameHi || e.name;
      const details = (time: string | null, extra: string) =>
        [time ? `${extra} ${time}` : null, e.venue, e.dressCode && `Dress: ${e.dressCode}`]
          .filter(Boolean)
          .join(" · ");
      const detailsHi = [timeHi ? `शुरू: ${timeHi}` : null, e.venue, e.dressCode && `पहनावा: ${e.dressCode}`]
        .filter(Boolean)
        .join(" · ");

      // 6:00 pm India time on the day before.
      const dayBefore = new Date(`${ymd(e.date)}T18:00:00+05:30`).getTime() - 24 * HOUR;
      desired.set(`${base}:eve`, {
        title: `Tomorrow: ${e.name}`,
        titleHi: `कल: ${nameHi}`,
        body: details(timeEn, "Starts at"),
        bodyHi: detailsHi,
        sendAt: new Date(dayBefore),
        eventId: e.id,
        reminderKey: `${base}:eve`,
      });
      desired.set(`${base}:hour`, {
        title: `${e.name} starts in 1 hour`,
        titleHi: `${nameHi} एक घंटे में शुरू होगा`,
        body: details(null, "") || "Open the app for details.",
        bodyHi: detailsHi,
        sendAt: new Date(start.getTime() - HOUR),
        eventId: e.id,
        reminderKey: `${base}:hour`,
      });
    }
    for (const [key, data] of desired) {
      if (data.sendAt.getTime() < oldest) desired.delete(key);
    }
  }

  const stale = unsent.filter((u) => !desired.has(u.reminderKey!)).map((u) => u.id);
  if (stale.length) await prisma.announcement.deleteMany({ where: { id: { in: stale } } });

  if (desired.size) {
    await prisma.announcement.createMany({
      data: [...desired.values()].map((d) => ({ ...d, kind: "REMINDER" as const })),
      skipDuplicates: true,
    });
  }
  return { created: desired.size, removed: stale.length };
}

