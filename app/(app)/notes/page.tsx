import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/shared/Card";
import { EmptyState } from "@/components/shared/EmptyState";
import { NoteRow } from "@/components/notes/NoteRow";
import { AddNoteForm } from "@/components/notes/AddNoteForm";

export default async function NotesPage() {
  const session = await auth();
  const userId = session!.user.id;

  const notes = await prisma.note.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="My Notes"
        subtitle="Just for you — no one else in the workspace can see this."
      />

      <div className="mb-5">
        <AddNoteForm />
      </div>

      {notes.length === 0 ? (
        <EmptyState title="No personal notes yet" hint="Jot down a private reminder above." />
      ) : (
        <Card className="flex flex-col gap-1">
          {notes.map((note) => (
            <NoteRow key={note.id} note={note} />
          ))}
        </Card>
      )}
    </div>
  );
}
