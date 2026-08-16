"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { visibleToWhere } from "@/lib/visibility";
import type { Visibility } from "@/generated/prisma/enums";

const PATH = "/checklist";

async function requireUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

export async function createPhaseAction(name: string) {
  await requireUserId();
  const last = await prisma.checklistPhase.findFirst({ orderBy: { sortOrder: "desc" } });
  await prisma.checklistPhase.create({
    data: { name, sortOrder: (last?.sortOrder ?? 0) + 1 },
  });
  revalidatePath(PATH);
}

export async function renamePhaseAction(phaseId: string, name: string) {
  await requireUserId();
  await prisma.checklistPhase.update({ where: { id: phaseId }, data: { name } });
  revalidatePath(PATH);
}

export async function deletePhaseAction(phaseId: string) {
  await requireUserId();
  await prisma.checklistPhase.delete({ where: { id: phaseId } });
  revalidatePath(PATH);
}

export async function createTaskAction(phaseId: string, text: string) {
  const userId = await requireUserId();
  const last = await prisma.checklistTask.findFirst({
    where: { phaseId },
    orderBy: { sortOrder: "desc" },
  });
  await prisma.checklistTask.create({
    data: { phaseId, text, ownerId: userId, sortOrder: (last?.sortOrder ?? 0) + 1 },
  });
  revalidatePath(PATH);
}

async function assertTaskVisible(taskId: string, userId: string) {
  const task = await prisma.checklistTask.findFirst({
    where: { AND: [{ id: taskId }, visibleToWhere(userId)] },
  });
  if (!task) throw new Error("Not found or not permitted");
  return task;
}

export async function updateTaskTextAction(taskId: string, text: string) {
  const userId = await requireUserId();
  await assertTaskVisible(taskId, userId);
  await prisma.checklistTask.update({ where: { id: taskId }, data: { text } });
  revalidatePath(PATH);
}

export async function toggleTaskDoneAction(taskId: string, done: boolean) {
  const userId = await requireUserId();
  await assertTaskVisible(taskId, userId);
  await prisma.checklistTask.update({ where: { id: taskId }, data: { done } });
  revalidatePath(PATH);
}

export async function updateTaskAssigneeAction(taskId: string, assignedTo: string) {
  const userId = await requireUserId();
  await assertTaskVisible(taskId, userId);
  await prisma.checklistTask.update({
    where: { id: taskId },
    data: { assignedTo: assignedTo || null },
  });
  revalidatePath(PATH);
}

export async function deleteTaskAction(taskId: string) {
  const userId = await requireUserId();
  await assertTaskVisible(taskId, userId);
  await prisma.checklistTask.delete({ where: { id: taskId } });
  revalidatePath(PATH);
}

export async function updateTaskVisibilityAction(
  taskId: string,
  visibility: keyof typeof Visibility,
  sharedWithIds: string[],
) {
  const userId = await requireUserId();
  const task = await prisma.checklistTask.findUnique({ where: { id: taskId } });
  if (!task || task.ownerId !== userId) throw new Error("Only the owner can change visibility");

  await prisma.checklistTask.update({
    where: { id: taskId },
    data: {
      visibility,
      sharedWith: { set: sharedWithIds.map((id) => ({ id })) },
    },
  });
  revalidatePath(PATH);
}
