import { OnboardingNameForm } from "@/components/auth/OnboardingNameForm";

export default function OnboardingNamePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-white/60 p-8 shadow-sm">
        <h1 className="font-display text-3xl text-maroon">Welcome!</h1>
        <p className="mt-1 text-sm text-ink/60">
          One quick thing before you dive in — what should we call you?
        </p>
        <div className="mt-6">
          <OnboardingNameForm />
        </div>
      </div>
    </main>
  );
}
