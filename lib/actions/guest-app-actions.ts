"use server";

import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import type { Side } from "@/generated/prisma/enums";

/** Planner-only actions for managing the guest app. */
async function requireUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

function done() {
  revalidatePath("/guest-app");
  revalidatePath("/guests");
}

export async function linkAccountAction(accountId: string, guestId: string | null) {
  await requireUserId();
  await prisma.guestAccount.update({ where: { id: accountId }, data: { guestId } });
  done();
}

/** Create a Guest List entry from a registration and link the two. */
export async function addAccountToGuestListAction(accountId: string, side: keyof typeof Side) {
  const userId = await requireUserId();
  const account = await prisma.guestAccount.findUniqueOrThrow({ where: { id: accountId } });
  const existing = await prisma.guest.findUnique({ where: { phone: account.phone } });
  const guest =
    existing ??
    (await prisma.guest.create({
      data: { name: account.name, phone: account.phone, side, headcount: 1, ownerId: userId },
    }));
  await prisma.guestAccount.update({ where: { id: accountId }, data: { guestId: guest.id } });
  done();
  revalidatePath("/dashboard");
}

/** Sets a fresh random PIN, signs the guest out everywhere, and returns the PIN once. */
export async function resetGuestPinAction(accountId: string): Promise<string> {
  await requireUserId();
  const pin = String(randomInt(0, 10_000)).padStart(4, "0");
  await prisma.guestAccount.update({
    where: { id: accountId },
    data: {
      pinHash: await bcrypt.hash(pin, 10),
      sessionVersion: { increment: 1 },
      failedAttempts: 0,
      lockedUntil: null,
    },
  });
  return pin;
}

export async function deleteGuestAccountAction(accountId: string) {
  await requireUserId();
  await prisma.guestAccount.delete({ where: { id: accountId } });
  done();
}

export async function createHelpContactAction(data: {
  label: string;
  name: string;
  phone: string;
}): Promise<{ error?: string }> {
  await requireUserId();
  const phone = normalizePhone(data.phone);
  if (!data.label.trim() || !data.name.trim()) return { error: "Fill in all fields." };
  if (!phone) return { error: "That mobile number doesn't look right." };
  const last = await prisma.helpContact.findFirst({ orderBy: { sortOrder: "desc" } });
  await prisma.helpContact.create({
    data: {
      label: data.label.trim(),
      name: data.name.trim(),
      phone,
      sortOrder: (last?.sortOrder ?? 0) + 1,
    },
  });
  revalidatePath("/guest-app");
  return {};
}

export async function deleteHelpContactAction(id: string) {
  await requireUserId();
  await prisma.helpContact.delete({ where: { id } });
  revalidatePath("/guest-app");
}

/** Room assignment shown to the guest in their app. */
export async function updateStayAction(
  accountId: string,
  patch: { stayPlace?: string; stayRoom?: string; stayNote?: string },
) {
  await requireUserId();
  const clean = (v: string | undefined, max: number) =>
    v === undefined ? undefined : v.trim().slice(0, max) || null;
  await prisma.guestAccount.update({
    where: { id: accountId },
    data: {
      stayPlace: clean(patch.stayPlace, 120),
      stayRoom: clean(patch.stayRoom, 40),
      stayNote: clean(patch.stayNote, 300),
    },
  });
  revalidatePath("/stay");
}
