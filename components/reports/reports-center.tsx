"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  FileText,
  Presentation,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Wallet,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import { formatCurrency } from "@/lib/accounting/dashboard-stats";
import { COMMUNICATION_UPDATED_EVENT } from "@/lib/communication/conversation-storage";
import { VOUCHERS_UPDATED_EVENT } from "@/hooks/use-voucher-data";
import { buildDateRange } from "@/lib/reports/date-range";
import { buildReportSnapshot } from "@/lib/reports/report-data";
import type { DateRangePreset, RankedItem, ReportSnapshot } from "@/lib/reports/types";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

function RankedList({
  title,
  items,
  recordsLabel,
  emptyLabel,
  loading = false,
}: {
  title: string;
  items: RankedItem[];
  recordsLabel: string;
  emptyLabel: string;
  loading?: boolean;
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="rounded-xl border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
            --
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
            {emptyLabel}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.count} {recordsLabel}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums">
                  {formatCurrency(item.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ReportsCenter() {
  const { t, locale } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [preset, setPreset] = useState<DateRangePreset>("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [snapshot, setSnapshot] = useState<ReportSnapshot | null>(null);

  const range = useMemo(
    () => buildDateRange(preset, new Date(), customStart, customEnd),
    [preset, customStart, customEnd]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    setSnapshot(buildReportSnapshot(range, locale));
  }, [mounted, range, locale, refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const handleUpdate = () => refresh();
    window.addEventListener(VOUCHERS_UPDATED_EVENT, handleUpdate);
    window.addEventListener(COMMUNICATION_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(VOUCHERS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener(COMMUNICATION_UPDATED_EVENT, handleUpdate);
    };
  }, [mounted, refresh]);

  const isLoading = !mounted || snapshot === null;
  const placeholder = "--";

  const dateRangeOptions: Array<{ value: DateRangePreset; label: string }> = [
    { value: "today", label: t("reports.rangeToday") },
    { value: "week", label: t("reports.rangeThisWeek") },
    { value: "month", label: t("reports.rangeThisMonth") },
    { value: "custom", label: t("reports.rangeCustom") },
  ];

  const kpiCards = [
    {
      key: "revenue",
      title: t("reports.kpiRevenue"),
      value: isLoading ? placeholder : formatCurrency(snapshot.kpis.revenue),
      icon: TrendingUp,
    },
    {
      key: "expense",
      title: t("reports.kpiExpense"),
      value: isLoading ? placeholder : formatCurrency(snapshot.kpis.expense),
      icon: Wallet,
    },
    {
      key: "profit",
      title: t("reports.kpiProfit"),
      value: isLoading ? placeholder : formatCurrency(snapshot.kpis.profit),
      icon: Sparkles,
    },
    {
      key: "pendingOrders",
      title: t("reports.kpiPendingOrders"),
      value: isLoading ? placeholder : String(snapshot.kpis.pendingOrders),
      icon: ShoppingCart,
    },
    {
      key: "customersToNotify",
      title: t("reports.kpiCustomersToNotify"),
      value: isLoading ? placeholder : String(snapshot.kpis.customersToNotify),
      icon: Bell,
    },
  ] as const;

  const suggestions = [
    {
      key: "revenueTrend",
      label: t("reports.revenueTrend"),
      text: isLoading ? placeholder : snapshot.suggestions.revenueTrend,
    },
    {
      key: "expenseTrend",
      label: t("reports.expenseTrend"),
      text: isLoading ? placeholder : snapshot.suggestions.expenseTrend,
    },
    {
      key: "outstandingPayments",
      label: t("reports.outstandingPayments"),
      text: isLoading ? placeholder : snapshot.suggestions.outstandingPayments,
    },
    {
      key: "customersFollowUp",
      label: t("reports.customersFollowUp"),
      text: isLoading ? placeholder : snapshot.suggestions.customersFollowUp,
    },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in sm:space-y-8">
      <PageHeader
        title={t("reports.title")}
        description={t("reports.description")}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t("reports.dateRangeTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6">
            {dateRangeOptions.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 text-sm font-medium"
              >
                <input
                  type="radio"
                  name="report-date-range"
                  checked={preset === option.value}
                  onChange={() => setPreset(option.value)}
                  className="h-4 w-4 border-border text-primary focus:ring-primary"
                />
                {option.label}
              </label>
            ))}
          </div>

          {preset === "custom" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="report-custom-start">{t("reports.customStart")}</Label>
                <Input
                  id="report-custom-start"
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-custom-end">{t("reports.customEnd")}</Label>
                <Input
                  id="report-custom-end"
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <Card
              key={card.key}
              className={cn(
                "border-border/60 shadow-sm",
                index === 0 && "animate-fade-in",
                index === 1 && "animate-fade-in-delay-1",
                index === 2 && "animate-fade-in-delay-2",
                index === 3 && "animate-fade-in-delay-3",
                index === 4 && "animate-fade-in-delay-3"
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tabular-nums">{card.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <RankedList
          title={t("reports.topCustomersTitle")}
          items={snapshot?.topCustomers ?? []}
          recordsLabel={t("reports.recordsLabel")}
          emptyLabel={t("reports.topCustomersEmpty")}
          loading={isLoading}
        />
        <RankedList
          title={t("reports.topProductsTitle")}
          items={snapshot?.topProducts ?? []}
          recordsLabel={t("reports.recordsLabel")}
          emptyLabel={t("reports.topProductsEmpty")}
          loading={isLoading}
        />
      </div>

      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">{t("reports.businessSummaryTitle")}</CardTitle>
          </div>
          <CardDescription>{t("reports.businessSummaryHint")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-8 text-muted-foreground sm:text-lg">
            {isLoading ? placeholder : snapshot.businessSummary}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t("reports.businessSuggestionsTitle")}</CardTitle>
          <CardDescription>{t("reports.businessSuggestionsHint")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {suggestions.map((item) => (
              <li
                key={item.key}
                className="rounded-xl border border-border/60 px-4 py-3"
              >
                <p className="text-sm font-medium">{item.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t("reports.exportTitle")}</CardTitle>
          <CardDescription>{t("reports.exportHint")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ["word", FileText, t("reports.exportWord")],
              ["pdf", FileText, t("reports.exportPdf")],
              ["powerpoint", Presentation, t("reports.exportPowerPoint")],
            ] as const
          ).map(([key, Icon, label]) => (
            <Button
              key={key}
              type="button"
              variant="outline"
              disabled
              className="h-11 w-full justify-between touch-manipulation"
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </span>
              <Badge variant="secondary">{t("reports.comingSoon")}</Badge>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
