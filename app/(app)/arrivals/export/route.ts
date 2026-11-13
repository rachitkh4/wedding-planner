import { auth } from "@/auth";
import { getTravelOverview, MODE_LABELS, parseDirection, toCsv } from "@/lib/arrivals";
import { formatIstTime, istYmd } from "@/lib/time";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const direction = parseDirection(new URL(request.url).searchParams.get("dir") ?? undefined);
  const { legs } = await getTravelOverview(direction);

  const csv = toCsv([
    ["Date", "Time", "Name", "Mobile", "Mode", "Place", "Number", "PNR", "People", "Others coming", "Note"],
    ...legs.map((l) => [
      istYmd(l.dateTime),
      formatIstTime(l.dateTime, "en"),
      l.account.name,
      l.account.phone,
      MODE_LABELS[l.mode],
      l.place,
      l.number,
      l.pnr,
      l.paxCount,
      l.account.members.map((m) => m.name).join("; "),
      l.note,
    ]),
  ]);

  const name = direction === "ARRIVAL" ? "arrivals" : "departures";
  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
