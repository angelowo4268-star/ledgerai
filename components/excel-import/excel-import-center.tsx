"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { ExcelUploadZone } from "@/components/excel-import/excel-upload-zone";
import { ExcelDataPreview } from "@/components/excel-import/excel-data-preview";
import { parseExcelFile } from "@/lib/excel-import/parse-excel";
import type { ParsedExcelData } from "@/lib/excel-import/types";

export function ExcelImportCenter() {
  const [parsedData, setParsedData] = useState<ParsedExcelData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await parseExcelFile(file);
      setParsedData(result);
    } catch (err) {
      setParsedData(null);
      setError(err instanceof Error ? err.message : "解析 Excel 失敗，請稍後再試。");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCancel = () => {
    setParsedData(null);
    setError(null);
  };

  const handleConfirmImport = () => {
    console.log("Import Success");
  };

  return (
    <div className="space-y-6 animate-fade-in sm:space-y-8">
      <PageHeader
        title="Excel 匯入"
        description="上傳 Excel 或 CSV 檔案，預覽內容後確認匯入"
      />

      {!parsedData ? (
        <>
          <ExcelUploadZone
            onFileSelected={handleFileSelected}
            isLoading={isLoading}
          />
          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <ExcelDataPreview data={parsedData} />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="h-11 w-full touch-manipulation sm:w-auto"
            >
              取消
            </Button>
            <Button
              onClick={handleConfirmImport}
              className="h-11 w-full touch-manipulation shadow-sm sm:w-auto"
            >
              確認匯入
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
