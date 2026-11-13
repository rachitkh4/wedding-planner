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
  patch: {
    name?: string;
    date?: string;
    venue?: string;
    startTime?: string | null;
    nameHi?: string | null;
    dressCode?: string | null;
    mapUrl?: string | null;
    description?: string | null;
    showToGuests?: boolean;
  },
) {
  await requireAuth();
  if (patch.startTime && !/^\d{2}:\d{2}$/.test(patch.startTime)) {
    throw new Error("Start time must be HH:MM");
  }
  if (patch.mapUrl && !/^https:\/\//.test(patch.mapUrl)) {
    throw new Error("Map link must start with https://");
  }
  // Empty strings from cleared inputs are stored as null.
  const clean = Object.fromEntries(
    Object.entries(patch).map(([k, v]) => [k, typeof v === "string" && v.trim() === "" && k !== "name" ? null : v]),
  ) as typeof patch;
  await prisma.eventItem.update({
    where: { id: eventId },
    data: {
      ...clean,
      ...(patch.date !== undefined && { date: new Date(patch.date) }),
    },
  });
  revalidatePath("/g", "layout");
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
