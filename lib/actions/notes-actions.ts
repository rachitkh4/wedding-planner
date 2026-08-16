"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const PATH = "/notes";

async function requireUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

async function assertOwnNote(noteId: string, userId: string) {
  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note || note.userId !== userId) throw new Error("Not found or not permitted");
  return note;
}

export async function createNoteAction(text: string) {
  const userId = await requireUserId();
  await prisma.note.create({ data: { userId, text } });
  revalidatePath(PATH);
}

export async function updateNoteTextAction(noteId: string, text: string) {
  const userId = await requireUserId();
  await assertOwnNote(noteId, userId);
  await prisma.note.update({ where: { id: noteId }, data: { text } });
  revalidatePath(PATH);
}

export async function toggleNoteAction(noteId: string, done: boolean) {
  const userId = await requireUserId();
  await assertOwnNote(noteId, userId);
  await prisma.note.update({ where: { id: noteId }, data: { done } });
  revalidatePath(PATH);
}

export async function deleteNoteAction(noteId: string) {
  const userId = await requireUserId();
  await assertOwnNote(noteId, userId);
  await prisma.note.delete({ where: { id: noteId } });
  revalidatePath(PATH);
}
