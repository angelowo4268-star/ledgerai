"use client";

import {
  Banknote,
  CircleDollarSign,
  Package,
  TrendingUp,
  Undo2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/accounting/dashboard-stats";
import { useTranslation } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/types";
import type { ConversationSummary } from "@/lib/communication/types";
import { cn } from "@/lib/utils";

interface ConversationSummaryCardsProps {
  summary: ConversationSummary;
}

const cardConfig = [
  {
    key: "totalOrders",
    titleKey: "communicationCenter.totalOrders" as TranslationKey,
    hintKey: "communicationCenter.totalOrdersHint" as TranslationKey,
    icon: Package,
    format: (summary: ConversationSummary) => String(summary.totalOrders),
  },
  {
    key: "paid",
    titleKey: "communicationCenter.paid" as TranslationKey,
    hintKey: "communicationCenter.paidHint" as TranslationKey,
    icon: Banknote,
    format: (summary: ConversationSummary) => formatCurrency(summary.paid),
  },
  {
    key: "unpaid",
    titleKey: "communicationCenter.unpaid" as TranslationKey,
    hintKey: "communicationCenter.unpaidHint" as TranslationKey,
    icon: CircleDollarSign,
    format: (summary: ConversationSummary) => formatCurrency(summary.unpaid),
  },
  {
    key: "refund",
    titleKey: "communicationCenter.refund" as TranslationKey,
    hintKey: "communicationCenter.refundHint" as TranslationKey,
    icon: Undo2,
    format: (summary: ConversationSummary) => formatCurrency(summary.refund),
  },
  {
    key: "revenue",
    titleKey: "communicationCenter.revenue" as TranslationKey,
    hintKey: "communicationCenter.revenueHint" as TranslationKey,
    icon: TrendingUp,
    format: (summary: ConversationSummary) => formatCurrency(summary.revenue),
  },
] as const;

export function ConversationSummaryCards({
  summary,
}: ConversationSummaryCardsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cardConfig.map((card, index) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.key}
            className={cn(
              "border-border/60 hover:border-primary/20 hover:shadow-md",
              index === 0 && "animate-fade-in",
              index === 1 && "animate-fade-in-delay-1",
              index === 2 && "animate-fade-in-delay-2",
              index === 3 && "animate-fade-in-delay-3"
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t(card.titleKey)}
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                <Icon className="h-[18px] w-[18px] text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {card.format(summary)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t(card.hintKey)}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
