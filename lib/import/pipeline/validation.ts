import type { MappedImportRow, ValidationIssue } from "@/lib/import/types";

const VALID_CURRENCIES = new Set([
  "TWD",
  "NTD",
  "NT$",
  "USD",
  "EUR",
  "JPY",
  "CNY",
  "HKD",
  "SGD",
]);

function normalizeCurrency(value: string) {
  return value.trim().toUpperCase().replace("$", "");
}

function duplicateKey(row: MappedImportRow) {
  if (row.orderId) {
    return `order:${row.orderId}`;
  }

  return `fallback:${row.customer}:${row.product}:${row.amount}`;
}

export function validateImportRows(rows: MappedImportRow[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seen = new Map<string, number>();

  rows.forEach((row) => {
    if (!row.customer.trim()) {
      issues.push({
        rowIndex: row.rowIndex,
        code: "missing_customer",
        message: "Customer is missing.",
        severity: "error",
      });
    }

    if (row.amount <= 0) {
      issues.push({
        rowIndex: row.rowIndex,
        code: "missing_amount",
        message: "Amount is missing or zero.",
        severity: "error",
      });
    }

    const key = duplicateKey(row);
    if (seen.has(key)) {
      issues.push({
        rowIndex: row.rowIndex,
        code: "duplicate_order",
        message: `Duplicate order detected (matches row ${seen.get(key)}).`,
        severity: "warning",
      });
    } else {
      seen.set(key, row.rowIndex);
    }

    if (row.paid > row.amount && row.amount > 0) {
      issues.push({
        rowIndex: row.rowIndex,
        code: "paid_exceeds_amount",
        message: "Paid amount exceeds total amount.",
        severity: "error",
      });
    }

    const expectedRemaining = Math.max(row.amount - row.paid, 0);
    if (
      row.amount > 0 &&
      row.paid >= 0 &&
      row.remaining >= 0 &&
      Math.abs(row.paid + row.remaining - row.amount) > 0.01
    ) {
      issues.push({
        rowIndex: row.rowIndex,
        code: "payment_mismatch",
        message: "Paid + remaining does not equal amount.",
        severity: "warning",
      });
    }

    const currency = normalizeCurrency(row.currency);
    if (currency && !VALID_CURRENCIES.has(currency)) {
      issues.push({
        rowIndex: row.rowIndex,
        code: "invalid_currency",
        message: `Invalid currency: ${row.currency}`,
        severity: "warning",
      });
    }

    if (row.remaining <= 0 && expectedRemaining > 0 && row.paid < row.amount) {
      // Will be repaired; no issue needed here.
    }
  });

  return issues;
}
