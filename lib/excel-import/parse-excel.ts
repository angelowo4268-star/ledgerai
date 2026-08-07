import * as XLSX from "xlsx";

import {
  EXCEL_EXTENSIONS,
  type ParsedExcelData,
} from "@/lib/excel-import/types";

function getExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "") : "";
}

export function isExcelFile(file: File): boolean {
  const ext = getExtension(file.name);
  return EXCEL_EXTENSIONS.includes(ext as (typeof EXCEL_EXTENSIONS)[number]);
}

export async function parseExcelFile(file: File): Promise<ParsedExcelData> {
  if (!isExcelFile(file)) {
    throw new Error("不支援的檔案格式，請上傳 xlsx、xls 或 csv 檔案。");
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("找不到工作表，請確認 Excel 檔案內容。");
  }

  const worksheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(
    worksheet,
    { header: 1, defval: "" }
  );

  if (rawData.length === 0) {
    throw new Error("Excel 檔案沒有資料。");
  }

  const [headerRow, ...bodyRows] = rawData;
  const headers = (headerRow ?? []).map((cell) => String(cell ?? "").trim());

  const normalizedHeaders =
    headers.length > 0 && headers.some(Boolean)
      ? headers
      : ["欄位 1", "欄位 2", "欄位 3", "欄位 4", "欄位 5"];

  const rows = bodyRows
    .map((row) =>
      normalizedHeaders.map((_, index) => String(row?.[index] ?? "").trim())
    )
    .filter((row) => row.some((cell) => cell !== ""));

  return {
    fileName: file.name,
    sheetName,
    headers: normalizedHeaders,
    rows,
    totalRows: rows.length,
  };
}
