"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Plus } from "lucide-react";
import { createInviteAction } from "@/lib/actions/auth-actions";

export function CreateInviteButton({ canInviteAsCouple }: { canInviteAsCouple: boolean }) {
  const [pending, startTransition] = useTransition();
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [asCouple, setAsCouple] = useState(false);

  function handleCreate() {
    startTransition(async () => {
      const token = await createInviteAction(asCouple ? "COUPLE" : "FAMILY");
      setLink(`${window.location.origin}/invite/${token}`);
      setCopied(false);
    });
  }

  function handleCopy() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-3">
      {canInviteAsCouple && (
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={asCouple}
            onChange={(e) => setAsCouple(e.target.checked)}
            className="h-4 w-4 accent-maroon"
          />
          This is my partner — give full edit access to wedding details
        </label>
      )}
      <button
        type="button"
        onClick={handleCreate}
        disabled={pending}
        className="inline-flex w-fit items-center gap-2 rounded-lg bg-maroon px-4 py-2.5 text-sm font-medium text-ivory transition hover:bg-maroon/90 disabled:opacity-60"
      >
        <Plus size={16} />
        {pending ? "Creating link…" : "Create invite link"}
      </button>

      {link && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm">
          <code className="break-all text-ink/70">{link}</code>
          <button
            type="button"
            onClick={handleCopy}
            className="ml-auto inline-flex items-center gap-1 rounded-md bg-ink/5 px-2 py-1 text-xs font-medium text-ink/70 hover:bg-maroon/10 hover:text-maroon"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
      <p className="text-xs text-ink/50">Expires in 7 days. Share it over WhatsApp, email, etc.</p>
    </div>
  );
}
