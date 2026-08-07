"use client";

import {
  formatCurrency,
  type CategorySlice,
} from "@/lib/accounting/dashboard-stats";

import { ChartEmptyState } from "./chart-empty-state";

interface CategoryPieChartProps {
  data: CategorySlice[];
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  if (total === 0) {
    return <ChartEmptyState messageKey="dashboard.noCategoryData" />;
  }

  let cumulative = 0;
  const gradient = data
    .map((slice) => {
      const start = (cumulative / total) * 100;
      cumulative += slice.value;
      const end = (cumulative / total) * 100;
      return `${slice.color} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-5 lg:flex-row lg:items-start">
      <div
        className="relative h-40 w-40 shrink-0 rounded-full sm:h-44 sm:w-44"
        style={{ background: `conic-gradient(${gradient})` }}
      >
        <div className="absolute inset-6 flex items-center justify-center rounded-full bg-card text-center">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Total
            </p>
            <p className="mt-1 text-xs font-semibold tabular-nums sm:text-sm">
              {formatCurrency(total)}
            </p>
          </div>
        </div>
      </div>
      <div className="grid w-full gap-3 lg:max-w-xs">
        {data.map((slice) => {
          const percentage = Math.round((slice.value / total) * 100);

          return (
            <div
              key={slice.label}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="truncate">
                  {slice.label}
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({percentage}%)
                  </span>
                </span>
              </div>
              <span className="font-medium tabular-nums">
                {formatCurrency(slice.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
