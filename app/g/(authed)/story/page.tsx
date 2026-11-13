import Image from "next/image";
import { getDict, pick } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { Divider } from "@/components/guest/Ornaments";

export default async function StoryPage() {
  const [{ locale, t }, chapters] = await Promise.all([
    getDict(),
    prisma.storyChapter.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-invite text-center text-4xl font-semibold text-maroon">{t.story.title}</h1>
      {chapters.length === 0 && (
        <p className="rounded-3xl bg-white/70 px-5 py-4 text-center text-ink/60">{t.story.empty}</p>
      )}
      {chapters.map((c, i) => (
        <article key={c.id} className="overflow-hidden rounded-3xl border border-marigold/40 bg-white/85 shadow-sm">
          {c.imageId && (
            <div className="relative aspect-[4/3] w-full bg-ivory">
              <Image src={`/api/images/${c.imageId}`} alt="" fill unoptimized sizes="512px" className="object-cover" />
            </div>
          )}
          <div className="p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mehendi">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h2 className="font-invite mt-1 text-3xl font-semibold leading-tight text-maroon">
              {pick(locale, c.title, c.titleHi)}
            </h2>
            <Divider className="my-3 h-5 w-40" />
            <p className="whitespace-pre-line text-lg text-ink/85">{pick(locale, c.body, c.bodyHi)}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
