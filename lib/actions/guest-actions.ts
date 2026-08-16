"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { visibleToWhere } from "@/lib/visibility";
import type { Side, RsvpStatus, Visibility } from "@/generated/prisma/enums";

const PATH = "/guests";

async function requireUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

async function assertGuestVisible(guestId: string, userId: string) {
  const guest = await prisma.guest.findFirst({
    where: { AND: [{ id: guestId }, visibleToWhere(userId)] },
  });
  if (!guest) throw new Error("Not found or not permitted");
  return guest;
}

export async function createGuestAction(data: {
  name: string;
  side: keyof typeof Side;
  headcount: number;
}) {
  const userId = await requireUserId();
  await prisma.guest.create({
    data: { name: data.name, side: data.side, headcount: data.headcount, ownerId: userId },
  });
  revalidatePath(PATH);
  revalidatePath("/dashboard");
}

export async function updateGuestFieldAction(
  guestId: string,
  patch: Partial<{
    name: string;
    side: keyof typeof Side;
    headcount: number;
    rsvpStatus: keyof typeof RsvpStatus;
  }>,
) {
  const userId = await requireUserId();
  await assertGuestVisible(guestId, userId);
  await prisma.guest.update({ where: { id: guestId }, data: patch });
  revalidatePath(PATH);
  revalidatePath("/dashboard");
}

export async function toggleGuestEventAction(guestId: string, eventId: string, invited: boolean) {
  const userId = await requireUserId();
  await assertGuestVisible(guestId, userId);
  await prisma.guest.update({
    where: { id: guestId },
    data: {
      invitedEvents: invited ? { connect: { id: eventId } } : { disconnect: { id: eventId } },
    },
  });
  revalidatePath(PATH);
}

export async function deleteGuestAction(guestId: string) {
  const userId = await requireUserId();
  await assertGuestVisible(guestId, userId);
  await prisma.guest.delete({ where: { id: guestId } });
  revalidatePath(PATH);
  revalidatePath("/dashboard");
}

export async function updateGuestVisibilityAction(
  guestId: string,
  visibility: keyof typeof Visibility,
  sharedWithIds: string[],
) {
  const userId = await requireUserId();
  const guest = await prisma.guest.findUnique({ where: { id: guestId } });
  if (!guest || guest.ownerId !== userId) throw new Error("Only the owner can change visibility");

  await prisma.guest.update({
    where: { id: guestId },
    data: { visibility, sharedWith: { set: sharedWithIds.map((id) => ({ id })) } },
  });
  revalidatePath(PATH);
}
