"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { visibleToWhere } from "@/lib/visibility";
import { normalizePhone } from "@/lib/phone";
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
  phone?: string;
}): Promise<{ error?: string }> {
  const userId = await requireUserId();
  let phone: string | null = null;
  if (data.phone?.trim()) {
    phone = normalizePhone(data.phone);
    if (!phone) return { error: "That mobile number doesn't look right." };
    if (await prisma.guest.findUnique({ where: { phone } })) {
      return { error: "Another guest already has that mobile number." };
    }
  }
  const guest = await prisma.guest.create({
    data: { name: data.name, side: data.side, headcount: data.headcount, ownerId: userId, phone },
  });
  if (phone) await linkAccountsByPhone(guest.id, phone);
  revalidatePath(PATH);
  revalidatePath("/dashboard");
  return {};
}

/** Link any guest-app registration with this number that isn't linked yet. */
async function linkAccountsByPhone(guestId: string, phone: string) {
  await prisma.guestAccount.updateMany({
    where: { phone, guestId: null },
    data: { guestId },
  });
  revalidatePath("/guest-app");
}

export async function updateGuestPhoneAction(
  guestId: string,
  rawPhone: string,
): Promise<{ error?: string; phone?: string | null }> {
  const userId = await requireUserId();
  await assertGuestVisible(guestId, userId);

  const phone = rawPhone.trim() ? normalizePhone(rawPhone) : null;
  if (rawPhone.trim() && !phone) return { error: "Invalid number" };
  if (phone) {
    const other = await prisma.guest.findUnique({ where: { phone } });
    if (other && other.id !== guestId) return { error: `Already used by ${other.name}` };
  }
  await prisma.guest.update({ where: { id: guestId }, data: { phone } });
  if (phone) await linkAccountsByPhone(guestId, phone);
  revalidatePath(PATH);
  return { phone };
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
