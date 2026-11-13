import { prisma } from "@/lib/prisma";
import { getSchedulerStatus } from "@/lib/scheduler";
import { formatIstDate, formatIstTime } from "@/lib/time";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/shared/Card";
import { EmptyState } from "@/components/shared/EmptyState";
import { AnnouncementForm } from "@/components/announcements/AnnouncementForm";
import { AnnouncementRow } from "@/components/announcements/AnnouncementRow";
import { AutoRemindersToggle } from "@/components/announcements/AutoRemindersToggle";

export default async function AnnouncementsPage() {
  const [meta, items, devices, accounts, scheduler] = await Promise.all([
    prisma.weddingMeta.findFirst({ select: { autoReminders: true } }),
    prisma.announcement.findMany({ orderBy: { sendAt: "desc" }, take: 100 }),
    prisma.pushSubscription.findMany({ select: { accountId: true } }),
    prisma.guestAccount.count(),
    getSchedulerStatus(),
  ]);

  const upcoming = items.filter((a) => !a.sentAt).sort((a, b) => a.sendAt.getTime() - b.sendAt.getTime());
  const sent = items.filter((a) => a.sentAt);
  const reachable = new Set(devices.map((d) => d.accountId)).size;
  const when = (d: Date) => `${formatIstDate(d, "en")} · ${formatIstTime(d, "en")}`;
  const toRow = (a: (typeof items)[number]) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    auto: !!a.reminderKey,
    when: when(a.sentAt ?? a.sendAt),
    sent: !!a.sentAt,
    sentCount: a.sentCount,
    failedCount: a.failedCount,
  });

  const schedulerText = {
    "not-configured": "Not set up (CRON_SECRET is missing)",
    "never-ran": "Waiting for the first run",
    running: `Running · last ran ${scheduler.minutesAgo === 0 ? "just now" : `${scheduler.minutesAgo} min ago`}`,
    stalled: `Not running · last ran ${scheduler.minutesAgo} min ago`,
  }[scheduler.state];

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Send updates to every guest's phone, and see the reminders that go out automatically."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Phones reachable" value={`${reachable}/${accounts}`} sub="guests with reminders on" />
        <StatCard label="Scheduled" value={String(upcoming.length)} sub="waiting to go out" />
        <StatCard label="Sent" value={String(sent.length)} sub="shown in guests' Updates" />
        <StatCard
          label="Scheduler"
          value={scheduler.state === "running" ? "On" : "Off"}
          sub={schedulerText}
        />
      </div>

      {(!scheduler.pushConfigured || scheduler.state !== "running") && (
        <Card className="mb-6 border-marigold/50 bg-marigold/10">
          <h2 className="font-display text-lg text-ink">Finish setting up notifications</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/75">
            {!scheduler.pushConfigured && (
              <li>
                Add <code>VAPID_PUBLIC_KEY</code> and <code>VAPID_PRIVATE_KEY</code> to your environment variables,
                otherwise phones can&apos;t be notified (messages still appear in the app&apos;s Updates).
              </li>
            )}
            {scheduler.state === "not-configured" && (
              <li>
                Add <code>CRON_SECRET</code> to your environment variables.
              </li>
            )}
            {(scheduler.state === "never-ran" || scheduler.state === "stalled") && (
              <li>
                Make sure the 5-minute scheduler on cron-job.org is calling <code>/api/cron/notify</code>. Scheduled
                messages and automatic reminders only go out when it runs. Steps are in the README.
              </li>
            )}
          </ul>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="font-display text-lg text-ink">New announcement</h2>
          <div className="mt-3">
            <AnnouncementForm canPush={scheduler.pushConfigured} />
          </div>
        </Card>
        <Card>
          <h2 className="font-display text-lg text-ink">Automatic reminders</h2>
          <div className="mt-3">
            <AutoRemindersToggle initial={meta?.autoReminders ?? true} />
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="mb-2 font-display text-lg text-ink">Scheduled ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <EmptyState title="Nothing scheduled" hint="Add a start time to your events, and reminders appear here automatically." />
        ) : (
          <Card className="p-0">
            <ul>{upcoming.map((a) => <AnnouncementRow key={a.id} item={toRow(a)} />)}</ul>
          </Card>
        )}
      </div>

      <div className="mt-6">
        <h2 className="mb-2 font-display text-lg text-ink">Sent ({sent.length})</h2>
        {sent.length === 0 ? (
          <EmptyState title="Nothing sent yet" />
        ) : (
          <Card className="p-0">
            <ul>{sent.map((a) => <AnnouncementRow key={a.id} item={toRow(a)} />)}</ul>
          </Card>
        )}
      </div>
    </div>
  );
}
