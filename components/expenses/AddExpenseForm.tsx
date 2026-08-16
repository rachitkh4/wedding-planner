"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createExpenseAction } from "@/lib/actions/expense-actions";
import { createCategoryAction } from "@/lib/actions/budget-actions";
import { toDateInputValue } from "@/lib/format";
import type { PaymentMethod } from "@/generated/prisma/enums";

const NEW_CATEGORY = "__new__";

const PAYMENT_METHODS: { value: keyof typeof PaymentMethod; label: string }[] = [
  { value: "UPI", label: "UPI" },
  { value: "CARD", label: "Card" },
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "CHEQUE", label: "Cheque" },
];

export function AddExpenseForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? NEW_CATEGORY);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<keyof typeof PaymentMethod>("UPI");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    setPending(true);
    try {
      let finalCategoryId = categoryId;
      if (categoryId === NEW_CATEGORY) {
        if (!newCategoryName.trim()) return;
        const category = await createCategoryAction(newCategoryName.trim(), 0);
        finalCategoryId = category.id;
      }

      await createExpenseAction({
        categoryId: finalCategoryId,
        date,
        description: description.trim(),
        amount: Number(amount),
        paidBy: paidBy.trim(),
        paymentMethod,
      });

      setDescription("");
      setAmount("");
      setPaidBy("");
      setNewCategoryName("");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-2 rounded-2xl border border-dashed border-ink/15 bg-white/40 px-4 py-3"
    >
      <Field label="Date">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-ink/10 bg-white px-2 py-1.5 text-sm text-ink outline-none focus:border-maroon"
        />
      </Field>

      <Field label="Category">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-md border border-ink/10 bg-white px-2 py-1.5 text-sm text-ink outline-none focus:border-maroon"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value={NEW_CATEGORY}>+ Add new category…</option>
        </select>
      </Field>
      {categoryId === NEW_CATEGORY && (
        <Field label="New category name">
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="e.g. Honeymoon"
            className="rounded-md border border-ink/10 bg-white px-2 py-1.5 text-sm text-ink outline-none focus:border-maroon"
          />
        </Field>
      )}

      <Field label="Description" grow>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Venue advance"
          required
          className="w-full rounded-md border border-ink/10 bg-white px-2 py-1.5 text-sm text-ink outline-none focus:border-maroon"
        />
      </Field>

      <Field label="Amount ₹">
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="w-28 rounded-md border border-ink/10 bg-white px-2 py-1.5 text-sm text-ink outline-none focus:border-maroon"
        />
      </Field>

      <Field label="Paid by">
        <input
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          placeholder="e.g. Priya"
          className="w-28 rounded-md border border-ink/10 bg-white px-2 py-1.5 text-sm text-ink outline-none focus:border-maroon"
        />
      </Field>

      <Field label="Payment method">
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as keyof typeof PaymentMethod)}
          className="rounded-md border border-ink/10 bg-white px-2 py-1.5 text-sm text-ink outline-none focus:border-maroon"
        >
          {PAYMENT_METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-1.5 rounded-lg bg-maroon px-4 py-2 text-sm font-medium text-ivory hover:bg-maroon/90 disabled:opacity-60"
      >
        <Plus size={15} />
        {pending ? "Adding…" : "Add expense"}
      </button>
    </form>
  );
}

function Field({
  label,
  grow,
  children,
}: {
  label: string;
  grow?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 text-xs text-ink/50 ${grow ? "flex-1 min-w-40" : ""}`}>
      {label}
      {children}
    </label>
  );
}
