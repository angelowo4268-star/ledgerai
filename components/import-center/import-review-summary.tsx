"use client";

import {
  AlertTriangle,
  Columns3,
  Copy,
  Rows3,
  CircleOff,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ReviewSummary } from "@/lib/import/pipeline/review-summary";
import { cn } from "@/lib/utils";

interface ImportReviewSummaryProps {
  summary: ReviewSummary;
  labels: {
    totalRows: string;
    totalColumns: string;
    missingValues: string;
    invalidValues: string;
    duplicateRecords: string;
  };
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  highlight?: "warning" | "neutral";
}) {
  const hasProblem = highlight === "warning" && value > 0;

  return (
    <div
      className={cn(
        "rounded-xl border bg-background px-4 py-4",
        hasProblem
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-border/60"
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className={cn("h-4 w-4", hasProblem && "text-amber-600")} />
        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p
        className={cn(
          "mt-2 text-2xl font-bold tracking-tight",
          hasProblem ? "text-amber-700" : "text-foreground"
        )}
      >
        {value.toLocaleString()}
      </p>
    </div>
  );
}

export function ImportReviewSummary({
  summary,
  labels,
}: ImportReviewSummaryProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <SummaryTile
        icon={Rows3}
        label={labels.totalRows}
        value={summary.totalRows}
      />
      <SummaryTile
        icon={Columns3}
        label={labels.totalColumns}
        value={summary.totalColumns}
      />
      <SummaryTile
        icon={CircleOff}
        label={labels.missingValues}
        value={summary.missingValues}
        highlight="warning"
      />
      <SummaryTile
        icon={AlertTriangle}
        label={labels.invalidValues}
        value={summary.invalidValues}
        highlight="warning"
      />
      <SummaryTile
        icon={Copy}
        label={labels.duplicateRecords}
        value={summary.duplicateRecords}
        highlight="warning"
      />
    </div>
  );
}
