"use client";

import { useState } from "react";
import { setAutoRemindersAction } from "@/lib/actions/announcement-actions";

export function AutoRemindersToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <label className="flex items-start gap-3 text-sm text-ink/80">
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => {
          setOn(e.target.checked);
          setAutoRemindersAction(e.target.checked);
        }}
        className="mt-0.5 h-4 w-4 accent-maroon"
      />
      <span>
        Send automatic event reminders
        <span className="block text-xs text-ink/50">
          At 6 pm the evening before, and 1 hour before the start, for every event that has a start time and is
          shown to guests.
        </span>
      </span>
    </label>
  );
}
