"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SidebarNav } from "./SidebarNav";
import { MarigoldGarland } from "./MarigoldGarland";
import { LogoutButton } from "./LogoutButton";

export function AppShell({
  displayName,
  children,
}: {
  displayName: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-ivory">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink/10 bg-white/50 md:flex">
        <SidebarHeader displayName={displayName} />
        <SidebarNav />
        <div className="border-t border-ink/10 p-3">
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-ink/10 bg-ivory/95 px-4 py-3 backdrop-blur md:hidden">
        <span className="font-display text-xl text-maroon">Shubh Vivah</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-2 text-ink/70 hover:bg-maroon/8"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-ivory shadow-xl">
            <div className="flex items-center justify-between px-4 pt-4">
              <SidebarHeader displayName={displayName} compact />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-2 text-ink/60 hover:bg-maroon/8"
              >
                <X size={20} />
              </button>
            </div>
            <SidebarNav onNavigate={() => setOpen(false)} />
            <div className="border-t border-ink/10 p-3">
              <LogoutButton />
            </div>
          </aside>
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 pt-20 pb-10 md:px-10 md:pt-10">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

function SidebarHeader({
  displayName,
  compact = false,
}: {
  displayName: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "" : "px-5 pt-6"}>
      <span className="font-display text-2xl text-maroon">Shubh Vivah</span>
      <MarigoldGarland className="mt-2 h-3 w-32" />
      <p className="mt-3 text-xs text-ink/50">Signed in as {displayName}</p>
    </div>
  );
}
