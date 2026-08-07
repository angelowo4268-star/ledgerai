"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, CloudUpload, ImagePlus, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFilesSelected?: (files: File[]) => void;
  fileCount?: number;
}

const FILE_ACCEPT =
  ".jpg,.jpeg,.png,.webp,.heic,.pdf,.docx,.doc,.xlsx,.xls,.csv,.pptx,image/*,application/pdf";

export function UploadZone({ onFilesSelected, fileCount = 0 }: UploadZoneProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const fileArray = Array.from(files);
      onFilesSelected?.(fileArray);
    },
    [onFilesSelected]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex min-h-[240px] flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-all duration-200 sm:min-h-[280px] sm:px-6 sm:py-12",
        isDragging
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
          : "border-border/80 bg-muted/20 hover:border-primary/40 hover:bg-muted/30"
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={FILE_ACCEPT}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <input
        ref={galleryInputRef}
        type="file"
        multiple
        accept="image/*,.jpg,.jpeg,.png,.webp,.heic"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200 sm:h-16 sm:w-16",
          isDragging
            ? "scale-110 bg-primary text-primary-foreground"
            : "bg-secondary text-primary"
        )}
      >
        {isDragging ? (
          <CloudUpload className="h-7 w-7 sm:h-8 sm:w-8" />
        ) : (
          <Upload className="h-7 w-7 sm:h-8 sm:w-8" />
        )}
      </div>

      <h3 className="mt-4 text-base font-semibold tracking-tight sm:mt-5 sm:text-lg">
        {isDragging ? t("documentCenter.uploadDropRelease") : t("documentCenter.title")}
      </h3>
      <p className="mt-1.5 max-w-sm px-2 text-sm text-muted-foreground">
        <span className="hidden sm:inline">{t("documentCenter.uploadDragHint")}</span>
        <span className="sm:hidden">{t("documentCenter.uploadMobileHint")}</span>
      </p>

      <div className="mt-5 flex w-full max-w-md flex-col gap-3 sm:mt-6 sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
        <Button
          onClick={() => cameraInputRef.current?.click()}
          className="h-12 w-full touch-manipulation shadow-sm sm:hidden"
        >
          <Camera className="h-5 w-5" />
          {t("documentCenter.takePhoto")}
        </Button>

        <Button
          variant="outline"
          onClick={() => galleryInputRef.current?.click()}
          className="h-12 w-full touch-manipulation sm:hidden"
        >
          <ImagePlus className="h-5 w-5" />
          {t("documentCenter.chooseFromGallery")}
        </Button>

        <Button
          onClick={() => fileInputRef.current?.click()}
          className="h-12 w-full touch-manipulation shadow-sm sm:h-10 sm:w-auto"
        >
          <Upload className="h-4 w-4" />
          {t("documentCenter.chooseFiles")}
        </Button>

        <span className="hidden text-xs text-muted-foreground sm:inline">
          {t("documentCenter.uploadDragSecondary")}
        </span>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {["JPG", "PNG", "PDF", "DOC", "DOCX", "XLS", "XLSX", "CSV"].map(
          (type) => (
            <span
              key={type}
              className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground"
            >
              {type}
            </span>
          )
        )}
      </div>
      {fileCount > 0 && (
        <p className="mt-4 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          {t("documentCenter.filesAdded", { count: fileCount })}
        </p>
      )}
    </div>
  );
}
