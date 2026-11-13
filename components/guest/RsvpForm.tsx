"use client";

import { useActionState, useState } from "react";
import { saveRsvpAction } from "@/lib/actions/guest-trip-actions";
import type { Dict } from "@/lib/i18n";
import { Stepper } from "./Stepper";

export function RsvpForm({
  t,
  initial,
}: {
  t: Dict;
  initial: { attending: boolean | null; partySize: number | null; members: string[] };
}) {
  const [state, formAction, pending] = useActionState(saveRsvpAction, undefined);
  const [attending, setAttending] = useState<boolean | null>(initial.attending);
  const [partySize, setPartySize] = useState(initial.partySize ?? 1);
  const [members, setMembers] = useState<string[]>(initial.members);

  const others = Math.max(0, partySize - 1);
  const names = Array.from({ length: others }, (_, i) => members[i] ?? "");

  const choice = (active: boolean, tone: "yes" | "no") =>
    `w-full rounded-2xl border-2 px-5 py-4 text-left text-xl font-semibold active:scale-[0.99] ${
      active
        ? tone === "yes"
          ? "border-mehendi bg-mehendi text-white"
          : "border-maroon bg-maroon text-ivory"
        : "border-ink/15 bg-white text-ink"
    }`;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-lg font-semibold text-ink">{t.rsvp.attendingQ}</legend>
        <button type="button" onClick={() => setAttending(true)} aria-pressed={attending === true} className={choice(attending === true, "yes")}>
          {t.rsvp.yes}
        </button>
        <button type="button" onClick={() => setAttending(false)} aria-pressed={attending === false} className={choice(attending === false, "no")}>
          {t.rsvp.no}
        </button>
        <input type="hidden" name="attending" value={attending === null ? "" : attending ? "yes" : "no"} />
      </fieldset>

      {attending === true && (
        <>
          <section className="rounded-3xl border border-ink/10 bg-white/80 p-5">
            <p className="mb-4 text-center text-lg font-semibold text-ink">{t.rsvp.howMany}</p>
            <Stepper
              name="partySize"
              value={partySize}
              max={20}
              onChange={setPartySize}
              minusLabel={t.rsvp.minus}
              plusLabel={t.rsvp.plus}
            />
          </section>

          {others > 0 && (
            <section className="flex flex-col gap-3">
              <p className="text-lg font-semibold text-ink">{t.rsvp.names}</p>
              {names.map((name, i) => (
                <input
                  key={i}
                  name="member"
                  value={name}
                  onChange={(e) => {
                    const next = [...names];
                    next[i] = e.target.value;
                    setMembers(next);
                  }}
                  placeholder={`${t.rsvp.nameN} ${i + 1}`}
                  maxLength={80}
                  autoComplete="off"
                  className="w-full rounded-2xl border-2 border-ink/15 bg-white px-4 py-3.5 text-xl text-ink outline-none placeholder:text-ink/35 focus:border-maroon"
                />
              ))}
            </section>
          )}
        </>
      )}

      {attending === false && <p className="rounded-2xl bg-white/80 px-4 py-3 text-lg text-ink/75">{t.rsvp.sorry}</p>}

      {state?.error && (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-lg text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || attending === null}
        className="rounded-2xl bg-maroon px-6 py-4 text-xl font-semibold text-ivory shadow-md active:scale-[0.98] disabled:opacity-50"
      >
        {pending ? t.trip.saving : t.trip.save}
      </button>
    </form>
  );
}
