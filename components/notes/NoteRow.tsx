"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { updateNoteTextAction, toggleNoteAction, deleteNoteAction } from "@/lib/actions/notes-actions";
import { useDebouncedSave } from "@/lib/hooks/useDebouncedSave";

export function NoteRow({ note }: { note: { id: string; text: string; done: boolean } }) {
  const [text, setText] = useState(note.text);
  const [done, setDone] = useState(note.done);
  const { trigger } = useDebouncedSave((value: string) => updateNoteTextAction(note.id, value));

  return (
    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-ink/[0.03]">
      <input
        type="checkbox"
        checked={done}
        onChange={(e) => {
          setDone(e.target.checked);
          toggleNoteAction(note.id, e.target.checked);
        }}
        className="h-4 w-4 accent-mehendi"
      />
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          trigger(e.target.value);
        }}
        className={`min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white ${
          done ? "text-ink/40 line-through" : "text-ink/90"
        }`}
      />
      <button
        type="button"
        onClick={() => deleteNoteAction(note.id)}
        className="shrink-0 rounded-md p-1 text-ink/30 hover:bg-red-50 hover:text-red-500"
        aria-label="Delete note"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
