"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signIn, signOut, auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function loginAction(_prevState: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
    return undefined;
  } catch (error) {
    if (error instanceof AuthError) {
      return "Invalid email or password.";
    }
    throw error;
  }
}

export async function acceptInviteAction(
  token: string,
  _prevState: string | undefined,
  formData: FormData,
) {
  const email = (formData.get("email") as string | null)?.toLowerCase().trim();
  const displayName = (formData.get("displayName") as string | null)?.trim();
  const password = formData.get("password") as string | null;
  const confirmPassword = formData.get("confirmPassword") as string | null;

  if (!email || !displayName || !password) {
    return "All fields are required.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  const invite = await prisma.inviteToken.findUnique({ where: { token } });
  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    return "This invite link is invalid or has expired.";
  }
  if (invite.email && invite.email.toLowerCase() !== email) {
    return `This invite was created for ${invite.email}.`;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return "An account with that email already exists — try logging in instead.";
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.create({ data: { email, displayName, passwordHash } }),
    prisma.inviteToken.update({ where: { token }, data: { usedAt: new Date() } }),
  ]);

  await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  return undefined;
}

export async function setDisplayNameAction(_prevState: string | undefined, formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const displayName = (formData.get("displayName") as string | null)?.trim();
  if (!displayName) return "Please enter a name.";

  await prisma.user.update({
    where: { id: session.user.id },
    data: { displayName },
  });
  redirect("/dashboard");
}

export async function createInviteAction() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const invite = await prisma.inviteToken.create({
    data: { expiresAt, createdById: session.user.id },
  });
  revalidatePath("/invite-manage");
  return invite.token;
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
