import type { ExportFormatId } from "@/lib/export/types";

export interface ExportFormatDefinition {
  id: ExportFormatId;
  label: string;
  extension: string;
  implemented: boolean;
}

export const EXPORT_FORMATS: Record<ExportFormatId, ExportFormatDefinition> = {
  excel: {
    id: "excel",
    label: "Excel",
    extension: "xlsx",
    implemented: true,
  },
  csv: {
    id: "csv",
    label: "CSV",
    extension: "csv",
    implemented: false,
  },
  json: {
    id: "json",
    label: "JSON",
    extension: "json",
    implemented: false,
  },
  "google-sheets": {
    id: "google-sheets",
    label: "Google Sheets",
    extension: "gsheet",
    implemented: false,
  },
  "google-docs": {
    id: "google-docs",
    label: "Google Docs",
    extension: "gdoc",
    implemented: false,
  },
  word: {
    id: "word",
    label: "Word",
    extension: "docx",
    implemented: false,
  },
  pdf: {
    id: "pdf",
    label: "PDF",
    extension: "pdf",
    implemented: false,
  },
  powerpoint: {
    id: "powerpoint",
    label: "PowerPoint",
    extension: "pptx",
    implemented: false,
  },
};

export const DEFAULT_EXPORT_FORMAT: ExportFormatId = "excel";

export function getImplementedFormats(): ExportFormatDefinition[] {
  return Object.values(EXPORT_FORMATS).filter((format) => format.implemented);
}

export function getAllFormats(): ExportFormatDefinition[] {
  return Object.values(EXPORT_FORMATS);
}
