import type { SupportedLocale } from "@/lib/i18n/types";

import type { ExportRow, TemplateField, TemplateType } from "@/lib/export/types";

function sampleValue(
  field: TemplateField,
  rowIndex: number,
  locale: SupportedLocale
): string | number | boolean {
  if (field.isCustom) {
    switch (field.customType) {
      case "number":
      case "currency":
        return rowIndex === 0 ? 1200 : 850;
      case "date":
        return rowIndex === 0 ? "2026-08-07" : "2026-08-06";
      case "yes-no":
        return rowIndex === 0;
      case "dropdown":
        return field.dropdownOptions?.[0] ?? "";
      default:
        return rowIndex === 0 ? "Sample" : "Example";
    }
  }

  const samplesEn: Record<string, Array<string | number | boolean>> = {
    date: ["2026-08-07", "2026-08-06"],
    vendor: ["Acme Supplies", "Pacific Telecom"],
    invoiceNumber: ["INV-2026-0312", "INV-2026-0311"],
    summary: ["Office supplies", "Monthly telecom"],
    debitAccount: ["6100 Office Expense", "6200 Utilities"],
    debitAmount: [1245, 3890.5],
    creditAccount: ["2100 Accounts Payable", "2100 Accounts Payable"],
    creditAmount: [1245, 3890.5],
    status: ["Confirmed", "Exported"],
    orderNumber: ["PO-2026-0812", "PO-2026-0811"],
    customerName: ["Jane Chen", "Tokyo Reseller Co."],
    customerId: ["CUS-10021", "CUS-10018"],
    platform: ["Shopee", "Instagram"],
    product: ["Japanese Snack Box", "Limited Figure"],
    sku: ["JP-SNACK-01", "FIG-LTD-08"],
    quantity: [2, 1],
    unitPrice: [620, 850],
    amount: [1240, 850],
    currency: ["TWD", "TWD"],
    paymentStatus: ["Paid", "Unpaid"],
    paymentMethod: ["Credit Card", "Bank Transfer"],
    paymentDate: ["2026-08-07", ""],
    orderStatus: ["Shipped", "Processing"],
    shippingMethod: ["Express", "Standard"],
    trackingNumber: ["TW123456789", ""],
    shippingDate: ["2026-08-07", ""],
    customerNotified: [true, false],
    notes: ["Gift wrap requested", "Awaiting payment"],
  };

  const samplesZh: Record<string, Array<string | number | boolean>> = {
    date: ["2026-08-07", "2026-08-06"],
    vendor: ["Acme 辦公用品", "太平洋電信"],
    invoiceNumber: ["INV-2026-0312", "INV-2026-0311"],
    summary: ["辦公用品", "電信月費"],
    debitAccount: ["6100 辦公用品費", "6200 水電費"],
    debitAmount: [1245, 3890.5],
    creditAccount: ["2100 應付帳款", "2100 應付帳款"],
    creditAmount: [1245, 3890.5],
    status: ["已確認", "已匯出"],
    orderNumber: ["PO-2026-0812", "PO-2026-0811"],
    customerName: ["陳小姐", "東京代購商行"],
    customerId: ["CUS-10021", "CUS-10018"],
    platform: ["Shopee", "Instagram"],
    product: ["日本零食箱", "限定公仔"],
    sku: ["JP-SNACK-01", "FIG-LTD-08"],
    quantity: [2, 1],
    unitPrice: [620, 850],
    amount: [1240, 850],
    currency: ["TWD", "TWD"],
    paymentStatus: ["已付款", "未付款"],
    paymentMethod: ["信用卡", "銀行轉帳"],
    paymentDate: ["2026-08-07", ""],
    orderStatus: ["已出貨", "處理中"],
    shippingMethod: ["快速配送", "標準配送"],
    trackingNumber: ["TW123456789", ""],
    shippingDate: ["2026-08-07", ""],
    customerNotified: [true, false],
    notes: ["需要禮品包裝", "等待付款"],
  };

  const samples = locale === "zh-TW" ? samplesZh : samplesEn;
  const values = samples[field.key];

  if (values) {
    return values[rowIndex] ?? values[0] ?? "";
  }

  return rowIndex === 0 ? "Sample" : "Example";
}

export function buildPreviewRows(
  fields: TemplateField[],
  templateType: TemplateType,
  locale: SupportedLocale,
  rowCount = 3
): ExportRow[] {
  const activeFields = fields
    .filter((field) => field.enabled)
    .sort((a, b) => a.order - b.order);

  return Array.from({ length: rowCount }, (_, rowIndex) => {
    const row: ExportRow = {};

    activeFields.forEach((field) => {
      row[field.header] = sampleValue(field, rowIndex, locale);
    });

    return row;
  });
}

export function getPreviewHeaders(fields: TemplateField[]) {
  return fields
    .filter((field) => field.enabled)
    .sort((a, b) => a.order - b.order)
    .map((field) => field.header);
}
