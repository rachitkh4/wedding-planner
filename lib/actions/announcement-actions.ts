"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseISTDateTime, todayYmdIST, ymd } from "@/lib/time";
import { deleteImageQuietly } from "@/lib/actions/image-actions";
import { sendAnnouncementNow, sendDueAnnouncements, syncEventReminders } from "@/lib/notifications";

async function requireUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

function refresh() {
  revalidatePath("/announcements");
  revalidatePath("/g", "layout");
}

export async function createAnnouncementAction(data: {
  title: string;
  body: string;
  titleHi?: string;
  bodyHi?: string;
  when: "now" | "later";
  date?: string;
  time?: string;
}): Promise<{ error?: string; sent?: number }> {
  await requireUserId();
  const title = data.title.trim().slice(0, 100);
  const body = data.body.trim().slice(0, 1000);
  if (!title || !body) return { error: "Please write a title and a message." };

  let sendAt = new Date();
  if (data.when === "later") {
    const parsed = parseISTDateTime(data.date ?? "", data.time ?? "");
    if (!parsed) return { error: "Please choose the date and time to send." };
    if (parsed.getTime() < Date.now() - 60_000) return { error: "That time has already passed." };
    sendAt = parsed;
  }

  await prisma.announcement.create({
    data: {
      kind: "ANNOUNCEMENT",
      title,
      body,
      titleHi: data.titleHi?.trim().slice(0, 100) || null,
      bodyHi: data.bodyHi?.trim().slice(0, 1000) || null,
      sendAt,
    },
  });

  let sent: number | undefined;
  if (data.when === "now") {
    const results = await sendDueAnnouncements();
    sent = results.reduce((sum, r) => sum + r.sent, 0);
  }
  refresh();
  return { sent };
}

export async function sendAnnouncementNowAction(id: string) {
  await requireUserId();
  await sendAnnouncementNow(id);
  refresh();
}

export async function deleteAnnouncementAction(id: string) {
  await requireUserId();
  const a = await prisma.announcement.findUnique({ where: { id } });
  // Automatic reminders are switched off with the toggle, otherwise they would just be recreated.
  if (!a || (a.reminderKey && !a.sentAt)) return;
  await prisma.announcement.delete({ where: { id } });
  await deleteImageQuietly(a.imageId);
  refresh();
}

export async function setAutoRemindersAction(enabled: boolean) {
  await requireUserId();
  const meta = await prisma.weddingMeta.findFirst({ select: { id: true } });
  if (!meta) return;
  await prisma.weddingMeta.update({ where: { id: meta.id }, data: { autoReminders: enabled } });
  await syncEventReminders();
  refresh();
}

/** Countdown surprises go out at 9 am India time on their day. */
export async function saveSurpriseAction(data: {
  date: string;
  title: string;
  body: string;
  titleHi?: string;
  bodyHi?: string;
  imageId?: string | null;
}): Promise<{ error?: string }> {
  await requireUserId();
  const sendAt = parseISTDateTime(data.date, "09:00");
  if (!sendAt) return { error: "Choose a valid day." };
  if (data.date < todayYmdIST()) return { error: "That day has already passed." };
  const meta = await prisma.weddingMeta.findFirst({ select: { weddingDate: true } });
  if (meta && data.date > ymd(meta.weddingDate)) return { error: "That is after the wedding day." };

  const existing = await prisma.announcement.findFirst({ where: { kind: "SURPRISE", sendAt } });
  if (existing?.sentAt) return { error: "That surprise has already been sent." };

  const title = data.title.trim().slice(0, 100);
  const body = data.body.trim().slice(0, 1000);
  if (!title && !body && !data.imageId) {
    // Clearing a day removes its surprise.
    if (existing) {
      await prisma.announcement.delete({ where: { id: existing.id } });
      await deleteImageQuietly(existing.imageId);
    }
    refresh();
    return {};
  }
  if (!title || !body) return { error: "Please write a title and a message." };

  const values = {
    title,
    body,
    titleHi: data.titleHi?.trim().slice(0, 100) || null,
    bodyHi: data.bodyHi?.trim().slice(0, 1000) || null,
    imageId: data.imageId ?? null,
  };
  if (existing) {
    await prisma.announcement.update({ where: { id: existing.id }, data: values });
    if (existing.imageId && existing.imageId !== values.imageId) await deleteImageQuietly(existing.imageId);
  } else {
    await prisma.announcement.create({ data: { kind: "SURPRISE", sendAt, ...values } });
  }
  refresh();
  return {};
}
