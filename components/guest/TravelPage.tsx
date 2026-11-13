import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDict } from "@/lib/i18n";
import { requireGuest } from "@/lib/guest-session";
import { prisma } from "@/lib/prisma";
import { istHm, istYmd } from "@/lib/time";
import { removeTravelAction, saveTravelAction } from "@/lib/actions/guest-trip-actions";
import { TravelForm } from "@/components/guest/TravelForm";

/** Shared by the arrival and departure pages. */
export async function TravelPage({ direction }: { direction: "ARRIVAL" | "DEPARTURE" }) {
  const [guest, { t }] = await Promise.all([requireGuest(), getDict()]);
  const leg = await prisma.travelLeg.findUnique({
    where: { accountId_direction: { accountId: guest.id, direction } },
  });
  const arriving = direction === "ARRIVAL";

  return (
    <div className="flex flex-col gap-5">
      <Link href="/g/trip" className="inline-flex w-fit items-center gap-1.5 text-lg font-medium text-maroon">
        <ArrowLeft size={22} /> {t.trip.back}
      </Link>
      <h1 className="font-invite text-4xl font-semibold text-maroon">
        {arriving ? t.travel.arrivalTitle : t.travel.departureTitle}
      </h1>

      {guest.attending === false ? (
        <p className="rounded-2xl bg-white/80 px-4 py-3 text-lg text-ink/75">{t.travel.notComing}</p>
      ) : (
        <>
          <TravelForm
            t={t}
            direction={direction}
            action={saveTravelAction.bind(null, direction)}
            initial={{
              mode: leg?.mode ?? null,
              date: leg ? istYmd(leg.dateTime) : "",
              time: leg ? istHm(leg.dateTime) : "",
              place: leg?.place ?? "",
              number: leg?.number ?? "",
              pnr: leg?.pnr ?? "",
              paxCount: leg?.paxCount ?? guest.partySize ?? 1,
              note: leg?.note ?? "",
            }}
          />
          {leg && (
            <form action={removeTravelAction.bind(null, direction)}>
              <button type="submit" className="w-full rounded-2xl border-2 border-ink/15 bg-white px-4 py-3 text-lg text-ink/60 active:scale-[0.98]">
                {t.travel.remove}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
