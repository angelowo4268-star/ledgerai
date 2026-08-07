import * as XLSX from "xlsx";

import type { ChatRecord } from "@/lib/chat-records/types";

const EXPORT_COLUMNS = [
  "Customer Name",
  "Paid Amount",
  "Unpaid Amount",
  "Refund Amount",
  "Payment Status",
  "Order Note",
  "Source",
  "Analyzed At",
] as const;

function toExportRow(record: ChatRecord) {
  return {
    "Customer Name": record.customerName,
    "Paid Amount": record.paidAmount,
    "Unpaid Amount": record.unpaidAmount,
    "Refund Amount": record.refundAmount,
    "Payment Status": record.paymentStatus,
    "Order Note": record.orderNote,
    Source: record.sourceLabel,
    "Analyzed At": record.analyzedAt,
  };
}

function buildExportFilename() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `chat-records-${year}${month}${day}.xlsx`;
}

export function exportChatRecordsToExcel(records: ChatRecord[]) {
  if (records.length === 0) {
    throw new Error("No chat records to export.");
  }

  const worksheet = XLSX.utils.json_to_sheet(records.map(toExportRow), {
    header: [...EXPORT_COLUMNS],
  });
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Chat Records");
  XLSX.writeFile(workbook, buildExportFilename());
}
