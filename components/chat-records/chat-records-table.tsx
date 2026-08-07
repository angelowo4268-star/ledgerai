"use client";

import { Search, Trash2 } from "lucide-react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/accounting/dashboard-stats";
import { useTranslation } from "@/lib/i18n/context";
import type { ChatRecord } from "@/lib/chat-records/types";

interface ChatRecordsTableProps {
  records: ChatRecord[];
  search: string;
  onSearchChange: (value: string) => void;
  onDelete: (id: string) => void;
}

export function ChatRecordsTable({
  records,
  search,
  onSearchChange,
  onDelete,
}: ChatRecordsTableProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg">{t("chatRecords.resultsTitle")}</CardTitle>
          <CardDescription>
            {t("chatRecords.resultsCount", { count: records.length })}
          </CardDescription>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("chatRecords.searchPlaceholder")}
            className="h-10 pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
            {t("chatRecords.emptyDescription")}
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="rounded-xl border border-border/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{record.customerName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {record.sourceLabel}
                      </p>
                    </div>
                    <Badge variant="pending">{record.paymentStatus}</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">{t("chatRecords.tablePaid")}</p>
                      <p className="mt-1 font-medium tabular-nums">
                        {formatCurrency(record.paidAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("chatRecords.tableUnpaid")}</p>
                      <p className="mt-1 font-medium tabular-nums">
                        {formatCurrency(record.unpaidAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("chatRecords.tableRefund")}</p>
                      <p className="mt-1 font-medium tabular-nums">
                        {formatCurrency(record.refundAmount)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {record.orderNote}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(record.id)}
                    className="mt-4 h-9 w-full touch-manipulation text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("common.delete")}
                  </Button>
                </div>
              ))}
            </div>

            <div className="-mx-4 hidden overflow-x-auto md:mx-0 md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>{t("chatRecords.tableCustomer")}</TableHead>
                    <TableHead className="text-right">{t("chatRecords.tablePaid")}</TableHead>
                    <TableHead className="text-right">{t("chatRecords.tableUnpaid")}</TableHead>
                    <TableHead className="text-right">{t("chatRecords.tableRefund")}</TableHead>
                    <TableHead>{t("chatRecords.tableStatus")}</TableHead>
                    <TableHead>{t("chatRecords.tableOrderNote")}</TableHead>
                    <TableHead>{t("chatRecords.tableSource")}</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.customerName}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(record.paidAmount)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(record.unpaidAmount)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(record.refundAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="pending">{record.paymentStatus}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[240px] truncate">
                        {record.orderNote}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.sourceLabel}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(record.id)}
                          className="h-9 w-9 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
  );
}
