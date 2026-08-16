"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Lock, Users, Globe2, ChevronDown } from "lucide-react";
import { Visibility } from "@/generated/prisma/enums";
import type { SimpleUser } from "@/lib/visibility";

const OPTIONS: { value: keyof typeof Visibility; label: string; icon: typeof Lock }[] = [
  { value: "PRIVATE", label: "Only me", icon: Lock },
  { value: "SELECTED", label: "Selected people", icon: Users },
  { value: "EVERYONE", label: "Everyone", icon: Globe2 },
];

export function VisibilityControl({
  visibility,
  sharedWithIds,
  allUsers,
  isOwner,
  onChange,
}: {
  visibility: keyof typeof Visibility;
  sharedWithIds: string[];
  allUsers: SimpleUser[];
  isOwner: boolean;
  onChange: (visibility: keyof typeof Visibility, sharedWithIds: string[]) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [draftVisibility, setDraftVisibility] = useState(visibility);
  const [draftShared, setDraftShared] = useState<string[]>(sharedWithIds);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = OPTIONS.find((o) => o.value === visibility) ?? OPTIONS[2];
  const Icon = current.icon;

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!isOwner) {
    return (
      <span
        title={current.label}
        className="inline-flex items-center gap-1 rounded-full bg-ink/5 px-2 py-1 text-xs text-ink/50"
      >
        <Icon size={13} />
      </span>
    );
  }

  function commit(nextVisibility: keyof typeof Visibility, nextShared: string[]) {
    setDraftVisibility(nextVisibility);
    setDraftShared(nextShared);
    startTransition(async () => {
      await onChange(nextVisibility, nextVisibility === "SELECTED" ? nextShared : []);
    });
    if (nextVisibility !== "SELECTED") setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        title={current.label}
        className="inline-flex items-center gap-1 rounded-full bg-ink/5 px-2 py-1 text-xs text-ink/60 transition hover:bg-maroon/10 hover:text-maroon disabled:opacity-50"
      >
        <Icon size={13} />
        <ChevronDown size={11} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-56 rounded-xl border border-ink/10 bg-white p-2 shadow-lg">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => commit(opt.value, draftShared)}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition ${
                draftVisibility === opt.value
                  ? "bg-maroon/10 text-maroon"
                  : "text-ink/70 hover:bg-ink/5"
              }`}
            >
              <opt.icon size={13} />
              {opt.label}
            </button>
          ))}

          {draftVisibility === "SELECTED" && (
            <div className="mt-1 max-h-40 overflow-y-auto border-t border-ink/10 pt-1">
              {allUsers.length === 0 && (
                <p className="px-2.5 py-1.5 text-xs text-ink/40">No one else yet.</p>
              )}
              {allUsers.map((u) => (
                <label
                  key={u.id}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-ink/70 hover:bg-ink/5"
                >
                  <input
                    type="checkbox"
                    checked={draftShared.includes(u.id)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...draftShared, u.id]
                        : draftShared.filter((id) => id !== u.id);
                      commit("SELECTED", next);
                    }}
                    className="accent-maroon"
                  />
                  {u.displayName ?? u.email}
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
