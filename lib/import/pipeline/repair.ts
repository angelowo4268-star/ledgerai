import type { DataRepair, MappedImportRow } from "@/lib/import/types";

const CURRENCY_MAP: Record<string, string> = {
  NT$: "TWD",
  NTD: "TWD",
  "$": "TWD",
  US$: "USD",
  "美金": "USD",
  "美元": "USD",
  "台幣": "TWD",
  "新台幣": "TWD",
};

function normalizeCurrency(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "TWD";
  }

  const upper = trimmed.toUpperCase();
  return CURRENCY_MAP[trimmed] ?? CURRENCY_MAP[upper] ?? upper.replace("$", "");
}

function inferPaymentStatus(row: MappedImportRow) {
  if (row.amount <= 0) {
    return row.status;
  }

  if (row.paid >= row.amount) {
    return "已付款";
  }

  if (row.paid > 0) {
    return "部分付款";
  }

  return row.status || "未付款";
}

function normalizeDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${year}/${month.padStart(2, "0")}/${day.padStart(2, "0")}`;
  }

  return trimmed;
}

export function applyRuleBasedRepairs(rows: MappedImportRow[]): {
  rows: MappedImportRow[];
  repairs: DataRepair[];
} {
  const repairs: DataRepair[] = [];

  const repairedRows = rows.map((row) => {
    const next = { ...row };

    const normalizedCurrency = normalizeCurrency(next.currency);
    if (normalizedCurrency !== next.currency) {
      repairs.push({
        rowIndex: next.rowIndex,
        field: "currency",
        originalValue: next.currency,
        repairedValue: normalizedCurrency,
        reason: "Normalized currency code.",
      });
      next.currency = normalizedCurrency;
    }

    const expectedRemaining = Math.max(next.amount - next.paid, 0);
    if (
      next.amount > 0 &&
      (next.remaining <= 0 || Math.abs(next.paid + next.remaining - next.amount) > 0.01)
    ) {
      repairs.push({
        rowIndex: next.rowIndex,
        field: "remaining",
        originalValue: String(next.remaining),
        repairedValue: String(expectedRemaining),
        reason: "Recalculated remaining amount.",
      });
      next.remaining = expectedRemaining;
    }

    const paymentStatus = inferPaymentStatus(next);
    if (paymentStatus !== next.status) {
      repairs.push({
        rowIndex: next.rowIndex,
        field: "status",
        originalValue: next.status,
        repairedValue: paymentStatus,
        reason: "Inferred payment status from paid/remaining.",
      });
      next.status = paymentStatus;
    }

    const normalizedRemarks = normalizeDate(next.remarks);
    if (normalizedRemarks !== next.remarks && /^\d{4}/.test(next.remarks)) {
      repairs.push({
        rowIndex: next.rowIndex,
        field: "remarks",
        originalValue: next.remarks,
        repairedValue: normalizedRemarks,
        reason: "Normalized date formatting.",
      });
      next.remarks = normalizedRemarks;
    }

    return next;
  });

  return { rows: repairedRows, repairs };
}

export async function repairRowsWithAi(rows: MappedImportRow[]) {
  const response = await fetch("/api/import/repair", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rows }),
  });

  if (!response.ok) {
    console.error("[Import Center] repair API failed:", response.status);
    return { rows, repairs: [] as DataRepair[] };
  }

  return (await response.json()) as {
    rows: MappedImportRow[];
    repairs: DataRepair[];
  };
}

export async function repairImportRows(rows: MappedImportRow[]) {
  const ruleBased = applyRuleBasedRepairs(rows);
  const aiResult = await repairRowsWithAi(ruleBased.rows);

  return {
    rows: aiResult.rows,
    repairs: [...ruleBased.repairs, ...aiResult.repairs],
  };
}
