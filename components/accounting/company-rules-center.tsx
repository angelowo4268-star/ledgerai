"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Scale, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteRule,
  getRules,
  saveRule,
  updateRule,
  type AccountingRule,
} from "@/lib/accounting/rule-storage";
import { useTranslation } from "@/lib/i18n/context";
import type { SupportedLocale } from "@/lib/i18n/types";

interface RuleFormState {
  vendor: string;
  debitAccount: string;
  creditAccount: string;
  category: string;
  autoApply: boolean;
}

const emptyForm: RuleFormState = {
  vendor: "",
  debitAccount: "",
  creditAccount: "",
  category: "",
  autoApply: true,
};

function formatRuleDate(iso: string, locale: SupportedLocale) {
  return new Date(iso).toLocaleString(locale === "zh-TW" ? "zh-TW" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CompanyRulesCenter() {
  const { t, locale } = useTranslation();
  const [rules, setRules] = useState<AccountingRule[]>([]);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingRule, setEditingRule] = useState<AccountingRule | null>(null);
  const [form, setForm] = useState<RuleFormState>(emptyForm);

  const loadRules = useCallback(() => {
    setRules(getRules());
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  useEffect(() => {
    const handleUpdate = () => loadRules();
    window.addEventListener("ledgerai-rules-updated", handleUpdate);
    return () =>
      window.removeEventListener("ledgerai-rules-updated", handleUpdate);
  }, [loadRules]);

  const filteredRules = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return rules;
    }

    return rules.filter((rule) =>
      rule.vendor.toLowerCase().includes(query)
    );
  }, [rules, search]);

  const openCreateForm = () => {
    setEditingRule(null);
    setForm(emptyForm);
    setIsCreating(true);
  };

  const openEditForm = (rule: AccountingRule) => {
    setIsCreating(false);
    setEditingRule(rule);
    setForm({
      vendor: rule.vendor,
      debitAccount: rule.debitAccount,
      creditAccount: rule.creditAccount,
      category: rule.category,
      autoApply: rule.autoApply,
    });
  };

  const closeForm = () => {
    setIsCreating(false);
    setEditingRule(null);
    setForm(emptyForm);
  };

  const updateFormField = <K extends keyof RuleFormState>(
    key: K,
    value: RuleFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!form.vendor.trim() || !form.debitAccount.trim() || !form.creditAccount.trim()) {
      return;
    }

    if (editingRule) {
      updateRule({
        ...editingRule,
        vendor: form.vendor.trim(),
        debitAccount: form.debitAccount.trim(),
        creditAccount: form.creditAccount.trim(),
        category: form.category.trim(),
        autoApply: form.autoApply,
      });
    } else {
      saveRule({
        vendor: form.vendor.trim(),
        debitAccount: form.debitAccount.trim(),
        creditAccount: form.creditAccount.trim(),
        category: form.category.trim(),
        autoApply: form.autoApply,
      });
    }

    closeForm();
    loadRules();
  };

  const handleDelete = (id: string) => {
    deleteRule(id);
    if (editingRule?.id === id) {
      closeForm();
    }
    loadRules();
  };

  const showForm = isCreating || editingRule != null;

  return (
    <div className="space-y-6 animate-fade-in sm:space-y-8">
      <PageHeader
        title={t("companyRules.title")}
        description={t("companyRules.description")}
      >
        <Button
          onClick={openCreateForm}
          className="h-10 w-full touch-manipulation shadow-sm sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          {t("companyRules.addRule")}
        </Button>
      </PageHeader>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{t("companyRules.listTitle")}</CardTitle>
          <CardDescription>
            {t("companyRules.listCount", { count: filteredRules.length })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("companyRules.searchPlaceholder")}
              className="h-10 pl-9"
            />
          </div>

          {showForm && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">
                  {editingRule
                    ? t("companyRules.editTitle")
                    : t("companyRules.createTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="rule-vendor">{t("companyRules.vendor")}</Label>
                    <Input
                      id="rule-vendor"
                      value={form.vendor}
                      onChange={(e) => updateFormField("vendor", e.target.value)}
                      placeholder={t("companyRules.vendor")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rule-category">{t("companyRules.category")}</Label>
                    <Input
                      id="rule-category"
                      value={form.category}
                      onChange={(e) => updateFormField("category", e.target.value)}
                      placeholder={t("companyRules.category")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rule-debit">{t("companyRules.debitAccount")}</Label>
                    <Input
                      id="rule-debit"
                      value={form.debitAccount}
                      onChange={(e) =>
                        updateFormField("debitAccount", e.target.value)
                      }
                      placeholder={t("companyRules.debitAccount")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rule-credit">{t("companyRules.creditAccount")}</Label>
                    <Input
                      id="rule-credit"
                      value={form.creditAccount}
                      onChange={(e) =>
                        updateFormField("creditAccount", e.target.value)
                      }
                      placeholder={t("companyRules.creditAccount")}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-3">
                  <input
                    id="rule-auto-apply"
                    type="checkbox"
                    checked={form.autoApply}
                    onChange={(e) => updateFormField("autoApply", e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="rule-auto-apply" className="cursor-pointer">
                      {t("companyRules.autoApply")}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t("companyRules.autoApplyHint")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeForm}
                    className="h-10 touch-manipulation"
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSave}
                    className="h-10 touch-manipulation shadow-sm"
                  >
                    {t("common.save")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {filteredRules.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 px-4 py-10 text-center">
              <Scale className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">{t("companyRules.emptyTitle")}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("companyRules.emptyDescription")}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {filteredRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="rounded-xl border border-border/60 bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{rule.vendor}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {rule.category || "—"}
                        </p>
                      </div>
                      <Badge variant={rule.autoApply ? "success" : "pending"}>
                        {rule.autoApply
                          ? t("companyRules.yes")
                          : t("companyRules.no")}
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {t("companyRules.tableDebit")}
                        </p>
                        <p className="font-medium">{rule.debitAccount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {t("companyRules.tableCredit")}
                        </p>
                        <p className="font-medium">{rule.creditAccount}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {t("companyRules.updatedAt")}:{" "}
                      {formatRuleDate(rule.updatedAt, locale)}
                    </p>
                    <div className="mt-4 flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openEditForm(rule)}
                        className="h-10 touch-manipulation"
                      >
                        <Pencil className="h-4 w-4" />
                        {t("common.edit")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleDelete(rule.id)}
                        className="h-10 touch-manipulation text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        {t("common.delete")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="-mx-4 hidden overflow-x-auto md:mx-0 md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>{t("companyRules.tableVendor")}</TableHead>
                      <TableHead>{t("companyRules.tableDebit")}</TableHead>
                      <TableHead>{t("companyRules.tableCredit")}</TableHead>
                      <TableHead>{t("companyRules.tableCategory")}</TableHead>
                      <TableHead>{t("companyRules.tableAutoApply")}</TableHead>
                      <TableHead>{t("companyRules.tableCreatedAt")}</TableHead>
                      <TableHead>{t("companyRules.tableUpdatedAt")}</TableHead>
                      <TableHead>{t("companyRules.tableActions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.vendor}</TableCell>
                        <TableCell>{rule.debitAccount}</TableCell>
                        <TableCell>{rule.creditAccount}</TableCell>
                        <TableCell>{rule.category || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={rule.autoApply ? "success" : "pending"}>
                            {rule.autoApply
                              ? t("companyRules.yes")
                              : t("companyRules.no")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatRuleDate(rule.createdAt, locale)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatRuleDate(rule.updatedAt, locale)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openEditForm(rule)}
                              className="h-8 touch-manipulation"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              {t("common.edit")}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(rule.id)}
                              className="h-8 touch-manipulation text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {t("common.delete")}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
