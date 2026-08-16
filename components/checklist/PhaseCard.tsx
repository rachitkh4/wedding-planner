"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/shared/Card";
import { TaskRow } from "./TaskRow";
import {
  createTaskAction,
  renamePhaseAction,
  deletePhaseAction,
} from "@/lib/actions/checklist-actions";
import { useDebouncedSave } from "@/lib/hooks/useDebouncedSave";
import type { SimpleUser } from "@/lib/visibility";
import type { Visibility } from "@/generated/prisma/enums";

type Task = {
  id: string;
  text: string;
  done: boolean;
  assignedTo: string | null;
  ownerId: string;
  visibility: keyof typeof Visibility;
  sharedWith: { id: string }[];
};

export function PhaseCard({
  phase,
  tasks,
  members,
  currentUserId,
}: {
  phase: { id: string; name: string };
  tasks: Task[];
  members: SimpleUser[];
  currentUserId: string;
}) {
  const [name, setName] = useState(phase.name);
  const [newTask, setNewTask] = useState("");
  const { trigger: saveName } = useDebouncedSave((value: string) =>
    renamePhaseAction(phase.id, value),
  );

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;
    createTaskAction(phase.id, newTask.trim());
    setNewTask("");
  }

  return (
    <Card>
      <div className="mb-2 flex items-center justify-between gap-2">
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            saveName(e.target.value);
          }}
          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent font-display text-lg text-ink outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
        />
        <button
          type="button"
          onClick={() => {
            if (confirm(`Delete phase "${phase.name}" and all its tasks?`)) {
              deletePhaseAction(phase.id);
            }
          }}
          className="shrink-0 rounded-md p-1.5 text-ink/30 hover:bg-red-50 hover:text-red-500"
          aria-label="Delete phase"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="flex flex-col gap-0.5">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} members={members} currentUserId={currentUserId} />
        ))}
        {tasks.length === 0 && <p className="px-2 py-2 text-sm text-ink/40">No tasks yet.</p>}
      </div>

      <form onSubmit={handleAddTask} className="mt-2 flex items-center gap-2">
        <Plus size={14} className="shrink-0 text-ink/30" />
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a task…"
          className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm text-ink outline-none hover:border-ink/10 focus:border-maroon/30 focus:bg-white"
        />
      </form>
    </Card>
  );
}
