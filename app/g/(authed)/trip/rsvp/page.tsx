import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDict } from "@/lib/i18n";
import { requireGuest } from "@/lib/guest-session";
import { prisma } from "@/lib/prisma";
import { RsvpForm } from "@/components/guest/RsvpForm";

export default async function RsvpPage() {
  const [guest, { t }] = await Promise.all([requireGuest(), getDict()]);
  const members = await prisma.guestMember.findMany({
    where: { accountId: guest.id },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="flex flex-col gap-5">
      <Link href="/g/trip" className="inline-flex w-fit items-center gap-1.5 text-lg font-medium text-maroon">
        <ArrowLeft size={22} /> {t.trip.back}
      </Link>
      <h1 className="font-invite text-4xl font-semibold text-maroon">{t.rsvp.title}</h1>
      <RsvpForm
        t={t}
        initial={{
          attending: guest.attending,
          partySize: guest.partySize,
          members: members.map((m) => m.name),
        }}
      />
    </div>
  );
}
