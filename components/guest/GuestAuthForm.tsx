"use client";

import { useActionState, useState } from "react";
import type { GuestFormState } from "@/lib/actions/guest-auth-actions";

type Field = {
  name: string;
  label: string;
  hint?: string;
  placeholder?: string;
  kind: "text" | "phone" | "pin";
};

/** Large, forgiving form used for both guest registration and login. */
export function GuestAuthForm({
  action,
  fields,
  submitLabel,
  pendingLabel,
}: {
  action: (prev: GuestFormState, formData: FormData) => Promise<GuestFormState>;
  fields: Field[];
  submitLabel: string;
  pendingLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  // Controlled inputs: React resets uncontrolled forms after an action, which
  // would wipe what the guest typed whenever we show an error.
  const [values, setValues] = useState<Record<string, string>>({});

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {fields.map((f) => (
        <label key={f.name} className="flex flex-col gap-1.5">
          <span className="text-lg font-semibold text-ink">{f.label}</span>
          <input
            name={f.name}
            value={values[f.name] ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
            required
            placeholder={f.placeholder}
            autoComplete={f.kind === "phone" ? "tel" : f.kind === "pin" ? "off" : "name"}
            type={f.kind === "pin" ? "password" : f.kind === "phone" ? "tel" : "text"}
            inputMode={f.kind === "text" ? "text" : "numeric"}
            maxLength={f.kind === "pin" ? 4 : f.kind === "phone" ? 16 : 80}
            pattern={f.kind === "pin" ? "\\d{4}" : undefined}
            className={`w-full rounded-2xl border-2 border-ink/15 bg-white px-4 py-3.5 text-xl text-ink outline-none placeholder:text-ink/35 focus:border-maroon ${
              f.kind === "pin" ? "tracking-[0.6em]" : ""
            }`}
          />
          {f.hint && <span className="text-base text-ink/60">{f.hint}</span>}
        </label>
      ))}

      {state?.error && (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-lg text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-2xl bg-maroon px-6 py-4 text-xl font-semibold text-ivory shadow-md active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
