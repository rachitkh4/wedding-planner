"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireGuest } from "@/lib/guest-session";
import { getDict } from "@/lib/i18n";

const MAX_PER_GUEST = 3;

export type BlessingFormState = { error?: string } | undefined;

export async function submitBlessingAction(
  _prev: BlessingFormState,
  formData: FormData,
): Promise<BlessingFormState> {
  const [guest, { t }] = await Promise.all([requireGuest(), getDict()]);
  const text = String(formData.get("text") ?? "").trim().replace(/[ \t]+/g, " ");
  if (text.length < 2) return { error: t.blessings.errorShort };
  if (text.length > 300) return { error: t.blessings.errorLong };

  const mine = await prisma.blessing.count({ where: { accountId: guest.id } });
  if (mine >= MAX_PER_GUEST) return { error: t.blessings.errorLimit };

  await prisma.blessing.create({ data: { accountId: guest.id, authorName: guest.name, text } });
  revalidatePath("/g/blessings");
  revalidatePath("/guest-content");
  return undefined;
}

export async function deleteOwnBlessingAction(id: string) {
  const guest = await requireGuest();
  await prisma.blessing.deleteMany({ where: { id, accountId: guest.id } });
  revalidatePath("/g/blessings");
  revalidatePath("/guest-content");
}
