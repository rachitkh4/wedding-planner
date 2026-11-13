"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import {
  createStoryChapterAction,
  deleteStoryChapterAction,
  moveStoryChapterAction,
  updateStoryChapterAction,
} from "@/lib/actions/content-actions";
import { useDebouncedSave } from "@/lib/hooks/useDebouncedSave";
import { PhotoUpload } from "./PhotoUpload";

type Chapter = {
  id: string;
  title: string;
  titleHi: string;
  body: string;
  bodyHi: string;
  imageId: string | null;
};

const input =
  "w-full rounded-md border border-ink/10 bg-white px-2.5 py-1.5 text-sm text-ink outline-none focus:border-maroon";

export function StoryEditor({ chapters }: { chapters: Chapter[] }) {
  return (
    <div className="flex flex-col gap-4">
      {chapters.map((c, i) => (
        <ChapterRow key={c.id} chapter={c} first={i === 0} last={i === chapters.length - 1} />
      ))}
      {chapters.length === 0 && <p className="text-sm text-ink/40">No chapters yet. Add the first one below.</p>}
      <AddChapter />
    </div>
  );
}

function ChapterRow({ chapter, first, last }: { chapter: Chapter; first: boolean; last: boolean }) {
  const [v, setV] = useState(chapter);
  const [hindi, setHindi] = useState(!!(chapter.titleHi || chapter.bodyHi));
  const { trigger, status } = useDebouncedSave((patch: Parameters<typeof updateStoryChapterAction>[1]) =>
    updateStoryChapterAction(chapter.id, patch),
  );
  const set = (key: "title" | "titleHi" | "body" | "bodyHi", value: string) => {
    setV((prev) => ({ ...prev, [key]: value }));
    trigger({ [key]: value });
  };

  return (
    <div className="rounded-xl border border-ink/10 bg-white/60 p-3">
      <div className="flex items-start gap-2">
        <input value={v.title} onChange={(e) => set("title", e.target.value)} placeholder="Chapter title" className={`${input} font-medium`} />
        <div className="flex shrink-0 items-center">
          <button type="button" disabled={first} onClick={() => moveStoryChapterAction(chapter.id, "up")} className="rounded p-1.5 text-ink/40 hover:bg-ink/5 disabled:opacity-20" aria-label="Move up">
            <ArrowUp size={15} />
          </button>
          <button type="button" disabled={last} onClick={() => moveStoryChapterAction(chapter.id, "down")} className="rounded p-1.5 text-ink/40 hover:bg-ink/5 disabled:opacity-20" aria-label="Move down">
            <ArrowDown size={15} />
          </button>
          <button
            type="button"
            onClick={() => confirm(`Delete "${chapter.title}"?`) && deleteStoryChapterAction(chapter.id)}
            className="rounded p-1.5 text-ink/30 hover:bg-red-50 hover:text-red-500"
            aria-label="Delete chapter"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <textarea value={v.body} onChange={(e) => set("body", e.target.value)} rows={3} placeholder="The story…" className={`${input} mt-2`} />
      {hindi ? (
        <div className="mt-2 flex flex-col gap-2">
          <input value={v.titleHi} onChange={(e) => set("titleHi", e.target.value)} placeholder="शीर्षक (हिंदी)" className={input} />
          <textarea value={v.bodyHi} onChange={(e) => set("bodyHi", e.target.value)} rows={3} placeholder="कहानी (हिंदी)" className={input} />
        </div>
      ) : (
        <button type="button" onClick={() => setHindi(true)} className="mt-2 text-xs font-medium text-maroon hover:underline">
          + Hindi version
        </button>
      )}
      <div className="mt-3 flex items-center justify-between">
        <PhotoUpload value={v.imageId} onChange={(id) => { setV((p) => ({ ...p, imageId: id })); updateStoryChapterAction(chapter.id, { imageId: id }); }} />
        <span className="text-xs text-ink/40">{status === "saving" ? "Saving…" : status === "saved" ? "Saved ✓" : ""}</span>
      </div>
    </div>
  );
}

function AddChapter() {
  const [v, setV] = useState({ title: "", body: "", titleHi: "", bodyHi: "" });
  const [imageId, setImageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = await createStoryChapterAction({ ...v, imageId });
    if (result.error) return setError(result.error);
    setError(null);
    setV({ title: "", body: "", titleHi: "", bodyHi: "" });
    setImageId(null);
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-dashed border-ink/15 bg-white/40 p-3">
      <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink/70">
        <Plus size={15} /> Add a chapter
      </p>
      <input value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} placeholder="Title (e.g. How we met)" className={input} />
      <textarea value={v.body} onChange={(e) => setV({ ...v, body: e.target.value })} rows={3} placeholder="The story…" className={`${input} mt-2`} />
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <input value={v.titleHi} onChange={(e) => setV({ ...v, titleHi: e.target.value })} placeholder="शीर्षक (हिंदी, optional)" className={input} />
        <input value={v.bodyHi} onChange={(e) => setV({ ...v, bodyHi: e.target.value })} placeholder="कहानी (हिंदी, optional)" className={input} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <PhotoUpload value={imageId} onChange={setImageId} />
        <button type="submit" className="ml-auto rounded-lg bg-maroon px-3.5 py-2 text-sm font-medium text-ivory hover:bg-maroon/90">
          Add chapter
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </form>
  );
}
