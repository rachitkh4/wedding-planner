/**
 * Remembers, per phone, that the guest has already opened the envelope and
 * revealed the date, so the animation only plays once. Reads are wrapped because
 * storage can be blocked (private mode); then the animation simply plays each time.
 */
export const OPENED_KEY = "invite-opened";
export const REVEALED_KEY = "invite-revealed";
const CHANGE_EVENT = "invite-flags-change";

export function subscribeFlags(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

export function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

export function setFlag(key: string, value: boolean) {
  try {
    if (value) localStorage.setItem(key, "1");
    else localStorage.removeItem(key);
  } catch {
    /* storage blocked: nothing to remember */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
