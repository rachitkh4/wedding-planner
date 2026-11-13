import webpush from "web-push";

export function vapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null;
}

export function pushConfigured() {
  return !!(vapidPublicKey() && process.env.VAPID_PRIVATE_KEY);
}

/**
 * The server POSTs to whatever endpoint a guest's browser gives it, so only the
 * real browser push services are accepted. Otherwise a guest could aim the
 * server at an internal address.
 */
const PUSH_HOSTS = [
  "fcm.googleapis.com", // Chrome, Edge, Samsung, Opera, Brave on Android and desktop
  "updates.push.services.mozilla.com", // Firefox
  "push.services.mozilla.com",
  "web.push.apple.com", // Safari / iPhone home-screen apps
  "push.apple.com",
  "notify.windows.com", // legacy Edge
];

export function isAllowedPushEndpoint(endpoint: string): boolean {
  if (endpoint.length > 1000) return false;
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.port || url.username || url.password) return false;
  const host = url.hostname.toLowerCase();
  return PUSH_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
}

export type PushTarget = { id: string; endpoint: string; p256dh: string; auth: string };

/**
 * Sends one payload to many subscriptions, a few at a time. Returns how many
 * were accepted and which subscriptions are gone for good (the phone
 * uninstalled the app or revoked permission), so they can be deleted.
 */
export async function sendPush(
  targets: PushTarget[],
  payload: (target: PushTarget) => object,
  options: { ttlSeconds: number },
) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? process.env.NEXTAUTH_URL ?? "https://example.com",
    vapidPublicKey()!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  let sent = 0;
  let failed = 0;
  const gone: string[] = [];
  const queue = [...targets];

  async function worker() {
    for (let t = queue.shift(); t; t = queue.shift()) {
      try {
        await webpush.sendNotification(
          { endpoint: t.endpoint, keys: { p256dh: t.p256dh, auth: t.auth } },
          JSON.stringify(payload(t)),
          { TTL: options.ttlSeconds, urgency: "high", timeout: 15_000 },
        );
        sent++;
      } catch (error) {
        failed++;
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) gone.push(t.id);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(20, targets.length) }, worker));
  return { sent, failed, gone };
}
