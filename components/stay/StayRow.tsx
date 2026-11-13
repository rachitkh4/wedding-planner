"use client";

import { useState } from "react";
import { useDebouncedSave } from "@/lib/hooks/useDebouncedSave";
import { updateStayAction } from "@/lib/actions/guest-app-actions";
import { formatPhone, telHref } from "@/lib/phone";

type Account = {
  id: string;
  name: string;
  phone: string;
  attending: boolean | null;
  partySize: number | null;
  members: string[];
  stayPlace: string;
  stayRoom: string;
  stayNote: string;
};

export function StayRow({ account, hotels }: { account: Account; hotels: string[] }) {
  const [place, setPlace] = useState(account.stayPlace);
  const [room, setRoom] = useState(account.stayRoom);
  const [note, setNote] = useState(account.stayNote);
  const { trigger, status } = useDebouncedSave(
    (patch: Parameters<typeof updateStayAction>[1]) => updateStayAction(account.id, patch),
  );

  const input =
    "w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm text-ink outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white";

  return (
    <tr className={`border-b border-ink/5 align-top last:border-0 ${account.attending === false ? "opacity-50" : ""}`}>
      <td className="px-3 py-2.5">
        <p className="text-ink/90">{account.name}</p>
        <a href={telHref(account.phone)} className="text-xs text-ink/50 hover:text-maroon">
          {formatPhone(account.phone)}
        </a>
      </td>
      <td className="px-3 py-2.5 text-xs">
        {account.attending === null && <span className="rounded-full bg-ink/10 px-2 py-0.5 text-ink/60">No reply</span>}
        {account.attending === true && (
          <span className="rounded-full bg-mehendi/15 px-2 py-0.5 font-medium text-mehendi">
            Coming · {account.partySize ?? 1}
          </span>
        )}
        {account.attending === false && <span className="rounded-full bg-ink/10 px-2 py-0.5 text-ink/60">Declined</span>}
        {account.members.length > 0 && <p className="mt-1 text-ink/50">+ {account.members.join(", ")}</p>}
      </td>
      <td className="px-3 py-2">
        <input
          list="stay-hotels"
          value={place}
          placeholder="Hotel / home"
          onChange={(e) => {
            setPlace(e.target.value);
            trigger({ stayPlace: e.target.value, stayRoom: room, stayNote: note });
          }}
          className={input}
        />
        <datalist id="stay-hotels">
          {hotels.map((h) => (
            <option key={h} value={h} />
          ))}
        </datalist>
      </td>
      <td className="px-3 py-2">
        <input
          value={room}
          placeholder="Room"
          onChange={(e) => {
            setRoom(e.target.value);
            trigger({ stayPlace: place, stayRoom: e.target.value, stayNote: note });
          }}
          className={`${input} w-24`}
        />
      </td>
      <td className="px-3 py-2">
        <input
          value={note}
          placeholder="Note for guest (optional)"
          onChange={(e) => {
            setNote(e.target.value);
            trigger({ stayPlace: place, stayRoom: room, stayNote: e.target.value });
          }}
          className={input}
        />
      </td>
      <td className="w-14 px-2 py-2.5 text-xs text-ink/40">{status === "saving" ? "…" : status === "saved" ? "✓" : ""}</td>
    </tr>
  );
}
