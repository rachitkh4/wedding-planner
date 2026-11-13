"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void> };

/** Android: native install button when the browser offers one. iPhone: Safari steps. */
export function InstallHelp({
  labels,
}: {
  labels: { installAndroid: string; installIos: string; installOther: string; installed: string };
}) {
  const [mode, setMode] = useState<"loading" | "installed" | "ios" | "other">("loading");
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser-only state once on mount
    setMode(standalone ? "installed" : ios ? "ios" : "other");

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (mode === "loading") return null;
  if (mode === "installed") return <p className="text-ink/70">✅ {labels.installed}</p>;

  return (
    <div className="flex flex-col gap-3">
      {prompt && (
        <button
          type="button"
          onClick={async () => {
            await prompt.prompt();
            setPrompt(null);
          }}
          className="flex items-center justify-center gap-2 rounded-2xl bg-maroon px-4 py-3.5 text-lg font-semibold text-ivory active:scale-[0.98]"
        >
          <Download size={22} /> {labels.installAndroid}
        </button>
      )}
      <p className="text-ink/75">{mode === "ios" ? labels.installIos : labels.installOther}</p>
    </div>
  );
}
