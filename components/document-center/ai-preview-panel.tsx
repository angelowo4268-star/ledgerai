"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, Loader2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  SuccessToast,
  useSuccessToast,
} from "@/components/ui/success-toast";
import { cn } from "@/lib/utils";
import { useAIAnalysis } from "@/hooks/use-ai-analysis";
import { useTranslation } from "@/lib/i18n/context";
import type { AIAnalysisResult } from "@/lib/ai-analysis/types";
import {
  previewDataMap,
  type DocumentPreviewType,
} from "@/lib/document-center-mock-data";
import {
  formatFileSize,
  type FilePreviewCategory,
} from "@/lib/file-preview";
import { getFileCategoryLabel } from "@/lib/i18n/file-category";
import { typeConfig } from "@/components/document-center/recent-uploads";
import {
  FilePreviewDisplay,
  getPreviewIconConfig,
} from "@/components/document-center/file-preview-display";
import { AIAnalysisResults } from "@/components/document-center/ai-analysis-results";
import { VoucherPanel } from "@/components/accounting/voucher-panel";

interface AIPreviewPanelProps {
  fileName: string;
  category: FilePreviewCategory;
  previewUrl?: string | null;
  fileSize?: number;
  isUploadedFile: boolean;
  mockPreviewType?: DocumentPreviewType;
  file?: File | null;
  onSaveResult?: (result: AIAnalysisResult) => void;
}

export function AIPreviewPanel({
  fileName,
  category,
  previewUrl,
  fileSize,
  isUploadedFile,
  mockPreviewType,
  file,
  onSaveResult,
}: AIPreviewPanelProps) {
  const fileKey = file ? `${file.name}-${file.size}-${file.lastModified}` : fileName;
  const { status, result, error, runAnalysis, isAnalyzing } = useAIAnalysis({
    fileKey,
  });
  const [documentState, setDocumentState] = useState<AIAnalysisResult | null>(
    null
  );
  const toast = useSuccessToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (result) {
      setDocumentState(result);
    } else {
      setDocumentState(null);
    }
  }, [result]);

  const mockPreview = mockPreviewType
    ? previewDataMap[mockPreviewType]
    : null;
  const mockConfig = mockPreviewType ? typeConfig[mockPreviewType] : null;
  const iconConfig = getPreviewIconConfig(category);
  const HeaderIcon = iconConfig.icon;

  const displayLabel = isUploadedFile
    ? getFileCategoryLabel(category, t)
    : mockConfig
      ? t(mockConfig.labelKey)
      : getFileCategoryLabel(category, t);

  const canAnalyze = isUploadedFile && file != null;
  const activeResult = documentState ?? result;

  const handleAnalyze = () => {
    if (!file || isAnalyzing) return;
    void runAnalysis(file);
  };

  const handleSaveDocument = (updated: AIAnalysisResult) => {
    setDocumentState(updated);
    onSaveResult?.(updated);
  };

  return (
    <>
      <Card className="border-border/60 shadow-sm lg:sticky lg:top-20">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  isUploadedFile ? iconConfig.bg : mockConfig?.color
                )}
              >
                <HeaderIcon
                  className={cn(
                    "h-5 w-5",
                    isUploadedFile ? iconConfig.color : "text-primary"
                  )}
                />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base">{t("aiAnalysis.aiPreview")}</CardTitle>
                <CardDescription className="text-xs">{displayLabel}</CardDescription>
              </div>
            </div>
            {!isUploadedFile && mockPreview && (
              <Badge
                variant="pending"
                className="shrink-0 border border-violet-200 bg-violet-50 text-violet-700"
              >
                <Sparkles className="mr-1 h-3 w-3" />
                {mockPreview.confidence}%
              </Badge>
            )}
            {activeResult && isUploadedFile && (
              <Badge
                variant="pending"
                className="shrink-0 border border-violet-200 bg-violet-50 text-violet-700"
              >
                <Sparkles className="mr-1 h-3 w-3" />
                {activeResult.confidence}%
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <FilePreviewDisplay
            category={category}
            fileName={fileName}
            previewUrl={previewUrl}
          />

          <div className="rounded-lg bg-muted/50 px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t("aiAnalysis.selectedFile")}
            </p>
            <p className="mt-0.5 truncate text-sm font-medium">{fileName}</p>
            {isUploadedFile && fileSize !== undefined && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatFileSize(fileSize)}
              </p>
            )}
          </div>

          {canAnalyze && (
            <div className="space-y-4">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || status === "success"}
                className="h-11 w-full touch-manipulation shadow-sm"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("aiAnalysis.analyzing")}
                  </>
                ) : status === "success" ? (
                  t("aiAnalysis.analyzeComplete")
                ) : (
                  t("aiAnalysis.startAnalyze")
                )}
              </Button>

              {isAnalyzing && (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  {t("aiAnalysis.analyzing")}
                </div>
              )}

              {error && (
                <p className="text-center text-sm text-destructive">
                  {t("aiAnalysis.analyzeFailed")}
                </p>
              )}

              {status === "success" && activeResult && (
                <div className="space-y-4">
                  <AIAnalysisResults
                    result={activeResult}
                    onSave={handleSaveDocument}
                    onToast={toast.show}
                  />
                  <VoucherPanel result={activeResult} />
                </div>
              )}

              {status === "idle" && (
                <div className="rounded-xl border border-dashed border-primary/20 bg-primary/5 p-4 text-center">
                  <p className="text-sm font-medium text-foreground">
                    {t("aiAnalysis.fileReady")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("aiAnalysis.fileReadyHint")}
                  </p>
                </div>
              )}
            </div>
          )}

          {!isUploadedFile && mockPreview && (
            <>
              <div>
                <p className="text-sm font-semibold">{mockPreview.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {mockPreview.subtitle}
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("aiAnalysis.extractedFields")}
                </p>
                {mockPreview.fields.map((field) => (
                  <div
                    key={field.label}
                    className="flex flex-col gap-0.5 text-sm sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                  >
                    <span className="shrink-0 text-muted-foreground">
                      {field.label}
                    </span>
                    <span className="font-medium sm:text-right">{field.value}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-primary" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("aiAnalysis.aiInsights")}
                  </p>
                </div>
                <ul className="space-y-2">
                  {mockPreview.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-dashed border-primary/20 bg-primary/5 p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  {t("aiAnalysis.mockPreviewHint")}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <SuccessToast message={toast.message} onDismiss={toast.dismiss} />
    </>
  );
}
