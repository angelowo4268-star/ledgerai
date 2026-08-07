"use client";

import {
  Banknote,
  CircleDollarSign,
  Package,
  Truck,
  TrendingUp,
  Undo2,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/accounting/dashboard-stats";
import type { ChatParserSummary } from "@/lib/ai-chat-parser/types";
import { useTranslation } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

interface ChatParserInsightsPanelProps {
  summary: ChatParserSummary;
}

const tileConfig: Array<{
  key: keyof ChatParserSummary;
  titleKey: TranslationKey;
  hintKey: TranslationKey;
  icon: LucideIcon;
  format: (summary: ChatParserSummary) => string;
  highlight?: "warning";
}> = [
  {
    key: "orders",
    titleKey: "aiChatParser.insightOrders",
    hintKey: "aiChatParser.insightOrdersHint",
    icon: Package,
    format: (summary) => summary.orders.toLocaleString(),
  },
  {
    key: "pendingPayments",
    titleKey: "aiChatParser.insightPendingPayments",
    hintKey: "aiChatParser.insightPendingPaymentsHint",
    icon: Wallet,
    format: (summary) => summary.pendingPayments.toLocaleString(),
    highlight: "warning",
  },
  {
    key: "paid",
    titleKey: "aiChatParser.insightPaid",
    hintKey: "aiChatParser.insightPaidHint",
    icon: Banknote,
    format: (summary) => summary.paid.toLocaleString(),
  },
  {
    key: "cod",
    titleKey: "aiChatParser.insightCod",
    hintKey: "aiChatParser.insightCodHint",
    icon: CircleDollarSign,
    format: (summary) => summary.cod.toLocaleString(),
  },
  {
    key: "refunds",
    titleKey: "aiChatParser.insightRefunds",
    hintKey: "aiChatParser.insightRefundsHint",
    icon: Undo2,
    format: (summary) => summary.refunds.toLocaleString(),
    highlight: "warning",
  },
  {
    key: "shippingTotal",
    titleKey: "aiChatParser.insightShippingTotal",
    hintKey: "aiChatParser.insightShippingTotalHint",
    icon: Truck,
    format: (summary) => formatCurrency(summary.shippingTotal),
  },
  {
    key: "expectedIncome",
    titleKey: "aiChatParser.insightExpectedIncome",
    hintKey: "aiChatParser.insightExpectedIncomeHint",
    icon: TrendingUp,
    format: (summary) => formatCurrency(summary.expectedIncome),
  },
];

function InsightTile({
  icon: Icon,
  title,
  hint,
  value,
  highlight,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
  value: string;
  highlight?: "warning";
}) {
  const isWarning = highlight === "warning" && value !== "0";

  return (
    <div
      className={cn(
        "rounded-xl border bg-background px-4 py-4",
        isWarning
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-border/60"
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className={cn("h-4 w-4", isWarning && "text-amber-600")} />
        <span className="text-xs font-medium uppercase tracking-wide">
          {title}
        </span>
      </div>
      <p
        className={cn(
          "mt-2 text-2xl font-bold tracking-tight",
          isWarning ? "text-amber-700" : "text-foreground"
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export function ChatParserInsightsPanel({
  summary,
}: ChatParserInsightsPanelProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">
          {t("aiChatParser.insightsTitle")}
        </CardTitle>
        <CardDescription>{t("aiChatParser.insightsDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {tileConfig.map((tile) => (
            <InsightTile
              key={tile.key}
              icon={tile.icon}
              title={t(tile.titleKey)}
              hint={t(tile.hintKey)}
              value={tile.format(summary)}
              highlight={tile.highlight}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
