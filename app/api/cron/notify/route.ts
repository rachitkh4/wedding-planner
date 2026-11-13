import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendDueAnnouncements, syncEventReminders } from "@/lib/notifications";

export const dynamic = "force-dynamic";

function authorised(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const url = new URL(request.url);
  const header = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const supplied = header ?? url.searchParams.get("secret") ?? "";
  const a = Buffer.from(supplied);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Called every few minutes by an external scheduler (see README). Creates any
 * missing automatic reminders and sends everything that is due.
 */
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return Response.json({ error: "CRON_SECRET is not set on the server." }, { status: 503 });
  }
  if (!authorised(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const reminders = await syncEventReminders();
  const sent = await sendDueAnnouncements();
  await prisma.jobHeartbeat.upsert({
    where: { name: "notify" },
    create: { name: "notify", lastRunAt: new Date() },
    update: { lastRunAt: new Date() },
  });
  return Response.json({ ok: true, reminders, sent });
}
