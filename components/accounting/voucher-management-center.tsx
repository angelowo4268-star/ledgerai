"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { formatAmount } from "@/lib/ai-analysis/form-utils";
import { exportVouchersWithTemplate } from "@/lib/accounting/export-with-template";
import {
  EXPORT_TEMPLATES_UPDATED_EVENT,
  getExportTemplates,
  saveExportSelection,
} from "@/lib/export/template-storage";
import type { ExportTemplate } from "@/lib/accounting/export-template-types";
import {
  deleteVoucher,
  deleteVouchers,
  getVouchers,
  markVouchersExported,
  updateVoucher,
  type Voucher,
  type VoucherStatus,
} from "@/lib/accounting/voucher-storage";
import {
  getVoucherStatusLabel,
  getVoucherStatusVariant,
} from "@/lib/i18n/voucher-status";
import { useTranslation } from "@/lib/i18n/context";
import { VOUCHERS_UPDATED_EVENT } from "@/hooks/use-voucher-data";
import { cn } from "@/lib/utils";

export function VoucherManagementCenter() {
  const { t, locale } = useTranslation();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exportTemplates, setExportTemplates] = useState<ExportTemplate[]>([]);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadVouchers = useCallback(() => {
    setVouchers(getVouchers());
  }, []);

  const loadExportTemplates = useCallback(() => {
    setExportTemplates(getExportTemplates(locale));
  }, [locale]);

  useEffect(() => {
    loadVouchers();
    loadExportTemplates();
  }, [loadVouchers, loadExportTemplates]);

  useEffect(() => {
    const handleUpdate = () => loadVouchers();
    window.addEventListener(VOUCHERS_UPDATED_EVENT, handleUpdate);
    return () =>
      window.removeEventListener(VOUCHERS_UPDATED_EVENT, handleUpdate);
  }, [loadVouchers]);

  useEffect(() => {
    const handleUpdate = () => loadExportTemplates();
    window.addEventListener(EXPORT_TEMPLATES_UPDATED_EVENT, handleUpdate);
    return () =>
      window.removeEventListener(EXPORT_TEMPLATES_UPDATED_EVENT, handleUpdate);
  }, [loadExportTemplates]);

  useEffect(() => {
    setSelectedIds((current) => {
      const validIds = new Set(vouchers.map((voucher) => voucher.id));
      const next = new Set(
        [...current].filter((id) => validIds.has(id))
      );

      return next.size === current.size ? current : next;
    });
  }, [vouchers]);

  const filteredVouchers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return vouchers;
    }

    return vouchers.filter(
      (voucher) =>
        voucher.vendor.toLowerCase().includes(query) ||
        voucher.invoiceNumber.toLowerCase().includes(query) ||
        voucher.summary.toLowerCase().includes(query)
    );
  }, [search, vouchers]);

  const allSelected =
    filteredVouchers.length > 0 &&
    filteredVouchers.every((voucher) => selectedIds.has(voucher.id));

  const handleToggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredVouchers.map((voucher) => voucher.id)));
      return;
    }

    setSelectedIds(new Set());
  };

  const handleDelete = (id: string) => {
    deleteVoucher(id);
    if (editingVoucher?.id === id) {
      setEditingVoucher(null);
    }
    setSelectedIds((current) => {
      if (!current.has(id)) {
        return current;
      }

      const next = new Set(current);
      next.delete(id);
      return next;
    });
    loadVouchers();
  };

  const handleBulkDelete = () => {
    const ids = [...selectedIds];
    deleteVouchers(ids);

    if (editingVoucher && selectedIds.has(editingVoucher.id)) {
      setEditingVoucher(null);
    }

    setSelectedIds(new Set());
    loadVouchers();
  };

  const handleBulkMarkExported = () => {
    markVouchersExported([...selectedIds]);
    loadVouchers();
  };

  const handleBulkExportWithTemplate = (template: ExportTemplate) => {
    const selected = vouchers.filter((voucher) => selectedIds.has(voucher.id));

    if (selected.length === 0) {
      return;
    }

    try {
      exportVouchersWithTemplate(selected, template, locale);
      setError(null);
    } catch {
      setError(t("voucher.exportFailed"));
    }
  };

  const handleSaveEdit = () => {
    if (!editingVoucher) {
      return;
    }

    updateVoucher(editingVoucher);
    setEditingVoucher(null);
    loadVouchers();
  };

  const updateEditingField = <K extends keyof Voucher>(
    key: K,
    value: Voucher[K]
  ) => {
    setEditingVoucher((prev) => {
      if (!prev) {
        return prev;
      }

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
    <div className="space-y-6 animate-fade-in sm:space-y-8">
      <PageHeader
        title={t("voucher.title")}
        description={t("voucher.description")}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{t("voucher.listTitle")}</CardTitle>
          <CardDescription>
            {t("voucher.listCount", { count: filteredVouchers.length })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("voucher.searchPlaceholder")}
              className="h-10 pl-9"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {selectedIds.size > 0 && (
            <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium">
                {t("voucher.bulkSelected", { count: selectedIds.size })}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-full touch-manipulation sm:w-auto"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      {t("voucher.bulkExportTemplates")}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {exportTemplates.map((template) => (
                      <DropdownMenuItem
                        key={template.id}
                        className="min-h-10"
                        onClick={() => handleBulkExportWithTemplate(template)}
                      >
                        {template.name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="min-h-10">
                      <Link
                        href="/excel-export"
                        onClick={() => saveExportSelection([...selectedIds])}
                      >
                        {t("voucher.bulkManageTemplates")}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBulkMarkExported}
                  className="h-10 w-full touch-manipulation sm:w-auto"
                >
                  {t("voucher.bulkMarkExported")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBulkDelete}
                  className="h-10 w-full touch-manipulation text-destructive hover:text-destructive sm:w-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  {t("voucher.bulkDelete")}
                </Button>
              </div>
            </div>
          )}

          {editingVoucher && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">{t("voucher.editTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-date">{t("voucher.date")}</Label>
                    <Input
                      id="edit-date"
                      value={editingVoucher.date}
                      onChange={(e) => updateEditingField("date", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-vendor">{t("voucher.vendor")}</Label>
                    <Input
                      id="edit-vendor"
                      value={editingVoucher.vendor}
                      onChange={(e) =>
                        updateEditingField("vendor", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-invoice">{t("voucher.invoiceNumber")}</Label>
                    <Input
                      id="edit-invoice"
                      value={editingVoucher.invoiceNumber}
                      onChange={(e) =>
                        updateEditingField("invoiceNumber", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">{t("voucher.status")}</Label>
                    <Input
                      id="edit-status"
                      value={editingVoucher.status}
                      onChange={(e) =>
                        updateEditingField(
                          "status",
                          e.target.value as VoucherStatus
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="edit-summary">{t("voucher.summary")}</Label>
                    <Input
                      id="edit-summary"
                      value={editingVoucher.summary}
                      onChange={(e) =>
                        updateEditingField("summary", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-debit-account">{t("voucher.debitAccount")}</Label>
                    <Input
                      id="edit-debit-account"
                      value={editingVoucher.debitAccount}
                      onChange={(e) =>
                        updateEditingField("debitAccount", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-debit-amount">{t("voucher.debitAmount")}</Label>
                    <Input
                      id="edit-debit-amount"
                      type="number"
                      min={0}
                      value={editingVoucher.debitAmount}
                      onChange={(e) =>
                        updateEditingField(
                          "debitAmount",
                          Number(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-credit-account">{t("voucher.creditAccount")}</Label>
                    <Input
                      id="edit-credit-account"
                      value={editingVoucher.creditAccount}
                      onChange={(e) =>
                        updateEditingField("creditAccount", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-credit-amount">{t("voucher.creditAmount")}</Label>
                    <Input
                      id="edit-credit-amount"
                      type="number"
                      min={0}
                      value={editingVoucher.creditAmount}
                      onChange={(e) =>
                        updateEditingField(
                          "creditAmount",
                          Number(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingVoucher(null)}
                    className="h-10 touch-manipulation"
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveEdit}
                    className="h-10 touch-manipulation shadow-sm"
                  >
                    {t("common.save")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {filteredVouchers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 px-4 py-10 text-center">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">{t("voucher.emptyTitle")}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("voucher.emptyDescription")}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {filteredVouchers.map((voucher) => {
                  const statusVariant = getVoucherStatusVariant(voucher.status);
                  const statusLabel = getVoucherStatusLabel(voucher.status, t);

                  return (
                    <div
                      key={voucher.id}
                      className="rounded-xl border border-border/60 bg-card p-4"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          id={`select-voucher-${voucher.id}`}
                          type="checkbox"
                          checked={selectedIds.has(voucher.id)}
                          onChange={(e) =>
                            handleToggleSelect(voucher.id, e.target.checked)
                          }
                          className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                          aria-label={t("voucher.selectRow")}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-medium">{voucher.vendor}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {voucher.date}
                              </p>
                            </div>
                            <Badge variant={statusVariant}>{statusLabel}</Badge>
                          </div>
                          <p className="mt-3 text-sm text-muted-foreground">
                            {voucher.summary}
                          </p>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {t("voucher.tableDebit")}
                              </p>
                              <p className="font-medium">{voucher.debitAccount}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {t("voucher.tableCredit")}
                              </p>
                              <p className="font-medium">{voucher.creditAccount}</p>
                            </div>
                          </div>
                          <p className="mt-3 text-sm font-semibold tabular-nums">
                            {formatAmount(voucher.debitAmount)}
                          </p>
                          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setEditingVoucher({ ...voucher })}
                              className="h-10 flex-1 touch-manipulation"
                            >
                              <Pencil className="h-4 w-4" />
                              {t("common.edit")}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleDelete(voucher.id)}
                              className="h-10 flex-1 touch-manipulation text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              {t("common.delete")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="-mx-4 hidden overflow-x-auto md:mx-0 md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[48px]">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={(e) =>
                            handleToggleSelectAll(e.target.checked)
                          }
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                          aria-label={t("voucher.selectAll")}
                        />
                      </TableHead>
                      <TableHead>{t("voucher.tableDate")}</TableHead>
                      <TableHead>{t("voucher.tableVendor")}</TableHead>
                      <TableHead>{t("voucher.tableSummary")}</TableHead>
                      <TableHead>{t("voucher.tableDebit")}</TableHead>
                      <TableHead>{t("voucher.tableCredit")}</TableHead>
                      <TableHead className="text-right">
                        {t("voucher.tableAmount")}
                      </TableHead>
                      <TableHead>{t("voucher.tableStatus")}</TableHead>
                      <TableHead>{t("voucher.tableActions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVouchers.map((voucher) => {
                      const statusVariant = getVoucherStatusVariant(voucher.status);
                      const statusLabel = getVoucherStatusLabel(voucher.status, t);

                      return (
                        <TableRow key={voucher.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedIds.has(voucher.id)}
                              onChange={(e) =>
                                handleToggleSelect(voucher.id, e.target.checked)
                              }
                              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                              aria-label={t("voucher.selectRow")}
                            />
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {voucher.date}
                          </TableCell>
                          <TableCell className="font-medium">
                            {voucher.vendor}
                          </TableCell>
                          <TableCell className="max-w-[220px] truncate">
                            {voucher.summary}
                          </TableCell>
                          <TableCell>{voucher.debitAccount}</TableCell>
                          <TableCell>{voucher.creditAccount}</TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            {formatAmount(voucher.debitAmount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={statusVariant}
                              className={cn(
                                voucher.status === "Confirmed" &&
                                  "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                              )}
                            >
                              {statusLabel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingVoucher({ ...voucher })}
                                className="h-8 touch-manipulation"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                {t("common.edit")}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(voucher.id)}
                                className="h-8 touch-manipulation text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                {t("common.delete")}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
