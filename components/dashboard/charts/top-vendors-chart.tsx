"use client";

import {
  formatCurrency,
  type VendorBar,
} from "@/lib/accounting/dashboard-stats";

import { ChartEmptyState } from "./chart-empty-state";

interface TopVendorsChartProps {
  data: VendorBar[];
}

export function TopVendorsChart({ data }: TopVendorsChartProps) {
  const maxValue = Math.max(...data.map((item) => item.amount), 1);

  if (data.length === 0) {
    return <ChartEmptyState messageKey="dashboard.noVendorData" />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
      {data.map((item, index) => (
        <div key={item.vendor} className="space-y-2 rounded-xl border border-border/60 p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <span className="truncate font-medium">{item.vendor}</span>
            </div>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {formatCurrency(item.amount)}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(item.amount / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
