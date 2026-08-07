import type {
  AIAnalysisResult,
  EditableAIFormValues,
} from "@/lib/ai-analysis/types";

export function parseAmount(value: string): number {
  const numeric = value.replace(/[^\d.]/g, "");
  const parsed = parseFloat(numeric);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function formatAmount(value: number): string {
  return `NT$${value.toLocaleString("zh-TW", { maximumFractionDigits: 0 })}`;
}

export function parseDisplayDate(value: string): string {
  const normalized = value.replace(/\//g, "-");
  const parts = normalized.split("-");

  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return value;
}

export function formatDisplayDate(value: string): string {
  const parts = value.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${year}/${month}/${day}`;
  }
  return value;
}

export function toFormValues(result: AIAnalysisResult): EditableAIFormValues {
  return {
    vendor: result.vendor,
    invoiceNumber: result.invoiceNumber,
    amount: parseAmount(result.amount),
    date: parseDisplayDate(result.date),
    category: result.suggestedAccount,
    confidence: result.confidence,
  };
}

export function fromFormValues(
  values: EditableAIFormValues,
  base: AIAnalysisResult
): AIAnalysisResult {
  return {
    ...base,
    vendor: values.vendor,
    invoiceNumber: values.invoiceNumber,
    amount: formatAmount(values.amount),
    date: formatDisplayDate(values.date),
    suggestedAccount: values.category,
    confidence: values.confidence,
  };
}
