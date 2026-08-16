"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const PATH = "/itinerary";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

export async function createEventAction(name: string, date: string, venue: string) {
  await requireAuth();
  const last = await prisma.eventItem.findFirst({ orderBy: { sortOrder: "desc" } });
  await prisma.eventItem.create({
    data: { name, date: new Date(date), venue, sortOrder: (last?.sortOrder ?? 0) + 1 },
  });
  revalidatePath(PATH);
  revalidatePath("/dashboard");
  revalidatePath("/guests");
}

export async function updateEventAction(
  eventId: string,
  patch: { name?: string; date?: string; venue?: string },
) {
  await requireAuth();
  await prisma.eventItem.update({
    where: { id: eventId },
    data: {
      ...patch,
      ...(patch.date !== undefined && { date: new Date(patch.date) }),
    },
  });
  revalidatePath(PATH);
  revalidatePath("/dashboard");
  revalidatePath("/guests");
}

export async function deleteEventAction(eventId: string) {
  await requireAuth();
  await prisma.eventItem.delete({ where: { id: eventId } });
  revalidatePath(PATH);
  revalidatePath("/dashboard");
  revalidatePath("/guests");
}

export async function createScheduleEntryAction(eventId: string, time: string, activity: string) {
  await requireAuth();
  const last = await prisma.scheduleEntry.findFirst({
    where: { eventId },
    orderBy: { sortOrder: "desc" },
  });
  await prisma.scheduleEntry.create({
    data: { eventId, time, activity, sortOrder: (last?.sortOrder ?? 0) + 1 },
  });
  revalidatePath(PATH);
}

export async function updateScheduleEntryAction(
  entryId: string,
  patch: { time?: string; activity?: string },
) {
  await requireAuth();
  await prisma.scheduleEntry.update({ where: { id: entryId }, data: patch });
  revalidatePath(PATH);
}

export async function deleteScheduleEntryAction(entryId: string) {
  await requireAuth();
  await prisma.scheduleEntry.delete({ where: { id: entryId } });
  revalidatePath(PATH);
}
