import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { EventCard } from "@/components/itinerary/EventCard";
import { AddEventForm } from "@/components/itinerary/AddEventForm";

export default async function ItineraryPage() {
  const events = await prisma.eventItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { date: "asc" }],
    include: { scheduleEntries: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div>
      <PageHeader title="Itinerary" subtitle="Every event, venue, and run of show." />

      {events.length === 0 ? (
        <EmptyState title="No events yet" hint="Add your first event below." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={{
                id: event.id,
                name: event.name,
                date: event.date.toISOString(),
                venue: event.venue,
              }}
              scheduleEntries={event.scheduleEntries}
            />
          ))}
        </div>
      )}

      <div className="mt-5">
        <AddEventForm />
      </div>
    </div>
  );
}
