import { MessageCircle, Phone } from "lucide-react";
import { formatPhone, normalizePhone, telHref, whatsappHref } from "@/lib/phone";

type Contact = { id: string; label: string; name: string; phone: string };

export function HelpContactList({
  contacts,
  labels,
}: {
  contacts: Contact[];
  labels: { call: string; whatsapp: string; empty: string };
}) {
  if (contacts.length === 0) {
    return <p className="rounded-2xl bg-white/70 px-4 py-4 text-ink/60">{labels.empty}</p>;
  }
  return (
    <ul className="flex flex-col gap-3">
      {contacts.map((c) => (
        <li key={c.id} className="rounded-3xl border border-ink/10 bg-white/80 p-4 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-mehendi">{c.label}</p>
          <p className="text-xl font-semibold text-ink">{c.name}</p>
          <p className="text-ink/60">{formatPhone(normalizePhone(c.phone) ?? c.phone)}</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <a
              href={telHref(c.phone)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-maroon px-4 py-3 text-lg font-semibold text-ivory active:scale-[0.98]"
            >
              <Phone size={20} /> {labels.call}
            </a>
            <a
              href={whatsappHref(c.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#1f8f4e] px-4 py-3 text-lg font-semibold text-white active:scale-[0.98]"
            >
              <MessageCircle size={20} /> {labels.whatsapp}
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
