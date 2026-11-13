"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireGuest } from "@/lib/guest-session";
import { isAllowedPushEndpoint } from "@/lib/push";

const MAX_DEVICES = 5;

export async function savePushSubscriptionAction(subscription: {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
}): Promise<{ ok: boolean }> {
  const guest = await requireGuest();
  const { endpoint, keys } = subscription;
  if (!isAllowedPushEndpoint(endpoint) || !keys?.p256dh || !keys.auth) return { ok: false };
  if (keys.p256dh.length > 200 || keys.auth.length > 100) return { ok: false };

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    // The same browser may have been used by someone else before: always point it at the current guest.
    create: { accountId: guest.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
    update: { accountId: guest.id, p256dh: keys.p256dh, auth: keys.auth },
  });

  // Keep only the most recent devices per guest.
  const mine = await prisma.pushSubscription.findMany({
    where: { accountId: guest.id },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (mine.length > MAX_DEVICES) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: mine.slice(MAX_DEVICES).map((m) => m.id) } } });
  }
  revalidatePath("/announcements");
  return { ok: true };
}

export async function removePushSubscriptionAction(endpoint: string) {
  const guest = await requireGuest();
  await prisma.pushSubscription.deleteMany({ where: { endpoint, accountId: guest.id } });
  revalidatePath("/announcements");
}

/** Called when the guest opens the Updates list, to clear the unread dot. */
export async function markUpdatesSeenAction() {
  const guest = await requireGuest();
  await prisma.guestAccount.update({ where: { id: guest.id }, data: { updatesSeenAt: new Date() } });
  revalidatePath("/g", "layout");
}
