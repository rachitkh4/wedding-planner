"use client";

import { useState } from "react";
import { Check, Copy, Send, Trash2 } from "lucide-react";
import { deleteAnnouncementAction, sendAnnouncementNowAction } from "@/lib/actions/announcement-actions";

type Item = {
  id: string;
  title: string;
  body: string;
  auto: boolean;
  when: string;
  sent: boolean;
  sentCount: number;
  failedCount: number;
};

export function AnnouncementRow({ item }: { item: Item }) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <li className="flex flex-col gap-1 border-b border-ink/5 px-4 py-3 last:border-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="font-medium text-ink/90">{item.title}</p>
        {item.auto && <span className="rounded-full bg-marigold/20 px-2 py-0.5 text-xs font-medium text-ink/60">Auto</span>}
        <span className="ml-auto text-xs text-ink/50">{item.sent ? "Sent" : "Goes out"} {item.when}</span>
      </div>
      <p className="whitespace-pre-line text-sm text-ink/70">{item.body}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
        {item.sent && (
          <span className="text-ink/50">
            {item.sentCount} phone{item.sentCount === 1 ? "" : "s"} notified
            {item.failedCount > 0 && `, ${item.failedCount} failed`}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(`*${item.title}*\n${item.body}\n\n${window.location.origin}/`);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-ink/60 hover:bg-ink/5"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy for WhatsApp"}
          </button>
          {!item.sent && (
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                await sendAnnouncementNowAction(item.id);
                setBusy(false);
              }}
              className="inline-flex items-center gap-1 rounded-md bg-maroon/10 px-2 py-1 font-medium text-maroon hover:bg-maroon/15 disabled:opacity-60"
            >
              <Send size={13} /> Send now
            </button>
          )}
          {!(item.auto && !item.sent) && (
            <button
              type="button"
              onClick={() => {
                if (confirm(item.sent ? "Remove this from the guests' Updates list? Phones that already got it keep it." : "Delete this scheduled message?")) {
                  deleteAnnouncementAction(item.id);
                }
              }}
              className="rounded-md p-1 text-ink/30 hover:bg-red-50 hover:text-red-500"
              aria-label="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </span>
      </div>
    </li>
  );
}
