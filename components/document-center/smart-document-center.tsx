"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileSpreadsheet } from "lucide-react";

import {
  defaultSelectedUploadId,
  recentUploads,
  type RecentUpload,
} from "@/lib/document-center-mock-data";
import {
  getFilePreviewCategory,
  getFilePreviewCategoryFromExtension,
} from "@/lib/file-preview";
import {
  createUploadedFileItem,
  type UploadedFileItem,
} from "@/lib/document-center/uploaded-file";
import type { AIAnalysisResult } from "@/lib/ai-analysis/types";
import {
  exportAIResultsToExcel,
  getSavedResultsCount,
} from "@/lib/ai-analysis/export-results";
import { Button } from "@/components/ui/button";
import {
  SuccessToast,
  useSuccessToast,
} from "@/components/ui/success-toast";
import { PageHeader } from "@/components/layout/page-header";
import { useTranslation } from "@/lib/i18n/context";
import { UploadZone } from "@/components/document-center/upload-zone";
import { UploadedFileList } from "@/components/document-center/uploaded-file-list";
import { SupportedFormats } from "@/components/document-center/supported-formats";
import { RecentUploads } from "@/components/document-center/recent-uploads";
import { AIPreviewPanel } from "@/components/document-center/ai-preview-panel";

const UPLOAD_SIMULATE_MS = 800;

export function SmartDocumentCenter() {
  const [selectedUpload, setSelectedUpload] = useState<RecentUpload>(
    () =>
      recentUploads.find((u) => u.id === defaultSelectedUploadId) ??
      recentUploads[0]
  );
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [activeUploadedId, setActiveUploadedId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewSource, setPreviewSource] = useState<"upload" | "mock">("mock");
  const [savedResults, setSavedResults] = useState<
    Record<string, AIAnalysisResult>
  >({});
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const toast = useSuccessToast();
  const { t } = useTranslation();

  const activeUploadedFile = useMemo(
    () => uploadedFiles.find((item) => item.id === activeUploadedId) ?? null,
    [uploadedFiles, activeUploadedId]
  );

  const savedResultsCount = getSavedResultsCount(savedResults);

  useEffect(() => {
    if (previewSource !== "upload" || !activeUploadedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(activeUploadedFile.file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [previewSource, activeUploadedFile]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const scheduleUploadComplete = useCallback((id: string) => {
    const existing = timersRef.current.get(id);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      setUploadedFiles((prev) =>
        prev.map((item) =>
          item.id === id && item.status === "uploading"
            ? { ...item, status: "ready" }
            : item
        )
      );
      timersRef.current.delete(id);
    }, UPLOAD_SIMULATE_MS);

    timersRef.current.set(id, timer);
  }, []);

  const previewProps = useMemo(() => {
    if (previewSource === "upload" && activeUploadedFile) {
      return {
        fileName: activeUploadedFile.file.name,
        category: getFilePreviewCategory(activeUploadedFile.file),
        previewUrl,
        fileSize: activeUploadedFile.file.size,
        isUploadedFile: true as const,
        mockPreviewType: undefined,
      };
    }

    const mockCategory = getFilePreviewCategoryFromExtension(
      selectedUpload.extension.toLowerCase()
    );

    return {
      fileName: selectedUpload.name,
      category: mockCategory,
      previewUrl: null,
      fileSize: undefined,
      isUploadedFile: false as const,
      mockPreviewType: selectedUpload.type,
    };
  }, [previewSource, activeUploadedFile, previewUrl, selectedUpload]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;

    const newItems = files.map(createUploadedFileItem);

    setUploadedFiles((prev) => [...prev, ...newItems]);
    setActiveUploadedId(newItems[0].id);
    setPreviewSource("upload");

    newItems.forEach((item) => scheduleUploadComplete(item.id));
  };

  const handleRemoveFile = (id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setSavedResults((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    setUploadedFiles((prev) => {
      const next = prev.filter((item) => item.id !== id);

      if (activeUploadedId === id) {
        const nextActive = next[next.length - 1] ?? null;
        setActiveUploadedId(nextActive?.id ?? null);
        setPreviewSource(nextActive ? "upload" : "mock");
      }

      if (next.length === 0) {
        setActiveUploadedId(null);
        setPreviewSource("mock");
      }

      return next;
    });
  };

  const handleSelectUploadedFile = (id: string) => {
    setActiveUploadedId(id);
    setPreviewSource("upload");
  };

  const handleMockUploadSelect = (upload: RecentUpload) => {
    setSelectedUpload(upload);
    setPreviewSource("mock");
  };

  const handleSaveResult = (fileId: string, result: AIAnalysisResult) => {
    setSavedResults((prev) => ({ ...prev, [fileId]: result }));
  };

  const handleExportExcel = () => {
    const results = Object.values(savedResults);
    if (results.length === 0) return;

    try {
      exportAIResultsToExcel(results);
      toast.show(t("toast.exportAiResultsSuccess", { count: results.length }));
    } catch {
      toast.show(t("toast.exportAiResultsFailed"));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in sm:space-y-8">
      <PageHeader
        title={t("documentCenter.title")}
        description={t("documentCenter.description")}
      >
        <Button
          variant="outline"
          onClick={handleExportExcel}
          disabled={savedResultsCount === 0}
          className="h-10 w-full touch-manipulation sm:w-auto"
        >
          <FileSpreadsheet className="h-4 w-4" />
          {t("documentCenter.exportExcel")}
          {savedResultsCount > 0 && (
            <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {savedResultsCount}
            </span>
          )}
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
        <div className="order-1 space-y-4 lg:col-start-1 lg:row-start-1">
          <UploadZone
            onFilesSelected={handleFilesSelected}
            fileCount={uploadedFiles.length}
          />
          <UploadedFileList
            files={uploadedFiles}
            selectedId={previewSource === "upload" ? activeUploadedId : null}
            onSelect={handleSelectUploadedFile}
            onRemove={handleRemoveFile}
          />
        </div>

        <div className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-3">
          <AIPreviewPanel
            fileName={previewProps.fileName}
            category={previewProps.category}
            previewUrl={previewProps.previewUrl}
            fileSize={previewProps.fileSize}
            isUploadedFile={previewProps.isUploadedFile}
            mockPreviewType={previewProps.mockPreviewType}
            file={activeUploadedFile?.file ?? null}
            onSaveResult={
              activeUploadedId
                ? (result) => handleSaveResult(activeUploadedId, result)
                : undefined
            }
          />
        </div>

        <div className="order-3 lg:col-start-1 lg:row-start-2">
          <SupportedFormats />
        </div>

        <div className="order-4 lg:col-start-1 lg:row-start-3">
          <RecentUploads
            selectedId={selectedUpload.id}
            onSelect={handleMockUploadSelect}
          />
        </div>
      </div>

      <SuccessToast message={toast.message} onDismiss={toast.dismiss} />
    </div>
  );
}
