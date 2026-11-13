import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Toran } from "./Ornaments";
import { LanguageToggle } from "./LanguageToggle";
import type { Locale } from "@/lib/i18n";

export function AuthPageShell({
  locale,
  switchLabel,
  title,
  subtitle,
  children,
}: {
  locale: Locale;
  switchLabel: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="guest-paper min-h-screen">
      <Toran className="h-14 w-full" />
      <div className="mx-auto w-full max-w-md px-5 pb-12">
        <div className="mt-1 flex items-center justify-between">
          <Link href="/g" aria-label="Back" className="rounded-full p-2 text-maroon active:bg-maroon/10">
            <ArrowLeft size={28} />
          </Link>
          <LanguageToggle locale={locale} label={switchLabel} />
        </div>
        <h1 className="font-invite mt-4 text-4xl font-semibold text-maroon">{title}</h1>
        <p className="mt-1 text-lg text-ink/70">{subtitle}</p>
        <div className="mt-7">{children}</div>
      </div>
    </main>
  );
}
