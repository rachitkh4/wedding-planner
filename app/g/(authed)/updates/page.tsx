import { getDict } from "@/lib/i18n";
import { requireGuest } from "@/lib/guest-session";
import { prisma } from "@/lib/prisma";
import { UpdateCard } from "@/components/guest/UpdateCard";
import { MarkUpdatesSeen } from "@/components/guest/MarkUpdatesSeen";

export default async function UpdatesPage() {
  const [guest, { locale, t }] = await Promise.all([requireGuest(), getDict()]);
  const items = await prisma.announcement.findMany({
    where: { sentAt: { not: null } },
    orderBy: { sentAt: "desc" },
    take: 60,
  });
  const seenUntil = guest.updatesSeenAt ?? guest.createdAt;

  return (
    <div className="flex flex-col gap-4">
      <MarkUpdatesSeen />
      <h1 className="font-invite text-center text-4xl font-semibold text-maroon">{t.updates.title}</h1>
      {items.length === 0 && (
        <p className="rounded-3xl bg-white/70 px-5 py-4 text-center text-ink/60">{t.updates.empty}</p>
      )}
      {items.map((a) => (
        <UpdateCard
          key={a.id}
          t={t}
          locale={locale}
          unread={a.sentAt! > seenUntil}
          item={{ ...a, sentAt: a.sentAt! }}
        />
      ))}
    </div>
  );
}
