import {
  getRecordAmount,
  isPaidStatus,
  isUnpaidStatus,
} from "@/lib/communication/conversation-utils";
import type { ConversationRecord } from "@/lib/communication/types";
import { saveVoucher } from "@/lib/accounting/voucher-storage";

function formatTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

function buildSummary(record: ConversationRecord) {
  return record.product;
}

export function generateAccountingEntriesFromRecords(
  records: ConversationRecord[]
): number {
  const date = formatTodayDate();
  let created = 0;

  for (const record of records) {
    const amount = getRecordAmount(record);
    const summary = buildSummary(record);

    if (amount <= 0) {
      continue;
    }

    const voucherDate = record.orderDate || date;

    if (isPaidStatus(record.paymentStatus)) {
      saveVoucher({
        date: voucherDate,
        vendor: record.customerName,
        invoiceNumber: "",
        summary,
        debitAccount: "現金",
        debitAmount: amount,
        creditAccount: "銷貨收入",
        creditAmount: amount,
        status: "Confirmed",
      });
      created += 1;
      continue;
    }

    if (isUnpaidStatus(record.paymentStatus)) {
      saveVoucher({
        date: voucherDate,
        vendor: record.customerName,
        invoiceNumber: "",
        summary,
        debitAccount: "應收帳款",
        debitAmount: amount,
        creditAccount: "銷貨收入",
        creditAmount: amount,
        status: "Confirmed",
      });
      created += 1;
      continue;
    }

    saveVoucher({
      date: voucherDate,
      vendor: record.customerName,
      invoiceNumber: "",
      summary,
      debitAccount: "現金",
      debitAmount: amount,
      creditAccount: "銷貨收入",
      creditAmount: amount,
      status: "Confirmed",
    });
    created += 1;
  }

  return created;
}
