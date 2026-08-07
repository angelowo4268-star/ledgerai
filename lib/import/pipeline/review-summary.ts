import type {
  MappedFormImportRow,
  MappedImportRow,
  ValidationIssue,
} from "@/lib/import/types";

export interface ReviewSummary {
  totalRows: number;
  totalColumns: number;
  missingValues: number;
  invalidValues: number;
  duplicateRecords: number;
}

const MISSING_ISSUE_CODES = new Set([
  "missing_customer",
  "missing_amount",
]);

const DUPLICATE_ISSUE_CODE = "duplicate_order";

export function buildSheetReviewSummary(
  rows: MappedImportRow[],
  issues: ValidationIssue[],
  columnCount: number
): ReviewSummary {
  const missingValues = issues.filter((issue) =>
    MISSING_ISSUE_CODES.has(issue.code)
  ).length;

  const invalidValues = issues.filter(
    (issue) =>
      !MISSING_ISSUE_CODES.has(issue.code) &&
      issue.code !== DUPLICATE_ISSUE_CODE
  ).length;

  const duplicateRecords = issues.filter(
    (issue) => issue.code === DUPLICATE_ISSUE_CODE
  ).length;

  return {
    totalRows: rows.length,
    totalColumns: columnCount,
    missingValues,
    invalidValues,
    duplicateRecords,
  };
}

function formDuplicateKey(row: MappedFormImportRow) {
  return `${row.customer}|${row.product}|${row.amount}|${row.date}|${row.status}`;
}

export function buildFormReviewSummary(
  rows: MappedFormImportRow[],
  columnCount: number
): ReviewSummary {
  const missingValues = rows.reduce(
    (sum, row) => sum + row.missingFields.length,
    0
  );

  const invalidValues = rows.filter(
    (row) =>
      !row.missingFields.includes("amount") &&
      row.amount <= 0 &&
      row.missingFields.length === 0
  ).length;

  const seen = new Map<string, number>();
  let duplicateRecords = 0;

  rows.forEach((row) => {
    const key = formDuplicateKey(row);
    if (!row.customer && !row.product && row.amount <= 0) {
      return;
    }

    if (seen.has(key)) {
      duplicateRecords += 1;
    } else {
      seen.set(key, row.rowIndex);
    }
  });

  return {
    totalRows: rows.length,
    totalColumns: columnCount,
    missingValues,
    invalidValues,
    duplicateRecords,
  };
}
