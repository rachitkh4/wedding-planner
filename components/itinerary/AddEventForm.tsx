"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createEventAction } from "@/lib/actions/itinerary-actions";
import { toDateInputValue } from "@/lib/format";

export function AddEventForm() {
  const [name, setName] = useState("");
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [venue, setVenue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createEventAction(name.trim(), date, venue.trim());
    setName("");
    setVenue("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-ink/15 bg-white/40 px-4 py-3"
    >
      <Plus size={16} className="shrink-0 text-ink/40" />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Event name (e.g. Sangeet)"
        className="min-w-40 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/40"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded-md border border-ink/10 bg-white px-2 py-1 text-sm text-ink outline-none focus:border-maroon"
      />
      <input
        value={venue}
        onChange={(e) => setVenue(e.target.value)}
        placeholder="Venue"
        className="w-40 rounded-md border border-ink/10 bg-white px-2 py-1 text-sm text-ink outline-none focus:border-maroon"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-maroon/10 px-3 py-1.5 text-xs font-medium text-maroon hover:bg-maroon/15"
      >
        Add event
      </button>
    </form>
  );
}
