"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function updateWeddingMetaAction(data: {
  partner1Name?: string;
  partner2Name?: string;
  weddingDate?: string;
  city?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await prisma.weddingMeta.findFirst();
  const patch = {
    ...(data.partner1Name !== undefined && { partner1Name: data.partner1Name }),
    ...(data.partner2Name !== undefined && { partner2Name: data.partner2Name }),
    ...(data.weddingDate !== undefined && { weddingDate: new Date(data.weddingDate) }),
    ...(data.city !== undefined && { city: data.city }),
  };

  if (existing) {
    await prisma.weddingMeta.update({ where: { id: existing.id }, data: patch });
  } else {
    await prisma.weddingMeta.create({
      data: {
        partner1Name: data.partner1Name ?? "Partner 1",
        partner2Name: data.partner2Name ?? "Partner 2",
        weddingDate: data.weddingDate ? new Date(data.weddingDate) : new Date(),
        city: data.city,
      },
    });
  }
  revalidatePath("/dashboard");
}
