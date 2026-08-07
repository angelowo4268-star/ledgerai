import type {
  SupportedLocale,
  TranslationDictionary,
  TranslationKey,
} from "@/lib/i18n/types";
import { en } from "@/lib/i18n/dictionaries/en";
import { zhTW } from "@/lib/i18n/dictionaries/zh-TW";

const dictionaries: Record<SupportedLocale, TranslationDictionary> = {
  "zh-TW": zhTW,
  en,
};

export function getDictionary(locale: SupportedLocale): TranslationDictionary {
  return dictionaries[locale];
}

export function createTranslator(dictionary: TranslationDictionary) {
  return function t(
    key: TranslationKey,
    params?: Record<string, string | number>
  ): string {
    const parts = key.split(".");
    let value: unknown = dictionary;

    for (const part of parts) {
      if (value && typeof value === "object" && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return key;
      }
    }

    if (typeof value !== "string") {
      return key;
    }

    if (!params) {
      return value;
    }

    return value.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
      String(params[name] ?? "")
    );
  };
}
