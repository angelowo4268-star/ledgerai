"use client";

import {
  formatCurrency,
  type MonthlyTrendPoint,
} from "@/lib/accounting/dashboard-stats";

import { ChartEmptyState } from "./chart-empty-state";

interface ExpenseTrendChartProps {
  data: MonthlyTrendPoint[];
  hasData: boolean;
}

export function ExpenseTrendChart({ data, hasData }: ExpenseTrendChartProps) {
  if (!hasData) {
    return <ChartEmptyState messageKey="dashboard.noTrendData" />;
  }

  const maxValue = Math.max(...data.map((point) => point.value), 1);
  const width = 100;
  const height = 100;
  const points = data
    .map((point, index) => {
      const x =
        data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
      const y = height - (point.value / maxValue) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-52 w-full overflow-visible sm:h-56"
        role="img"
        aria-label="Monthly expense trend chart"
      >
        {[0, 1, 2, 3].map((line) => (
          <line
            key={line}
            x1="0"
            y1={line * 28 + 8}
            x2={width}
            y2={line * 28 + 8}
            className="stroke-border/70"
            strokeWidth="0.5"
          />
        ))}
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill="url(#trendGradient)"
        />
        <polyline
          fill="none"
          points={points}
          stroke="#7c3aed"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((point, index) => {
          const x =
            data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
          const y = height - (point.value / maxValue) * (height - 8) - 4;

          return (
            <g key={point.label}>
              <circle cx={x} cy={y} r="3" fill="#7c3aed" />
              <title>
                {point.label}: {formatCurrency(point.value)}
              </title>
            </g>
          );
        })}
      </svg>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {data.map((point) => (
          <div
            key={point.label}
            className="rounded-lg border border-border/60 bg-muted/20 px-2 py-2 text-center"
          >
            <p className="text-xs text-muted-foreground">{point.label}</p>
            <p className="mt-1 text-xs font-medium tabular-nums sm:text-sm">
              {formatCurrency(point.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
