"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { setLocaleAction } from "@/lib/actions/guest-auth-actions";
import type { Locale } from "@/lib/i18n";

export function LanguageToggle({
  locale,
  label,
  big = false,
}: {
  locale: Locale;
  label: string;
  big?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await setLocaleAction(locale === "hi" ? "en" : "hi");
          router.refresh();
        })
      }
      className={
        big
          ? "inline-flex items-center gap-2 rounded-full border-2 border-maroon/30 bg-white px-5 py-3 text-lg font-medium text-maroon shadow-sm active:scale-95 disabled:opacity-60"
          : "inline-flex items-center gap-1.5 rounded-full border border-maroon/25 bg-white/80 px-3 py-1.5 text-sm font-medium text-maroon active:scale-95 disabled:opacity-60"
      }
    >
      <Languages size={big ? 22 : 16} />
      {label}
    </button>
  );
}
