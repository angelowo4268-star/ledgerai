"use client";

import { useCallback, useRef, useState } from "react";
import { CloudUpload, FileSpreadsheet, Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EXCEL_ACCEPT } from "@/lib/excel-import/types";
import { isExcelFile } from "@/lib/excel-import/parse-excel";

interface ExcelUploadZoneProps {
  onFileSelected: (file: File) => void;
  isLoading?: boolean;
}

export function ExcelUploadZone({
  onFileSelected,
  isLoading = false,
}: ExcelUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;

      if (!isExcelFile(file)) {
        setError("不支援的檔案格式，請上傳 xlsx、xls 或 csv 檔案。");
        return;
      }

      setError(null);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      handleFile(files?.[0]);
    },
    [handleFile]
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
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-all duration-200 sm:min-h-[260px] sm:px-6 sm:py-10",
          isDragging
            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
            : "border-border/80 bg-muted/20 hover:border-primary/40 hover:bg-muted/30"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={EXCEL_ACCEPT}
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
          {isLoading ? (
            <Loader2 className="h-7 w-7 animate-spin sm:h-8 sm:w-8" />
          ) : isDragging ? (
            <CloudUpload className="h-7 w-7 sm:h-8 sm:w-8" />
          ) : (
            <FileSpreadsheet className="h-7 w-7 sm:h-8 sm:w-8" />
          )}
        </div>

        <h3 className="mt-4 text-base font-semibold tracking-tight sm:text-lg">
          {isLoading
            ? "正在解析 Excel..."
            : isDragging
              ? "放開即可上傳"
              : "請拖曳 Excel 或按下方按鈕選擇檔案。"}
        </h3>

        <p className="mt-1.5 max-w-md px-2 text-sm text-muted-foreground">
          支援 xlsx、xls、csv 格式
        </p>

        <Button
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="mt-5 h-11 w-full max-w-xs touch-manipulation shadow-sm sm:w-auto"
        >
          <Upload className="h-4 w-4" />
          選擇 Excel 檔案
        </Button>
      </div>

      {error && (
        <p className="text-center text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
