"use client";

import { useState } from "react";
import { KeyRound, Trash2, UserPlus } from "lucide-react";
import {
  addAccountToGuestListAction,
  deleteGuestAccountAction,
  linkAccountAction,
  resetGuestPinAction,
} from "@/lib/actions/guest-app-actions";
import { formatPhone } from "@/lib/phone";

type Account = {
  id: string;
  name: string;
  phone: string;
  guestId: string | null;
  createdAt: string;
  lastSeen: string | null;
};

export function RegistrationRow({
  account,
  guests,
}: {
  account: Account;
  guests: { id: string; name: string }[];
}) {
  const [newPin, setNewPin] = useState<string | null>(null);

  return (
    <tr className="border-b border-ink/5 last:border-0">
      <td className="px-3 py-2.5">
        <p className="text-ink/90">{account.name}</p>
        <p className="text-xs text-ink/50">{formatPhone(account.phone)}</p>
      </td>
      <td className="px-3 py-2.5">
        <select
          value={account.guestId ?? ""}
          onChange={(e) => linkAccountAction(account.id, e.target.value || null)}
          className={`max-w-48 rounded-md border px-2 py-1 text-xs outline-none focus:border-maroon ${
            account.guestId ? "border-ink/10 bg-white text-ink/80" : "border-marigold/50 bg-marigold/10 text-ink/70"
          }`}
        >
          <option value="">— Not in guest list —</option>
          {guests.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        {!account.guestId && (
          <button
            type="button"
            onClick={() => addAccountToGuestListAction(account.id, "BOTH")}
            className="ml-2 inline-flex items-center gap-1 rounded-md bg-maroon/10 px-2 py-1 text-xs font-medium text-maroon hover:bg-maroon/15"
          >
            <UserPlus size={12} /> Add as new guest
          </button>
        )}
      </td>
      <td className="px-3 py-2.5 text-xs text-ink/50">
        {account.createdAt}
        {account.lastSeen && <span className="block">seen {account.lastSeen}</span>}
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center justify-end gap-1">
          {newPin ? (
            <span className="rounded-md bg-mehendi/15 px-2 py-1 text-xs font-medium text-mehendi">
              New PIN: <span className="font-mono text-sm">{newPin}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={async () => {
                if (confirm(`Reset ${account.name}'s PIN? They'll be logged out and need the new PIN.`)) {
                  setNewPin(await resetGuestPinAction(account.id));
                }
              }}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-ink/60 hover:bg-ink/5"
            >
              <KeyRound size={13} /> Reset PIN
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (confirm(`Remove ${account.name}'s app registration? Their guest list entry stays.`)) {
                deleteGuestAccountAction(account.id);
              }
            }}
            className="rounded-md p-1 text-ink/30 hover:bg-red-50 hover:text-red-500"
            aria-label="Remove registration"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
