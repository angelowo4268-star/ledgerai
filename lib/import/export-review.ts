import * as XLSX from "xlsx";

export type ImportReviewExportRow = Record<string, string | number>;

export function buildLedgerAiExportFilename() {
  const stamp = new Date().toISOString().slice(0, 10);
  return `LedgerAI_${stamp}.xlsx`;
}

function downloadWorkbook(workbook: XLSX.WorkBook, filename: string) {
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportImportReviewToExcel(
  rows: ImportReviewExportRow[],
  headers: string[]
) {
  if (rows.length === 0) {
    throw new Error("No rows to export.");
  }

  if (headers.length === 0) {
    throw new Error("No columns to export.");
  }

  const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Import Review");
  downloadWorkbook(workbook, buildLedgerAiExportFilename());
}
