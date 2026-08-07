export type ExportFormatId =
  | "excel"
  | "csv"
  | "json"
  | "google-sheets"
  | "google-docs"
  | "word"
  | "pdf"
  | "powerpoint";

export type CustomFieldType =
  | "text"
  | "number"
  | "currency"
  | "date"
  | "yes-no"
  | "dropdown";

export type TemplateType =
  | "accounting-voucher"
  | "purchase-order"
  | "financial-report"
  | "custom";

export type BuiltInTemplateKey =
  | "accounting-voucher"
  | "purchase-order"
  | "financial-report";

export type FieldSection =
  | "order-information"
  | "payment"
  | "shipping"
  | "customer"
  | "accounting"
  | "financial"
  | "custom";

export interface TemplateField {
  id: string;
  key: string;
  label: string;
  header: string;
  enabled: boolean;
  required: boolean;
  section: FieldSection;
  order: number;
  isCustom: boolean;
  customType?: CustomFieldType;
  dropdownOptions?: string[];
}

export interface ExportTemplate {
  id: string;
  name: string;
  description?: string;
  templateType: TemplateType;
  isBuiltIn?: boolean;
  builtInKey?: BuiltInTemplateKey;
  supportedFormats: ExportFormatId[];
  defaultFormat: ExportFormatId;
  fields: TemplateField[];
  createdAt: string;
  updatedAt: string;
}

export type ExportRow = Record<string, string | number | boolean>;

/** @deprecated Use ExportTemplate fields instead */
export type VoucherExportFieldKey =
  | "date"
  | "vendor"
  | "invoiceNumber"
  | "summary"
  | "debitAccount"
  | "debitAmount"
  | "creditAccount"
  | "creditAmount"
  | "status";

/** @deprecated Use TemplateField instead */
export interface ExportTemplateColumn {
  field: VoucherExportFieldKey;
  header: string;
  enabled: boolean;
}
