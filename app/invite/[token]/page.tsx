import { prisma } from "@/lib/prisma";
import { AcceptInviteForm } from "@/components/auth/AcceptInviteForm";

export default async function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await prisma.inviteToken.findUnique({ where: { token } });

  const isInvalid = !invite || !!invite.usedAt || invite.expiresAt < new Date();

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-white/60 p-8 shadow-sm">
        <h1 className="font-display text-3xl text-maroon">Shubh Vivah</h1>
        {isInvalid ? (
          <p className="mt-4 text-sm text-ink/70">
            This invite link is invalid or has expired. Ask whoever invited you to send a fresh
            link.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-ink/60">
              You&apos;ve been invited to the wedding workspace — set up your account below.
            </p>
            <div className="mt-6">
              <AcceptInviteForm token={token} prefillEmail={invite!.email} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
