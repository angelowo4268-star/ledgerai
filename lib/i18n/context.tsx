"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getDictionary, createTranslator } from "@/lib/i18n/translate";
import {
  applyDocumentLocale,
  getStoredLocale,
  saveLocale,
} from "@/lib/i18n/storage";
import type { SupportedLocale, TranslationKey } from "@/lib/i18n/types";

interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  ready: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>("zh-TW");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = getStoredLocale();
    setLocaleState(stored);
    applyDocumentLocale(stored);
    setReady(true);
  }, []);

  const setLocale = useCallback((next: SupportedLocale) => {
    setLocaleState(next);
    saveLocale(next);
    applyDocumentLocale(next);
  }, []);

  const t = useMemo(
    () => createTranslator(getDictionary(locale)),
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      ready,
    }),
    [locale, setLocale, t, ready]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within LanguageProvider");
  }
  return context;
}

export function useTranslation() {
  return useI18n();
}
