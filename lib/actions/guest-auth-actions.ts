"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { startGuestSession, endGuestSession, getGuest } from "@/lib/guest-session";
import { getDict, getLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export type GuestFormState = { error?: string } | undefined;

export async function registerGuestAction(
  _prev: GuestFormState,
  formData: FormData,
): Promise<GuestFormState> {
  const { t } = await getDict();
  const name = String(formData.get("name") ?? "").trim().replace(/\s+/g, " ");
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const pin = String(formData.get("pin") ?? "");
  const confirmPin = String(formData.get("confirmPin") ?? "");

  if (name.length < 2 || name.length > 80) return { error: t.errors.name };
  if (!phone) return { error: t.errors.phone };
  if (!/^\d{4}$/.test(pin)) return { error: t.errors.pin };
  if (pin !== confirmPin) return { error: t.errors.pinMismatch };

  const existing = await prisma.guestAccount.findUnique({ where: { phone } });
  if (existing) return { error: t.errors.exists };

  // Auto-link to the planner's Guest List when the couple already saved this number.
  const match = await prisma.guest.findUnique({ where: { phone }, select: { id: true } });

  const account = await prisma.guestAccount.create({
    data: {
      name,
      phone,
      pinHash: await bcrypt.hash(pin, 10),
      guestId: match?.id ?? null,
      locale: await getLocale(), // notifications arrive in the language they were reading
    },
  });
  await startGuestSession(account);
  redirect("/g/home");
}

export async function loginGuestAction(
  _prev: GuestFormState,
  formData: FormData,
): Promise<GuestFormState> {
  const { t } = await getDict();
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const pin = String(formData.get("pin") ?? "");
  if (!phone) return { error: t.errors.phone };
  if (!/^\d{4}$/.test(pin)) return { error: t.errors.pin };

  const account = await prisma.guestAccount.findUnique({ where: { phone } });
  if (!account) return { error: t.errors.wrong };
  if (account.lockedUntil && account.lockedUntil > new Date()) return { error: t.errors.locked };

  if (!(await bcrypt.compare(pin, account.pinHash))) {
    const failedAttempts = account.failedAttempts + 1;
    const lock = failedAttempts >= MAX_ATTEMPTS;
    await prisma.guestAccount.update({
      where: { id: account.id },
      data: {
        failedAttempts: lock ? 0 : failedAttempts,
        lockedUntil: lock ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
      },
    });
    return { error: lock ? t.errors.locked : t.errors.wrong };
  }

  await prisma.guestAccount.update({
    where: { id: account.id },
    data: { failedAttempts: 0, lockedUntil: null, lastSeenAt: new Date() },
  });
  await startGuestSession(account);
  redirect("/g/home");
}

export async function logoutGuestAction() {
  await endGuestSession();
  redirect("/g");
}

export async function setLocaleAction(locale: Locale) {
  const value = locale === "hi" ? "hi" : "en";
  const guest = await getGuest();
  if (guest) await prisma.guestAccount.update({ where: { id: guest.id }, data: { locale: value } });
  (await cookies()).set(LOCALE_COOKIE, value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
