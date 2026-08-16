"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth-actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink/60 transition hover:bg-maroon/5 hover:text-maroon"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </form>
  );
}
