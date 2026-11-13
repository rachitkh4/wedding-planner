import { cookies } from "next/headers";
import { en } from "./en";
import { hi } from "./hi";

export type Locale = "en" | "hi";
export type Dict = typeof en;

export const LOCALE_COOKIE = "lang";
const dictionaries: Record<Locale, Dict> = { en, hi };

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return value === "hi" ? "hi" : "en";
}

export async function getDict(): Promise<{ locale: Locale; t: Dict }> {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}

/** Pick the Hindi variant of a piece of content when it exists. */
export function pick(locale: Locale, en: string, hi?: string | null) {
  return locale === "hi" && hi ? hi : en;
}
