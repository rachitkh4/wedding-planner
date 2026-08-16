"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { visibleToWhere } from "@/lib/visibility";
import type { Visibility } from "@/generated/prisma/enums";

const PATH = "/shopping";

async function requireUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

async function assertItemVisible(itemId: string, userId: string) {
  const item = await prisma.shoppingItem.findFirst({
    where: { AND: [{ id: itemId }, visibleToWhere(userId)] },
  });
  if (!item) throw new Error("Not found or not permitted");
  return item;
}

export async function createShoppingItemAction(data: { item: string; category: string }) {
  const userId = await requireUserId();
  await prisma.shoppingItem.create({
    data: { item: data.item, category: data.category || null, ownerId: userId },
  });
  revalidatePath(PATH);
}

export async function updateShoppingItemFieldAction(
  itemId: string,
  patch: Partial<{
    item: string;
    category: string;
    budgetEstimate: number | null;
    bought: boolean;
  }>,
) {
  const userId = await requireUserId();
  await assertItemVisible(itemId, userId);
  await prisma.shoppingItem.update({ where: { id: itemId }, data: patch });
  revalidatePath(PATH);
}

export async function deleteShoppingItemAction(itemId: string) {
  const userId = await requireUserId();
  await assertItemVisible(itemId, userId);
  await prisma.shoppingItem.delete({ where: { id: itemId } });
  revalidatePath(PATH);
}

export async function updateShoppingItemVisibilityAction(
  itemId: string,
  visibility: keyof typeof Visibility,
  sharedWithIds: string[],
) {
  const userId = await requireUserId();
  const item = await prisma.shoppingItem.findUnique({ where: { id: itemId } });
  if (!item || item.ownerId !== userId) throw new Error("Only the owner can change visibility");

  await prisma.shoppingItem.update({
    where: { id: itemId },
    data: { visibility, sharedWith: { set: sharedWithIds.map((id) => ({ id })) } },
  });
  revalidatePath(PATH);
}
