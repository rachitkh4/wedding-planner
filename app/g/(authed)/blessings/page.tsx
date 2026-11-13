import { getDict } from "@/lib/i18n";
import { requireGuest } from "@/lib/guest-session";
import { prisma } from "@/lib/prisma";
import { formatIstDate } from "@/lib/time";
import { BlessingForm } from "@/components/guest/BlessingForm";
import { RemoveBlessingButton } from "@/components/guest/RemoveBlessingButton";

export default async function BlessingsPage() {
  const [guest, { locale, t }] = await Promise.all([requireGuest(), getDict()]);
  const [meta, blessings, mine] = await Promise.all([
    prisma.weddingMeta.findFirst({ select: { hashtag: true } }),
    prisma.blessing.findMany({
      where: { OR: [{ hidden: false }, { accountId: guest.id }] },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.blessing.count({ where: { accountId: guest.id } }),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h1 className="font-invite text-4xl font-semibold text-maroon">{t.blessings.title}</h1>
        <p className="mt-1 text-lg text-ink/70">{t.blessings.subtitle}</p>
      </div>

      {mine < 3 ? (
        <BlessingForm key={mine} t={t} />
      ) : (
        <p className="rounded-3xl bg-white/80 px-5 py-4 text-center text-lg text-ink/75">{t.blessings.limit}</p>
      )}

      {meta?.hashtag && (
        <p className="text-center text-lg text-ink/70">
          {t.blessings.hashtag} <span className="font-semibold text-maroon">{meta.hashtag}</span>
        </p>
      )}

      {blessings.length === 0 && (
        <p className="rounded-3xl bg-white/70 px-5 py-4 text-center text-ink/60">{t.blessings.empty}</p>
      )}
      <ul className="flex flex-col gap-3">
        {blessings.map((b) => (
          <li
            key={b.id}
            className={`rounded-3xl border p-5 shadow-sm ${b.accountId === guest.id ? "border-marigold bg-marigold/10" : "border-ink/10 bg-white/85"}`}
          >
            <p className="font-invite whitespace-pre-line text-2xl leading-snug text-ink">&ldquo;{b.text}&rdquo;</p>
            <p className="mt-2 text-base text-ink/60">
              <span className="font-semibold text-maroon">{b.authorName}</span> · {formatIstDate(b.createdAt, locale)}
              {b.accountId === guest.id && ` · ${t.blessings.yours}`}
            </p>
            {b.accountId === guest.id && <RemoveBlessingButton id={b.id} label={t.blessings.remove} />}
          </li>
        ))}
      </ul>
    </div>
  );
}
