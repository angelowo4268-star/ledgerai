import ExcelJS from "exceljs";

import type { ConversationRecord } from "@/lib/communication/types";

const EXPORT_COLUMNS = [
  "No",
  "Customer",
  "Product",
  "Quantity",
  "Amount",
  "Currency",
  "Payment Status",
  "Payment Method",
  "Order Status",
  "Order Date",
  "Customer Notified",
  "Confidence",
  "Note",
] as const;

const AMOUNT_COLUMN_INDEX = 5;
const CURRENCY_NUMBER_FORMAT = "#,##0.00";

function buildExportFilename() {
  const stamp = new Date().toISOString().slice(0, 10);
  return `LedgerAI_Orders_${stamp}.xlsx`;
}

function toExportRow(record: ConversationRecord, index: number) {
  return [
    index + 1,
    record.customerName,
    record.product,
    record.quantity,
    record.amount,
    record.currency,
    record.paymentStatus,
    record.paymentMethod,
    record.orderStatus,
    record.orderDate,
    record.customerNotified,
    record.confidence,
    record.notes,
  ];
}

function autoFitColumns(worksheet: ExcelJS.Worksheet) {
  worksheet.columns.forEach((column) => {
    if (!column?.eachCell) {
      return;
    }

    let maxLength = 10;

    column.eachCell({ includeEmpty: true }, (cell) => {
      const value =
        cell.value == null
          ? ""
          : typeof cell.value === "number"
            ? cell.value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : String(cell.value);

      maxLength = Math.max(maxLength, value.length);
    });

    column.width = Math.min(maxLength + 2, 60);
  });
}

function downloadWorkbook(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportConversationsToExcel(
  records: ConversationRecord[]
) {
  if (records.length === 0) {
    throw new Error("No conversation records to export.");
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Orders");

  worksheet.addRow([...EXPORT_COLUMNS]);
  worksheet.getRow(1).font = { bold: true };
  worksheet.views = [{ state: "frozen", ySplit: 1, activeCell: "A2" }];

  records.forEach((record, index) => {
    worksheet.addRow(toExportRow(record, index));
  });

  worksheet.getColumn(AMOUNT_COLUMN_INDEX).numFmt = CURRENCY_NUMBER_FORMAT;
  autoFitColumns(worksheet);

  const buffer = await workbook.xlsx.writeBuffer();
  downloadWorkbook(buffer, buildExportFilename());
}
