"use client";

import { useActionState } from "react";
import { acceptInviteAction } from "@/lib/actions/auth-actions";

export function AcceptInviteForm({
  token,
  prefillEmail,
}: {
  token: string;
  prefillEmail: string | null;
}) {
  const action = acceptInviteAction.bind(null, token);
  const [error, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink/80">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={prefillEmail ?? ""}
          readOnly={!!prefillEmail}
          autoComplete="email"
          className="rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-ink outline-none read-only:bg-ink/5 focus:border-maroon focus:ring-2 focus:ring-maroon/20"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="displayName" className="text-sm font-medium text-ink/80">
          Your name
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          placeholder="e.g. Priya"
          className="rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-ink outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/20"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-ink/80">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-ink outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/20"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-ink/80">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-ink outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/20"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-maroon px-4 py-2.5 font-medium text-ivory transition hover:bg-maroon/90 disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Join the wedding workspace"}
      </button>
    </form>
  );
}
