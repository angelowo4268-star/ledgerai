import * as XLSX from "xlsx";

import { EXPORT_FORMATS } from "@/lib/export/formats";
import type { ExportFormatId, ExportRow, ExportTemplate } from "@/lib/export/types";

function sanitizeFilename(value: string) {
  return value.replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, "");
}

function getFilenameBase(template: ExportTemplate) {
  if (template.builtInKey === "purchase-order") {
    return "PurchaseOrders";
  }

  if (template.builtInKey === "accounting-voucher") {
    return "AccountingVouchers";
  }

  if (template.builtInKey === "financial-report") {
    return "FinancialReports";
  }

  return sanitizeFilename(template.name) || "LedgerAI_Export";
}

export function buildExportFilename(
  template: ExportTemplate,
  format: ExportFormatId = template.defaultFormat
) {
  const stamp = new Date().toISOString().slice(0, 10);
  const extension = EXPORT_FORMATS[format].extension;
  return `${getFilenameBase(template)}_${stamp}.${extension}`;
}

function exportExcel(rows: ExportRow[], headers: string[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Export");
  XLSX.writeFile(workbook, filename);
}

export function exportRowsWithTemplate(
  template: ExportTemplate,
  rows: ExportRow[],
  format: ExportFormatId = template.defaultFormat
) {
  const formatDefinition = EXPORT_FORMATS[format];

  if (!formatDefinition.implemented) {
    throw new Error(`${formatDefinition.label} export is not implemented yet.`);
  }

  if (rows.length === 0) {
    throw new Error("No rows to export.");
  }

  const headers = template.fields
    .filter((field) => field.enabled)
    .sort((a, b) => a.order - b.order)
    .map((field) => field.header);

  if (headers.length === 0) {
    throw new Error("Template has no enabled columns.");
  }

  const filename = buildExportFilename(template, format);

  if (format === "excel") {
    exportExcel(rows, headers, filename);
    return;
  }

  throw new Error(`${formatDefinition.label} export is not implemented yet.`);
}
