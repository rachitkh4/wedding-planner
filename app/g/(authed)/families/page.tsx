import Image from "next/image";
import { getDict, pick } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export default async function FamiliesPage() {
  const [{ locale, t }, members] = await Promise.all([
    getDict(),
    prisma.familyMember.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  const sides = [
    { key: "GROOM" as const, title: t.families.groom },
    { key: "BRIDE" as const, title: t.families.bride },
  ].filter((s) => members.some((m) => m.side === s.key));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-invite text-center text-4xl font-semibold text-maroon">{t.families.title}</h1>
      {members.length === 0 && (
        <p className="rounded-3xl bg-white/70 px-5 py-4 text-center text-ink/60">{t.families.empty}</p>
      )}
      {sides.map((side) => (
        <section key={side.key}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-mehendi">{side.title}</h2>
          <ul className="flex flex-col gap-3">
            {members
              .filter((m) => m.side === side.key)
              .map((m) => {
                const name = pick(locale, m.name, m.nameHi);
                return (
                  <li key={m.id} className="flex items-center gap-4 rounded-3xl border border-marigold/40 bg-white/85 p-3 shadow-sm">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-marigold/60 bg-ivory">
                      {m.imageId ? (
                        <Image src={`/api/images/${m.imageId}`} alt="" fill unoptimized sizes="80px" className="object-cover" />
                      ) : (
                        <span className="font-invite flex h-full w-full items-center justify-center text-3xl font-semibold text-maroon">
                          {name.trim().charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-invite text-2xl font-semibold leading-tight text-maroon">{name}</p>
                      <p className="text-lg text-ink/70">{pick(locale, m.relation, m.relationHi)}</p>
                    </div>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}
