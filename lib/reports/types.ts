export type DateRangePreset = "today" | "week" | "month" | "custom";

export interface DateRange {
  preset: DateRangePreset;
  start: Date;
  end: Date;
  label: string;
}

export interface ReportKpis {
  revenue: number;
  expense: number;
  profit: number;
  pendingOrders: number;
  customersToNotify: number;
}

export interface RankedItem {
  name: string;
  amount: number;
  count: number;
}

export interface TrendInsight {
  label: string;
  current: number;
  previous: number;
  direction: "up" | "down" | "flat";
}

export interface BusinessSuggestions {
  revenueTrend: string;
  expenseTrend: string;
  outstandingPayments: string;
  customersFollowUp: string;
}

export interface ReportSnapshot {
  range: DateRange;
  kpis: ReportKpis;
  topCustomers: RankedItem[];
  topProducts: RankedItem[];
  businessSummary: string;
  suggestions: BusinessSuggestions;
  generatedAt: string;
}
