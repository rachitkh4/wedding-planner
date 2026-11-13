import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { getGuest } from "@/lib/guest-session";
import { getWeddingInfo } from "@/lib/guest-data";
import { formatEventDate } from "@/lib/time";
import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import { Divider, Kalash, Toran } from "@/components/guest/Ornaments";
import { LanguageToggle } from "@/components/guest/LanguageToggle";

export default async function InvitationPage() {
  const [{ locale, t }, guest, { meta, countdownTarget }] = await Promise.all([
    getDict(),
    getGuest(),
    getWeddingInfo(),
  ]);

  return (
    <main className="guest-paper flex min-h-screen flex-col">
      <Toran className="h-16 w-full" />

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-5 pb-10 text-center">
        <div className="mt-2 self-end">
          <LanguageToggle locale={locale} label={t.switchTo} big />
        </div>

        <Kalash className="mt-4 h-20 w-20" />
        <p className="mt-2 font-semibold tracking-wide text-maroon">{t.invocation}</p>

        {meta ? (
          <>
            <p className="mt-6 max-w-xs text-ink/75">{t.invitePre}</p>
            <h1 className="font-invite mt-5 text-5xl font-semibold leading-tight text-maroon">
              {meta.partner1Name}
            </h1>
            <p className="font-invite my-1 text-3xl italic text-marigold">{t.and}</p>
            <h1 className="font-invite text-5xl font-semibold leading-tight text-maroon">
              {meta.partner2Name}
            </h1>

            <Divider className="mt-7 h-6 w-56" />
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.25em] text-mehendi">
              {t.saveTheDate}
            </p>
            <p className="font-invite mt-1 text-3xl font-semibold text-ink">
              {formatEventDate(meta.weddingDate, locale)}
            </p>
            {meta.city && <p className="mt-1 text-xl text-ink/70">{meta.city}</p>}

            {countdownTarget && (
              <div className="mt-6 w-full rounded-3xl border border-marigold/40 bg-white/70 px-4 py-5 shadow-sm">
                <CountdownTimer
                  weddingDate={countdownTarget}
                  labels={t.countdown}
                  doneMessage={t.countdownDone}
                  className="flex justify-around"
                />
              </div>
            )}
          </>
        ) : (
          <p className="mt-10 text-ink/70">{t.notSetUp}</p>
        )}

        <div className="mt-8 flex w-full flex-col gap-3">
          {guest ? (
            <Link
              href="/g/home"
              className="rounded-2xl bg-maroon px-6 py-4 text-xl font-semibold text-ivory shadow-md active:scale-[0.98]"
            >
              {t.enter}
            </Link>
          ) : (
            <>
              <Link
                href="/g/join"
                className="rounded-2xl bg-maroon px-6 py-4 text-xl font-semibold text-ivory shadow-md active:scale-[0.98]"
              >
                {t.register}
              </Link>
              <Link
                href="/g/login"
                className="rounded-2xl border-2 border-maroon/30 bg-white px-6 py-4 text-lg font-medium text-maroon active:scale-[0.98]"
              >
                {t.login}
              </Link>
            </>
          )}
        </div>

        <Link href="/login" className="mt-auto pt-10 text-sm text-ink/40 underline-offset-4 hover:underline">
          {t.plannerLogin}
        </Link>
      </div>
    </main>
  );
}
