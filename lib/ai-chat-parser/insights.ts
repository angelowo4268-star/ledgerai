import type {
  ChatParserSummary,
  ChatParserSummaryDraft,
  ParsedChatOrder,
} from "@/lib/ai-chat-parser/types";

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function isPaidOrder(order: ParsedChatOrder) {
  const status = order.status.toLowerCase();
  return (
    status.includes("paid") ||
    order.status.includes("已匯") ||
    order.status.includes("已付")
  );
}

function isRefundOrder(order: ParsedChatOrder) {
  const status = order.status.toLowerCase();
  return status.includes("refund") || order.refund > 0 || order.status.includes("退");
}

function isPendingPaymentOrder(order: ParsedChatOrder) {
  if (isPaidOrder(order) || isRefundOrder(order)) {
    return false;
  }

  const status = order.status.toLowerCase();
  return (
    status.includes("pending payment") ||
    status.includes("待付") ||
    status.includes("須補") ||
    order.remaining > 0
  );
}

function isCodOrder(order: ParsedChatOrder) {
  const method = order.paymentMethod.toLowerCase();
  return method === "cod" || method.includes("取付") || method.includes("貨到付款");
}

export function computeChatParserInsights(
  orders: ParsedChatOrder[]
): ChatParserSummary {
  return {
    orders: orders.length,
    pendingPayments: orders.filter(isPendingPaymentOrder).length,
    refunds: orders.filter(isRefundOrder).length,
    paid: orders.filter(isPaidOrder).length,
    cod: orders.filter(isCodOrder).length,
    shippingTotal: roundMoney(
      orders.reduce((sum, order) => sum + order.shipping, 0)
    ),
    expectedIncome: roundMoney(
      orders.reduce(
        (sum, order) => sum + Math.max(0, order.total - order.refund),
        0
      )
    ),
  };
}

export function normalizeChatParserSummary(
  draft: ChatParserSummaryDraft | undefined,
  orders: ParsedChatOrder[]
): ChatParserSummary {
  const computed = computeChatParserInsights(orders);

  if (!draft) {
    return computed;
  }

  return {
    orders: draft.orders ?? computed.orders,
    pendingPayments: draft.pendingPayments ?? computed.pendingPayments,
    refunds: draft.refunds ?? computed.refunds,
    paid: draft.paid ?? computed.paid,
    cod: draft.cod ?? computed.cod,
    shippingTotal: roundMoney(draft.shippingTotal ?? computed.shippingTotal),
    expectedIncome: roundMoney(draft.expectedIncome ?? computed.expectedIncome),
  };
}
