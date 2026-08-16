"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

export async function createCategoryAction(name: string, estimatedAmount: number) {
  await requireUserId();
  const last = await prisma.budgetCategory.findFirst({ orderBy: { sortOrder: "desc" } });
  const category = await prisma.budgetCategory.create({
    data: { name, estimatedAmount, sortOrder: (last?.sortOrder ?? 0) + 1 },
  });
  revalidatePath("/budget");
  revalidatePath("/expenses");
  return category;
}

export async function updateCategoryAction(
  categoryId: string,
  patch: { name?: string; estimatedAmount?: number },
) {
  await requireUserId();
  await prisma.budgetCategory.update({ where: { id: categoryId }, data: patch });
  revalidatePath("/budget");
  revalidatePath("/expenses");
}

export async function deleteCategoryAction(categoryId: string) {
  await requireUserId();
  const expenseCount = await prisma.expense.count({ where: { categoryId } });
  if (expenseCount > 0) {
    throw new Error(
      `Can't delete a category with ${expenseCount} expense(s) logged against it. Move or delete those first.`,
    );
  }
  await prisma.budgetCategory.delete({ where: { id: categoryId } });
  revalidatePath("/budget");
  revalidatePath("/expenses");
}
