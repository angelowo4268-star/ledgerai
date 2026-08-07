"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Separator } from "@/components/ui/separator";
import { CATEGORY_OPTIONS } from "@/lib/ai-analysis/category-options";
import {
  fromFormValues,
  toFormValues,
} from "@/lib/ai-analysis/form-utils";
import { useTranslation } from "@/lib/i18n/context";
import type {
  AIAnalysisResult,
  EditableAIFormValues,
} from "@/lib/ai-analysis/types";

interface AIAnalysisResultsProps {
  result: AIAnalysisResult;
  onSave: (updated: AIAnalysisResult) => void;
  onToast: (message: string) => void;
}

export function AIAnalysisResults({
  result,
  onSave,
  onToast,
}: AIAnalysisResultsProps) {
  const { t } = useTranslation();
  const [savedValues, setSavedValues] = useState<EditableAIFormValues>(() =>
    toFormValues(result)
  );
  const [draftValues, setDraftValues] = useState<EditableAIFormValues>(() =>
    toFormValues(result)
  );

  useEffect(() => {
    const nextValues = toFormValues(result);
    setSavedValues(nextValues);
    setDraftValues(nextValues);
  }, [result]);

  const updateField = <K extends keyof EditableAIFormValues>(
    key: K,
    value: EditableAIFormValues[K]
  ) => {
    setDraftValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const updated = fromFormValues(draftValues, result);
    setSavedValues(draftValues);
    onSave(updated);
    onToast(t("toast.documentSaved"));
  };

  const handleCancel = () => {
    setDraftValues(savedValues);
  };

  const hasChanges =
    JSON.stringify(draftValues) !== JSON.stringify(savedValues);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("aiAnalysis.resultsTitle")}
          </p>
        </div>
        <Badge
          variant="pending"
          className="shrink-0 border border-violet-200 bg-violet-50 text-violet-700"
        >
          <Sparkles className="mr-1 h-3 w-3" />
          {draftValues.confidence}%
        </Badge>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vendor">{t("aiAnalysis.vendor")}</Label>
          <Input
            id="vendor"
            value={draftValues.vendor}
            onChange={(e) => updateField("vendor", e.target.value)}
            placeholder={t("aiAnalysis.vendorPlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">{t("aiAnalysis.invoiceNumber")}</Label>
          <Input
            id="invoiceNumber"
            value={draftValues.invoiceNumber}
            onChange={(e) => updateField("invoiceNumber", e.target.value)}
            placeholder={t("aiAnalysis.invoicePlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">{t("aiAnalysis.amount")}</Label>
          <Input
            id="amount"
            type="number"
            min={0}
            step={1}
            value={draftValues.amount}
            onChange={(e) =>
              updateField("amount", Number(e.target.value) || 0)
            }
            placeholder={t("aiAnalysis.amountPlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">{t("aiAnalysis.date")}</Label>
          <Input
            id="date"
            type="date"
            value={draftValues.date}
            onChange={(e) => updateField("date", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">{t("aiAnalysis.category")}</Label>
          <SearchableSelect
            value={draftValues.category}
            onChange={(value) => updateField("category", value)}
            options={CATEGORY_OPTIONS}
            placeholder={t("aiAnalysis.categoryPlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confidence">{t("aiAnalysis.confidence")}</Label>
          <Input
            id="confidence"
            value={`${draftValues.confidence}%`}
            readOnly
            disabled
            className="bg-muted/50"
          />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={!hasChanges}
          className="h-10 w-full touch-manipulation sm:w-auto"
        >
          {t("common.cancel")}
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges}
          className="h-10 w-full touch-manipulation shadow-sm sm:w-auto"
        >
          {t("common.save")}
        </Button>
      </div>
    </>
  );
}
