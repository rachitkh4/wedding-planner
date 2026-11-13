import Link from "next/link";
import { redirect } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getGuest } from "@/lib/guest-session";
import { registerGuestAction } from "@/lib/actions/guest-auth-actions";
import { AuthPageShell } from "@/components/guest/AuthPageShell";
import { GuestAuthForm } from "@/components/guest/GuestAuthForm";

export default async function JoinPage() {
  if (await getGuest()) redirect("/g/home");
  const { locale, t } = await getDict();

  return (
    <AuthPageShell locale={locale} switchLabel={t.switchTo} title={t.join.title} subtitle={t.join.subtitle}>
      <GuestAuthForm
        action={registerGuestAction}
        submitLabel={t.join.submit}
        pendingLabel={t.join.submitting}
        fields={[
          { name: "name", label: t.join.name, placeholder: t.join.namePlaceholder, kind: "text" },
          { name: "phone", label: t.join.phone, placeholder: t.join.phonePlaceholder, kind: "phone" },
          { name: "pin", label: t.join.pin, hint: t.join.pinHint, kind: "pin" },
          { name: "confirmPin", label: t.join.confirmPin, kind: "pin" },
        ]}
      />
      <p className="mt-8 text-center text-lg text-ink/70">
        {t.join.haveAccount}{" "}
        <Link href="/g/login" className="font-semibold text-maroon underline underline-offset-4">
          {t.loginPage.submit}
        </Link>
      </p>
    </AuthPageShell>
  );
}
