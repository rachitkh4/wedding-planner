import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardStats } from "@/lib/dashboard-stats";
import { formatINR, toDateInputValue } from "@/lib/format";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/shared/Card";
import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import { TimelineStrip } from "@/components/dashboard/TimelineStrip";
import { MetaEditor } from "@/components/dashboard/MetaEditor";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [meta, events, stats] = await Promise.all([
    prisma.weddingMeta.findFirst(),
    prisma.eventItem.findMany({ orderBy: [{ sortOrder: "asc" }, { date: "asc" }] }),
    getDashboardStats(userId),
  ]);

  const metaValues = {
    partner1Name: meta?.partner1Name ?? "",
    partner2Name: meta?.partner2Name ?? "",
    weddingDate: meta ? toDateInputValue(meta.weddingDate) : toDateInputValue(new Date()),
    city: meta?.city ?? "",
  };

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your wedding planning, at a glance." />

      <Card className="mb-6">
        <MetaEditor initial={metaValues} canEdit={session!.user.role === "COUPLE"} />
        {meta && (
          <div className="mt-5 border-t border-ink/10 pt-5">
            <CountdownTimer weddingDate={meta.weddingDate.toISOString()} />
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Checklist"
          value={`${stats.tasks.done}/${stats.tasks.total}`}
          sub="tasks completed"
        />
        <StatCard
          label="Budget"
          value={formatINR(stats.budget.spent)}
          sub={`of ${formatINR(stats.budget.planned)} planned`}
        />
        <StatCard
          label="Guests"
          value={`${stats.guests.confirmed}/${stats.guests.total}`}
          sub="confirmed"
        />
        <StatCard
          label="Vendors"
          value={`${stats.vendors.booked}/${stats.vendors.total}`}
          sub="booked"
        />
      </div>

      {events.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 font-display text-lg text-ink">Wedding timeline</h2>
          <Card>
            <TimelineStrip events={events} />
          </Card>
        </div>
      )}
    </div>
  );
}
