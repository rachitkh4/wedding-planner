import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-white/60 p-8 shadow-sm">
        <h1 className="font-display text-3xl text-maroon">Shubh Vivah</h1>
        <p className="mt-1 text-sm text-ink/60">Sign in to the wedding workspace.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
