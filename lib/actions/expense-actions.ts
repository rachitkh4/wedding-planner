"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { visibleToWhere } from "@/lib/visibility";
import type { PaymentMethod, Visibility } from "@/generated/prisma/enums";

const PATH = "/expenses";

async function requireUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

async function assertExpenseVisible(expenseId: string, userId: string) {
  const expense = await prisma.expense.findFirst({
    where: { AND: [{ id: expenseId }, visibleToWhere(userId)] },
  });
  if (!expense) throw new Error("Not found or not permitted");
  return expense;
}

export async function createExpenseAction(data: {
  categoryId: string;
  date: string;
  description: string;
  amount: number;
  paidBy: string;
  paymentMethod: keyof typeof PaymentMethod;
}) {
  const userId = await requireUserId();
  await prisma.expense.create({
    data: {
      categoryId: data.categoryId,
      date: new Date(data.date),
      description: data.description,
      amount: data.amount,
      paidBy: data.paidBy,
      paymentMethod: data.paymentMethod,
      ownerId: userId,
    },
  });
  revalidatePath(PATH);
  revalidatePath("/budget");
  revalidatePath("/dashboard");
}

export async function updateExpenseFieldAction(
  expenseId: string,
  patch: Partial<{
    categoryId: string;
    date: string;
    description: string;
    amount: number;
    paidBy: string;
    paymentMethod: keyof typeof PaymentMethod;
  }>,
) {
  const userId = await requireUserId();
  await assertExpenseVisible(expenseId, userId);
  await prisma.expense.update({
    where: { id: expenseId },
    data: {
      ...patch,
      ...(patch.date !== undefined && { date: new Date(patch.date) }),
    },
  });
  revalidatePath(PATH);
  revalidatePath("/budget");
  revalidatePath("/dashboard");
}

export async function deleteExpenseAction(expenseId: string) {
  const userId = await requireUserId();
  await assertExpenseVisible(expenseId, userId);
  await prisma.expense.delete({ where: { id: expenseId } });
  revalidatePath(PATH);
  revalidatePath("/budget");
  revalidatePath("/dashboard");
}

export async function updateExpenseVisibilityAction(
  expenseId: string,
  visibility: keyof typeof Visibility,
  sharedWithIds: string[],
) {
  const userId = await requireUserId();
  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense || expense.ownerId !== userId) {
    throw new Error("Only the owner can change visibility");
  }
  await prisma.expense.update({
    where: { id: expenseId },
    data: { visibility, sharedWith: { set: sharedWithIds.map((id) => ({ id })) } },
  });
  revalidatePath(PATH);
  revalidatePath("/budget");
  revalidatePath("/dashboard");
}
