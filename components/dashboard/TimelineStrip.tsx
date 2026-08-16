import { formatDate } from "@/lib/format";

export function TimelineStrip({
  events,
}: {
  events: { id: string; name: string; date: Date | string }[];
}) {
  if (events.length === 0) return null;

  return (
    <div className="overflow-x-auto pb-2">
      <div className="relative flex min-w-max gap-10 px-2 pt-4">
        <div className="absolute left-2 right-2 top-[19px] h-0.5 bg-marigold/40" />
        {events.map((e) => (
          <div key={e.id} className="relative z-10 flex w-32 flex-col items-center text-center">
            <span className="h-3.5 w-3.5 rounded-full bg-marigold ring-[5px] ring-ivory" />
            <span className="mt-2.5 font-display text-sm text-ink">{e.name}</span>
            <span className="text-xs text-ink/50">{formatDate(e.date)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
