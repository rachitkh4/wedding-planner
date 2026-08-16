"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { visibleToWhere } from "@/lib/visibility";
import type { VendorStatus, Visibility } from "@/generated/prisma/enums";

const PATH = "/vendors";

async function requireUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

async function assertVendorVisible(vendorId: string, userId: string) {
  const vendor = await prisma.vendor.findFirst({
    where: { AND: [{ id: vendorId }, visibleToWhere(userId)] },
  });
  if (!vendor) throw new Error("Not found or not permitted");
  return vendor;
}

export async function createVendorAction(data: { category: string; name: string }) {
  const userId = await requireUserId();
  await prisma.vendor.create({
    data: { category: data.category, name: data.name, ownerId: userId },
  });
  revalidatePath(PATH);
  revalidatePath("/dashboard");
}

export async function updateVendorFieldAction(
  vendorId: string,
  patch: Partial<{
    category: string;
    name: string;
    contact: string;
    quotedCost: number | null;
    advancePaid: number;
    status: keyof typeof VendorStatus;
  }>,
) {
  const userId = await requireUserId();
  await assertVendorVisible(vendorId, userId);
  await prisma.vendor.update({ where: { id: vendorId }, data: patch });
  revalidatePath(PATH);
  revalidatePath("/dashboard");
}

export async function deleteVendorAction(vendorId: string) {
  const userId = await requireUserId();
  await assertVendorVisible(vendorId, userId);
  await prisma.vendor.delete({ where: { id: vendorId } });
  revalidatePath(PATH);
  revalidatePath("/dashboard");
}

export async function updateVendorVisibilityAction(
  vendorId: string,
  visibility: keyof typeof Visibility,
  sharedWithIds: string[],
) {
  const userId = await requireUserId();
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor || vendor.ownerId !== userId) {
    throw new Error("Only the owner can change visibility");
  }
  await prisma.vendor.update({
    where: { id: vendorId },
    data: { visibility, sharedWith: { set: sharedWithIds.map((id) => ({ id })) } },
  });
  revalidatePath(PATH);
}
