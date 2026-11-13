"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import {
  createFamilyMemberAction,
  deleteFamilyMemberAction,
  moveFamilyMemberAction,
  updateFamilyMemberAction,
} from "@/lib/actions/content-actions";
import { useDebouncedSave } from "@/lib/hooks/useDebouncedSave";
import { PhotoUpload } from "./PhotoUpload";

type Member = {
  id: string;
  side: "BRIDE" | "GROOM";
  name: string;
  nameHi: string;
  relation: string;
  relationHi: string;
  imageId: string | null;
};

const input =
  "min-w-0 flex-1 rounded-md border border-ink/10 bg-white px-2.5 py-1.5 text-sm text-ink outline-none focus:border-maroon";

export function FamilyEditor({ members }: { members: Member[] }) {
  const [side, setSide] = useState<"BRIDE" | "GROOM">("GROOM");
  const list = members.filter((m) => m.side === side);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {(["GROOM", "BRIDE"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSide(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              side === s ? "bg-maroon text-ivory" : "bg-white text-ink/60 hover:bg-maroon/10 hover:text-maroon"
            }`}
          >
            {s === "GROOM" ? "Groom's family" : "Bride's family"} ({members.filter((m) => m.side === s).length})
          </button>
        ))}
      </div>
      {list.map((m, i) => (
        <MemberRow key={m.id} member={m} first={i === 0} last={i === list.length - 1} />
      ))}
      {list.length === 0 && <p className="text-sm text-ink/40">Nobody added to this side yet.</p>}
      <AddMember side={side} />
    </div>
  );
}

function MemberRow({ member, first, last }: { member: Member; first: boolean; last: boolean }) {
  const [v, setV] = useState(member);
  const { trigger } = useDebouncedSave((patch: Parameters<typeof updateFamilyMemberAction>[1]) =>
    updateFamilyMemberAction(member.id, patch),
  );
  const set = (key: "name" | "nameHi" | "relation" | "relationHi", value: string) => {
    setV((p) => ({ ...p, [key]: value }));
    trigger({ [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-ink/10 bg-white/60 p-2.5">
      <PhotoUpload
        value={v.imageId}
        label="Photo"
        onChange={(id) => {
          setV((p) => ({ ...p, imageId: id }));
          updateFamilyMemberAction(member.id, { imageId: id });
        }}
      />
      <div className="grid min-w-60 flex-1 gap-1.5 sm:grid-cols-2">
        <input value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="Name" className={input} />
        <input value={v.relation} onChange={(e) => set("relation", e.target.value)} placeholder="Relation (e.g. Father of the groom)" className={input} />
        <input value={v.nameHi} onChange={(e) => set("nameHi", e.target.value)} placeholder="नाम (हिंदी, optional)" className={input} />
        <input value={v.relationHi} onChange={(e) => set("relationHi", e.target.value)} placeholder="रिश्ता (हिंदी, optional)" className={input} />
      </div>
      <div className="flex shrink-0 items-center">
        <button type="button" disabled={first} onClick={() => moveFamilyMemberAction(member.id, "up")} className="rounded p-1.5 text-ink/40 hover:bg-ink/5 disabled:opacity-20" aria-label="Move up">
          <ArrowUp size={15} />
        </button>
        <button type="button" disabled={last} onClick={() => moveFamilyMemberAction(member.id, "down")} className="rounded p-1.5 text-ink/40 hover:bg-ink/5 disabled:opacity-20" aria-label="Move down">
          <ArrowDown size={15} />
        </button>
        <button
          type="button"
          onClick={() => confirm(`Remove ${member.name}?`) && deleteFamilyMemberAction(member.id)}
          className="rounded p-1.5 text-ink/30 hover:bg-red-50 hover:text-red-500"
          aria-label={`Remove ${member.name}`}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function AddMember({ side }: { side: "BRIDE" | "GROOM" }) {
  const [v, setV] = useState({ name: "", relation: "", nameHi: "", relationHi: "" });
  const [imageId, setImageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = await createFamilyMemberAction({ side, ...v, imageId });
    if (result.error) return setError(result.error);
    setError(null);
    setV({ name: "", relation: "", nameHi: "", relationHi: "" });
    setImageId(null);
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-ink/15 bg-white/40 p-2.5">
      <Plus size={15} className="shrink-0 text-ink/40" />
      <PhotoUpload value={imageId} onChange={setImageId} label="Photo" />
      <input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder="Name" className={input} />
      <input value={v.relation} onChange={(e) => setV({ ...v, relation: e.target.value })} placeholder="Relation" className={input} />
      <input value={v.nameHi} onChange={(e) => setV({ ...v, nameHi: e.target.value })} placeholder="नाम (हिंदी)" className={input} />
      <input value={v.relationHi} onChange={(e) => setV({ ...v, relationHi: e.target.value })} placeholder="रिश्ता (हिंदी)" className={input} />
      <button type="submit" className="rounded-lg bg-maroon/10 px-3 py-1.5 text-xs font-medium text-maroon hover:bg-maroon/15">
        Add
      </button>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </form>
  );
}
