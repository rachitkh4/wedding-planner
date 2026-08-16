import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { visibleToWhere } from "@/lib/visibility";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { PhaseCard } from "@/components/checklist/PhaseCard";
import { AddPhaseForm } from "@/components/checklist/AddPhaseForm";

export default async function ChecklistPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const mine = filter === "mine";

  const session = await auth();
  const userId = session!.user.id;
  const displayName = session!.user.displayName;

  const [phases, members] = await Promise.all([
    prisma.checklistPhase.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        tasks: {
          where: {
            AND: [visibleToWhere(userId), ...(mine ? [{ assignedTo: displayName }] : [])],
          },
          orderBy: { sortOrder: "asc" },
          include: { sharedWith: { select: { id: true } } },
        },
      },
    }),
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Checklist"
        subtitle="Your phased wedding planning to-do list."
        action={
          <div className="flex overflow-hidden rounded-lg border border-ink/10 text-sm">
            <Link
              href="/checklist"
              className={`px-3 py-1.5 ${!mine ? "bg-maroon text-ivory" : "bg-white text-ink/60"}`}
            >
              Everyone&apos;s tasks
            </Link>
            <Link
              href="/checklist?filter=mine"
              className={`px-3 py-1.5 ${mine ? "bg-maroon text-ivory" : "bg-white text-ink/60"}`}
            >
              Assigned to me
            </Link>
          </div>
        }
      />

      {phases.length === 0 ? (
        <EmptyState
          title="No checklist phases yet"
          hint="Add your first phase below to start planning."
        />
      ) : (
        <div className="flex flex-col gap-5">
          {phases.map((phase) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              tasks={phase.tasks}
              members={members}
              currentUserId={userId}
            />
          ))}
        </div>
      )}

      <div className="mt-5">
        <AddPhaseForm />
      </div>
    </div>
  );
}
