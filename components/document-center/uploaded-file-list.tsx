"use client";

import { Loader2, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getFileCategoryLabel } from "@/lib/i18n/file-category";
import {
  getUploadStatusLabel,
  uploadStatusClassNames,
} from "@/lib/i18n/upload-status";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import type { UploadedFileItem } from "@/lib/document-center/uploaded-file";
import { formatFileSize } from "@/lib/file-preview";
import { getPreviewIconConfig } from "@/components/document-center/file-preview-display";

interface UploadedFileListProps {
  files: UploadedFileItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

export function UploadedFileList({
  files,
  selectedId,
  onSelect,
  onRemove,
}: UploadedFileListProps) {
  const { t } = useTranslation();

  if (files.length === 0) return null;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">
              {t("documentCenter.uploadedFilesTitle")}
            </CardTitle>
            <CardDescription>
              {t("documentCenter.uploadedFilesCount", { count: files.length })}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {files.map((item) => {
          const iconConfig = getPreviewIconConfig(item.category);
          const Icon = iconConfig.icon;
          const statusClassName = uploadStatusClassNames[item.status];
          const isSelected = item.id === selectedId;

          return (
            <div
              key={item.id}
              className={cn(
                "group rounded-xl border transition-all duration-200",
                isSelected
                  ? "border-primary/30 bg-primary/5 shadow-sm"
                  : "border-border/60 bg-card hover:border-primary/20 hover:bg-muted/30"
              )}
            >
              <div className="hidden items-center gap-3 p-3 sm:flex">
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      iconConfig.bg
                    )}
                  >
                    <Icon className={cn("h-5 w-5", iconConfig.color)} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.file.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatFileSize(item.file.size)} ·{" "}
                      {getFileCategoryLabel(item.category, t)}
                    </p>
                  </div>
                </button>

                <Badge
                  variant="outline"
                  className={cn("shrink-0 text-[10px]", statusClassName)}
                >
                  {item.status === "uploading" && (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  )}
                  {getUploadStatusLabel(item.status, t)}
                </Badge>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(item.id)}
                  aria-label={t("documentCenter.removeFile", {
                    name: item.file.name,
                  })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3 p-3 sm:hidden">
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className="flex w-full items-start gap-3 text-left"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      iconConfig.bg
                    )}
                  >
                    <Icon className={cn("h-5 w-5", iconConfig.color)} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.file.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(item.file.size)}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {getFileCategoryLabel(item.category, t)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px]", statusClassName)}
                      >
                        {item.status === "uploading" && (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        )}
                        {getUploadStatusLabel(item.status, t)}
                      </Badge>
                    </div>
                  </div>
                </button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 w-full touch-manipulation text-destructive hover:text-destructive"
                  onClick={() => onRemove(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  {t("documentCenter.remove")}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
