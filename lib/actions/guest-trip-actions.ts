"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireGuest } from "@/lib/guest-session";
import { getDict } from "@/lib/i18n";
import { parseISTDateTime } from "@/lib/time";
import type { TravelDirection, TravelMode } from "@/generated/prisma/enums";

export type TripFormState = { error?: string; saved?: boolean } | undefined;

const MODES: TravelMode[] = ["TRAIN", "FLIGHT", "BUS", "CAR", "OTHER"];

function refreshPlannerPages() {
  revalidatePath("/arrivals");
  revalidatePath("/stay");
  revalidatePath("/guest-app");
  revalidatePath("/guests");
  revalidatePath("/dashboard");
}

function text(formData: FormData, key: string, max: number): string | null {
  const value = String(formData.get(key) ?? "").trim().replace(/\s+/g, " ");
  return value ? value.slice(0, max) : null;
}

export async function saveRsvpAction(
  _prev: TripFormState,
  formData: FormData,
): Promise<TripFormState> {
  const [guest, { t }] = await Promise.all([requireGuest(), getDict()]);

  const answer = String(formData.get("attending") ?? "");
  if (answer !== "yes" && answer !== "no") return { error: t.rsvp.errorAnswer };
  const attending = answer === "yes";

  let partySize: number | null = null;
  let members: string[] = [];
  if (attending) {
    partySize = Number(formData.get("partySize"));
    if (!Number.isInteger(partySize) || partySize < 1 || partySize > 20) {
      return { error: t.rsvp.errorPeople };
    }
    members = formData
      .getAll("member")
      .map((m) => String(m).trim().replace(/\s+/g, " ").slice(0, 80))
      .slice(0, partySize - 1);
    if (members.length !== partySize - 1 || members.some((m) => !m)) {
      return { error: t.rsvp.errorNames };
    }
  }

  await prisma.$transaction([
    prisma.guestMember.deleteMany({ where: { accountId: guest.id } }),
    prisma.guestAccount.update({
      where: { id: guest.id },
      data: {
        attending,
        partySize,
        rsvpAt: new Date(),
        members: { create: members.map((name, sortOrder) => ({ name, sortOrder })) },
      },
    }),
    // Keep the planner's Guest List in step so the Dashboard and Guests numbers stay right.
    ...(guest.guestId
      ? [
          prisma.guest.update({
            where: { id: guest.guestId },
            data: {
              rsvpStatus: attending ? "CONFIRMED" : "DECLINED",
              ...(attending && partySize ? { headcount: partySize } : {}),
            },
          }),
        ]
      : []),
  ]);

  refreshPlannerPages();
  revalidatePath("/g", "layout");
  redirect("/g/trip");
}

export async function saveTravelAction(
  direction: TravelDirection,
  _prev: TripFormState,
  formData: FormData,
): Promise<TripFormState> {
  const [guest, { t }] = await Promise.all([requireGuest(), getDict()]);
  if (direction !== "ARRIVAL" && direction !== "DEPARTURE") throw new Error("Bad direction");

  const mode = String(formData.get("mode") ?? "") as TravelMode;
  if (!MODES.includes(mode)) return { error: t.travel.errorMode };

  const dateTime = parseISTDateTime(
    String(formData.get("date") ?? ""),
    String(formData.get("time") ?? ""),
  );
  if (!dateTime) return { error: t.travel.errorDateTime };

  const paxCount = Number(formData.get("paxCount"));
  if (!Number.isInteger(paxCount) || paxCount < 1 || paxCount > 50) {
    return { error: t.travel.errorPax };
  }

  const data = {
    mode,
    dateTime,
    paxCount,
    place: text(formData, "place", 80),
    number: text(formData, "number", 40),
    pnr: text(formData, "pnr", 30)?.toUpperCase() ?? null,
    note: text(formData, "note", 300),
  };

  await prisma.travelLeg.upsert({
    where: { accountId_direction: { accountId: guest.id, direction } },
    create: { accountId: guest.id, direction, ...data },
    update: data,
  });

  refreshPlannerPages();
  redirect("/g/trip");
}

export async function removeTravelAction(direction: TravelDirection) {
  const guest = await requireGuest();
  await prisma.travelLeg.deleteMany({ where: { accountId: guest.id, direction } });
  refreshPlannerPages();
  redirect("/g/trip");
}
