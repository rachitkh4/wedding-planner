import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/shared/Card";
import { EmptyState } from "@/components/shared/EmptyState";
import { StayRow } from "@/components/stay/StayRow";

export default async function StayPage() {
  const accounts = await prisma.guestAccount.findMany({
    include: { members: { orderBy: { sortOrder: "asc" } } },
    orderBy: { name: "asc" },
  });

  const rank = (a: { attending: boolean | null }) => (a.attending === true ? 0 : a.attending === null ? 1 : 2);
  const sorted = [...accounts].sort((a, b) => rank(a) - rank(b));
  const coming = accounts.filter((a) => a.attending === true);
  const assigned = coming.filter((a) => a.stayRoom || a.stayPlace).length;
  const people = coming.reduce((sum, a) => sum + (a.partySize ?? 1), 0);
  const hotels = [...new Set(accounts.map((a) => a.stayPlace).filter((p): p is string => !!p))];

  return (
    <div>
      <PageHeader
        title="Stay"
        subtitle="Replies from the app, and where each family is staying. Guests see their room under My Trip."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Coming" value={String(coming.length)} sub="families said yes" />
        <StatCard label="People" value={String(people)} sub="in those families" />
        <StatCard label="Room assigned" value={`${assigned}/${coming.length}`} sub="families coming" />
        <StatCard label="Waiting to reply" value={String(accounts.filter((a) => a.attending === null).length)} sub="registered, no RSVP" />
      </div>

      {accounts.length === 0 ? (
        <EmptyState title="Nobody has registered yet" hint="Share the guest app link from the Guest App page." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
                <th className="px-3 py-3">Guest</th>
                <th className="px-3 py-3">RSVP</th>
                <th className="px-3 py-3">Staying at</th>
                <th className="px-3 py-3">Room</th>
                <th className="px-3 py-3">Note</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((a) => (
                <StayRow
                  key={a.id}
                  hotels={hotels}
                  account={{
                    id: a.id,
                    name: a.name,
                    phone: a.phone,
                    attending: a.attending,
                    partySize: a.partySize,
                    members: a.members.map((m) => m.name),
                    stayPlace: a.stayPlace ?? "",
                    stayRoom: a.stayRoom ?? "",
                    stayNote: a.stayNote ?? "",
                  }}
                />
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
