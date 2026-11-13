"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { detectImageType, MAX_IMAGE_BYTES } from "@/lib/images";

async function requireUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

export async function uploadImageAction(formData: FormData): Promise<{ id?: string; error?: string }> {
  await requireUserId();
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Choose a photo first." };
  if (file.size > MAX_IMAGE_BYTES) return { error: "That photo is too large." };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentType = detectImageType(bytes);
  if (!contentType) return { error: "Please choose a JPEG, PNG or WebP photo." };

  const image = await prisma.siteImage.create({ data: { data: bytes, contentType } });
  return { id: image.id };
}

/** Removes a photo that nothing uses any more. */
export async function deleteImageQuietly(id: string | null | undefined) {
  if (!id) return;
  await prisma.siteImage.deleteMany({ where: { id } });
}
