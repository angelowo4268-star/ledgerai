"use client";

import { Banknote, CircleDollarSign, Undo2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/accounting/dashboard-stats";
import { useTranslation } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/types";
import type { ChatSummary } from "@/lib/chat-records/types";
import { cn } from "@/lib/utils";

interface ChatSummaryCardsProps {
  summary: ChatSummary;
}

const cardKeys = [
  {
    key: "totalReceived",
    titleKey: "chatRecords.totalReceived" as TranslationKey,
    hintKey: "chatRecords.totalReceivedHint" as TranslationKey,
    icon: Banknote,
    value: (summary: ChatSummary) => summary.totalReceived,
  },
  {
    key: "totalUnpaid",
    titleKey: "chatRecords.totalUnpaid" as TranslationKey,
    hintKey: "chatRecords.totalUnpaidHint" as TranslationKey,
    icon: CircleDollarSign,
    value: (summary: ChatSummary) => summary.totalUnpaid,
  },
  {
    key: "totalRefund",
    titleKey: "chatRecords.totalRefund" as TranslationKey,
    hintKey: "chatRecords.totalRefundHint" as TranslationKey,
    icon: Undo2,
    value: (summary: ChatSummary) => summary.totalRefund,
  },
] as const;

export function ChatSummaryCards({ summary }: ChatSummaryCardsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cardKeys.map((card, index) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.key}
            className={cn(
              "border-border/60 hover:border-primary/20 hover:shadow-md",
              index === 0 && "animate-fade-in",
              index === 1 && "animate-fade-in-delay-1",
              index === 2 && "animate-fade-in-delay-2"
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
                {formatCurrency(card.value(summary))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t(card.hintKey)}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
