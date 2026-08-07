import {
  DEFAULT_LOCALE,
  type SupportedLocale,
  SUPPORTED_LOCALES,
} from "@/lib/i18n/types";

const STORAGE_KEY = "ledgerai-locale";

export function isSupportedLocale(value: string): value is SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale);
}

export function getStoredLocale(): SupportedLocale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored && isSupportedLocale(stored) ? stored : DEFAULT_LOCALE;
}

export function saveLocale(locale: SupportedLocale) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, locale);
}

export function applyDocumentLocale(locale: SupportedLocale) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.lang = locale;
}
