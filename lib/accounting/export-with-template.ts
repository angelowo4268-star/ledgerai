import { exportRowsWithTemplate } from "@/lib/export/engine";
import type { ExportTemplate } from "@/lib/export/types";
import {
  getExportTemplateById,
  resolveTemplateForExport,
} from "@/lib/export/template-storage";
import { buildExportRows } from "@/lib/export/voucher-resolver";
import type { Voucher } from "@/lib/accounting/voucher-storage";
import type { SupportedLocale } from "@/lib/i18n/types";

export interface ExportVoucher {
  date: string;
  summary: string;
  debitAccount: string;
  debitAmount: number;
  creditAccount: string;
  creditAmount: number;
  vendor: string;
  invoiceNumber: string;
}

export function exportVouchersWithTemplate(
  vouchers: Voucher[],
  template: ExportTemplate,
  locale: SupportedLocale = "zh-TW"
) {
  const resolvedTemplate = resolveTemplateForExport(template, locale);
  const rows = buildExportRows(
    vouchers,
    resolvedTemplate.fields,
    resolvedTemplate.templateType
  );

  exportRowsWithTemplate(resolvedTemplate, rows);
}

export function exportVoucherToExcel(
  voucher: ExportVoucher,
  locale: SupportedLocale = "zh-TW"
) {
  const template = getExportTemplateById("builtin-accounting-voucher", locale);

  if (!template) {
    throw new Error("Accounting voucher template not found.");
  }

  const asVoucher: Voucher = {
    id: "export-preview",
    status: "Draft",
    ...voucher,
  };

  exportVouchersWithTemplate([asVoucher], template, locale);
}

export function exportVouchersToExcel(
  vouchers: Voucher[],
  locale: SupportedLocale = "zh-TW"
) {
  const template = getExportTemplateById("builtin-accounting-voucher", locale);

  if (!template) {
    throw new Error("Accounting voucher template not found.");
  }

  exportVouchersWithTemplate(vouchers, template, locale);
}
