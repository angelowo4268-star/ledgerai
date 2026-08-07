"use client";

import {
  BrainCircuit,
  Clock,
  Receipt,
  Wallet,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatCurrency,
  type DashboardSummary,
} from "@/lib/accounting/dashboard-stats";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

interface AccountingStatCardsProps {
  summary: DashboardSummary;
}

export function AccountingStatCards({ summary }: AccountingStatCardsProps) {
  const { t } = useTranslation();

  const cards = [
    {
      key: "monthlyExpense",
      title: t("dashboard.monthlyExpense"),
      icon: Wallet,
      value: formatCurrency(summary.monthlyExpense),
      hint: t("dashboard.monthlyExpenseHint"),
    },
    {
      key: "totalVoucherCount",
      title: t("dashboard.totalVouchers"),
      icon: Receipt,
      value: String(summary.totalVoucherCount),
      hint: t("dashboard.totalVouchersHint"),
    },
    {
      key: "aiSuccessRate",
      title: t("dashboard.aiSuccessRate"),
      icon: BrainCircuit,
      value: `${summary.aiSuccessRate}%`,
      hint: t("dashboard.aiSuccessRateHint"),
    },
    {
      key: "pendingDraftCount",
      title: t("dashboard.pendingDraft"),
      icon: Clock,
      value: String(summary.pendingDraftCount),
      hint: t("dashboard.pendingDraftHint"),
    },
  ] as const;

  const animationClasses = [
    "animate-fade-in",
    "animate-fade-in-delay-1",
    "animate-fade-in-delay-2",
    "animate-fade-in-delay-3",
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.key}
            className={cn(
              "group border-border/60 hover:border-primary/20 hover:shadow-md",
              animationClasses[index]
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary transition-colors group-hover:bg-primary/10">
                <Icon className="h-[18px] w-[18px] text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{card.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
