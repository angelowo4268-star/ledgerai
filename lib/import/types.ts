export type ImportConnectorId =
  | "google-sheets"
  | "google-forms"
  | "excel"
  | "csv"
  | "discord"
  | "slack"
  | "email"
  | "telegram";

export type ImportFieldKey =
  | "customer"
  | "product"
  | "quantity"
  | "amount"
  | "paid"
  | "remaining"
  | "currency"
  | "orderId"
  | "paymentMethod"
  | "status"
  | "remarks";

export const IMPORT_FIELD_KEYS: ImportFieldKey[] = [
  "customer",
  "product",
  "quantity",
  "amount",
  "paid",
  "remaining",
  "currency",
  "orderId",
  "paymentMethod",
  "status",
  "remarks",
];

export interface RawImportData {
  sourceId: string;
  sourceName: string;
  sheetId: string;
  sheetName: string;
  headers: string[];
  rows: string[][];
  totalRows: number;
}

export interface ColumnMappingItem {
  field: ImportFieldKey;
  header: string | null;
  confidence: number;
}

export interface MappedImportRow {
  rowIndex: number;
  customer: string;
  product: string;
  quantity: number;
  amount: number;
  paid: number;
  remaining: number;
  currency: string;
  orderId: string;
  paymentMethod: string;
  status: string;
  remarks: string;
}

export type ValidationIssueCode =
  | "missing_amount"
  | "missing_customer"
  | "duplicate_order"
  | "paid_exceeds_amount"
  | "payment_mismatch"
  | "invalid_currency";

export interface ValidationIssue {
  rowIndex: number;
  code: ValidationIssueCode;
  message: string;
  severity: "error" | "warning";
}

export interface DataRepair {
  rowIndex: number;
  field: ImportFieldKey;
  originalValue: string;
  repairedValue: string;
  reason: string;
}

export interface ImportPreview {
  raw: RawImportData;
  mappings: ColumnMappingItem[];
  rows: MappedImportRow[];
  issues: ValidationIssue[];
  repairs: DataRepair[];
}

export interface ImportResult {
  customersCreated: number;
  customersUpdated: number;
  ordersCreated: number;
  communicationRecordsCreated: number;
  vouchersCreated: number;
}

export interface GoogleSpreadsheetSummary {
  id: string;
  name: string;
  modifiedTime: string;
}

export interface GoogleWorksheetSummary {
  sheetId: number;
  title: string;
  index: number;
}
