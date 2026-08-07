"use client";

import {
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  Presentation,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { type FilePreviewCategory } from "@/lib/file-preview";
import { getFileCategoryLabel } from "@/lib/i18n/file-category";
import { useTranslation } from "@/lib/i18n/context";

interface FilePreviewDisplayProps {
  category: FilePreviewCategory;
  fileName: string;
  previewUrl?: string | null;
  className?: string;
}

const iconConfig: Record<
  Exclude<FilePreviewCategory, "image">,
  { icon: typeof FileText; color: string; bg: string }
> = {
  pdf: {
    icon: FileText,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  spreadsheet: {
    icon: FileSpreadsheet,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  word: {
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  presentation: {
    icon: Presentation,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  unknown: {
    icon: File,
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
};

export function getPreviewIconConfig(category: FilePreviewCategory) {
  if (category === "image") {
    return {
      icon: FileImage,
      color: "text-sky-600",
      bg: "bg-sky-50",
    };
  }

  return iconConfig[category];
}

export function FilePreviewDisplay({
  category,
  fileName,
  previewUrl,
  className,
}: FilePreviewDisplayProps) {
  const { t } = useTranslation();

  if (category === "image" && previewUrl) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-border/60 bg-muted/30",
          className
        )}
      >
        <div className="relative aspect-[4/3] w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={t("documentCenter.previewAlt", { name: fileName })}
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    );
  }

  const config = getPreviewIconConfig(category);
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex aspect-[4/3] flex-col items-center justify-center rounded-xl border border-border/60 bg-muted/20 px-6",
        className
      )}
    >
      <div
        className={cn(
          "flex h-20 w-20 items-center justify-center rounded-2xl",
          config.bg
        )}
      >
        <Icon className={cn("h-10 w-10", config.color)} />
      </div>
      <p className="mt-4 text-sm font-medium text-foreground">
        {getFileCategoryLabel(category, t)}
      </p>
      {!previewUrl && (
        <p className="mt-1 text-xs text-muted-foreground">
          {category === "image"
            ? t("documentCenter.cannotPreviewImage")
            : t("documentCenter.unsupportedPreview")}
        </p>
      )}
    </div>
  );
}
