"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText } from "lucide-react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/accounting/dashboard-stats";
import { useTranslation } from "@/lib/i18n/context";
import {
  getVoucherStatusLabel,
  getVoucherStatusVariant,
} from "@/lib/i18n/voucher-status";
import type { Voucher } from "@/lib/accounting/voucher-storage";
import { cn } from "@/lib/utils";

interface RecentVouchersActivityProps {
  vouchers: Voucher[];
}

export function RecentVouchersActivity({ vouchers }: RecentVouchersActivityProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Card className="animate-fade-in-delay-2 border-border/60">
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg">
            {t("dashboard.recentActivityTitle")}
          </CardTitle>
          <CardDescription>
            {t("dashboard.recentActivityDescription")}
          </CardDescription>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-10 w-full touch-manipulation sm:w-auto"
        >
          <Link href="/voucher-management">
            {t("common.viewAll")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {vouchers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 px-4 py-10 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">
              {t("dashboard.noActivityTitle")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("dashboard.noActivityDescription")}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {vouchers.map((voucher) => (
                <Link
                  key={voucher.id}
                  href="/voucher-management"
                  className="block rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-primary/30 hover:bg-muted/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{voucher.vendor}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {voucher.date}
                      </p>
                    </div>
                    <Badge variant={getVoucherStatusVariant(voucher.status)}>
                      {getVoucherStatusLabel(voucher.status, t)}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm font-semibold tabular-nums">
                    {formatCurrency(voucher.debitAmount)}
                  </p>
                </Link>
              ))}
            </div>

            <div className="-mx-4 hidden overflow-x-auto md:mx-0 md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>{t("voucher.tableDate")}</TableHead>
                    <TableHead>{t("voucher.tableVendor")}</TableHead>
                    <TableHead className="text-right">
                      {t("voucher.tableAmount")}
                    </TableHead>
                    <TableHead>{t("voucher.tableStatus")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchers.map((voucher) => (
                    <TableRow
                      key={voucher.id}
                      className="cursor-pointer"
                      onClick={() => router.push("/voucher-management")}
                    >
                      <TableCell className="text-muted-foreground">
                        {voucher.date}
                      </TableCell>
                      <TableCell className="font-medium">
                        {voucher.vendor}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatCurrency(voucher.debitAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getVoucherStatusVariant(voucher.status)}
                          className={cn(
                            voucher.status === "Confirmed" &&
                              "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                          )}
                        >
                          {getVoucherStatusLabel(voucher.status, t)}
                        </Badge>
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
