"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { removePushSubscriptionAction, savePushSubscriptionAction } from "@/lib/actions/guest-push-actions";
import type { Dict } from "@/lib/i18n";

type Status = "loading" | "hidden" | "unsupported" | "install-ios" | "denied" | "off" | "on" | "busy";

function keyToBytes(base64Url: string) {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const raw = atob((base64Url + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/**
 * Turn reminders on or off. "card" is the prompt on Home (shown only while it is
 * useful); "row" is the full control on the More page.
 */
export function PushSetup({
  publicKey,
  t,
  variant,
}: {
  publicKey: string | null;
  t: Dict;
  variant: "card" | "row";
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState(false);

  const detect = useCallback(async () => {
    if (!publicKey) return "hidden";
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    if (!supported) return ios && !standalone ? "install-ios" : "unsupported";
    if (Notification.permission === "denied") return "denied";
    if (Notification.permission === "granted") {
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        // Quietly re-save, so the server always has this phone's current details.
        await savePushSubscriptionAction(existing.toJSON() as Parameters<typeof savePushSubscriptionAction>[0]);
        return "on";
      }
    }
    return "off";
  }, [publicKey]);

  useEffect(() => {
    let cancelled = false;
    detect()
      .then((s) => !cancelled && setStatus(s as Status))
      .catch(() => !cancelled && setStatus("unsupported"));
    return () => {
      cancelled = true;
    };
  }, [detect]);

  async function turnOn() {
    setError(false);
    setStatus("busy");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return setStatus(permission === "denied" ? "denied" : "off");
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: keyToBytes(publicKey!),
        }));
      const result = await savePushSubscriptionAction(
        subscription.toJSON() as Parameters<typeof savePushSubscriptionAction>[0],
      );
      if (!result.ok) throw new Error("save failed");
      setStatus("on");
    } catch {
      setError(true);
      setStatus("off");
    }
  }

  async function turnOff() {
    setStatus("busy");
    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js");
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await removePushSubscriptionAction(subscription.endpoint);
        await subscription.unsubscribe();
      }
    } finally {
      setStatus("off");
    }
  }

  if (status === "loading" || status === "hidden") return null;

  const bigButton =
    "flex w-full items-center justify-center gap-2 rounded-2xl bg-maroon px-4 py-3.5 text-lg font-semibold text-ivory shadow-md active:scale-[0.98] disabled:opacity-60";

  // On Home, only prompt while there's something to do.
  if (variant === "card") {
    if (status !== "off" && status !== "busy" && status !== "install-ios") return null;
    return (
      <section className="rounded-3xl border-2 border-marigold bg-marigold/15 p-5 shadow-sm">
        <p className="flex items-center gap-2 text-xl font-semibold text-maroon">
          <Bell size={26} className="shrink-0" /> {t.push.cardTitle}
        </p>
        <p className="mt-1 text-ink/75">{status === "install-ios" ? t.push.installFirst : t.push.cardBody}</p>
        {status !== "install-ios" && (
          <button type="button" onClick={turnOn} disabled={status === "busy"} className={`${bigButton} mt-4`}>
            {status === "busy" ? t.push.working : t.push.turnOn}
          </button>
        )}
        {error && <p className="mt-2 text-red-700">{t.push.failed}</p>}
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {status === "on" && (
        <>
          <p className="flex items-center gap-2 text-lg font-semibold text-mehendi">
            <Bell size={22} /> {t.push.on}
          </p>
          <button
            type="button"
            onClick={turnOff}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-ink/15 bg-white px-4 py-3 text-lg text-ink/70 active:scale-[0.98]"
          >
            <BellOff size={20} /> {t.push.turnOff}
          </button>
        </>
      )}
      {(status === "off" || status === "busy") && (
        <>
          <p className="text-ink/70">{t.push.off}</p>
          <button type="button" onClick={turnOn} disabled={status === "busy"} className={bigButton}>
            <Bell size={22} /> {status === "busy" ? t.push.working : t.push.turnOn}
          </button>
        </>
      )}
      {status === "denied" && <p className="text-ink/75">{t.push.denied}</p>}
      {status === "install-ios" && <p className="text-ink/75">{t.push.installFirst}</p>}
      {status === "unsupported" && <p className="text-ink/75">{t.push.unsupported}</p>}
      {error && <p className="text-red-700">{t.push.failed}</p>}
    </div>
  );
}
