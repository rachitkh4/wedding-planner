"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/shared/Card";
import { useDebouncedSave } from "@/lib/hooks/useDebouncedSave";
import { toDateInputValue } from "@/lib/format";
import {
  updateEventAction,
  deleteEventAction,
  createScheduleEntryAction,
  updateScheduleEntryAction,
  deleteScheduleEntryAction,
} from "@/lib/actions/itinerary-actions";

type ScheduleEntry = { id: string; time: string; activity: string };

export function EventCard({
  event,
  scheduleEntries,
}: {
  event: { id: string; name: string; date: string; venue: string | null };
  scheduleEntries: ScheduleEntry[];
}) {
  const [name, setName] = useState(event.name);
  const [venue, setVenue] = useState(event.venue ?? "");
  const [time, setTime] = useState("");
  const [activity, setActivity] = useState("");

  const { trigger } = useDebouncedSave(
    (patch: Parameters<typeof updateEventAction>[1]) => updateEventAction(event.id, patch),
  );

  function handleAddEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!time.trim() || !activity.trim()) return;
    createScheduleEntryAction(event.id, time.trim(), activity.trim());
    setTime("");
    setActivity("");
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            trigger({ name: e.target.value });
          }}
          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent font-display text-xl text-maroon outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
        />
        <button
          type="button"
          onClick={() => {
            if (confirm(`Delete "${event.name}" and its schedule?`)) {
              deleteEventAction(event.id);
            }
          }}
          className="shrink-0 rounded-md p-1.5 text-ink/30 hover:bg-red-50 hover:text-red-500"
          aria-label="Delete event"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink/60">
        <input
          type="date"
          defaultValue={toDateInputValue(event.date)}
          onChange={(e) => updateEventAction(event.id, { date: e.target.value })}
          className="rounded-md border border-ink/10 bg-white px-2 py-1 outline-none focus:border-maroon"
        />
        <input
          value={venue}
          onChange={(e) => {
            setVenue(e.target.value);
            trigger({ venue: e.target.value });
          }}
          placeholder="Venue"
          className="min-w-32 flex-1 rounded-md border border-ink/10 bg-white px-2 py-1 outline-none focus:border-maroon"
        />
      </div>

      <div className="mt-4 flex flex-col gap-1">
        {scheduleEntries.map((entry) => (
          <ScheduleEntryRow key={entry.id} entry={entry} />
        ))}
        {scheduleEntries.length === 0 && (
          <p className="px-1 py-1 text-sm text-ink/40">No schedule entries yet.</p>
        )}
      </div>

      <form onSubmit={handleAddEntry} className="mt-2 flex items-center gap-2">
        <Plus size={14} className="shrink-0 text-ink/30" />
        <input
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="Time (e.g. 10:00 AM)"
          className="w-32 shrink-0 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm text-ink outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
        />
        <input
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          placeholder="Activity"
          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm text-ink outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
        />
      </form>
    </Card>
  );
}

function ScheduleEntryRow({ entry }: { entry: ScheduleEntry }) {
  const [time, setTime] = useState(entry.time);
  const [activity, setActivity] = useState(entry.activity);
  const { trigger } = useDebouncedSave(
    (patch: Parameters<typeof updateScheduleEntryAction>[1]) =>
      updateScheduleEntryAction(entry.id, patch),
  );

  return (
    <div className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-ink/[0.03]">
      <input
        value={time}
        onChange={(e) => {
          setTime(e.target.value);
          trigger({ time: e.target.value });
        }}
        className="w-32 shrink-0 rounded-md border border-transparent bg-transparent px-1.5 py-1 font-mono text-xs text-ink/70 outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
      />
      <input
        value={activity}
        onChange={(e) => {
          setActivity(e.target.value);
          trigger({ activity: e.target.value });
        }}
        className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm text-ink outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
      />
      <button
        type="button"
        onClick={() => deleteScheduleEntryAction(entry.id)}
        className="shrink-0 rounded-md p-1 text-ink/30 hover:bg-red-50 hover:text-red-500"
        aria-label="Delete schedule entry"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
