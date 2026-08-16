import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/shared/Card";
import { EmptyState } from "@/components/shared/EmptyState";
import { CreateInviteButton } from "@/components/invite/CreateInviteButton";
import { formatDate } from "@/lib/format";

export default async function InviteManagePage() {
  const session = await auth();
  const [members, invites] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.inviteToken.findMany({
      orderBy: { createdAt: "desc" },
      include: { createdBy: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Invite"
        subtitle="Bring your fiancée and family into the wedding workspace."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="font-display text-lg text-ink">New invite link</h2>
          <div className="mt-3">
            <CreateInviteButton canInviteAsCouple={session!.user.role === "COUPLE"} />
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg text-ink">Members ({members.length})</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between text-sm">
                <span className="text-ink/80">{m.displayName ?? "(name pending)"}</span>
                <span className="flex items-center gap-2">
                  <span className="text-ink/40">{m.email}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      m.role === "COUPLE" ? "bg-maroon/10 text-maroon" : "bg-ink/8 text-ink/50"
                    }`}
                  >
                    {m.role === "COUPLE" ? "Couple" : "Family"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 font-display text-lg text-ink">Invite history</h2>
        {invites.length === 0 ? (
          <EmptyState title="No invites sent yet" hint="Create one above to get started." />
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
                  <th className="px-4 py-3">Created by</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((inv) => {
                  const status = inv.usedAt
                    ? "Accepted"
                    : inv.expiresAt < new Date()
                      ? "Expired"
                      : "Pending";
                  return (
                    <tr key={inv.id} className="border-b border-ink/5 last:border-0">
                      <td className="px-4 py-3 text-ink/80">
                        {inv.createdBy.displayName ?? inv.createdBy.email}
                      </td>
                      <td className="px-4 py-3 text-ink/60">{formatDate(inv.createdAt)}</td>
                      <td className="px-4 py-3 text-ink/60">{formatDate(inv.expiresAt)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            status === "Accepted"
                              ? "bg-mehendi/15 text-mehendi"
                              : status === "Expired"
                                ? "bg-ink/10 text-ink/50"
                                : "bg-marigold/20 text-marigold"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
