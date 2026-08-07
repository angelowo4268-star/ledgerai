import type { SupportedLocale } from "@/lib/i18n/types";

import type {
  BuiltInTemplateKey,
  FieldSection,
  TemplateField,
  TemplateType,
} from "@/lib/export/types";

interface CatalogField {
  key: string;
  section: FieldSection;
  label: Record<SupportedLocale, string>;
  header: Record<SupportedLocale, string>;
  enabled?: boolean;
  required?: boolean;
}

const ACCOUNTING_FIELDS: CatalogField[] = [
  {
    key: "date",
    section: "accounting",
    label: { "zh-TW": "日期", en: "Date" },
    header: { "zh-TW": "日期", en: "Date" },
    enabled: true,
  },
  {
    key: "summary",
    section: "accounting",
    label: { "zh-TW": "摘要", en: "Summary" },
    header: { "zh-TW": "摘要", en: "Summary" },
    enabled: true,
  },
  {
    key: "debitAccount",
    section: "accounting",
    label: { "zh-TW": "借方科目", en: "Debit Account" },
    header: { "zh-TW": "借方科目", en: "Debit Account" },
    enabled: true,
  },
  {
    key: "debitAmount",
    section: "accounting",
    label: { "zh-TW": "借方金額", en: "Debit Amount" },
    header: { "zh-TW": "借方金額", en: "Debit Amount" },
    enabled: true,
  },
  {
    key: "creditAccount",
    section: "accounting",
    label: { "zh-TW": "貸方科目", en: "Credit Account" },
    header: { "zh-TW": "貸方科目", en: "Credit Account" },
    enabled: true,
  },
  {
    key: "creditAmount",
    section: "accounting",
    label: { "zh-TW": "貸方金額", en: "Credit Amount" },
    header: { "zh-TW": "貸方金額", en: "Credit Amount" },
    enabled: true,
  },
  {
    key: "vendor",
    section: "accounting",
    label: { "zh-TW": "供應商", en: "Vendor" },
    header: { "zh-TW": "供應商", en: "Vendor" },
    enabled: true,
  },
  {
    key: "invoiceNumber",
    section: "accounting",
    label: { "zh-TW": "發票號碼", en: "Invoice Number" },
    header: { "zh-TW": "發票號碼", en: "Invoice Number" },
    enabled: true,
  },
];

const PURCHASE_ORDER_FIELDS: CatalogField[] = [
  {
    key: "orderNumber",
    section: "order-information",
    label: { "zh-TW": "訂單編號", en: "Order Number" },
    header: { "zh-TW": "訂單編號", en: "Order Number" },
    enabled: true,
    required: true,
  },
  {
    key: "customerName",
    section: "order-information",
    label: { "zh-TW": "客戶名稱", en: "Customer Name" },
    header: { "zh-TW": "客戶名稱", en: "Customer Name" },
    enabled: true,
    required: true,
  },
  {
    key: "customerId",
    section: "order-information",
    label: { "zh-TW": "客戶 ID", en: "Customer ID" },
    header: { "zh-TW": "客戶 ID", en: "Customer ID" },
    enabled: true,
  },
  {
    key: "platform",
    section: "order-information",
    label: { "zh-TW": "平台", en: "Platform" },
    header: { "zh-TW": "平台", en: "Platform" },
    enabled: true,
  },
  {
    key: "product",
    section: "order-information",
    label: { "zh-TW": "產品", en: "Product" },
    header: { "zh-TW": "產品", en: "Product" },
    enabled: true,
  },
  {
    key: "sku",
    section: "order-information",
    label: { "zh-TW": "SKU", en: "SKU" },
    header: { "zh-TW": "SKU", en: "SKU" },
    enabled: true,
  },
  {
    key: "quantity",
    section: "order-information",
    label: { "zh-TW": "數量", en: "Quantity" },
    header: { "zh-TW": "數量", en: "Quantity" },
    enabled: true,
  },
  {
    key: "unitPrice",
    section: "order-information",
    label: { "zh-TW": "單價", en: "Unit Price" },
    header: { "zh-TW": "單價", en: "Unit Price" },
    enabled: true,
  },
  {
    key: "amount",
    section: "order-information",
    label: { "zh-TW": "金額", en: "Amount" },
    header: { "zh-TW": "金額", en: "Amount" },
    enabled: true,
    required: true,
  },
  {
    key: "currency",
    section: "order-information",
    label: { "zh-TW": "幣別", en: "Currency" },
    header: { "zh-TW": "幣別", en: "Currency" },
    enabled: true,
  },
  {
    key: "paymentStatus",
    section: "payment",
    label: { "zh-TW": "付款狀態", en: "Payment Status" },
    header: { "zh-TW": "付款狀態", en: "Payment Status" },
    enabled: true,
  },
  {
    key: "paymentMethod",
    section: "payment",
    label: { "zh-TW": "付款方式", en: "Payment Method" },
    header: { "zh-TW": "付款方式", en: "Payment Method" },
    enabled: true,
  },
  {
    key: "paymentDate",
    section: "payment",
    label: { "zh-TW": "付款日期", en: "Payment Date" },
    header: { "zh-TW": "付款日期", en: "Payment Date" },
    enabled: true,
  },
  {
    key: "orderStatus",
    section: "shipping",
    label: { "zh-TW": "訂單狀態", en: "Order Status" },
    header: { "zh-TW": "訂單狀態", en: "Order Status" },
    enabled: true,
  },
  {
    key: "shippingMethod",
    section: "shipping",
    label: { "zh-TW": "配送方式", en: "Shipping Method" },
    header: { "zh-TW": "配送方式", en: "Shipping Method" },
    enabled: true,
  },
  {
    key: "trackingNumber",
    section: "shipping",
    label: { "zh-TW": "追蹤號碼", en: "Tracking Number" },
    header: { "zh-TW": "追蹤號碼", en: "Tracking Number" },
    enabled: true,
  },
  {
    key: "shippingDate",
    section: "shipping",
    label: { "zh-TW": "出貨日期", en: "Shipping Date" },
    header: { "zh-TW": "出貨日期", en: "Shipping Date" },
    enabled: true,
  },
  {
    key: "customerNotified",
    section: "customer",
    label: { "zh-TW": "已通知客戶", en: "Customer Notified" },
    header: { "zh-TW": "已通知客戶", en: "Customer Notified" },
    enabled: true,
  },
  {
    key: "notes",
    section: "customer",
    label: { "zh-TW": "備註", en: "Notes" },
    header: { "zh-TW": "備註", en: "Notes" },
    enabled: true,
  },
];

const FINANCIAL_REPORT_FIELDS: CatalogField[] = [
  {
    key: "date",
    section: "financial",
    label: { "zh-TW": "日期", en: "Date" },
    header: { "zh-TW": "日期", en: "Date" },
    enabled: true,
  },
  {
    key: "vendor",
    section: "financial",
    label: { "zh-TW": "供應商", en: "Vendor" },
    header: { "zh-TW": "供應商", en: "Vendor" },
    enabled: true,
  },
  {
    key: "summary",
    section: "financial",
    label: { "zh-TW": "摘要", en: "Summary" },
    header: { "zh-TW": "摘要", en: "Summary" },
    enabled: true,
  },
  {
    key: "debitAmount",
    section: "financial",
    label: { "zh-TW": "借方金額", en: "Debit Amount" },
    header: { "zh-TW": "借方金額", en: "Debit Amount" },
    enabled: true,
  },
  {
    key: "creditAmount",
    section: "financial",
    label: { "zh-TW": "貸方金額", en: "Credit Amount" },
    header: { "zh-TW": "貸方金額", en: "Credit Amount" },
    enabled: true,
  },
  {
    key: "status",
    section: "financial",
    label: { "zh-TW": "狀態", en: "Status" },
    header: { "zh-TW": "狀態", en: "Status" },
    enabled: true,
  },
];

const BUILT_IN_META: Record<
  BuiltInTemplateKey,
  Record<SupportedLocale, { name: string; description: string }>
> = {
  "accounting-voucher": {
    "zh-TW": {
      name: "會計傳票",
      description: "標準借貸分錄格式，適用會計系統匯入",
    },
    en: {
      name: "Accounting Voucher",
      description: "Standard debit/credit entry format for accounting systems",
    },
  },
  "purchase-order": {
    "zh-TW": {
      name: "採購訂單",
      description: "電商、代購與批發業者的訂單匯出配置",
    },
    en: {
      name: "Purchase Order",
      description: "Order export layout for e-commerce, resellers, and purchasing",
    },
  },
  "financial-report": {
    "zh-TW": {
      name: "財務報表",
      description: "管理報表與財務分析用的摘要欄位",
    },
    en: {
      name: "Financial Report",
      description: "Summary columns for management reports and financial analysis",
    },
  },
};

const CATALOG_BY_TYPE: Record<
  Exclude<TemplateType, "custom">,
  CatalogField[]
> = {
  "accounting-voucher": ACCOUNTING_FIELDS,
  "purchase-order": PURCHASE_ORDER_FIELDS,
  "financial-report": FINANCIAL_REPORT_FIELDS,
};

export const SECTION_ORDER: FieldSection[] = [
  "order-information",
  "payment",
  "shipping",
  "customer",
  "accounting",
  "financial",
  "custom",
];

export function catalogFieldsForType(
  templateType: TemplateType,
  locale: SupportedLocale
): TemplateField[] {
  const catalog =
    templateType === "custom"
      ? PURCHASE_ORDER_FIELDS
      : CATALOG_BY_TYPE[templateType];

  return catalog.map((field, index) => ({
    id: `field-${field.key}`,
    key: field.key,
    label: field.label[locale],
    header: field.header[locale],
    enabled: field.enabled ?? false,
    required: field.required ?? false,
    section: field.section,
    order: index,
    isCustom: false,
  }));
}

export function getBuiltInTemplateMeta(
  key: BuiltInTemplateKey,
  locale: SupportedLocale
) {
  return BUILT_IN_META[key][locale];
}

export function buildBuiltInTemplate(
  key: BuiltInTemplateKey,
  locale: SupportedLocale
) {
  const meta = getBuiltInTemplateMeta(key, locale);

  return {
    id: `builtin-${key}`,
    name: meta.name,
    description: meta.description,
    templateType: key,
    isBuiltIn: true,
    builtInKey: key,
    supportedFormats: ["excel" as const],
    defaultFormat: "excel" as const,
    fields: catalogFieldsForType(key, locale),
    createdAt: "1970-01-01T00:00:00.000Z",
    updatedAt: "1970-01-01T00:00:00.000Z",
  };
}

export function createBlankCustomTemplate(
  locale: SupportedLocale,
  name: string
) {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    name,
    description: "",
    templateType: "custom" as const,
    supportedFormats: ["excel" as const],
    defaultFormat: "excel" as const,
    fields: catalogFieldsForType("purchase-order", locale).map((field) => ({
      ...field,
      enabled: false,
    })),
    createdAt: now,
    updatedAt: now,
  };
}

export function sortFields(fields: TemplateField[]) {
  return [...fields].sort((a, b) => a.order - b.order);
}

export function getActiveFields(template: { fields: TemplateField[] }) {
  return sortFields(template.fields).filter((field) => field.enabled);
}

export function reorderFields(
  fields: TemplateField[],
  fromIndex: number,
  toIndex: number
) {
  const sorted = sortFields(fields);
  const next = [...sorted];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);

  return next.map((field, index) => ({ ...field, order: index }));
}
