"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  updateTaskTextAction,
  toggleTaskDoneAction,
  updateTaskAssigneeAction,
  deleteTaskAction,
  updateTaskVisibilityAction,
} from "@/lib/actions/checklist-actions";
import { useDebouncedSave } from "@/lib/hooks/useDebouncedSave";
import { VisibilityControl } from "@/components/shared/VisibilityControl";
import type { SimpleUser } from "@/lib/visibility";
import type { Visibility } from "@/generated/prisma/enums";

export function TaskRow({
  task,
  members,
  currentUserId,
}: {
  task: {
    id: string;
    text: string;
    done: boolean;
    assignedTo: string | null;
    ownerId: string;
    visibility: keyof typeof Visibility;
    sharedWith: { id: string }[];
  };
  members: SimpleUser[];
  currentUserId: string;
}) {
  const [text, setText] = useState(task.text);
  const [done, setDone] = useState(task.done);
  const [assignedTo, setAssignedTo] = useState(task.assignedTo ?? "");
  const { trigger: saveText } = useDebouncedSave((value: string) =>
    updateTaskTextAction(task.id, value),
  );

  return (
    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-ink/[0.03]">
      <input
        type="checkbox"
        checked={done}
        onChange={(e) => {
          setDone(e.target.checked);
          toggleTaskDoneAction(task.id, e.target.checked);
        }}
        className="h-4 w-4 accent-mehendi"
      />
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          saveText(e.target.value);
        }}
        className={`min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white ${
          done ? "text-ink/40 line-through" : "text-ink/90"
        }`}
      />
      <select
        value={assignedTo}
        onChange={(e) => {
          setAssignedTo(e.target.value);
          updateTaskAssigneeAction(task.id, e.target.value);
        }}
        className="w-32 shrink-0 rounded-md border border-ink/10 bg-white px-1.5 py-1 text-xs text-ink/70 outline-none focus:border-maroon"
      >
        <option value="">Unassigned</option>
        {members.map((m) => (
          <option key={m.id} value={m.displayName ?? m.email}>
            {m.displayName ?? m.email}
          </option>
        ))}
      </select>
      <VisibilityControl
        visibility={task.visibility}
        sharedWithIds={task.sharedWith.map((u) => u.id)}
        allUsers={members.filter((m) => m.id !== task.ownerId)}
        isOwner={task.ownerId === currentUserId}
        onChange={(v, ids) => updateTaskVisibilityAction(task.id, v, ids)}
      />
      <button
        type="button"
        onClick={() => deleteTaskAction(task.id)}
        className="shrink-0 rounded-md p-1 text-ink/30 hover:bg-red-50 hover:text-red-500"
        aria-label="Delete task"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
