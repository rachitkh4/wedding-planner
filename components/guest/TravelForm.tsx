"use client";

import { useActionState, useState } from "react";
import { Bus, Car, Ellipsis, Plane, TrainFront } from "lucide-react";
import type { TripFormState } from "@/lib/actions/guest-trip-actions";
import type { Dict } from "@/lib/i18n";
import { Stepper } from "./Stepper";

type Mode = "TRAIN" | "FLIGHT" | "BUS" | "CAR" | "OTHER";

const MODE_ICONS: Record<Mode, React.ComponentType<{ size?: number }>> = {
  TRAIN: TrainFront,
  FLIGHT: Plane,
  BUS: Bus,
  CAR: Car,
  OTHER: Ellipsis,
};
const MODES = Object.keys(MODE_ICONS) as Mode[];

export type TravelInitial = {
  mode: Mode | null;
  date: string;
  time: string;
  place: string;
  number: string;
  pnr: string;
  paxCount: number;
  note: string;
};

export function TravelForm({
  t,
  direction,
  action,
  initial,
}: {
  t: Dict;
  direction: "ARRIVAL" | "DEPARTURE";
  action: (prev: TripFormState, formData: FormData) => Promise<TripFormState>;
  initial: TravelInitial;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [v, setV] = useState(initial);
  const set = <K extends keyof TravelInitial>(key: K, value: TravelInitial[K]) =>
    setV((prev) => ({ ...prev, [key]: value }));

  const arriving = direction === "ARRIVAL";
  const mode = v.mode ?? "TRAIN";
  const input =
    "w-full rounded-2xl border-2 border-ink/15 bg-white px-4 py-3.5 text-xl text-ink outline-none placeholder:text-ink/35 focus:border-maroon";

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <fieldset>
        <legend className="mb-2 text-lg font-semibold text-ink">{t.travel.mode}</legend>
        <div className="grid grid-cols-3 gap-3">
          {MODES.map((m) => {
            const Icon = MODE_ICONS[m];
            const active = v.mode === m;
            return (
              <button
                key={m}
                type="button"
                aria-pressed={active}
                onClick={() => set("mode", m)}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-2 py-4 text-lg font-semibold active:scale-95 ${
                  active ? "border-maroon bg-maroon text-ivory" : "border-ink/15 bg-white text-ink"
                }`}
              >
                <Icon size={30} />
                {t.travel.modes[m]}
              </button>
            );
          })}
        </div>
        <input type="hidden" name="mode" value={v.mode ?? ""} />
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-lg font-semibold text-ink">
            {arriving ? t.travel.arrivalDate : t.travel.departureDate}
          </span>
          <input type="date" name="date" required value={v.date} onChange={(e) => set("date", e.target.value)} className={input} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-lg font-semibold text-ink">
            {arriving ? t.travel.arrivalTime : t.travel.departureTime}
          </span>
          <input type="time" name="time" required value={v.time} onChange={(e) => set("time", e.target.value)} className={input} />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-lg font-semibold text-ink">{t.travel.place[mode]}</span>
        <input
          name="place"
          value={v.place}
          onChange={(e) => set("place", e.target.value)}
          placeholder={arriving ? t.travel.placeArrivalHint : t.travel.placeDepartureHint}
          maxLength={80}
          className={input}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-lg font-semibold text-ink">{t.travel.number[mode]}</span>
        <input name="number" value={v.number} onChange={(e) => set("number", e.target.value)} maxLength={40} className={input} />
      </label>

      {(mode === "TRAIN" || mode === "FLIGHT" || mode === "BUS") && (
        <label className="flex flex-col gap-1.5">
          <span className="text-lg font-semibold text-ink">{t.travel.pnr}</span>
          <input
            name="pnr"
            value={v.pnr}
            onChange={(e) => set("pnr", e.target.value)}
            maxLength={30}
            autoCapitalize="characters"
            className={`${input} uppercase`}
          />
        </label>
      )}

      <section className="rounded-3xl border border-ink/10 bg-white/80 p-5">
        <p className="mb-4 text-center text-lg font-semibold text-ink">{t.travel.pax}</p>
        <Stepper
          name="paxCount"
          value={v.paxCount}
          max={50}
          onChange={(n) => set("paxCount", n)}
          minusLabel={t.rsvp.minus}
          plusLabel={t.rsvp.plus}
        />
      </section>

      <label className="flex flex-col gap-1.5">
        <span className="text-lg font-semibold text-ink">{t.travel.note}</span>
        <textarea name="note" rows={2} value={v.note} onChange={(e) => set("note", e.target.value)} maxLength={300} className={input} />
      </label>

      {state?.error && (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-lg text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-2xl bg-maroon px-6 py-4 text-xl font-semibold text-ivory shadow-md active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? t.trip.saving : t.trip.save}
      </button>
    </form>
  );
}
