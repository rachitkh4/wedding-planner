"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  updateExpenseFieldAction,
  deleteExpenseAction,
  updateExpenseVisibilityAction,
} from "@/lib/actions/expense-actions";
import { useDebouncedSave } from "@/lib/hooks/useDebouncedSave";
import { toDateInputValue } from "@/lib/format";
import { VisibilityControl } from "@/components/shared/VisibilityControl";
import type { SimpleUser } from "@/lib/visibility";
import type { PaymentMethod, Visibility } from "@/generated/prisma/enums";

const PAYMENT_METHODS: (keyof typeof PaymentMethod)[] = [
  "UPI",
  "CARD",
  "CASH",
  "BANK_TRANSFER",
  "CHEQUE",
];

const PAYMENT_LABELS: Record<keyof typeof PaymentMethod, string> = {
  UPI: "UPI",
  CARD: "Card",
  CASH: "Cash",
  BANK_TRANSFER: "Bank transfer",
  CHEQUE: "Cheque",
};

export function ExpenseRow({
  expense,
  categories,
  members,
  currentUserId,
}: {
  expense: {
    id: string;
    date: string;
    categoryId: string;
    description: string;
    amount: number;
    paidBy: string;
    paymentMethod: keyof typeof PaymentMethod;
    ownerId: string;
    visibility: keyof typeof Visibility;
    sharedWith: { id: string }[];
  };
  categories: { id: string; name: string }[];
  members: SimpleUser[];
  currentUserId: string;
}) {
  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(expense.amount);
  const [paidBy, setPaidBy] = useState(expense.paidBy);

  const { trigger } = useDebouncedSave(
    (patch: Parameters<typeof updateExpenseFieldAction>[1]) =>
      updateExpenseFieldAction(expense.id, patch),
  );

  function updateImmediate(patch: Parameters<typeof updateExpenseFieldAction>[1]) {
    updateExpenseFieldAction(expense.id, patch);
  }

  return (
    <tr className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
      <td className="px-3 py-2">
        <input
          type="date"
          defaultValue={toDateInputValue(expense.date)}
          onChange={(e) => updateImmediate({ date: e.target.value })}
          className="rounded-md border border-transparent bg-transparent px-1 py-1 text-xs text-ink/80 outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
        />
      </td>
      <td className="px-3 py-2">
        <select
          defaultValue={expense.categoryId}
          onChange={(e) => updateImmediate({ categoryId: e.target.value })}
          className="rounded-md border border-transparent bg-transparent px-1 py-1 text-xs text-ink/80 outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2">
        <input
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            trigger({ description: e.target.value });
          }}
          className="w-full min-w-32 rounded-md border border-transparent bg-transparent px-1 py-1 text-sm text-ink outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => {
            const value = Number(e.target.value);
            setAmount(value);
            trigger({ amount: value });
          }}
          className="w-24 rounded-md border border-transparent bg-transparent px-1 py-1 text-right text-sm text-ink outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
        />
      </td>
      <td className="px-3 py-2">
        <input
          value={paidBy}
          onChange={(e) => {
            setPaidBy(e.target.value);
            trigger({ paidBy: e.target.value });
          }}
          className="w-24 rounded-md border border-transparent bg-transparent px-1 py-1 text-sm text-ink outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
        />
      </td>
      <td className="px-3 py-2">
        <select
          defaultValue={expense.paymentMethod}
          onChange={(e) =>
            updateImmediate({ paymentMethod: e.target.value as keyof typeof PaymentMethod })
          }
          className="rounded-md border border-transparent bg-transparent px-1 py-1 text-xs text-ink/80 outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
        >
          {PAYMENT_METHODS.map((m) => (
            <option key={m} value={m}>
              {PAYMENT_LABELS[m]}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2">
        <VisibilityControl
          visibility={expense.visibility}
          sharedWithIds={expense.sharedWith.map((u) => u.id)}
          allUsers={members.filter((m) => m.id !== expense.ownerId)}
          isOwner={expense.ownerId === currentUserId}
          onChange={(v, ids) => updateExpenseVisibilityAction(expense.id, v, ids)}
        />
      </td>
      <td className="px-3 py-2">
        <button
          type="button"
          onClick={() => deleteExpenseAction(expense.id)}
          className="rounded-md p-1 text-ink/30 hover:bg-red-50 hover:text-red-500"
          aria-label="Delete expense"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}
