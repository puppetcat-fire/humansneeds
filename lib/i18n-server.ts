import "server-only";

import { cookies } from "next/headers";

import { defaultLocale, localeCookieName, normalizeLocale } from "@/lib/i18n";

export async function getCurrentLocale() {
  const cookieStore = await cookies();
  const localeValue = cookieStore.get(localeCookieName)?.value;

  return normalizeLocale(localeValue ?? defaultLocale);
}

