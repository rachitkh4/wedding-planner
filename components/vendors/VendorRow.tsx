"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  updateVendorFieldAction,
  deleteVendorAction,
  updateVendorVisibilityAction,
} from "@/lib/actions/vendor-actions";
import { useDebouncedSave } from "@/lib/hooks/useDebouncedSave";
import { VisibilityControl } from "@/components/shared/VisibilityControl";
import type { SimpleUser } from "@/lib/visibility";
import type { VendorStatus, Visibility } from "@/generated/prisma/enums";

const STATUSES: (keyof typeof VendorStatus)[] = [
  "RESEARCHING",
  "CONTACTED",
  "BOOKED",
  "PAID",
  "COMPLETED",
];
const STATUS_LABELS: Record<keyof typeof VendorStatus, string> = {
  RESEARCHING: "Researching",
  CONTACTED: "Contacted",
  BOOKED: "Booked",
  PAID: "Paid",
  COMPLETED: "Completed",
};
const STATUS_STYLES: Record<keyof typeof VendorStatus, string> = {
  RESEARCHING: "bg-ink/10 text-ink/60",
  CONTACTED: "bg-marigold/20 text-marigold",
  BOOKED: "bg-mehendi/15 text-mehendi",
  PAID: "bg-mehendi/25 text-mehendi",
  COMPLETED: "bg-maroon/10 text-maroon",
};

export function VendorRow({
  vendor,
  members,
  currentUserId,
}: {
  vendor: {
    id: string;
    category: string;
    name: string;
    contact: string | null;
    quotedCost: number | null;
    advancePaid: number;
    status: keyof typeof VendorStatus;
    ownerId: string;
    visibility: keyof typeof Visibility;
    sharedWith: { id: string }[];
  };
  members: SimpleUser[];
  currentUserId: string;
}) {
  const [category, setCategory] = useState(vendor.category);
  const [name, setName] = useState(vendor.name);
  const [contact, setContact] = useState(vendor.contact ?? "");
  const [quotedCost, setQuotedCost] = useState(vendor.quotedCost ?? "");
  const [advancePaid, setAdvancePaid] = useState(vendor.advancePaid);

  const { trigger } = useDebouncedSave(
    (patch: Parameters<typeof updateVendorFieldAction>[1]) =>
      updateVendorFieldAction(vendor.id, patch),
  );

  return (
    <tr className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
      <td className="px-3 py-2">
        <input
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            trigger({ category: e.target.value });
          }}
          className="w-28 rounded-md border border-transparent bg-transparent px-1 py-1 text-xs text-ink/70 outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
        />
      </td>
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
        <input
          value={contact}
          onChange={(e) => {
            setContact(e.target.value);
            trigger({ contact: e.target.value });
          }}
          placeholder="Phone / email"
          className="w-32 rounded-md border border-transparent bg-transparent px-1 py-1 text-xs text-ink/70 outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          min={0}
          value={quotedCost}
          onChange={(e) => {
            const value = e.target.value === "" ? "" : Number(e.target.value);
            setQuotedCost(value);
            trigger({ quotedCost: value === "" ? null : value });
          }}
          className="w-24 rounded-md border border-transparent bg-transparent px-1 py-1 text-right text-sm text-ink outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          min={0}
          value={advancePaid}
          onChange={(e) => {
            const value = Number(e.target.value);
            setAdvancePaid(value);
            trigger({ advancePaid: value });
          }}
          className="w-24 rounded-md border border-transparent bg-transparent px-1 py-1 text-right text-sm text-ink outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
        />
      </td>
      <td className="px-3 py-2">
        <select
          defaultValue={vendor.status}
          onChange={(e) =>
            updateVendorFieldAction(vendor.id, { status: e.target.value as keyof typeof VendorStatus })
          }
          className={`rounded-full border-0 px-2 py-1 text-xs font-medium outline-none ${STATUS_STYLES[vendor.status]}`}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2">
        <VisibilityControl
          visibility={vendor.visibility}
          sharedWithIds={vendor.sharedWith.map((u) => u.id)}
          allUsers={members.filter((m) => m.id !== vendor.ownerId)}
          isOwner={vendor.ownerId === currentUserId}
          onChange={(v, ids) => updateVendorVisibilityAction(vendor.id, v, ids)}
        />
      </td>
      <td className="px-3 py-2">
        <button
          type="button"
          onClick={() => deleteVendorAction(vendor.id)}
          className="rounded-md p-1 text-ink/30 hover:bg-red-50 hover:text-red-500"
          aria-label="Delete vendor"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}
