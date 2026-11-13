import { requireGuest, touchLastSeen } from "@/lib/guest-session";
import { getDict } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { BottomTabs } from "@/components/guest/BottomTabs";
import { LanguageToggle } from "@/components/guest/LanguageToggle";
import { MarigoldGarland } from "@/components/layout/MarigoldGarland";

export default async function GuestAppLayout({ children }: { children: React.ReactNode }) {
  const [guest, { locale, t }, meta] = await Promise.all([
    requireGuest(),
    getDict(),
    prisma.weddingMeta.findFirst({ select: { partner1Name: true, partner2Name: true } }),
  ]);

  await touchLastSeen(guest);

  return (
    <div className="guest-paper min-h-screen pb-28">
      <header className="sticky top-0 z-20 border-b border-maroon/10 bg-ivory/90 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-2.5">
          <div>
            <p className="font-invite text-2xl font-semibold leading-tight text-maroon">
              {meta ? `${meta.partner1Name} & ${meta.partner2Name}` : "Shubh Vivah"}
            </p>
            <MarigoldGarland className="h-2.5 w-28" />
          </div>
          <LanguageToggle locale={locale} label={t.switchTo} />
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 pt-5">{children}</main>
      <BottomTabs labels={t.tabs} />
    </div>
  );
}
