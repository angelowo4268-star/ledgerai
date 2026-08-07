import type { ExportRow, TemplateField } from "@/lib/export/types";
import type { Voucher } from "@/lib/accounting/voucher-storage";

function getAccountingFieldValue(
  voucher: Voucher,
  key: string
): string | number {
  switch (key) {
    case "date":
      return voucher.date;
    case "vendor":
      return voucher.vendor;
    case "invoiceNumber":
      return voucher.invoiceNumber;
    case "summary":
      return voucher.summary;
    case "debitAccount":
      return voucher.debitAccount;
    case "debitAmount":
      return voucher.debitAmount;
    case "creditAccount":
      return voucher.creditAccount;
    case "creditAmount":
      return voucher.creditAmount;
    case "status":
      return voucher.status;
    default:
      return "";
  }
}

function getPurchaseOrderFieldValue(
  voucher: Voucher,
  key: string
): string | number | boolean {
  switch (key) {
    case "orderNumber":
      return voucher.invoiceNumber;
    case "customerName":
      return voucher.vendor;
    case "customerId":
      return "";
    case "platform":
      return "";
    case "product":
      return voucher.summary;
    case "sku":
      return "";
    case "quantity":
      return 1;
    case "unitPrice":
      return voucher.debitAmount;
    case "amount":
      return voucher.debitAmount;
    case "currency":
      return "TWD";
    case "paymentStatus":
      return voucher.status === "Exported" ? "Paid" : voucher.status;
    case "paymentMethod":
      return "";
    case "paymentDate":
      return voucher.date;
    case "orderStatus":
      return voucher.status;
    case "shippingMethod":
      return "";
    case "trackingNumber":
      return "";
    case "shippingDate":
      return "";
    case "customerNotified":
      return false;
    case "notes":
      return voucher.summary;
    default:
      return "";
  }
}

export function resolveFieldValue(
  voucher: Voucher,
  field: TemplateField,
  templateType: string
): string | number | boolean {
  if (field.isCustom) {
    return "";
  }

  if (templateType === "purchase-order" || templateType === "custom") {
    return getPurchaseOrderFieldValue(voucher, field.key);
  }

  return getAccountingFieldValue(voucher, field.key);
}

export function buildExportRows(
  vouchers: Voucher[],
  fields: TemplateField[],
  templateType: string
): ExportRow[] {
  const activeFields = fields.filter((field) => field.enabled);

  return vouchers.map((voucher) => {
    const row: ExportRow = {};

    activeFields.forEach((field) => {
      row[field.header] = resolveFieldValue(voucher, field, templateType);
    });

    return row;
  });
}
