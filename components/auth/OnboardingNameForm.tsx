"use client";

import { useActionState } from "react";
import { setDisplayNameAction } from "@/lib/actions/auth-actions";

export function OnboardingNameForm() {
  const [error, formAction, pending] = useActionState(setDisplayNameAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="displayName" className="text-sm font-medium text-ink/80">
          What should we call you?
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          placeholder="e.g. Priya"
          autoFocus
          className="rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-ink outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/20"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-maroon px-4 py-2.5 font-medium text-ivory transition hover:bg-maroon/90 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
