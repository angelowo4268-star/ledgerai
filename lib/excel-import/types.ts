export interface ParsedExcelData {
  fileName: string;
  sheetName: string;
  headers: string[];
  rows: string[][];
  totalRows: number;
}

export const EXCEL_ACCEPT = ".xlsx,.xls,.csv";

export const EXCEL_EXTENSIONS = ["xlsx", "xls", "csv"] as const;

export const PREVIEW_ROW_LIMIT = 10;
