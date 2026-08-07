import {
  computeDashboardSummary,
  parseVoucherDate,
} from "@/lib/accounting/dashboard-stats";
import { getVouchers } from "@/lib/accounting/voucher-storage";
import type { Voucher } from "@/lib/accounting/voucher-storage";
import {
  isPaidStatus,
  isUnpaidStatus,
} from "@/lib/communication/conversation-utils";
import { getConversationRecords } from "@/lib/communication/conversation-storage";
import type { ConversationRecord } from "@/lib/communication/types";
import {
  getPreviousRange,
  isWithinRange,
  parseFlexibleDate,
} from "@/lib/reports/date-range";
import type {
  DateRange,
  RankedItem,
  ReportKpis,
  ReportSnapshot,
} from "@/lib/reports/types";

function isIncomeCredit(account: string) {
  const normalized = account.toLowerCase();
  return (
    account.includes("銷貨") ||
    account.includes("收入") ||
    normalized.includes("revenue") ||
    normalized.includes("sales")
  );
}

function isExpenseDebit(account: string) {
  return !account.includes("應收");
}

function getConversationDate(record: ConversationRecord) {
  const createdAt = record.createdAt ?? record.analyzedAt;

  return (
    parseFlexibleDate(record.orderDate) ??
    parseFlexibleDate(record.paymentDate) ??
    parseFlexibleDate(createdAt.slice(0, 10)) ??
    new Date(createdAt)
  );
}

function getVoucherRecordDate(voucher: Voucher, fallback: Date) {
  return parseVoucherDate(voucher.date) ?? fallback;
}

function isCustomerNotified(value?: string) {
  if (!value?.trim()) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return !(
    normalized === "no" ||
    normalized === "false" ||
    normalized.includes("未通知") ||
    normalized.includes("否")
  );
}

function filterConversations(records: ConversationRecord[], range: DateRange) {
  return records.filter((record) =>
    isWithinRange(getConversationDate(record), range)
  );
}

function filterVouchers(vouchers: Voucher[], range: DateRange) {
  const fallback = new Date();
  return vouchers.filter((voucher) =>
    isWithinRange(getVoucherRecordDate(voucher, fallback), range)
  );
}

function computeRevenue(
  conversations: ConversationRecord[],
  vouchers: Voucher[]
) {
  const conversationRevenue = conversations.reduce(
    (total, record) =>
      isPaidStatus(record.paymentStatus) ? total + record.amount : total,
    0
  );

  const voucherRevenue = vouchers.reduce(
    (total, voucher) =>
      isIncomeCredit(voucher.creditAccount)
        ? total + voucher.creditAmount
        : total,
    0
  );

  return conversationRevenue + voucherRevenue;
}

function computeExpense(vouchers: Voucher[]) {
  return vouchers.reduce(
    (total, voucher) =>
      isExpenseDebit(voucher.debitAccount) ? total + voucher.debitAmount : total,
    0
  );
}

export function computeReportKpis(
  conversations: ConversationRecord[],
  vouchers: Voucher[],
  range: DateRange
): ReportKpis {
  const filteredConversations = filterConversations(conversations, range);
  const filteredVouchers = filterVouchers(vouchers, range);

  const revenue = computeRevenue(filteredConversations, filteredVouchers);
  const expense = computeExpense(filteredVouchers);

  const pendingOrders = filteredConversations.filter((record) =>
    isUnpaidStatus(record.paymentStatus)
  ).length;

  const customersToNotify = filteredConversations.filter(
    (record) => !isCustomerNotified(record.customerNotified)
  ).length;

  return {
    revenue,
    expense,
    profit: revenue - expense,
    pendingOrders,
    customersToNotify,
  };
}

function aggregateRankedItems(
  items: Array<{ name: string; amount: number }>,
  limit = 5
): RankedItem[] {
  const totals = new Map<string, { amount: number; count: number }>();

  items.forEach((item) => {
    const name = item.name.trim();
    if (!name) {
      return;
    }

    const current = totals.get(name) ?? { amount: 0, count: 0 };
    totals.set(name, {
      amount: current.amount + item.amount,
      count: current.count + 1,
    });
  });

  return [...totals.entries()]
    .map(([name, stats]) => ({
      name,
      amount: stats.amount,
      count: stats.count,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export function computeTopCustomers(
  conversations: ConversationRecord[],
  range: DateRange
): RankedItem[] {
  const filtered = filterConversations(conversations, range);

  return aggregateRankedItems(
    filtered.map((record) => ({
      name: record.customerName,
      amount: record.amount,
    }))
  );
}

export function computeTopProducts(
  conversations: ConversationRecord[],
  range: DateRange
): RankedItem[] {
  const filtered = filterConversations(conversations, range);

  return aggregateRankedItems(
    filtered.map((record) => ({
      name: record.product,
      amount: record.amount,
    }))
  );
}

function compareTrend(current: number, previous: number) {
  if (Math.abs(current - previous) <= 0.01) {
    return "flat" as const;
  }

  return current > previous ? ("up" as const) : ("down" as const);
}

function periodLabel(preset: DateRange["preset"], locale: "zh-TW" | "en") {
  if (preset === "today") {
    return locale === "zh-TW" ? "今天" : "today";
  }
  if (preset === "week") {
    return locale === "zh-TW" ? "本週" : "this week";
  }
  if (preset === "custom") {
    return locale === "zh-TW" ? "所選期間" : "the selected period";
  }

  return locale === "zh-TW" ? "本月" : "this month";
}

export function generateBusinessSummary(
  conversations: ConversationRecord[],
  vouchers: Voucher[],
  range: DateRange,
  topProducts: RankedItem[],
  kpis: ReportKpis,
  locale: "zh-TW" | "en"
): string {
  const previousRange = getPreviousRange(range);
  const previousKpis = computeReportKpis(conversations, vouchers, previousRange);
  const revenueTrend = compareTrend(kpis.revenue, previousKpis.revenue);
  const period = periodLabel(range.preset, locale);
  const topProduct = topProducts[0]?.name;
  const sentences: string[] = [];

  if (locale === "zh-TW") {
    if (revenueTrend === "up") {
      sentences.push(`${period}營收較上期成長。`);
    } else if (revenueTrend === "down") {
      sentences.push(`${period}營收較上期下滑。`);
    } else {
      sentences.push(`${period}營收與上期大致持平。`);
    }

    if (kpis.pendingOrders > 0) {
      sentences.push(`仍有 ${kpis.pendingOrders} 筆訂單尚未付款。`);
    } else {
      sentences.push("目前沒有待付款訂單。");
    }

    if (topProduct) {
      sentences.push(`${topProduct} 是目前最熱銷產品。`);
    }

    if (kpis.customersToNotify > 0) {
      sentences.push(`仍有 ${kpis.customersToNotify} 位客戶需要後續通知。`);
    } else {
      sentences.push("所有客戶皆已完成通知。");
    }
  } else {
    if (revenueTrend === "up") {
      sentences.push(`Revenue increased during ${period}.`);
    } else if (revenueTrend === "down") {
      sentences.push(`Revenue decreased during ${period}.`);
    } else {
      sentences.push(`Revenue remained flat during ${period}.`);
    }

    if (kpis.pendingOrders > 0) {
      sentences.push(`${kpis.pendingOrders} orders are still unpaid.`);
    } else {
      sentences.push("There are no unpaid orders in this period.");
    }

    if (topProduct) {
      sentences.push(`${topProduct} is the top selling product.`);
    }

    if (kpis.customersToNotify > 0) {
      sentences.push(`${kpis.customersToNotify} customers still need follow-up.`);
    } else {
      sentences.push("All customers have been notified.");
    }
  }

  return sentences.join(" ");
}

export function generateBusinessSuggestions(
  conversations: ConversationRecord[],
  vouchers: Voucher[],
  range: DateRange,
  kpis: ReportKpis,
  locale: "zh-TW" | "en"
) {
  const previousRange = getPreviousRange(range);
  const previousKpis = computeReportKpis(conversations, vouchers, previousRange);
  const dashboard = computeDashboardSummary(vouchers);
  const revenueTrend = compareTrend(kpis.revenue, previousKpis.revenue);
  const expenseTrend = compareTrend(kpis.expense, previousKpis.expense);

  const outstandingTotal = filterConversations(conversations, range)
    .filter((record) => isUnpaidStatus(record.paymentStatus))
    .reduce((total, record) => total + record.amount, 0);

  const revenueTrendText =
    locale === "zh-TW"
      ? revenueTrend === "up"
        ? `營收較上期增加 NT$ ${(kpis.revenue - previousKpis.revenue).toLocaleString("zh-TW")}。`
        : revenueTrend === "down"
          ? `營收較上期減少 NT$ ${(previousKpis.revenue - kpis.revenue).toLocaleString("zh-TW")}。`
          : "營收與上期持平。"
      : revenueTrend === "up"
        ? `Revenue is up NT$ ${(kpis.revenue - previousKpis.revenue).toLocaleString("en-US")} versus the prior period.`
        : revenueTrend === "down"
          ? `Revenue is down NT$ ${(previousKpis.revenue - kpis.revenue).toLocaleString("en-US")} versus the prior period.`
          : "Revenue is unchanged versus the prior period.";

  const expenseTrendText =
    locale === "zh-TW"
      ? expenseTrend === "up"
        ? `支出較上期增加 NT$ ${(kpis.expense - previousKpis.expense).toLocaleString("zh-TW")}；儀表板本月支出為 NT$ ${dashboard.monthlyExpense.toLocaleString("zh-TW")}。`
        : expenseTrend === "down"
          ? `支出較上期減少 NT$ ${(previousKpis.expense - kpis.expense).toLocaleString("zh-TW")}；儀表板本月支出為 NT$ ${dashboard.monthlyExpense.toLocaleString("zh-TW")}。`
          : `支出與上期持平；儀表板本月支出為 NT$ ${dashboard.monthlyExpense.toLocaleString("zh-TW")}。`
      : expenseTrend === "up"
        ? `Expenses rose NT$ ${(kpis.expense - previousKpis.expense).toLocaleString("en-US")} versus the prior period; dashboard monthly expense is NT$ ${dashboard.monthlyExpense.toLocaleString("en-US")}.`
        : expenseTrend === "down"
          ? `Expenses fell NT$ ${(previousKpis.expense - kpis.expense).toLocaleString("en-US")} versus the prior period; dashboard monthly expense is NT$ ${dashboard.monthlyExpense.toLocaleString("en-US")}.`
          : `Expenses are flat versus the prior period; dashboard monthly expense is NT$ ${dashboard.monthlyExpense.toLocaleString("en-US")}.`;

  const outstandingPayments =
    locale === "zh-TW"
      ? outstandingTotal > 0
        ? `尚有 NT$ ${outstandingTotal.toLocaleString("zh-TW")} 未收款项，涉及 ${kpis.pendingOrders} 筆待處理訂單。`
        : "目前沒有未收款项。"
      : outstandingTotal > 0
        ? `NT$ ${outstandingTotal.toLocaleString("en-US")} in outstanding payments across ${kpis.pendingOrders} pending orders.`
        : "No outstanding payments in this period.";

  const customersFollowUp =
    locale === "zh-TW"
      ? kpis.customersToNotify > 0
        ? `${kpis.customersToNotify} 位客戶仍需付款或出貨通知。`
        : "所有客戶皆已完成必要通知。"
      : kpis.customersToNotify > 0
        ? `${kpis.customersToNotify} customers still need payment or shipping follow-up.`
        : "All customers have received necessary follow-up.";

  return {
    revenueTrend: revenueTrendText,
    expenseTrend: expenseTrendText,
    outstandingPayments,
    customersFollowUp,
  };
}

export function buildReportSnapshot(
  range: DateRange,
  locale: "zh-TW" | "en"
): ReportSnapshot {
  const conversations = getConversationRecords();
  const vouchers = getVouchers();
  const kpis = computeReportKpis(conversations, vouchers, range);
  const topCustomers = computeTopCustomers(conversations, range);
  const topProducts = computeTopProducts(conversations, range);

  return {
    range,
    kpis,
    topCustomers,
    topProducts,
    businessSummary: generateBusinessSummary(
      conversations,
      vouchers,
      range,
      topProducts,
      kpis,
      locale
    ),
    suggestions: generateBusinessSuggestions(
      conversations,
      vouchers,
      range,
      kpis,
      locale
    ),
    generatedAt: new Date().toISOString(),
  };
}
