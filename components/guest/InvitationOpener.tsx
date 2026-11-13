"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FallingPetals } from "./FallingPetals";
import { OPENED_KEY, prefersReducedMotion, readFlag, setFlag, subscribeFlags } from "@/lib/invite-flags";

type Labels = { tapToOpen: string; skip: string };

/**
 * Full-screen envelope shown the first time a guest opens the link. Tap to open
 * (seal pops, flap lifts, petals fall) and it fades into the invitation. Played
 * once per phone; "Skip" is always available.
 */
export function InvitationOpener({
  monogram,
  coupleLine,
  labels,
  languageToggle,
}: {
  monogram: string;
  coupleLine: string;
  labels: Labels;
  languageToggle: React.ReactNode;
}) {
  // null on the server and during hydration → show a plain cover, never a flash of the invitation.
  const opened = useSyncExternalStore<boolean | null>(subscribeFlags, () => readFlag(OPENED_KEY), () => null);
  const [phase, setPhase] = useState<"closed" | "opening" | "leaving">("closed");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  if (opened === true) return null;
  if (opened === null) return <div className="invite-cover" aria-hidden="true" />;

  function finish() {
    setPhase("leaving");
    timers.current.push(setTimeout(() => setFlag(OPENED_KEY, true), prefersReducedMotion() ? 0 : 500));
  }

  function open() {
    if (phase !== "closed") return;
    if (prefersReducedMotion()) return finish();
    setPhase("opening");
    timers.current.push(setTimeout(finish, 1900));
  }

  return (
    <div
      className={`invite-cover invite-overlay ${phase === "leaving" ? "leaving" : ""} ${phase !== "closed" ? "opening" : ""} guest-paper flex flex-col items-center`}
      role="dialog"
      aria-label="Invitation"
    >
      <FallingPetals />

      <div className="relative z-10 flex w-full items-center justify-between px-4 pt-4">
        {languageToggle}
        <button
          type="button"
          onClick={finish}
          className="rounded-full px-4 py-2 text-lg font-medium text-ink/60 underline-offset-4 active:scale-95"
        >
          {labels.skip}
        </button>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-10 px-4 pb-16">
        <button
          type="button"
          onClick={open}
          aria-label={labels.tapToOpen}
          className="env block cursor-pointer border-0 bg-transparent p-0 outline-none"
        >
          <div className="env-back" />
          <div className="env-letter">
            <p className="font-invite text-2xl font-semibold leading-tight text-maroon">{coupleLine}</p>
            <span className="mt-1 block h-px w-16 bg-marigold" />
          </div>
          <div className="env-front-l" />
          <div className="env-front-r" />
          <div className="env-front-b" />
          <div className="env-flap" />
          <span className="env-seal">{monogram}</span>
        </button>

        <p
          className={`font-invite text-3xl font-semibold text-maroon transition-opacity ${phase === "closed" ? "animate-pulse" : "opacity-0"}`}
        >
          {labels.tapToOpen}
        </p>
      </div>
    </div>
  );
}
