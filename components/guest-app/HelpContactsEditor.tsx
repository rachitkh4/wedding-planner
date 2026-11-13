"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createHelpContactAction, deleteHelpContactAction } from "@/lib/actions/guest-app-actions";
import { formatPhone } from "@/lib/phone";

type Contact = { id: string; label: string; name: string; phone: string };

export function HelpContactsEditor({ contacts }: { contacts: Contact[] }) {
  const [label, setLabel] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await createHelpContactAction({ label, name, phone });
    if (result.error) return setError(result.error);
    setError(null);
    setLabel("");
    setName("");
    setPhone("");
  }

  const input =
    "min-w-0 flex-1 rounded-md border border-ink/10 bg-white px-2 py-1.5 text-sm text-ink outline-none focus:border-maroon";

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-1.5">
        {contacts.map((c) => (
          <li key={c.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-ink/[0.03]">
            <span className="w-32 shrink-0 text-xs font-medium uppercase tracking-wide text-mehendi">
              {c.label}
            </span>
            <span className="flex-1 text-ink/80">{c.name}</span>
            <span className="text-ink/50">{formatPhone(c.phone)}</span>
            <button
              type="button"
              onClick={() => deleteHelpContactAction(c.id)}
              className="rounded-md p-1 text-ink/30 hover:bg-red-50 hover:text-red-500"
              aria-label={`Remove ${c.name}`}
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
        {contacts.length === 0 && <p className="text-sm text-ink/40">No help contacts yet.</p>}
      </ul>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="For (e.g. Travel & stay)" className={input} />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className={input} />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile" type="tel" className={input} />
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-lg bg-maroon/10 px-3 py-1.5 text-xs font-medium text-maroon hover:bg-maroon/15"
        >
          <Plus size={14} /> Add
        </button>
      </form>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
