"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { uploadImageAction } from "@/lib/actions/image-actions";
import { resizeImage } from "@/lib/resize-image";

/** Pick a photo, shrink it in the browser, upload it, and hand back the new image id. */
export function PhotoUpload({
  value,
  onChange,
  label = "Add photo",
}: {
  value: string | null;
  onChange: (id: string | null) => void;
  label?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const blob = await resizeImage(file);
      const form = new FormData();
      form.set("file", new File([blob], "photo.jpg", { type: "image/jpeg" }));
      const result = await uploadImageAction(form);
      if (result.error) setError(result.error);
      else onChange(result.id ?? null);
    } catch {
      setError("Could not use that photo.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-ink/10">
          <Image src={`/api/images/${value}`} alt="" fill unoptimized className="object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove photo"
            className="absolute right-0.5 top-0.5 rounded-full bg-white/90 p-0.5 text-ink/60 hover:text-red-600"
          >
            <X size={12} />
          </button>
        </div>
      ) : null}
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-xs font-medium text-ink/70 hover:bg-ink/5 disabled:opacity-60"
      >
        <ImagePlus size={14} /> {busy ? "Uploading…" : value ? "Change photo" : label}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
