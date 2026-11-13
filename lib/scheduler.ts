import { prisma } from "@/lib/prisma";
import { pushConfigured } from "@/lib/push";

export type SchedulerState = "not-configured" | "never-ran" | "running" | "stalled";

/** Is the external scheduler (cron-job.org) actually calling /api/cron/notify? */
export async function getSchedulerStatus() {
  const heartbeat = await prisma.jobHeartbeat.findUnique({ where: { name: "notify" } });
  const minutesAgo = heartbeat ? Math.round((Date.now() - heartbeat.lastRunAt.getTime()) / 60_000) : null;
  const state: SchedulerState = !process.env.CRON_SECRET
    ? "not-configured"
    : !heartbeat
      ? "never-ran"
      : minutesAgo! > 15
        ? "stalled"
        : "running";
  return {
    state,
    minutesAgo,
    lastRunAt: heartbeat?.lastRunAt ?? null,
    pushConfigured: pushConfigured(),
    cronSecretSet: !!process.env.CRON_SECRET,
  };
}
