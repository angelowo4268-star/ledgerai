"use client";

import { FileSpreadsheet, ScrollText, Trash2 } from "lucide-react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ConversationRecord } from "@/lib/communication/types";
import { useTranslation } from "@/lib/i18n/context";

interface ConversationResultsTableProps {
  records: ConversationRecord[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string, checked: boolean) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onGenerateVoucher: () => void;
  onExportExcel: () => void;
  onUpdate: (record: ConversationRecord) => void;
  onDelete: (ids: string[]) => void;
}

export function ConversationResultsTable({
  records,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onGenerateVoucher,
  onExportExcel,
  onUpdate,
  onDelete,
}: ConversationResultsTableProps) {
  const { t } = useTranslation();
  const allSelected =
    records.length > 0 && records.every((record) => selectedIds.has(record.id));
  const someSelected = records.some((record) => selectedIds.has(record.id));

  const updateField = <K extends keyof ConversationRecord>(
    record: ConversationRecord,
    key: K,
    value: ConversationRecord[K]
  ) => {
    onUpdate({ ...record, [key]: value });
  };

  const handleDeleteSelected = () => {
    onDelete([...selectedIds]);
  };

  if (records.length === 0) {
    return null;
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg">
            {t("communicationCenter.resultsTitle")}
          </CardTitle>
          <CardDescription>
            {t("communicationCenter.resultsCount", { count: records.length })}
          </CardDescription>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onExportExcel}
            className="h-10 w-full touch-manipulation sm:w-auto"
          >
            <FileSpreadsheet className="h-4 w-4" />
            {t("common.exportExcel")}
          </Button>
          <Button
            type="button"
            onClick={onGenerateVoucher}
            disabled={!someSelected}
            className="h-10 w-full touch-manipulation shadow-sm sm:w-auto"
          >
            <ScrollText className="h-4 w-4" />
            {t("communicationCenter.generateVoucher")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleDeleteSelected}
            disabled={!someSelected}
            className="h-10 w-full touch-manipulation text-destructive hover:text-destructive sm:w-auto"
          >
            <Trash2 className="h-4 w-4" />
            {t("voucher.bulkDelete")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 md:hidden">
          {records.map((record) => (
            <div
              key={record.id}
              className="space-y-3 rounded-xl border border-border/60 p-4"
            >
              <div className="flex items-center gap-3">
                <input
                  id={`select-${record.id}`}
                  type="checkbox"
                  checked={selectedIds.has(record.id)}
                  onChange={(e) => onToggleSelect(record.id, e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  aria-label={t("communicationCenter.selectRow")}
                />
                <Label
                  htmlFor={`select-${record.id}`}
                  className="cursor-pointer text-sm font-medium"
                >
                  {record.customerName || t("communicationCenter.tableCustomer")}
                </Label>
              </div>
              <Input
                value={record.customerName}
                onChange={(e) =>
                  updateField(record, "customerName", e.target.value)
                }
                placeholder={t("communicationCenter.tableCustomer")}
              />
              <Input
                value={record.product}
                onChange={(e) => updateField(record, "product", e.target.value)}
                placeholder={t("communicationCenter.tableProduct")}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  min={0}
                  value={record.quantity}
                  onChange={(e) =>
                    updateField(record, "quantity", Number(e.target.value) || 0)
                  }
                  placeholder={t("communicationCenter.tableQuantity")}
                />
                <Input
                  type="number"
                  min={0}
                  value={record.amount}
                  onChange={(e) =>
                    updateField(record, "amount", Number(e.target.value) || 0)
                  }
                  placeholder={t("communicationCenter.tableAmount")}
                />
              </div>
              <Input
                value={record.currency}
                onChange={(e) => updateField(record, "currency", e.target.value)}
                placeholder={t("communicationCenter.tableCurrency")}
              />
              <Input
                value={record.paymentStatus}
                onChange={(e) =>
                  updateField(record, "paymentStatus", e.target.value)
                }
                placeholder={t("communicationCenter.tablePaymentStatus")}
              />
              <Input
                value={record.paymentMethod}
                onChange={(e) =>
                  updateField(record, "paymentMethod", e.target.value)
                }
                placeholder={t("communicationCenter.tablePaymentMethod")}
              />
              <Input
                value={record.orderStatus}
                onChange={(e) =>
                  updateField(record, "orderStatus", e.target.value)
                }
                placeholder={t("communicationCenter.tableOrderStatus")}
              />
              <Input
                value={record.orderDate}
                onChange={(e) => updateField(record, "orderDate", e.target.value)}
                placeholder={t("communicationCenter.tableOrderDate")}
              />
              <Input
                type="number"
                min={0}
                max={100}
                value={record.confidence}
                onChange={(e) =>
                  updateField(
                    record,
                    "confidence",
                    Math.min(100, Math.max(0, Number(e.target.value) || 0))
                  )
                }
                placeholder={t("communicationCenter.tableConfidence")}
              />
            </div>
          ))}
        </div>

        <div className="-mx-4 hidden overflow-x-auto md:mx-0 md:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[48px]">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onToggleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    aria-label={t("communicationCenter.selectAll")}
                  />
                </TableHead>
                <TableHead>{t("communicationCenter.tableCustomer")}</TableHead>
                <TableHead>{t("communicationCenter.tableProduct")}</TableHead>
                <TableHead className="w-[80px]">
                  {t("communicationCenter.tableQuantity")}
                </TableHead>
                <TableHead className="w-[100px]">
                  {t("communicationCenter.tableAmount")}
                </TableHead>
                <TableHead className="w-[80px]">
                  {t("communicationCenter.tableCurrency")}
                </TableHead>
                <TableHead>{t("communicationCenter.tablePaymentStatus")}</TableHead>
                <TableHead>{t("communicationCenter.tablePaymentMethod")}</TableHead>
                <TableHead>{t("communicationCenter.tableOrderStatus")}</TableHead>
                <TableHead className="w-[120px]">
                  {t("communicationCenter.tableOrderDate")}
                </TableHead>
                <TableHead className="w-[90px]">
                  {t("communicationCenter.tableConfidence")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(record.id)}
                      onChange={(e) =>
                        onToggleSelect(record.id, e.target.checked)
                      }
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      aria-label={t("communicationCenter.selectRow")}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={record.customerName}
                      onChange={(e) =>
                        updateField(record, "customerName", e.target.value)
                      }
                      className="h-9 min-w-[120px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={record.product}
                      onChange={(e) =>
                        updateField(record, "product", e.target.value)
                      }
                      className="h-9 min-w-[120px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      value={record.quantity}
                      onChange={(e) =>
                        updateField(
                          record,
                          "quantity",
                          Number(e.target.value) || 0
                        )
                      }
                      className="h-9 w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      value={record.amount}
                      onChange={(e) =>
                        updateField(record, "amount", Number(e.target.value) || 0)
                      }
                      className="h-9 w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={record.currency}
                      onChange={(e) =>
                        updateField(record, "currency", e.target.value)
                      }
                      className="h-9 w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={record.paymentStatus}
                      onChange={(e) =>
                        updateField(record, "paymentStatus", e.target.value)
                      }
                      className="h-9 min-w-[100px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={record.paymentMethod}
                      onChange={(e) =>
                        updateField(record, "paymentMethod", e.target.value)
                      }
                      className="h-9 min-w-[100px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={record.orderStatus}
                      onChange={(e) =>
                        updateField(record, "orderStatus", e.target.value)
                      }
                      className="h-9 min-w-[100px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={record.orderDate}
                      onChange={(e) =>
                        updateField(record, "orderDate", e.target.value)
                      }
                      className="h-9 w-28"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={record.confidence}
                      onChange={(e) =>
                        updateField(
                          record,
                          "confidence",
                          Math.min(
                            100,
                            Math.max(0, Number(e.target.value) || 0)
                          )
                        )
                      }
                      className="h-9 w-20"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
