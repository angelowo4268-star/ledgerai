"use client";

import { Construction } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/types";

interface PlaceholderPageProps {
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
}

export function PlaceholderPage({
  titleKey,
  descriptionKey,
}: PlaceholderPageProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 animate-fade-in sm:py-24">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary sm:h-16 sm:w-16">
        <Construction className="h-7 w-7 text-primary sm:h-8 sm:w-8" />
      </div>

      <Badge
        variant="pending"
        className="mt-5 border border-violet-200 bg-violet-50 px-3 py-1 text-violet-700 sm:mt-6"
      >
        {t("placeholder.comingSoonBadge")}
      </Badge>

      <h1 className="mt-4 text-center text-xl font-bold tracking-tight sm:text-2xl">
        {t(titleKey)}
      </h1>
      <p className="mt-2 max-w-md text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
        {t(descriptionKey)}
      </p>
    </div>
  );
}
