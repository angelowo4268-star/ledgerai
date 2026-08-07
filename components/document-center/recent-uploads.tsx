"use client";

import {
  FileSpreadsheet,
  FileText,
  Receipt,
  ScrollText,
  Sheet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  recentUploads,
  type DocumentPreviewType,
  type RecentUpload,
} from "@/lib/document-center-mock-data";
import { useTranslation } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/types";

const typeConfig: Record<
  DocumentPreviewType,
  { labelKey: TranslationKey; icon: typeof FileText; color: string }
> = {
  invoice: {
    labelKey: "documentCenter.docTypeInvoice",
    icon: FileText,
    color: "text-violet-600 bg-violet-50",
  },
  receipt: {
    labelKey: "documentCenter.docTypeReceipt",
    icon: Receipt,
    color: "text-sky-600 bg-sky-50",
  },
  spreadsheet: {
    labelKey: "documentCenter.docTypeSpreadsheet",
    icon: FileSpreadsheet,
    color: "text-emerald-600 bg-emerald-50",
  },
  word: {
    labelKey: "documentCenter.docTypeWord",
    icon: Sheet,
    color: "text-indigo-600 bg-indigo-50",
  },
  contract: {
    labelKey: "documentCenter.docTypeContract",
    icon: ScrollText,
    color: "text-amber-600 bg-amber-50",
  },
};

const statusClassNames = {
  ready: "bg-emerald-50 text-emerald-700",
  processing: "bg-violet-50 text-violet-700",
  failed: "bg-red-50 text-red-700",
} as const;

interface RecentUploadsProps {
  selectedId: string;
  onSelect: (upload: RecentUpload) => void;
}

export function RecentUploads({ selectedId, onSelect }: RecentUploadsProps) {
  const { t } = useTranslation();

  const getStatusLabel = (status: keyof typeof statusClassNames) => {
    switch (status) {
      case "ready":
        return t("documentCenter.statusReady");
      case "processing":
        return t("documentCenter.statusProcessing");
      case "failed":
        return t("documentCenter.statusFailed");
      default:
        return status;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight">
          {t("documentCenter.recentUploadsTitle")}
        </h3>
        <span className="text-xs text-muted-foreground">
          {t("documentCenter.recentUploadsCount", {
            count: recentUploads.length,
          })}
        </span>
      </div>

      <div className="space-y-2">
        {recentUploads.map((upload) => {
          const config = typeConfig[upload.type];
          const Icon = config.icon;
          const statusClassName = statusClassNames[upload.status];
          const isSelected = upload.id === selectedId;

          return (
            <button
              key={upload.id}
              type="button"
              onClick={() => onSelect(upload)}
              className={cn(
                "group flex w-full min-h-[72px] touch-manipulation items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-200 active:scale-[0.99]",
                isSelected
                  ? "border-primary/30 bg-primary/5 shadow-sm"
                  : "border-border/60 bg-card hover:border-primary/20 hover:bg-muted/30"
              )}
            >
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors",
                  config.color
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{upload.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                  <span>{t(config.labelKey)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{upload.size}</span>
                  <span aria-hidden="true">·</span>
                  <span>{upload.uploadedAt}</span>
                </div>
              </div>

              <Badge
                variant="outline"
                className={cn("shrink-0 text-[10px]", statusClassName)}
              >
                {getStatusLabel(upload.status)}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { typeConfig };
