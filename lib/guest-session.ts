import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

/**
 * Guest-app sessions. Deliberately NOT NextAuth: planner server actions treat
 * any NextAuth session as a trusted family member, so guests get their own
 * signed cookie that planner code never looks at.
 */
const COOKIE = "guest_session";
const MAX_AGE = 60 * 60 * 24 * 180; // ~6 months: stays logged in through the wedding

function key() {
  const secret = process.env.GUEST_SESSION_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("Set NEXTAUTH_SECRET (or GUEST_SESSION_SECRET).");
  return new TextEncoder().encode(`guest-session:${secret}`);
}

export async function startGuestSession(account: { id: string; sessionVersion: number }) {
  const token = await new SignJWT({ v: account.sessionVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(account.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endGuestSession() {
  (await cookies()).delete(COOKIE);
}

/** The signed-in guest account, or null. Old devices are rejected after a PIN reset. */
export async function getGuest() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    if (!payload.sub) return null;
    const account = await prisma.guestAccount.findUnique({ where: { id: payload.sub } });
    if (!account || account.sessionVersion !== payload.v) return null;
    return account;
  } catch {
    return null;
  }
}

export async function requireGuest() {
  const guest = await getGuest();
  if (!guest) redirect("/g/login");
  return guest;
}

/** Cheap "last seen" (at most hourly) so the couple can see who has opened the app. */
export async function touchLastSeen(guest: { id: string; lastSeenAt: Date | null }) {
  if (guest.lastSeenAt && Date.now() - guest.lastSeenAt.getTime() < 60 * 60 * 1000) return;
  await prisma.guestAccount.update({ where: { id: guest.id }, data: { lastSeenAt: new Date() } });
}
