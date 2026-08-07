"use client";

import { Badge } from "@/components/ui/badge";
import {
  supportedFormats,
  type FormatCategoryKey,
} from "@/lib/document-center-mock-data";
import { useTranslation } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/types";

const formatCategoryKeys: Record<FormatCategoryKey, TranslationKey> = {
  images: "documentCenter.formatCategoryImages",
  documents: "documentCenter.formatCategoryDocuments",
  spreadsheets: "documentCenter.formatCategorySpreadsheets",
  presentations: "documentCenter.formatCategoryPresentations",
};

export function SupportedFormats() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-muted-foreground">
        {t("documentCenter.supportedFormatsTitle")}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {supportedFormats.map((group) => (
          <div
            key={group.categoryKey}
            className="rounded-xl border border-border/60 bg-card p-4"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t(formatCategoryKeys[group.categoryKey])}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {group.formats.map((format) => (
                <Badge
                  key={format}
                  variant="outline"
                  className={`border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${group.color}`}
                >
                  {format}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
