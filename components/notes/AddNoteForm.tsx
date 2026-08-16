"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createNoteAction } from "@/lib/actions/notes-actions";

export function AddNoteForm() {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    createNoteAction(text.trim());
    setText("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 rounded-2xl border border-dashed border-ink/15 bg-white/40 px-4 py-3"
    >
      <Plus size={16} className="shrink-0 text-ink/40" />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a personal reminder…"
        className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/40"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-maroon/10 px-3 py-1.5 text-xs font-medium text-maroon hover:bg-maroon/15"
      >
        Add
      </button>
    </form>
  );
}
