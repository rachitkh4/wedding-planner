import { getDict } from "@/lib/i18n";
import { getWeddingInfo } from "@/lib/guest-data";
import { HelpContactList } from "@/components/guest/HelpContactList";

export default async function GuestHelpPage() {
  const [{ t }, { helpContacts }] = await Promise.all([getDict(), getWeddingInfo()]);
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h1 className="font-invite text-4xl font-semibold text-maroon">{t.help.title}</h1>
        <p className="mt-1 text-lg text-ink/70">{t.help.subtitle}</p>
      </div>
      <HelpContactList contacts={helpContacts} labels={t.help} />
    </div>
  );
}
