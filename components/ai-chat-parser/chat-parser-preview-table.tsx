"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ParsedChatOrder } from "@/lib/ai-chat-parser/types";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

interface ChatParserPreviewTableProps {
  orders: ParsedChatOrder[];
  onUpdate: (order: ParsedChatOrder) => void;
}

function formatMoney(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function getStatusVariant(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("paid") || normalized.includes("已付") || normalized.includes("已匯")) {
    return "default";
  }

  if (normalized.includes("refund") || normalized.includes("退")) {
    return "destructive";
  }

  if (normalized.includes("pending") || normalized.includes("待")) {
    return "secondary";
  }

  if (normalized.includes("cod") || normalized.includes("取付")) {
    return "outline";
  }

  return "outline";
}

function getConfidenceClass(confidence: number) {
  if (confidence >= 90) {
    return "text-emerald-600";
  }

  if (confidence >= 70) {
    return "text-amber-600";
  }

  return "text-red-600";
}

export function ChatParserPreviewTable({
  orders,
  onUpdate,
}: ChatParserPreviewTableProps) {
  const { t } = useTranslation();

  const updateField = <K extends keyof ParsedChatOrder>(
    order: ParsedChatOrder,
    key: K,
    value: ParsedChatOrder[K]
  ) => {
    onUpdate({ ...order, [key]: value });
  };

  const updateNumber = (
    order: ParsedChatOrder,
    key: "quantity" | "total" | "paid" | "remaining" | "shipping" | "refund",
    raw: string
  ) => {
    const parsed = Number(raw.replace(/[^\d.-]/g, ""));
    updateField(order, key, Number.isFinite(parsed) ? parsed : 0);
  };

  if (orders.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>{t("aiChatParser.tableCustomer")}</TableHead>
              <TableHead>{t("aiChatParser.tableProduct")}</TableHead>
              <TableHead className="w-20">{t("aiChatParser.tableQty")}</TableHead>
              <TableHead className="text-right">
                {t("aiChatParser.tableTotal")}
              </TableHead>
              <TableHead className="text-right">
                {t("aiChatParser.tablePaid")}
              </TableHead>
              <TableHead className="text-right">
                {t("aiChatParser.tableRemaining")}
              </TableHead>
              <TableHead className="text-right">
                {t("aiChatParser.tableShipping")}
              </TableHead>
              <TableHead className="text-right">
                {t("aiChatParser.tableRefund")}
              </TableHead>
              <TableHead>{t("aiChatParser.tablePaymentMethod")}</TableHead>
              <TableHead>{t("aiChatParser.tableStatus")}</TableHead>
              <TableHead>{t("aiChatParser.tableNotes")}</TableHead>
              <TableHead className="w-16 text-right">
                {t("aiChatParser.tableConfidence")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="align-top">
                <TableCell className="min-w-[120px]">
                  <Input
                    value={order.customer}
                    onChange={(event) =>
                      updateField(order, "customer", event.target.value)
                    }
                    className="h-9"
                  />
                  {order.sourceLine && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {order.sourceLine}
                    </p>
                  )}
                </TableCell>
                <TableCell className="min-w-[120px]">
                  <Input
                    value={order.product}
                    onChange={(event) =>
                      updateField(order, "product", event.target.value)
                    }
                    className="h-9"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    inputMode="numeric"
                    value={order.quantity}
                    onChange={(event) =>
                      updateNumber(order, "quantity", event.target.value)
                    }
                    className="h-9"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    inputMode="decimal"
                    value={order.total}
                    onChange={(event) =>
                      updateNumber(order, "total", event.target.value)
                    }
                    className="h-9 text-right tabular-nums"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    inputMode="decimal"
                    value={order.paid}
                    onChange={(event) =>
                      updateNumber(order, "paid", event.target.value)
                    }
                    className="h-9 text-right tabular-nums"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    inputMode="decimal"
                    value={order.remaining}
                    onChange={(event) =>
                      updateNumber(order, "remaining", event.target.value)
                    }
                    className="h-9 text-right tabular-nums font-medium text-amber-700"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    inputMode="decimal"
                    value={order.shipping}
                    onChange={(event) =>
                      updateNumber(order, "shipping", event.target.value)
                    }
                    className="h-9 text-right tabular-nums"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    inputMode="decimal"
                    value={order.refund}
                    onChange={(event) =>
                      updateNumber(order, "refund", event.target.value)
                    }
                    className="h-9 text-right tabular-nums text-red-600"
                  />
                </TableCell>
                <TableCell className="min-w-[120px]">
                  <Input
                    value={order.paymentMethod}
                    onChange={(event) =>
                      updateField(order, "paymentMethod", event.target.value)
                    }
                    className="h-9"
                  />
                </TableCell>
                <TableCell className="min-w-[140px] space-y-2">
                  <Input
                    value={order.status}
                    onChange={(event) =>
                      updateField(order, "status", event.target.value)
                    }
                    className="h-9"
                  />
                  <Badge variant={getStatusVariant(order.status)}>
                    {order.status || "—"}
                  </Badge>
                </TableCell>
                <TableCell className="min-w-[140px]">
                  <Input
                    value={order.notes}
                    onChange={(event) =>
                      updateField(order, "notes", event.target.value)
                    }
                    className="h-9"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      getConfidenceClass(order.confidence)
                    )}
                  >
                    {order.confidence}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="border-t border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
        {t("aiChatParser.previewFootnote", {
          count: orders.length,
          total: formatMoney(orders.reduce((sum, order) => sum + order.total, 0)),
        })}
      </div>
    </div>
  );
}
