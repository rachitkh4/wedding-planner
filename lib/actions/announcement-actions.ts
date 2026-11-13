"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseISTDateTime } from "@/lib/time";
import { sendDueAnnouncements, syncEventReminders } from "@/lib/notifications";

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
  await prisma.announcement.updateMany({ where: { id, sentAt: null }, data: { sendAt: new Date() } });
  await sendDueAnnouncements();
  refresh();
}

export async function deleteAnnouncementAction(id: string) {
  await requireUserId();
  const a = await prisma.announcement.findUnique({ where: { id } });
  // Automatic reminders are switched off with the toggle, otherwise they would just be recreated.
  if (!a || (a.reminderKey && !a.sentAt)) return;
  await prisma.announcement.delete({ where: { id } });
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
