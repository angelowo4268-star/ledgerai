import type { Voucher } from "@/lib/accounting/voucher-storage";

export interface DashboardSummary {
  monthlyExpense: number;
  totalVoucherCount: number;
  aiSuccessRate: number;
  pendingDraftCount: number;
}

export interface MonthlyTrendPoint {
  label: string;
  value: number;
}

export interface CategorySlice {
  label: string;
  value: number;
  color: string;
}

export interface VendorBar {
  vendor: string;
  amount: number;
}

interface MonthBucket {
  year: number;
  month: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Software: "#7c3aed",
  Transportation: "#6366f1",
  Office: "#8b5cf6",
  Meal: "#a855f7",
  Misc: "#c084fc",
};

const MONTH_LABELS = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

function createLocalDate(year: number, month: number, day: number): Date | null {
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function parseVoucherDate(date: string): Date | null {
  const trimmed = date.trim();
  if (!trimmed) {
    return null;
  }

  const isoMatch = trimmed.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
  if (isoMatch) {
    return createLocalDate(
      Number(isoMatch[1]),
      Number(isoMatch[2]),
      Number(isoMatch[3])
    );
  }

  const rocMatch = trimmed.match(/^(\d{2,3})[./-](\d{1,2})[./-](\d{1,2})$/);
  if (rocMatch) {
    return createLocalDate(
      Number(rocMatch[1]) + 1911,
      Number(rocMatch[2]),
      Number(rocMatch[3])
    );
  }

  const localizedMatch = trimmed.match(
    /^(\d{4})年(\d{1,2})月(\d{1,2})日?$/
  );
  if (localizedMatch) {
    return createLocalDate(
      Number(localizedMatch[1]),
      Number(localizedMatch[2]),
      Number(localizedMatch[3])
    );
  }

  return null;
}

function getVoucherMonthBucket(
  voucher: Voucher,
  now: Date
): MonthBucket {
  const parsed = parseVoucherDate(voucher.date);
  if (parsed) {
    return {
      year: parsed.getFullYear(),
      month: parsed.getMonth(),
    };
  }

  return {
    year: now.getFullYear(),
    month: now.getMonth(),
  };
}

function isSameMonthBucket(bucket: MonthBucket, reference: Date): boolean {
  return (
    bucket.year === reference.getFullYear() &&
    bucket.month === reference.getMonth()
  );
}

export function mapDebitAccountToCategory(account: string): string {
  if (account.includes("軟體")) {
    return "Software";
  }

  if (account.includes("交通") || account.includes("差旅")) {
    return "Transportation";
  }

  if (account.includes("辦公")) {
    return "Office";
  }

  if (account.includes("餐飲") || account.includes("交際")) {
    return "Meal";
  }

  return "Misc";
}

export function computeDashboardSummary(
  vouchers: Voucher[],
  now = new Date()
): DashboardSummary {
  const monthlyExpense = vouchers.reduce((total, voucher) => {
    const bucket = getVoucherMonthBucket(voucher, now);
    if (!isSameMonthBucket(bucket, now)) {
      return total;
    }

    return total + voucher.debitAmount;
  }, 0);

  return {
    monthlyExpense,
    totalVoucherCount: vouchers.length,
    aiSuccessRate: 96,
    pendingDraftCount: vouchers.filter((voucher) => voucher.status === "Draft")
      .length,
  };
}

export function computeMonthlyTrend(
  vouchers: Voucher[],
  months = 6,
  now = new Date()
): MonthlyTrendPoint[] {
  const points: MonthlyTrendPoint[] = [];

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const total = vouchers.reduce((sum, voucher) => {
      const bucket = getVoucherMonthBucket(voucher, now);
      if (
        bucket.year !== monthDate.getFullYear() ||
        bucket.month !== monthDate.getMonth()
      ) {
        return sum;
      }

      return sum + voucher.debitAmount;
    }, 0);

    points.push({
      label: MONTH_LABELS[monthDate.getMonth()],
      value: total,
    });
  }

  return points;
}

export function computeCategoryBreakdown(vouchers: Voucher[]): CategorySlice[] {
  const totals = new Map<string, number>();

  for (const voucher of vouchers) {
    const category = mapDebitAccountToCategory(voucher.debitAccount);
    totals.set(category, (totals.get(category) ?? 0) + voucher.debitAmount);
  }

  return ["Software", "Transportation", "Office", "Meal", "Misc"]
    .map((label) => ({
      label,
      value: totals.get(label) ?? 0,
      color: CATEGORY_COLORS[label],
    }))
    .filter((slice) => slice.value > 0);
}

export function computeTopVendors(
  vouchers: Voucher[],
  limit = 5
): VendorBar[] {
  const totals = new Map<string, number>();

  for (const voucher of vouchers) {
    const vendor = voucher.vendor.trim() || "未知供應商";
    totals.set(vendor, (totals.get(vendor) ?? 0) + voucher.debitAmount);
  }

  return [...totals.entries()]
    .map(([vendor, amount]) => ({ vendor, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export function getRecentVouchers(
  vouchers: Voucher[],
  limit = 5
): Voucher[] {
  return [...vouchers]
    .sort((a, b) => {
      const dateA = parseVoucherDate(a.date)?.getTime() ?? 0;
      const dateB = parseVoucherDate(b.date)?.getTime() ?? 0;
      return dateB - dateA;
    })
    .slice(0, limit);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function hasVoucherData(vouchers: Voucher[]): boolean {
  return vouchers.length > 0;
}

export function hasExpenseTrendData(vouchers: Voucher[]): boolean {
  return vouchers.some((voucher) => voucher.debitAmount > 0);
}
