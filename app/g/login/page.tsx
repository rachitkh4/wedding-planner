import Link from "next/link";
import { redirect } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getGuest } from "@/lib/guest-session";
import { getWeddingInfo } from "@/lib/guest-data";
import { loginGuestAction } from "@/lib/actions/guest-auth-actions";
import { AuthPageShell } from "@/components/guest/AuthPageShell";
import { GuestAuthForm } from "@/components/guest/GuestAuthForm";
import { HelpContactList } from "@/components/guest/HelpContactList";

export default async function GuestLoginPage() {
  if (await getGuest()) redirect("/g/home");
  const [{ locale, t }, { helpContacts }] = await Promise.all([getDict(), getWeddingInfo()]);

  return (
    <AuthPageShell
      locale={locale}
      switchLabel={t.switchTo}
      title={t.loginPage.title}
      subtitle={t.loginPage.subtitle}
    >
      <GuestAuthForm
        action={loginGuestAction}
        submitLabel={t.loginPage.submit}
        pendingLabel={t.join.submitting}
        fields={[
          { name: "phone", label: t.join.phone, placeholder: t.join.phonePlaceholder, kind: "phone" },
          { name: "pin", label: t.loginPage.pin, kind: "pin" },
        ]}
      />
      <p className="mt-8 text-center text-lg text-ink/70">
        {t.loginPage.noAccount}{" "}
        <Link href="/g/join" className="font-semibold text-maroon underline underline-offset-4">
          {t.join.submit}
        </Link>
      </p>
      {helpContacts.length > 0 && (
        <div className="mt-10">
          <p className="mb-3 text-ink/70">{t.loginPage.forgot}</p>
          <HelpContactList contacts={helpContacts} labels={t.help} />
        </div>
      )}
    </AuthPageShell>
  );
}
