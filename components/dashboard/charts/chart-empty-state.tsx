"use client";

import { BarChart3 } from "lucide-react";

import { useTranslation } from "@/lib/i18n/context";

interface ChartEmptyStateProps {
  messageKey:
    | "dashboard.noTrendData"
    | "dashboard.noCategoryData"
    | "dashboard.noVendorData";
}

export function ChartEmptyState({ messageKey }: ChartEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 px-4 text-center">
      <BarChart3 className="h-8 w-8 text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">{t(messageKey)}</p>
    </div>
  );
}
