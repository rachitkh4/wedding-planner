"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

/** The one link to send to every guest, plus a ready-made WhatsApp message. */
export function ShareLinkCard({ couple }: { couple: string }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- window is only available after mount
  useEffect(() => setOrigin(window.location.origin), []);

  const link = origin ? `${origin}/` : "";
  const message =
    `🙏 Namaste!\n\nYou're warmly invited to the wedding of ${couple}. ` +
    `Open this link to see all the events, venues and updates, and to stay in touch with the family:\n\n${link}\n\n` +
    `🙏 नमस्ते! ${couple} के शुभ विवाह में आप सादर आमंत्रित हैं। सभी कार्यक्रम, स्थान और जानकारी के लिए यह लिंक खोलें:\n${link}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm">
        <code className="break-all text-ink/70">{link || "…"}</code>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="ml-auto inline-flex items-center gap-1 rounded-md bg-ink/5 px-2 py-1 text-xs font-medium text-ink/70 hover:bg-maroon/10 hover:text-maroon"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#1f8f4e] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
      >
        <Share2 size={16} /> Share on WhatsApp
      </a>
      <p className="text-xs text-ink/50">
        Everyone gets the same link. First time, they enter their name, mobile and a 4-digit PIN.
      </p>
    </div>
  );
}
