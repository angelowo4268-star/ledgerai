import type { VoucherStatus } from "@/lib/accounting/voucher-storage";
import type { TranslationKey } from "@/lib/i18n/types";

export function getVoucherStatusLabel(
  status: VoucherStatus,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
): string {
  switch (status) {
    case "Draft":
      return t("voucher.statusDraft");
    case "Confirmed":
      return t("voucher.statusConfirmed");
    case "Exported":
      return t("voucher.statusExported");
    default:
      return status;
  }
}

export function getVoucherStatusVariant(
  status: VoucherStatus
): "pending" | "success" | "warning" {
  switch (status) {
    case "Draft":
      return "pending";
    case "Confirmed":
      return "success";
    case "Exported":
      return "warning";
    default:
      return "pending";
  }
}
