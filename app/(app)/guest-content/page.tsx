import { prisma } from "@/lib/prisma";
import { formatIstDate } from "@/lib/time";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/shared/Card";
import { WordingEditor } from "@/components/content/WordingEditor";
import { StoryEditor } from "@/components/content/StoryEditor";
import { FamilyEditor } from "@/components/content/FamilyEditor";
import { BlessingModeration } from "@/components/content/BlessingModeration";

export default async function GuestContentPage() {
  const [meta, chapters, members, blessings] = await Promise.all([
    prisma.weddingMeta.findFirst(),
    prisma.storyChapter.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.familyMember.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.blessing.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
  ]);

  return (
    <div>
      <PageHeader
        title="Guest Content"
        subtitle="What guests read in the app: your invitation wording, your story, your families, and their blessings."
      />

      <div className="flex flex-col gap-6">
        <Card>
          <h2 className="font-display text-lg text-ink">Invitation wording</h2>
          <div className="mt-3">
            <WordingEditor
              initial={{
                hashtag: meta?.hashtag ?? "",
                invitationText: meta?.invitationText ?? "",
                invitationTextHi: meta?.invitationTextHi ?? "",
              }}
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg text-ink">Our story</h2>
          <p className="mt-1 text-xs text-ink/50">Short chapters with a photo each, shown in order on the guests&apos; Our Story page.</p>
          <div className="mt-3">
            <StoryEditor
              chapters={chapters.map((c) => ({
                id: c.id,
                title: c.title,
                titleHi: c.titleHi ?? "",
                body: c.body,
                bodyHi: c.bodyHi ?? "",
                imageId: c.imageId,
              }))}
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg text-ink">Meet the families</h2>
          <p className="mt-1 text-xs text-ink/50">So guests from both sides know who&apos;s who.</p>
          <div className="mt-3">
            <FamilyEditor
              members={members.map((m) => ({
                id: m.id,
                side: m.side === "BRIDE" ? "BRIDE" : "GROOM",
                name: m.name,
                nameHi: m.nameHi ?? "",
                relation: m.relation,
                relationHi: m.relationHi ?? "",
                imageId: m.imageId,
              }))}
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg text-ink">Blessings wall ({blessings.filter((b) => !b.hidden).length} shown)</h2>
          <p className="mt-1 text-xs text-ink/50">Written by guests. Hide anything you don&apos;t want everyone to see.</p>
          <div className="mt-2">
            <BlessingModeration
              items={blessings.map((b) => ({
                id: b.id,
                authorName: b.authorName,
                text: b.text,
                hidden: b.hidden,
                when: formatIstDate(b.createdAt, "en"),
              }))}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
