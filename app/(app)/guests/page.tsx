import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { visibleToWhere } from "@/lib/visibility";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/shared/Card";
import { EmptyState } from "@/components/shared/EmptyState";
import { GuestRow } from "@/components/guests/GuestRow";
import { AddGuestForm } from "@/components/guests/AddGuestForm";

export default async function GuestsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [events, members, guests] = await Promise.all([
    prisma.eventItem.findMany({ orderBy: [{ sortOrder: "asc" }, { date: "asc" }] }),
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.guest.findMany({
      where: visibleToWhere(userId),
      orderBy: { name: "asc" },
      include: { sharedWith: { select: { id: true } }, invitedEvents: { select: { id: true } } },
    }),
  ]);

  const totalHeadcount = guests.reduce((sum, g) => sum + g.headcount, 0);
  const confirmedHeadcount = guests
    .filter((g) => g.rsvpStatus === "CONFIRMED")
    .reduce((sum, g) => sum + g.headcount, 0);

  return (
    <div>
      <PageHeader title="Guests" subtitle="Who's coming, and to which events." />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Confirmed" value={`${confirmedHeadcount}/${totalHeadcount}`} sub="headcount" />
        <StatCard label="Families" value={String(guests.length)} sub="entries" />
      </div>

      <div className="mb-5">
        <AddGuestForm />
      </div>

      {guests.length === 0 ? (
        <EmptyState title="No guests yet" hint="Add your first guest or family above." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Side</th>
                <th className="px-3 py-3">Headcount</th>
                {events.map((event) => (
                  <th key={event.id} className="px-2 py-3 text-center">
                    {event.name}
                  </th>
                ))}
                <th className="px-3 py-3">RSVP</th>
                <th className="px-3 py-3"></th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <GuestRow
                  key={guest.id}
                  guest={guest}
                  events={events}
                  members={members}
                  currentUserId={userId}
                />
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
