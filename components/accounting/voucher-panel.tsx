"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, FileSpreadsheet, FileText, Pencil, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  SuccessToast,
  useSuccessToast,
} from "@/components/ui/success-toast";
import { formatAmount } from "@/lib/ai-analysis/form-utils";
import { exportVoucherToExcel } from "@/lib/accounting/export-voucher";
import {
  generateVoucherSuggestion,
  type VoucherSuggestion,
} from "@/lib/accounting/generate-voucher-suggestion";
import {
  findRuleByVendor,
  saveRule,
  updateRule,
} from "@/lib/accounting/rule-storage";
import { saveVoucher } from "@/lib/accounting/voucher-storage";
import { useTranslation } from "@/lib/i18n/context";
import type { AIAnalysisResult } from "@/lib/ai-analysis/types";

interface VoucherPanelProps {
  result: AIAnalysisResult;
}

export function VoucherPanel({ result }: VoucherPanelProps) {
  const { t } = useTranslation();
  const toast = useSuccessToast();
  const [rulesVersion, setRulesVersion] = useState(0);

  const suggestion = useMemo(
    () => generateVoucherSuggestion(result),
    [result, rulesVersion]
  );

  const [draft, setDraft] = useState<VoucherSuggestion>(suggestion);
  const [isEditing, setIsEditing] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    const handleRulesUpdate = () => setRulesVersion((value) => value + 1);
    window.addEventListener("ledgerai-rules-updated", handleRulesUpdate);
    return () =>
      window.removeEventListener("ledgerai-rules-updated", handleRulesUpdate);
  }, []);

  useEffect(() => {
    setDraft(suggestion);
    setIsEditing(false);
    setIsAccepted(false);
  }, [suggestion]);

  const handleAccept = () => {
    saveVoucher({
      date: result.date,
      vendor: result.vendor,
      invoiceNumber: result.invoiceNumber,
      summary: draft.summary,
      debitAccount: draft.debitAccount,
      debitAmount: draft.debitAmount,
      creditAccount: draft.creditAccount,
      creditAmount: draft.creditAmount,
      status: "Confirmed",
    });
    setIsEditing(false);
    setIsAccepted(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsAccepted(false);
  };

  const handleExport = () => {
    exportVoucherToExcel({
      date: result.date,
      summary: draft.summary,
      debitAccount: draft.debitAccount,
      debitAmount: draft.debitAmount,
      creditAccount: draft.creditAccount,
      creditAmount: draft.creditAmount,
      vendor: result.vendor,
      invoiceNumber: result.invoiceNumber,
    });
  };

  const handleSaveAsCompanyRule = () => {
    const category = result.suggestedAccount || draft.debitAccount;
    const existingRule = findRuleByVendor(result.vendor);

    if (existingRule) {
      updateRule({
        ...existingRule,
        debitAccount: draft.debitAccount,
        creditAccount: draft.creditAccount,
        category,
        autoApply: true,
      });
      toast.show(t("companyRules.ruleUpdated"));
      return;
    }

    saveRule({
      vendor: result.vendor,
      debitAccount: draft.debitAccount,
      creditAccount: draft.creditAccount,
      category,
      autoApply: true,
    });
    toast.show(t("companyRules.ruleSaved"));
  };

  const updateDraft = <K extends keyof VoucherSuggestion>(
    key: K,
    value: VoucherSuggestion[K]
  ) => {
    setDraft((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "debitAmount") {
        next.creditAmount = value as number;
      }

      if (key === "creditAmount") {
        next.debitAmount = value as number;
      }

      return next;
    });
  };

  return (
    <>
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{t("voucher.aiSuggestedTitle")}</CardTitle>
              {draft.matchedRule && (
                <p className="mt-1 text-xs text-violet-600">
                  {t("companyRules.matchedRuleHint")}
                </p>
              )}
              {isAccepted && (
                <p className="mt-1 text-xs text-emerald-600">{t("voucher.acceptedHint")}</p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("voucher.debit")}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="debit-account">{t("voucher.account")}</Label>
                {isEditing ? (
                  <Input
                    id="debit-account"
                    value={draft.debitAccount}
                    onChange={(e) => updateDraft("debitAccount", e.target.value)}
                  />
                ) : (
                  <p className="rounded-lg border bg-muted/30 px-3 py-2 text-sm font-medium">
                    {draft.debitAccount}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="debit-amount">{t("voucher.debitAmount")}</Label>
                {isEditing ? (
                  <Input
                    id="debit-amount"
                    type="number"
                    min={0}
                    step={1}
                    value={draft.debitAmount}
                    onChange={(e) =>
                      updateDraft("debitAmount", Number(e.target.value) || 0)
                    }
                  />
                ) : (
                  <p className="rounded-lg border bg-muted/30 px-3 py-2 text-sm font-medium">
                    {formatAmount(draft.debitAmount)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("voucher.credit")}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="credit-account">{t("voucher.account")}</Label>
                {isEditing ? (
                  <Input
                    id="credit-account"
                    value={draft.creditAccount}
                    onChange={(e) => updateDraft("creditAccount", e.target.value)}
                  />
                ) : (
                  <p className="rounded-lg border bg-muted/30 px-3 py-2 text-sm font-medium">
                    {draft.creditAccount}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="credit-amount">{t("voucher.creditAmount")}</Label>
                {isEditing ? (
                  <Input
                    id="credit-amount"
                    type="number"
                    min={0}
                    step={1}
                    value={draft.creditAmount}
                    onChange={(e) =>
                      updateDraft("creditAmount", Number(e.target.value) || 0)
                    }
                  />
                ) : (
                  <p className="rounded-lg border bg-muted/30 px-3 py-2 text-sm font-medium">
                    {formatAmount(draft.creditAmount)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="voucher-summary">{t("voucher.orderNote")}</Label>
            {isEditing ? (
              <Input
                id="voucher-summary"
                value={draft.summary}
                onChange={(e) => updateDraft("summary", e.target.value)}
              />
            ) : (
              <p className="rounded-lg border bg-muted/30 px-3 py-2 text-sm leading-relaxed">
                {draft.summary}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveAsCompanyRule}
              className="h-10 w-full touch-manipulation"
            >
              <Save className="h-4 w-4" />
              {t("companyRules.saveAsCompanyRule")}
            </Button>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={handleEdit}
                className="h-10 w-full touch-manipulation sm:flex-1"
              >
                <Pencil className="h-4 w-4" />
                {t("common.modify")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleExport}
                className="h-10 w-full touch-manipulation sm:flex-1"
              >
                <FileSpreadsheet className="h-4 w-4" />
                {t("common.exportExcel")}
              </Button>
              <Button
                type="button"
                onClick={handleAccept}
                className="h-10 w-full touch-manipulation shadow-sm sm:flex-1"
              >
                <Check className="h-4 w-4" />
                {t("common.acceptAiSuggestion")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <SuccessToast message={toast.message} onDismiss={toast.dismiss} />
    </>
  );
}
