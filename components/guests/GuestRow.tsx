"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  updateGuestFieldAction,
  toggleGuestEventAction,
  deleteGuestAction,
  updateGuestVisibilityAction,
} from "@/lib/actions/guest-actions";
import { useDebouncedSave } from "@/lib/hooks/useDebouncedSave";
import { VisibilityControl } from "@/components/shared/VisibilityControl";
import type { SimpleUser } from "@/lib/visibility";
import type { Side, RsvpStatus, Visibility } from "@/generated/prisma/enums";

const SIDES: (keyof typeof Side)[] = ["BRIDE", "GROOM", "BOTH"];
const SIDE_LABELS: Record<keyof typeof Side, string> = {
  BRIDE: "Bride's side",
  GROOM: "Groom's side",
  BOTH: "Both",
};

const RSVP_STATUSES: (keyof typeof RsvpStatus)[] = ["PENDING", "CONFIRMED", "DECLINED"];
const RSVP_LABELS: Record<keyof typeof RsvpStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  DECLINED: "Declined",
};

export function GuestRow({
  guest,
  events,
  members,
  currentUserId,
}: {
  guest: {
    id: string;
    name: string;
    side: keyof typeof Side;
    headcount: number;
    rsvpStatus: keyof typeof RsvpStatus;
    ownerId: string;
    visibility: keyof typeof Visibility;
    sharedWith: { id: string }[];
    invitedEvents: { id: string }[];
  };
  events: { id: string; name: string }[];
  members: SimpleUser[];
  currentUserId: string;
}) {
  const [name, setName] = useState(guest.name);
  const [headcount, setHeadcount] = useState(guest.headcount);
  const invitedIds = new Set(guest.invitedEvents.map((e) => e.id));

  const { trigger } = useDebouncedSave(
    (patch: Parameters<typeof updateGuestFieldAction>[1]) =>
      updateGuestFieldAction(guest.id, patch),
  );

  function updateImmediate(patch: Parameters<typeof updateGuestFieldAction>[1]) {
    updateGuestFieldAction(guest.id, patch);
  }

  return (
    <tr className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
      <td className="px-3 py-2">
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            trigger({ name: e.target.value });
          }}
          className="w-32 min-w-32 rounded-md border border-transparent bg-transparent px-1 py-1 text-sm text-ink outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
        />
      </td>
      <td className="px-3 py-2">
        <select
          defaultValue={guest.side}
          onChange={(e) => updateImmediate({ side: e.target.value as keyof typeof Side })}
          className="rounded-md border border-transparent bg-transparent px-1 py-1 text-xs text-ink/80 outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
        >
          {SIDES.map((s) => (
            <option key={s} value={s}>
              {SIDE_LABELS[s]}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          min={1}
          value={headcount}
          onChange={(e) => {
            const value = Number(e.target.value);
            setHeadcount(value);
            trigger({ headcount: value });
          }}
          className="w-16 rounded-md border border-transparent bg-transparent px-1 py-1 text-right text-sm text-ink outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
        />
      </td>
      {events.map((event) => (
        <td key={event.id} className="px-2 py-2 text-center">
          <input
            type="checkbox"
            checked={invitedIds.has(event.id)}
            onChange={(e) => toggleGuestEventAction(guest.id, event.id, e.target.checked)}
            className="h-4 w-4 accent-mehendi"
          />
        </td>
      ))}
      <td className="px-3 py-2">
        <select
          defaultValue={guest.rsvpStatus}
          onChange={(e) =>
            updateImmediate({ rsvpStatus: e.target.value as keyof typeof RsvpStatus })
          }
          className="rounded-md border border-transparent bg-transparent px-1 py-1 text-xs outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
        >
          {RSVP_STATUSES.map((s) => (
            <option key={s} value={s}>
              {RSVP_LABELS[s]}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2">
        <VisibilityControl
          visibility={guest.visibility}
          sharedWithIds={guest.sharedWith.map((u) => u.id)}
          allUsers={members.filter((m) => m.id !== guest.ownerId)}
          isOwner={guest.ownerId === currentUserId}
          onChange={(v, ids) => updateGuestVisibilityAction(guest.id, v, ids)}
        />
      </td>
      <td className="px-3 py-2">
        <button
          type="button"
          onClick={() => deleteGuestAction(guest.id)}
          className="rounded-md p-1 text-ink/30 hover:bg-red-50 hover:text-red-500"
          aria-label="Delete guest"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}
