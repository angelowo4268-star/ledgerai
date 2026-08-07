import * as XLSX from "xlsx";

import type { AIAnalysisResult } from "@/lib/ai-analysis/types";

const EXPORT_COLUMNS = [
  "Invoice Number",
  "Vendor",
  "Date",
  "Amount",
  "Category",
  "Tax Deductible",
] as const;

function toExportRow(result: AIAnalysisResult) {
  return {
    "Invoice Number": result.invoiceNumber,
    Vendor: result.vendor,
    Date: result.date,
    Amount: result.amount,
    Category: result.suggestedAccount,
    "Tax Deductible": result.deductible,
  };
}

function buildExportFilename() {
  const stamp = new Date().toISOString().slice(0, 10);
  return `ledgerai-ai-results-${stamp}.xlsx`;
}

export function exportAIResultsToExcel(results: AIAnalysisResult[]) {
  if (results.length === 0) {
    throw new Error("No saved results to export.");
  }

  const rows = results.map(toExportRow);
  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: [...EXPORT_COLUMNS],
  });
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "AI Recognition");
  XLSX.writeFile(workbook, buildExportFilename());
}

export function getSavedResultsCount(
  savedResults: Record<string, AIAnalysisResult>
): number {
  return Object.keys(savedResults).length;
}
