"use client";

import { Loader2, RotateCcw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type MappingConfidenceTone = "high" | "medium" | "low" | "none";

export function getMappingConfidenceTone(
  confidence: number,
  hasHeader: boolean
): MappingConfidenceTone {
  if (!hasHeader || confidence <= 0) {
    return "none";
  }

  if (confidence > 95) {
    return "high";
  }

  if (confidence >= 70) {
    return "medium";
  }

  return "low";
}

const toneStyles: Record<
  MappingConfidenceTone,
  { text: string; bar: string; badge: string }
> = {
  high: {
    text: "text-emerald-600",
    bar: "bg-emerald-500",
    badge: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700",
  },
  medium: {
    text: "text-amber-600",
    bar: "bg-amber-500",
    badge: "border-amber-500/25 bg-amber-500/10 text-amber-700",
  },
  low: {
    text: "text-destructive",
    bar: "bg-destructive",
    badge: "border-destructive/25 bg-destructive/10 text-destructive",
  },
  none: {
    text: "text-muted-foreground",
    bar: "bg-muted-foreground/30",
    badge: "border-border/60 bg-muted/40 text-muted-foreground",
  },
};

interface ImportMappingFieldCardProps {
  fieldId: string;
  fieldLabel: string;
  header: string | null;
  confidence: number;
  headers: string[];
  unmappedLabel: string;
  mappedToLabel: string;
  confidenceLabel: string;
  resetLabel: string;
  aiRemapLabel: string;
  disabled?: boolean;
  remapping?: boolean;
  onChange: (header: string) => void;
  onReset: () => void;
  onAiRemap: () => void;
}

export function ImportMappingFieldCard({
  fieldId,
  fieldLabel,
  header,
  confidence,
  headers,
  unmappedLabel,
  mappedToLabel,
  confidenceLabel,
  resetLabel,
  aiRemapLabel,
  disabled = false,
  remapping = false,
  onChange,
  onReset,
  onAiRemap,
}: ImportMappingFieldCardProps) {
  const hasHeader = Boolean(header);
  const tone = getMappingConfidenceTone(confidence, hasHeader);
  const styles = toneStyles[tone];
  const displayConfidence = hasHeader ? confidence : 0;

  return (
    <div
      className={cn(
        "rounded-xl border bg-background p-4 shadow-sm transition-colors",
        tone === "high" && "border-emerald-500/20",
        tone === "medium" && "border-amber-500/20",
        tone === "low" && "border-destructive/20",
        tone === "none" && "border-border/60"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <Label
            htmlFor={fieldId}
            className="text-sm font-semibold text-foreground"
          >
            {fieldLabel}
          </Label>
          <p className="text-xs text-muted-foreground">
            {mappedToLabel}{" "}
            <span className="font-medium text-foreground">
              {header ?? unmappedLabel}
            </span>
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
            styles.badge
          )}
        >
          {displayConfidence}%
        </span>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{confidenceLabel}</span>
          <span className={cn("font-semibold", styles.text)}>
            {displayConfidence}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all duration-300", styles.bar)}
            style={{ width: `${Math.max(displayConfidence, hasHeader ? 4 : 0)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <select
          id={fieldId}
          value={header ?? "__none__"}
          disabled={disabled || remapping}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <option value="__none__">{unmappedLabel}</option>
          {headers.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || remapping}
            onClick={onReset}
            className="h-8"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {resetLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || remapping}
            onClick={onAiRemap}
            className="h-8"
          >
            {remapping ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {aiRemapLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ImportMappingPanelProps {
  title: string;
  description: string;
  fields: Array<{ key: string; label: string }>;
  mappings: Array<{
    field: string;
    header: string | null;
    confidence: number;
  }>;
  headers: string[];
  unmappedLabel: string;
  mappedToLabel: string;
  confidenceLabel: string;
  resetLabel: string;
  aiRemapLabel: string;
  aiRemapAllLabel: string;
  resetAllLabel: string;
  disabled?: boolean;
  remappingField: string | null;
  remappingAll?: boolean;
  onChange: (field: string, header: string) => void;
  onResetField: (field: string) => void;
  onAiRemapField: (field: string) => void;
  onResetAll: () => void;
  onAiRemapAll: () => void;
}

export function ImportMappingPanel({
  title,
  description,
  fields,
  mappings,
  headers,
  unmappedLabel,
  mappedToLabel,
  confidenceLabel,
  resetLabel,
  aiRemapLabel,
  aiRemapAllLabel,
  resetAllLabel,
  disabled = false,
  remappingField,
  remappingAll = false,
  onChange,
  onResetField,
  onAiRemapField,
  onResetAll,
  onAiRemapAll,
}: ImportMappingPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-foreground sm:text-lg">
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || remappingAll || Boolean(remappingField)}
            onClick={onResetAll}
            className="h-9"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {resetAllLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={disabled || remappingAll || Boolean(remappingField)}
            onClick={onAiRemapAll}
            className="h-9"
          >
            {remappingAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {aiRemapAllLabel}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map(({ key, label }) => {
          const mapping = mappings.find((item) => item.field === key);

          return (
            <ImportMappingFieldCard
              key={key}
              fieldId={`map-${key}`}
              fieldLabel={label}
              header={mapping?.header ?? null}
              confidence={mapping?.confidence ?? 0}
              headers={headers}
              unmappedLabel={unmappedLabel}
              mappedToLabel={mappedToLabel}
              confidenceLabel={confidenceLabel}
              resetLabel={resetLabel}
              aiRemapLabel={aiRemapLabel}
              disabled={disabled || remappingAll}
              remapping={remappingField === key}
              onChange={(header) => onChange(key, header)}
              onReset={() => onResetField(key)}
              onAiRemap={() => onAiRemapField(key)}
            />
          );
        })}
      </div>
    </div>
  );
}
