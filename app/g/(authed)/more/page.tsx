import { LogOut } from "lucide-react";
import { getDict } from "@/lib/i18n";
import { requireGuest } from "@/lib/guest-session";
import { formatPhone } from "@/lib/phone";
import { logoutGuestAction } from "@/lib/actions/guest-auth-actions";
import { LanguageToggle } from "@/components/guest/LanguageToggle";
import { InstallHelp } from "@/components/guest/InstallHelp";
import { PushSetup } from "@/components/guest/PushSetup";
import { ExploreTiles } from "@/components/guest/ExploreTiles";
import { vapidPublicKey } from "@/lib/push";

export default async function GuestMorePage() {
  const [guest, { locale, t }] = await Promise.all([requireGuest(), getDict()]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-invite text-center text-4xl font-semibold text-maroon">{t.more.title}</h1>

      <Section title={t.explore.title}>
        <ExploreTiles t={t} />
      </Section>

      <Section title={t.more.you}>
        <p className="text-xl font-semibold text-ink">{guest.name}</p>
        <p className="text-ink/60">{formatPhone(guest.phone)}</p>
      </Section>

      {vapidPublicKey() && (
        <Section title={t.push.sectionTitle}>
          <PushSetup publicKey={vapidPublicKey()} t={t} variant="row" />
        </Section>
      )}

      <Section title={t.more.language}>
        <LanguageToggle locale={locale} label={t.switchTo} big />
      </Section>

      <Section title={t.more.install}>
        <InstallHelp labels={t.more} />
      </Section>

      <form action={logoutGuestAction}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-ink/15 bg-white px-4 py-3.5 text-lg font-medium text-ink/70 active:scale-[0.98]"
        >
          <LogOut size={20} /> {t.more.logout}
        </button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-ink/10 bg-white/80 p-5 shadow-sm">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-mehendi">{title}</p>
      {children}
    </section>
  );
}
