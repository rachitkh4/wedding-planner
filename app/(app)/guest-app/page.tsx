import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { visibleToWhere } from "@/lib/visibility";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/shared/Card";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ShareLinkCard } from "@/components/guest-app/ShareLinkCard";
import { HelpContactsEditor } from "@/components/guest-app/HelpContactsEditor";
import { RegistrationRow } from "@/components/guest-app/RegistrationRow";

export default async function GuestAppPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [meta, accounts, guests, helpContacts, hiddenEvents] = await Promise.all([
    prisma.weddingMeta.findFirst(),
    prisma.guestAccount.findMany({ orderBy: [{ guestId: { sort: "asc", nulls: "first" } }, { createdAt: "desc" }] }),
    prisma.guest.findMany({ where: visibleToWhere(userId), orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.helpContact.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.eventItem.count({ where: { showToGuests: false } }),
  ]);

  const unlinked = accounts.filter((a) => !a.guestId).length;
  const couple = meta ? `${meta.partner1Name} & ${meta.partner2Name}` : "our wedding";

  return (
    <div>
      <PageHeader
        title="Guest App"
        subtitle="The invitation and wedding companion your guests open from one link."
        action={
          <Link
            href="/g"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-maroon/20 bg-white px-3 py-2 text-sm font-medium text-maroon hover:bg-maroon/5"
          >
            <ExternalLink size={15} /> Preview as a guest
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Registered" value={String(accounts.length)} sub="guests using the app" />
        <StatCard label="Need review" value={String(unlinked)} sub="not matched to guest list" />
        <StatCard label="Hidden events" value={String(hiddenEvents)} sub="not shown to guests" />
        <StatCard label="Help contacts" value={String(helpContacts.length)} sub="shown on Help tab" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="font-display text-lg text-ink">Share with guests</h2>
          <div className="mt-3">
            <ShareLinkCard couple={couple} />
          </div>
        </Card>
        <Card>
          <h2 className="font-display text-lg text-ink">Help contacts</h2>
          <p className="mt-1 text-xs text-ink/50">
            Guests see these on the Help tab with one-tap Call and WhatsApp buttons, and on the login
            page if they forget their PIN.
          </p>
          <div className="mt-3">
            <HelpContactsEditor contacts={helpContacts} />
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="mb-1 font-display text-lg text-ink">Registrations ({accounts.length})</h2>
        <p className="mb-3 text-xs text-ink/50">
          Guests whose mobile number is in your Guest List are matched automatically. Link the rest to an
          existing guest, add them as a new guest, or remove them.
        </p>
        {accounts.length === 0 ? (
          <EmptyState title="Nobody has registered yet" hint="Share the link above to get started." />
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
                  <th className="px-3 py-3">Guest</th>
                  <th className="px-3 py-3">Guest list entry</th>
                  <th className="px-3 py-3">Joined</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <RegistrationRow
                    key={a.id}
                    guests={guests}
                    account={{
                      id: a.id,
                      name: a.name,
                      phone: a.phone,
                      guestId: a.guestId,
                      createdAt: formatDate(a.createdAt),
                      lastSeen: a.lastSeenAt ? formatDate(a.lastSeenAt) : null,
                    }}
                  />
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
