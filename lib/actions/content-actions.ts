"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteImageQuietly } from "@/lib/actions/image-actions";

async function requireUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

const clean = (v: string | null | undefined, max: number) => {
  const t = (v ?? "").trim().slice(0, max);
  return t || null;
};

function refresh() {
  revalidatePath("/guest-content");
  revalidatePath("/g", "layout");
}

/* ---------- wording ---------- */

export async function updateWordingAction(data: {
  hashtag: string;
  invitationText: string;
  invitationTextHi: string;
}) {
  await requireUserId();
  const meta = await prisma.weddingMeta.findFirst({ select: { id: true } });
  if (!meta) return;
  // A hashtag is shown as typed, but always with a single leading #.
  const tag = clean(data.hashtag, 40)?.replace(/\s+/g, "").replace(/^#+/, "");
  await prisma.weddingMeta.update({
    where: { id: meta.id },
    data: {
      hashtag: tag ? `#${tag}` : null,
      invitationText: clean(data.invitationText, 400),
      invitationTextHi: clean(data.invitationTextHi, 400),
    },
  });
  refresh();
}

/* ---------- our story ---------- */

type StoryInput = {
  title: string;
  titleHi?: string | null;
  body: string;
  bodyHi?: string | null;
  imageId?: string | null;
};

export async function createStoryChapterAction(data: StoryInput): Promise<{ error?: string }> {
  await requireUserId();
  const title = clean(data.title, 120);
  const body = clean(data.body, 2000);
  if (!title || !body) return { error: "Please write a title and the story." };
  const last = await prisma.storyChapter.findFirst({ orderBy: { sortOrder: "desc" } });
  await prisma.storyChapter.create({
    data: {
      title,
      body,
      titleHi: clean(data.titleHi, 120),
      bodyHi: clean(data.bodyHi, 2000),
      imageId: data.imageId ?? null,
      sortOrder: (last?.sortOrder ?? 0) + 1,
    },
  });
  refresh();
  return {};
}

export async function updateStoryChapterAction(id: string, patch: Partial<StoryInput>) {
  await requireUserId();
  const existing = await prisma.storyChapter.findUnique({ where: { id } });
  if (!existing) return;
  await prisma.storyChapter.update({
    where: { id },
    data: {
      ...(patch.title !== undefined && { title: clean(patch.title, 120) ?? existing.title }),
      ...(patch.body !== undefined && { body: clean(patch.body, 2000) ?? existing.body }),
      ...(patch.titleHi !== undefined && { titleHi: clean(patch.titleHi, 120) }),
      ...(patch.bodyHi !== undefined && { bodyHi: clean(patch.bodyHi, 2000) }),
      ...(patch.imageId !== undefined && { imageId: patch.imageId }),
    },
  });
  if (patch.imageId !== undefined && existing.imageId && existing.imageId !== patch.imageId) {
    await deleteImageQuietly(existing.imageId);
  }
  refresh();
}

export async function moveStoryChapterAction(id: string, direction: "up" | "down") {
  await requireUserId();
  const all = await prisma.storyChapter.findMany({ orderBy: { sortOrder: "asc" } });
  await swapNeighbour(all, id, direction, (rowId, sortOrder) =>
    prisma.storyChapter.update({ where: { id: rowId }, data: { sortOrder } }),
  );
  refresh();
}

export async function deleteStoryChapterAction(id: string) {
  await requireUserId();
  const existing = await prisma.storyChapter.findUnique({ where: { id } });
  if (!existing) return;
  await prisma.storyChapter.delete({ where: { id } });
  await deleteImageQuietly(existing.imageId);
  refresh();
}

/* ---------- families ---------- */

type FamilyInput = {
  side: "BRIDE" | "GROOM";
  name: string;
  nameHi?: string | null;
  relation: string;
  relationHi?: string | null;
  imageId?: string | null;
};

export async function createFamilyMemberAction(data: FamilyInput): Promise<{ error?: string }> {
  await requireUserId();
  const name = clean(data.name, 80);
  const relation = clean(data.relation, 80);
  if (!name || !relation) return { error: "Please write a name and how they're related." };
  if (data.side !== "BRIDE" && data.side !== "GROOM") return { error: "Choose a side." };
  const last = await prisma.familyMember.findFirst({ where: { side: data.side }, orderBy: { sortOrder: "desc" } });
  await prisma.familyMember.create({
    data: {
      side: data.side,
      name,
      relation,
      nameHi: clean(data.nameHi, 80),
      relationHi: clean(data.relationHi, 80),
      imageId: data.imageId ?? null,
      sortOrder: (last?.sortOrder ?? 0) + 1,
    },
  });
  refresh();
  return {};
}

export async function updateFamilyMemberAction(id: string, patch: Partial<Omit<FamilyInput, "side">>) {
  await requireUserId();
  const existing = await prisma.familyMember.findUnique({ where: { id } });
  if (!existing) return;
  await prisma.familyMember.update({
    where: { id },
    data: {
      ...(patch.name !== undefined && { name: clean(patch.name, 80) ?? existing.name }),
      ...(patch.relation !== undefined && { relation: clean(patch.relation, 80) ?? existing.relation }),
      ...(patch.nameHi !== undefined && { nameHi: clean(patch.nameHi, 80) }),
      ...(patch.relationHi !== undefined && { relationHi: clean(patch.relationHi, 80) }),
      ...(patch.imageId !== undefined && { imageId: patch.imageId }),
    },
  });
  if (patch.imageId !== undefined && existing.imageId && existing.imageId !== patch.imageId) {
    await deleteImageQuietly(existing.imageId);
  }
  refresh();
}

export async function moveFamilyMemberAction(id: string, direction: "up" | "down") {
  await requireUserId();
  const member = await prisma.familyMember.findUnique({ where: { id } });
  if (!member) return;
  const all = await prisma.familyMember.findMany({ where: { side: member.side }, orderBy: { sortOrder: "asc" } });
  await swapNeighbour(all, id, direction, (rowId, sortOrder) =>
    prisma.familyMember.update({ where: { id: rowId }, data: { sortOrder } }),
  );
  refresh();
}

export async function deleteFamilyMemberAction(id: string) {
  await requireUserId();
  const existing = await prisma.familyMember.findUnique({ where: { id } });
  if (!existing) return;
  await prisma.familyMember.delete({ where: { id } });
  await deleteImageQuietly(existing.imageId);
  refresh();
}

/* ---------- blessings (moderation) ---------- */

export async function setBlessingHiddenAction(id: string, hidden: boolean) {
  await requireUserId();
  await prisma.blessing.update({ where: { id }, data: { hidden } });
  refresh();
}

export async function deleteBlessingAction(id: string) {
  await requireUserId();
  await prisma.blessing.deleteMany({ where: { id } });
  refresh();
}

/** Swap a row's position with the one above or below it. */
async function swapNeighbour<T extends { id: string; sortOrder: number }>(
  rows: T[],
  id: string,
  direction: "up" | "down",
  save: (id: string, sortOrder: number) => Promise<unknown>,
) {
  const index = rows.findIndex((r) => r.id === id);
  const other = rows[direction === "up" ? index - 1 : index + 1];
  if (index < 0 || !other) return;
  // Re-number the whole list so equal sortOrders can never leave a swap stuck.
  const reordered = [...rows];
  [reordered[index], reordered[direction === "up" ? index - 1 : index + 1]] = [other, rows[index]];
  await Promise.all(reordered.map((r, i) => save(r.id, i + 1)));
}
